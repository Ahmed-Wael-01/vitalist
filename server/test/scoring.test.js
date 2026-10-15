import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  initialChecklist, initialProtocolSteps, applyChatToChecklist, applyProtocol,
  evaluateDifferential, evaluateFinalDiagnosis, evaluateHandoff, computeScore,
} from '../src/engine/index.js';

const concept = (conceptId, osceDomain, englishTerms, expectedStatus = 'ANY', arabicTerms = []) =>
  ({ conceptId, osceDomain, englishTerms, arabicTerms, expectedStatus });

const scenario = {
  requiredProtocol: 'SPIKES',
  conceptDictionary: [
    concept('onset', 'History', ['when did', 'how long']),
    concept('fever', 'History', ['fever']),
    concept('setting', 'Communication', ['private room', 'sit down']),
    concept('perception', 'Communication', ['what do you understand', 'what do you know']),
    concept('watch_bp', 'Handoff', ['blood pressure']),
  ],
  protocolSteps: [
    { stepCode: 'SPIKES_S_SETTING', order: 1, conceptId: 'setting' },
    { stepCode: 'SPIKES_P_PERCEPTION', order: 2, conceptId: 'perception' },
  ],
  acceptedDifferentials: [
    { key: 'mi', englishTerms: ['myocardial infarction', 'mi'], arabicTerms: [] },
    { key: 'pe', englishTerms: ['pulmonary embolism'], arabicTerms: [] },
  ],
  requiredDifferentialCount: 2,
  goldStandardDiagnosis: { key: 'mi', englishTerms: ['myocardial infarction', 'stemi'], arabicTerms: ['احتشاء'] },
  panelActions: [
    { actionCode: 'EXAM_CHEST', isRelevant: true },
    { actionCode: 'LAB_TROP', isRelevant: true },
    { actionCode: 'EXAM_KNEE', isRelevant: false },
    { actionCode: 'GIVE_THROMBO', isRelevant: false, isHarmful: true, safetyPenalty: 3 },
  ],
  disposition: { correctKey: 'CCU' },
};

test('protocol steps out of order earn partial credit', () => {
  let cl = initialChecklist(scenario);
  let steps = initialProtocolSteps(scenario);
  let r = applyChatToChecklist(cl, scenario, 'What do you understand about your results?');
  steps = applyProtocol(steps, scenario, r.mentions);
  r = applyChatToChecklist(r.checklist, scenario, "Let's sit down in a private room");
  steps = applyProtocol(steps, scenario, r.mentions);
  assert.deepEqual(steps.map((s) => [s.isCompleted, s.isCompletedInOrder]), [[true, true], [true, false]]);
});

test('protocol steps in the same message are ordered by position', () => {
  const r = applyChatToChecklist(initialChecklist(scenario), scenario, 'Please sit down. What do you know so far?');
  const steps = applyProtocol(initialProtocolSteps(scenario), scenario, r.mentions);
  assert.ok(steps.every((s) => s.isCompletedInOrder));
});

test('differential, final diagnosis and negation', () => {
  assert.deepEqual(evaluateDifferential('MI vs pulmonary embolism', scenario.acceptedDifferentials).sort(), ['mi', 'pe']);
  assert.deepEqual(evaluateDifferential('not pulmonary embolism, maybe MI', scenario.acceptedDifferentials), ['mi']);
  assert.equal(evaluateFinalDiagnosis('Acute inferior STEMI', scenario.goldStandardDiagnosis), true);
  assert.equal(evaluateFinalDiagnosis('احتشاء عضلة القلب', scenario.goldStandardDiagnosis), true);
  assert.equal(evaluateFinalDiagnosis('not myocardial infarction', scenario.goldStandardDiagnosis), false);
});

test('perfect run scores 100, harmful action deducts safety penalty', () => {
  let r = applyChatToChecklist(initialChecklist(scenario), scenario, 'Sit down please. What do you understand? When did it start? Any fever?');
  const steps = applyProtocol(initialProtocolSteps(scenario), scenario, r.mentions);
  const base = {
    scenario, checklist: r.checklist, protocolSteps: steps,
    commitment: { matchedKeys: ['mi', 'pe'] },
    diagnosisCorrect: true,
    handoff: evaluateHandoff(scenario, { handoffNote: 'Watch blood pressure', dispositionKey: 'CCU' }),
  };
  const perfect = computeScore({ ...base, actionCodes: ['EXAM_CHEST', 'LAB_TROP'] });
  assert.equal(perfect.finalScore, 100);

  const harmful = computeScore({ ...base, actionCodes: ['EXAM_CHEST', 'LAB_TROP', 'GIVE_THROMBO'] });
  assert.equal(harmful.finalScore, 97);
  assert.deepEqual(harmful.harmfulActions, ['GIVE_THROMBO']);

  const irrelevant = computeScore({ ...base, actionCodes: ['EXAM_CHEST', 'EXAM_KNEE'] });
  assert.equal(irrelevant.scores.find((s) => s.osceDomain === 'Exam').pointsEarned, 7.5);
});

test('no commitment and nothing done scores 0', () => {
  const result = computeScore({
    scenario, checklist: initialChecklist(scenario), protocolSteps: initialProtocolSteps(scenario),
    commitment: null, actionCodes: [], diagnosisCorrect: false,
    handoff: evaluateHandoff(scenario, {}),
  });
  assert.equal(result.finalScore, 0);
});

test('expectedStatus NEGATED requires a ruled-out mention', () => {
  const s = { ...scenario, requiredProtocol: 'NONE', protocolSteps: [],
    conceptDictionary: [concept('no_trauma', 'History', ['trauma', 'fall'], 'NEGATED')] };
  let r = applyChatToChecklist(initialChecklist(s), s, 'Did you have a fall?');
  assert.equal(r.checklist[0].isSatisfied, false);
  r = applyChatToChecklist(r.checklist, s, 'So no trauma at all.');
  assert.equal(r.checklist[0].isSatisfied, true);
});
