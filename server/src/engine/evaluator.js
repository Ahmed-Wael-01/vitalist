// Evaluation reducer: pure state transitions for checklist, protocol order, the diagnostic gate,
// final diagnosis and handoff. No I/O and no AI — given the same inputs it always yields the same output.

import { findConceptMentions, findMentions, satisfies } from './matcher.js';

/** OSCE domains whose concepts are scored from the free-text chat. */
export const CHAT_DOMAINS = ['History', 'Communication'];
/** OSCE domains whose concepts are scored from the final handoff note. */
export const HANDOFF_DOMAINS = ['Handoff', 'Management'];

/** Panel categories that remain locked until a working differential is committed. */
export const GATED_CATEGORIES = ['PhysicalExam', 'Investigation', 'Intervention'];

export const chatConcepts = (scenario) =>
  scenario.conceptDictionary.filter((c) => CHAT_DOMAINS.includes(c.osceDomain));

export const handoffConcepts = (scenario) =>
  scenario.conceptDictionary.filter((c) => HANDOFF_DOMAINS.includes(c.osceDomain));

export const protocolChannel = (scenario) =>
  scenario.requiredProtocol === 'SBAR_Handoff' ? 'handoff' : scenario.requiredProtocol === 'NONE' ? null : 'chat';

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

export function initialChecklist(scenario) {
  return chatConcepts(scenario).map((c) => ({
    conceptId: c.conceptId,
    status: 'NOT_MENTIONED',
    isSatisfied: false,
    satisfiedAt: null,
  }));
}

export function initialProtocolSteps(scenario) {
  return [...scenario.protocolSteps]
    .sort((a, b) => a.order - b.order)
    .map((s) => ({ stepCode: s.stepCode, order: s.order, isCompleted: false, isCompletedInOrder: false, completedAt: null }));
}

// ---------------------------------------------------------------------------
// Chat message evaluation
// ---------------------------------------------------------------------------

/**
 * Apply one trainee chat message to the checklist.
 * A satisfied item stays satisfied; an unsatisfied item records the latest observed status.
 */
export function applyChatToChecklist(checklist, scenario, text, at = new Date()) {
  const concepts = chatConcepts(scenario);
  const byId = new Map(concepts.map((c) => [c.conceptId, c]));
  const mentions = findConceptMentions(text, concepts);

  const next = checklist.map((item) => ({ ...item }));
  for (const item of next) {
    const hits = mentions.filter((m) => m.id === item.conceptId);
    if (!hits.length || item.isSatisfied) continue;
    const concept = byId.get(item.conceptId);
    const satisfying = hits.find((h) => satisfies(concept?.expectedStatus, h.status));
    if (satisfying) {
      item.status = satisfying.status;
      item.isSatisfied = true;
      item.satisfiedAt = at;
    } else {
      item.status = hits[hits.length - 1].status;
    }
  }
  return { checklist: next, mentions };
}

/**
 * Advance protocol steps (e.g. SPIKES) from concept mentions, in positional order.
 * A step is "in order" only if every lower-order step was already completed when it was reached.
 */
export function applyProtocol(steps, scenario, mentions, at = new Date()) {
  const stepByConcept = new Map(scenario.protocolSteps.map((s) => [s.conceptId, s.stepCode]));
  const next = steps.map((s) => ({ ...s }));
  const byCode = new Map(next.map((s) => [s.stepCode, s]));

  for (const mention of mentions) {
    const step = byCode.get(stepByConcept.get(mention.id));
    if (!step || step.isCompleted) continue;
    step.isCompleted = true;
    step.completedAt = at;
    step.isCompletedInOrder = next.filter((s) => s.order < step.order).every((s) => s.isCompleted);
  }
  return next;
}

// ---------------------------------------------------------------------------
// Diagnostic gate, final diagnosis, handoff
// ---------------------------------------------------------------------------

const asMatchable = (entry) => ({ id: entry.key, englishTerms: entry.englishTerms, arabicTerms: entry.arabicTerms });

/** Keys of accepted differentials that appear (affirmed) in the committed differential text. */
export function evaluateDifferential(text, acceptedDifferentials = []) {
  const mentions = findMentions(text, acceptedDifferentials.map(asMatchable));
  return [...new Set(mentions.filter((m) => m.status === 'AFFIRMED').map((m) => m.id))];
}

/** Is the gold-standard diagnosis stated (and not negated) in the final diagnosis text? */
export function evaluateFinalDiagnosis(text, goldStandard) {
  const mentions = findMentions(text, [asMatchable(goldStandard)]);
  return mentions.some((m) => m.status === 'AFFIRMED');
}

/** Score the handoff note against Handoff/Management concepts and (for SBAR) protocol order. */
export function evaluateHandoff(scenario, { handoffNote = '', dispositionKey = '' }, at = new Date()) {
  // Protocol step concepts (e.g. SBAR sections) are scored by order below, not as watch-list items.
  const stepConceptIds = new Set(scenario.protocolSteps.map((s) => s.conceptId));
  const concepts = handoffConcepts(scenario).filter((c) => !stepConceptIds.has(c.conceptId));
  const mentions = findConceptMentions(handoffNote, concepts);
  const conceptResults = concepts.map((c) => {
    const hits = mentions.filter((m) => m.id === c.conceptId);
    const satisfying = hits.find((h) => satisfies(c.expectedStatus, h.status));
    return {
      conceptId: c.conceptId,
      status: satisfying?.status ?? hits[0]?.status ?? 'NOT_MENTIONED',
      isSatisfied: Boolean(satisfying),
    };
  });

  let protocolSteps = null;
  if (protocolChannel(scenario) === 'handoff') {
    const stepConceptIds = new Set(scenario.protocolSteps.map((s) => s.conceptId));
    const stepConcepts = scenario.conceptDictionary.filter((c) => stepConceptIds.has(c.conceptId));
    protocolSteps = applyProtocol(initialProtocolSteps(scenario), scenario, findConceptMentions(handoffNote, stepConcepts), at);
  }

  return {
    conceptResults,
    protocolSteps,
    dispositionCorrect: Boolean(dispositionKey) && dispositionKey === scenario.disposition?.correctKey,
  };
}
