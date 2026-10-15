// Automated OSCE scoring engine (Blueprint §6).
// Final OSCE Score = (Σ earned / Σ station points) × 100 − safety penalties

import { protocolChannel } from './evaluator.js';

export const DOMAIN_WEIGHTS = Object.freeze({
  History: 25,
  GateReasoning: 15,
  Exam: 20,
  FinalDiagnosis: 25,
  Handoff: 15,
});

export const MAX_SAFETY_PENALTY = 5;
/** Fraction of one relevant action deducted for each irrelevant (but not harmful) action. */
export const IRRELEVANT_ACTION_COST = 0.25;

const round2 = (n) => Math.round(n * 100) / 100;
const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

/** Ordered-protocol credit: 1 per step done in order, 0.5 per step done out of order. */
export function protocolRatio(steps = []) {
  if (!steps.length) return 0;
  const credit = steps.reduce((sum, s) => sum + (s.isCompletedInOrder ? 1 : s.isCompleted ? 0.5 : 0), 0);
  return credit / steps.length;
}

/** Weighted average over the parts that actually exist for this scenario. */
function weightedParts(parts) {
  const present = parts.filter((p) => p.applies);
  const totalWeight = present.reduce((s, p) => s + p.weight, 0);
  if (!totalWeight) return 1;
  return present.reduce((s, p) => s + p.weight * p.ratio, 0) / totalWeight;
}

/**
 * @param {object} input
 * @param {object} input.scenario
 * @param {Array}  input.checklist           chat checklist state
 * @param {Array}  input.protocolSteps       chat protocol state (SPIKES etc.)
 * @param {object|null} input.commitment     { matchedKeys: string[] } or null
 * @param {string[]} input.actionCodes       unique panel action codes performed
 * @param {boolean} input.diagnosisCorrect
 * @param {object} input.handoff             result of evaluateHandoff()
 */
export function computeScore({ scenario, checklist, protocolSteps, commitment, actionCodes, diagnosisCorrect, handoff }) {
  const rows = [];
  const channel = protocolChannel(scenario);
  const stepConceptIds = new Set(scenario.protocolSteps.map((s) => s.conceptId));

  // --- History taking & communication (chat) ---
  const historyItems = checklist.filter((c) => !stepConceptIds.has(c.conceptId));
  const conceptRatio = historyItems.length ? historyItems.filter((c) => c.isSatisfied).length / historyItems.length : 1;
  const historyRatio = weightedParts([
    { applies: true, weight: 0.7, ratio: conceptRatio },
    { applies: channel === 'chat' && protocolSteps.length > 0, weight: 0.3, ratio: protocolRatio(protocolSteps) },
  ]);
  rows.push(row('History', historyRatio));

  // --- Diagnostic gate reasoning ---
  const accepted = scenario.acceptedDifferentials ?? [];
  const required = Math.max(1, Math.min(scenario.requiredDifferentialCount || 2, accepted.length || 1));
  const gateRatio = commitment ? Math.min(commitment.matchedKeys.length, required) / required : 0;
  rows.push(row('GateReasoning', gateRatio));

  // --- Physical exam & observations (action panel) ---
  const performed = new Set(actionCodes);
  const actions = scenario.panelActions;
  const relevant = actions.filter((a) => a.isRelevant);
  const relevantHit = relevant.filter((a) => performed.has(a.actionCode)).length;
  const irrelevantHit = actions.filter((a) => !a.isRelevant && !a.isHarmful && performed.has(a.actionCode)).length;
  const examRatio = relevant.length
    ? clamp(relevantHit - IRRELEVANT_ACTION_COST * irrelevantHit, 0, relevant.length) / relevant.length
    : 1;
  rows.push(row('Exam', examRatio));

  // --- Final diagnosis accuracy ---
  rows.push(row('FinalDiagnosis', diagnosisCorrect ? 1 : 0));

  // --- Handoff & disposition ---
  const handoffConcepts = handoff.conceptResults;
  const handoffRatio = weightedParts([
    { applies: Boolean(scenario.disposition?.correctKey), weight: 0.4, ratio: handoff.dispositionCorrect ? 1 : 0 },
    {
      applies: handoffConcepts.length > 0,
      weight: 0.6,
      ratio: handoffConcepts.length ? handoffConcepts.filter((c) => c.isSatisfied).length / handoffConcepts.length : 0,
    },
    { applies: Boolean(handoff.protocolSteps?.length), weight: 0.4, ratio: protocolRatio(handoff.protocolSteps ?? []) },
  ]);
  rows.push(row('Handoff', handoffRatio));

  // --- Safety & harmful actions ---
  const harmful = actions.filter((a) => a.isHarmful && performed.has(a.actionCode));
  const penalty = round2(Math.min(MAX_SAFETY_PENALTY, harmful.reduce((s, a) => s + (a.safetyPenalty ?? 0), 0)));
  rows.push({ osceDomain: 'Safety', pointsEarned: 0, pointsMax: 0, penaltyApplied: penalty });

  const earned = rows.reduce((s, r) => s + r.pointsEarned, 0);
  const total = rows.reduce((s, r) => s + r.pointsMax, 0);
  const finalScore = round2(Math.max(0, (earned / total) * 100 - penalty));

  return { scores: rows, finalScore, harmfulActions: harmful.map((a) => a.actionCode) };
}

function row(domain, ratio) {
  const max = DOMAIN_WEIGHTS[domain];
  return { osceDomain: domain, pointsEarned: round2(max * clamp(ratio, 0, 1)), pointsMax: max, penaltyApplied: 0 };
}
