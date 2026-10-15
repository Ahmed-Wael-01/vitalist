import { z } from 'zod';
import { Scenario, Session, User } from '../models/index.js';
import { OSCE_DOMAINS, PANEL_CATEGORIES, PROTOCOLS, EXPECTED_STATUSES } from '../models/Scenario.js';
import { HttpError } from '../utils/httpError.js';

const bilingual = z.object({ en: z.string().default(''), ar: z.string().default('') }).default({ en: '', ar: '' });
const terms = z.array(z.string().trim().min(1)).default([]);
const keyedTerms = z.object({ key: z.string().trim().min(1), label: bilingual, englishTerms: terms, arabicTerms: terms });

export const scenarioSchema = z
  .object({
    slug: z.string().trim().min(2).max(80).regex(/^[a-z0-9-]+$/, 'lowercase letters, digits and dashes only'),
    title: bilingual,
    specialty: z.string().trim().min(2).max(80),
    difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
    isPublished: z.boolean().default(false),
    estimatedMinutes: z.number().int().min(1).max(240).default(15),
    triageBrief: bilingual,
    patient: z.object({
      name: bilingual,
      age: z.number().int().min(0).max(130).optional(),
      sex: z.enum(['male', 'female']).optional(),
      setting: bilingual,
    }),
    patientPersona: z.string().max(20000).default(''),
    scriptedReplies: z.array(z.object({ conceptId: z.string(), en: z.string().default(''), ar: z.string().default('') })).default([]),
    defaultReply: bilingual,
    goldStandardDiagnosis: keyedTerms,
    acceptedDifferentials: z.array(keyedTerms).default([]),
    requiredDifferentialCount: z.number().int().min(1).max(10).default(2),
    requiredProtocol: z.enum(PROTOCOLS).default('NONE'),
    protocolSteps: z.array(z.object({ stepCode: z.string().trim().min(1), order: z.number().int().min(1), conceptId: z.string().trim().min(1) })).default([]),
    conceptDictionary: z.array(z.object({
      conceptId: z.string().trim().min(1),
      osceDomain: z.enum(OSCE_DOMAINS),
      label: bilingual,
      englishTerms: terms,
      arabicTerms: terms,
      expectedStatus: z.enum(EXPECTED_STATUSES).default('ANY'),
    })).default([]),
    panelActions: z.array(z.object({
      actionCode: z.string().trim().min(1),
      category: z.enum(PANEL_CATEGORIES),
      label: bilingual,
      finding: bilingual,
      payloadMediaUrl: z.string().trim().default(''),
      isRelevant: z.boolean().default(false),
      isHarmful: z.boolean().default(false),
      safetyPenalty: z.number().min(0).max(5).default(0),
    })).default([]),
    disposition: z.object({
      options: z.array(z.object({ key: z.string().trim().min(1), label: bilingual })).default([]),
      correctKey: z.string().default(''),
    }).default({ options: [], correctKey: '' }),
    guidelineReferences: z.array(z.object({ title: z.string().trim().min(1), url: z.string().trim().default('') })).default([]),
  })
  .superRefine((s, ctx) => {
    const issue = (path, message) => ctx.addIssue({ code: z.ZodIssueCode.custom, path, message });
    const dupes = (list) => list.filter((v, i) => list.indexOf(v) !== i);
    const conceptIds = s.conceptDictionary.map((c) => c.conceptId);
    dupes(conceptIds).forEach((id) => issue(['conceptDictionary'], `Duplicate conceptId "${id}"`));
    dupes(s.panelActions.map((a) => a.actionCode)).forEach((c) => issue(['panelActions'], `Duplicate actionCode "${c}"`));
    dupes(s.acceptedDifferentials.map((d) => d.key)).forEach((k) => issue(['acceptedDifferentials'], `Duplicate key "${k}"`));
    s.protocolSteps.forEach((step, i) => {
      if (!conceptIds.includes(step.conceptId)) issue(['protocolSteps', i, 'conceptId'], `Unknown conceptId "${step.conceptId}"`);
    });
    if (s.requiredProtocol !== 'NONE' && !s.protocolSteps.length) issue(['protocolSteps'], 'A protocol requires at least one step');
    if (s.disposition.correctKey && !s.disposition.options.some((o) => o.key === s.disposition.correctKey)) {
      issue(['disposition', 'correctKey'], 'Correct disposition must be one of the options');
    }
    if (!s.goldStandardDiagnosis.englishTerms.length && !s.goldStandardDiagnosis.arabicTerms.length) {
      issue(['goldStandardDiagnosis'], 'Gold standard diagnosis needs at least one term');
    }
    s.panelActions.forEach((a, i) => {
      if (a.isHarmful && a.isRelevant) issue(['panelActions', i], 'An action cannot be both relevant and harmful');
    });
  });

export const publishSchema = z.object({ isPublished: z.boolean() });

export async function listScenarios(_req, res) {
  const scenarios = await Scenario.find().sort({ updatedAt: -1 }).select('slug title specialty difficulty isPublished updatedAt');
  const counts = await Session.aggregate([{ $group: { _id: '$scenario', n: { $sum: 1 } } }]);
  const countMap = new Map(counts.map((c) => [String(c._id), c.n]));
  res.json({ scenarios: scenarios.map((s) => ({ ...s.toObject(), id: s.id, sessionCount: countMap.get(s.id) ?? 0 })) });
}

export async function getScenario(req, res) {
  const scenario = await Scenario.findById(req.params.id);
  if (!scenario) throw new HttpError(404, 'Scenario not found');
  res.json({ scenario });
}

export async function createScenario(req, res) {
  const scenario = await Scenario.create({ ...req.body, createdBy: req.auth.userId });
  res.status(201).json({ scenario });
}

export async function updateScenario(req, res) {
  const scenario = await Scenario.findById(req.params.id);
  if (!scenario) throw new HttpError(404, 'Scenario not found');
  scenario.overwrite({ ...req.body, createdBy: scenario.createdBy });
  await scenario.save();
  res.json({ scenario });
}

export async function setPublished(req, res) {
  const scenario = await Scenario.findByIdAndUpdate(req.params.id, { isPublished: req.body.isPublished }, { returnDocument: 'after' });
  if (!scenario) throw new HttpError(404, 'Scenario not found');
  res.json({ scenario });
}

export async function deleteScenario(req, res) {
  if (await Session.exists({ scenario: req.params.id })) {
    throw new HttpError(409, 'Scenario has trainee sessions; unpublish it instead of deleting');
  }
  const deleted = await Scenario.findByIdAndDelete(req.params.id);
  if (!deleted) throw new HttpError(404, 'Scenario not found');
  res.status(204).end();
}

export async function overview(_req, res) {
  const [users, completed] = await Promise.all([
    User.aggregate([{ $group: { _id: '$role', n: { $sum: 1 } } }]),
    Session.find({ status: 'completed' })
      .sort({ endTime: -1 })
      .limit(50)
      .populate('user', 'name email role')
      .populate('scenario', 'title specialty'),
  ]);
  res.json({
    userCounts: Object.fromEntries(users.map((u) => [u._id, u.n])),
    recentSessions: completed.map((s) => ({
      id: s.id,
      user: s.user && { name: s.user.name, email: s.user.email, role: s.user.role },
      scenario: s.scenario && { title: s.scenario.title, specialty: s.scenario.specialty },
      finalScore: s.finalScore,
      endTime: s.endTime,
    })),
  });
}

