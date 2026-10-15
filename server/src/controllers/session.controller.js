import { z } from 'zod';
import { Scenario, Session, ChatMessage, ActionLog } from '../models/index.js';
import { HttpError } from '../utils/httpError.js';
import {
  normalizeText, detectLanguage, GATED_CATEGORIES, protocolChannel,
  initialChecklist, initialProtocolSteps, applyChatToChecklist, applyProtocol,
  evaluateDifferential, evaluateFinalDiagnosis, evaluateHandoff, computeScore,
} from '../engine/index.js';
import { generatePatientReply } from '../ai/patient.js';

const PATIENT_CONTEXT_MESSAGES = 60;

export const startSchema = z.object({ scenarioId: z.string().min(1) });
export const messageSchema = z.object({ text: z.string().trim().min(1).max(2000) });
export const commitSchema = z.object({
  committedDifferential: z.string().trim().min(2).max(2000),
  reasoningNotes: z.string().trim().max(4000).default(''),
});
export const actionSchema = z.object({ actionCode: z.string().min(1).max(100) });
export const submitSchema = z.object({
  diagnosisText: z.string().trim().min(2).max(500),
  dispositionKey: z.string().max(100).default(''),
  handoffNote: z.string().trim().max(6000).default(''),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function loadOwnSession(req, { requireActive = false } = {}) {
  const session = await Session.findById(req.params.id);
  if (!session) throw new HttpError(404, 'Session not found');
  const isOwner = String(session.user) === req.auth.userId;
  if (!isOwner && req.auth.role !== 'admin') throw new HttpError(404, 'Session not found');
  if (requireActive && (!isOwner || session.status !== 'active')) throw new HttpError(409, 'Session is not active');
  const scenario = await Scenario.findById(session.scenario);
  if (!scenario) throw new HttpError(410, 'Scenario no longer exists');
  return { session, scenario };
}

const revealedAction = (action, log) => ({
  actionCode: action.actionCode,
  category: action.category,
  label: action.label,
  finding: action.finding,
  payloadMediaUrl: action.payloadMediaUrl,
  performedAt: log.timestamp,
});

const messageView = (m) => ({ id: m.id, sender: m.sender, text: m.rawText, language: m.language, timestamp: m.timestamp });

function sessionView(session, scenario, messages, logs) {
  const actionsByCode = new Map(scenario.panelActions.map((a) => [a.actionCode, a]));
  return {
    id: session.id,
    status: session.status,
    startTime: session.startTime,
    endTime: session.endTime,
    finalScore: session.status === 'completed' ? session.finalScore : undefined,
    isDiagnosticGatePassed: session.isDiagnosticGatePassed,
    diagnosticCommitment: session.isDiagnosticGatePassed
      ? {
        committedDifferential: session.diagnosticCommitment.committedDifferential,
        reasoningNotes: session.diagnosticCommitment.reasoningNotes,
        committedAt: session.diagnosticCommitment.committedAt,
      }
      : null,
    gatedCategories: GATED_CATEGORIES,
    scenario: scenario.toTraineeView(),
    messages: messages.map(messageView),
    revealedActions: logs.filter((l) => actionsByCode.has(l.actionCode)).map((l) => revealedAction(actionsByCode.get(l.actionCode), l)),
  };
}

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

export async function startSession(req, res) {
  const scenario = await Scenario.findById(req.body.scenarioId);
  if (!scenario || (!scenario.isPublished && req.auth.role !== 'admin')) throw new HttpError(404, 'Scenario not found');

  const session = await Session.create({
    user: req.auth.userId,
    scenario: scenario._id,
    checklist: initialChecklist(scenario),
    protocolSteps: protocolChannel(scenario) === 'chat' ? initialProtocolSteps(scenario) : [],
  });
  res.status(201).json({ session: sessionView(session, scenario, [], []) });
}

export async function listMySessions(req, res) {
  const sessions = await Session.find({ user: req.auth.userId })
    .sort({ createdAt: -1 })
    .limit(100)
    .populate('scenario', 'title specialty slug');
  res.json({
    sessions: sessions.map((s) => ({
      id: s.id,
      status: s.status,
      startTime: s.startTime,
      endTime: s.endTime,
      finalScore: s.finalScore,
      scenario: s.scenario && { id: s.scenario.id, title: s.scenario.title, specialty: s.scenario.specialty },
    })),
  });
}

export async function getSession(req, res) {
  const { session, scenario } = await loadOwnSession(req);
  const [messages, logs] = await Promise.all([
    ChatMessage.find({ session: session._id }).sort({ timestamp: 1 }),
    ActionLog.find({ session: session._id }).sort({ timestamp: 1 }),
  ]);
  res.json({ session: sessionView(session, scenario, messages, logs) });
}

export async function postMessage(req, res) {
  const { session, scenario } = await loadOwnSession(req, { requireActive: true });
  const { text } = req.body;
  const language = detectLanguage(text);
  const now = new Date();

  // 1) Deterministic evaluation — independent of the AI and done before it runs.
  const { checklist, mentions } = applyChatToChecklist(session.checklist.map((c) => c.toObject()), scenario, text, now);
  session.checklist = checklist;
  if (session.protocolSteps.length) {
    session.protocolSteps = applyProtocol(session.protocolSteps.map((s) => s.toObject()), scenario, mentions, now);
  }
  await session.save();

  const doctorMessage = await ChatMessage.create({
    session: session._id, sender: 'doctor', rawText: text, normalizedText: normalizeText(text), language, timestamp: now,
  });

  // 2) Patient persona reply — receives only the transcript, never evaluation state.
  const history = (await ChatMessage.find({ session: session._id }).sort({ timestamp: -1 }).limit(PATIENT_CONTEXT_MESSAGES)).reverse();
  const reply = await generatePatientReply(scenario, history, language);
  const patientMessage = await ChatMessage.create({
    session: session._id, sender: 'patient', rawText: reply.text, normalizedText: normalizeText(reply.text), language, source: reply.source,
  });

  res.status(201).json({ doctorMessage: messageView(doctorMessage), patientMessage: messageView(patientMessage) });
}

export async function commitDifferential(req, res) {
  const { session, scenario } = await loadOwnSession(req, { requireActive: true });
  if (session.isDiagnosticGatePassed) throw new HttpError(409, 'A working differential has already been committed');

  session.diagnosticCommitment = {
    committedDifferential: req.body.committedDifferential,
    reasoningNotes: req.body.reasoningNotes,
    matchedKeys: evaluateDifferential(req.body.committedDifferential, scenario.acceptedDifferentials),
    committedAt: new Date(),
  };
  session.isDiagnosticGatePassed = true;
  await session.save();
  res.json({ isDiagnosticGatePassed: true, committedAt: session.diagnosticCommitment.committedAt });
}

export async function performAction(req, res) {
  const { session, scenario } = await loadOwnSession(req, { requireActive: true });
  const action = scenario.panelActions.find((a) => a.actionCode === req.body.actionCode);
  if (!action) throw new HttpError(404, 'Unknown action');

  if (GATED_CATEGORIES.includes(action.category) && !session.isDiagnosticGatePassed) {
    throw new HttpError(423, 'Commit a working differential diagnosis before opening this panel', { code: 'GATE_LOCKED' });
  }

  let log = await ActionLog.findOne({ session: session._id, actionCode: action.actionCode });
  if (!log) {
    try {
      log = await ActionLog.create({
        session: session._id,
        panelActionId: action._id,
        actionCode: action.actionCode,
        wasGateUnlocked: session.isDiagnosticGatePassed,
      });
    } catch (err) {
      if (err?.code !== 11000) throw err; // concurrent duplicate click
      log = await ActionLog.findOne({ session: session._id, actionCode: action.actionCode });
    }
  }
  res.json({ action: revealedAction(action, log) });
}

export async function submitSession(req, res) {
  const { session, scenario } = await loadOwnSession(req, { requireActive: true });
  const now = new Date();
  const { diagnosisText, dispositionKey, handoffNote } = req.body;

  const logs = await ActionLog.find({ session: session._id });
  const diagnosisCorrect = evaluateFinalDiagnosis(diagnosisText, scenario.goldStandardDiagnosis);
  const handoff = evaluateHandoff(scenario, { handoffNote, dispositionKey }, now);
  const result = computeScore({
    scenario,
    checklist: session.checklist,
    protocolSteps: session.protocolSteps,
    commitment: session.isDiagnosticGatePassed ? session.diagnosticCommitment : null,
    actionCodes: logs.map((l) => l.actionCode),
    diagnosisCorrect,
    handoff,
  });

  session.finalSubmission = {
    diagnosisText, dispositionKey, handoffNote, submittedAt: now,
    diagnosisCorrect,
    dispositionCorrect: handoff.dispositionCorrect,
    handoffConcepts: handoff.conceptResults,
    handoffProtocolSteps: handoff.protocolSteps ?? [],
  };
  session.scores = result.scores;
  session.finalScore = result.finalScore;
  session.status = 'completed';
  session.endTime = now;
  await session.save();

  res.json({ scorecard: buildScorecard(session, scenario, logs) });
}

export async function getScorecard(req, res) {
  const { session, scenario } = await loadOwnSession(req);
  if (session.status !== 'completed') throw new HttpError(409, 'Scorecard is available after the encounter is submitted');
  const logs = await ActionLog.find({ session: session._id }).sort({ timestamp: 1 });
  res.json({ scorecard: buildScorecard(session, scenario, logs) });
}

// ---------------------------------------------------------------------------
// Scorecard (post-encounter feedback — full rubric is revealed only now)
// ---------------------------------------------------------------------------

function buildScorecard(session, scenario, logs) {
  const conceptLabel = new Map(scenario.conceptDictionary.map((c) => [c.conceptId, { label: c.label, domain: c.osceDomain, expectedStatus: c.expectedStatus }]));
  const withLabel = (item) => ({
    conceptId: item.conceptId,
    status: item.status,
    isSatisfied: item.isSatisfied,
    satisfiedAt: item.satisfiedAt,
    ...conceptLabel.get(item.conceptId),
  });
  const stepConcepts = new Set(scenario.protocolSteps.map((s) => s.conceptId));
  const performed = new Map(logs.map((l) => [l.actionCode, l]));
  const fs = session.finalSubmission;

  return {
    sessionId: session.id,
    scenario: { id: scenario.id, title: scenario.title, specialty: scenario.specialty },
    startTime: session.startTime,
    endTime: session.endTime,
    finalScore: session.finalScore,
    scores: session.scores,
    history: {
      checklist: session.checklist.filter((c) => !stepConcepts.has(c.conceptId)).map(withLabel),
      protocol: scenario.requiredProtocol,
      protocolSteps: (session.protocolSteps.length ? session.protocolSteps : fs.handoffProtocolSteps).map((s) => ({
        stepCode: s.stepCode, order: s.order, isCompleted: s.isCompleted, isCompletedInOrder: s.isCompletedInOrder, completedAt: s.completedAt,
      })),
    },
    gate: {
      committed: session.isDiagnosticGatePassed,
      committedDifferential: session.diagnosticCommitment?.committedDifferential,
      reasoningNotes: session.diagnosticCommitment?.reasoningNotes,
      committedAt: session.diagnosticCommitment?.committedAt,
      requiredCount: scenario.requiredDifferentialCount,
      acceptedDifferentials: scenario.acceptedDifferentials.map((d) => ({
        key: d.key, label: d.label, matched: session.diagnosticCommitment?.matchedKeys?.includes(d.key) ?? false,
      })),
    },
    actions: scenario.panelActions.map((a) => ({
      actionCode: a.actionCode,
      category: a.category,
      label: a.label,
      isRelevant: a.isRelevant,
      isHarmful: a.isHarmful,
      safetyPenalty: a.safetyPenalty,
      performed: performed.has(a.actionCode),
      performedAt: performed.get(a.actionCode)?.timestamp,
      wasGateUnlocked: performed.get(a.actionCode)?.wasGateUnlocked,
    })),
    finalDiagnosis: {
      submitted: fs.diagnosisText,
      correct: fs.diagnosisCorrect,
      goldStandard: scenario.goldStandardDiagnosis.label,
    },
    handoff: {
      note: fs.handoffNote,
      dispositionKey: fs.dispositionKey,
      dispositionCorrect: fs.dispositionCorrect,
      correctDisposition: scenario.disposition.options.find((o) => o.key === scenario.disposition.correctKey) ?? null,
      watchlist: fs.handoffConcepts.map(withLabel),
    },
    guidelineReferences: scenario.guidelineReferences,
  };
}
