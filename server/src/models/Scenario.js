import mongoose from 'mongoose';

const { Schema } = mongoose;

const bilingual = { en: { type: String, default: '' }, ar: { type: String, default: '' } };

export const OSCE_DOMAINS = ['History', 'Communication', 'Exam', 'Reasoning', 'Management', 'Handoff'];
export const PANEL_CATEGORIES = ['History', 'PhysicalExam', 'Investigation', 'Intervention'];
export const PROTOCOLS = ['NONE', 'SPIKES', 'SBAR_Handoff'];
export const EXPECTED_STATUSES = ['ANY', 'AFFIRMED', 'NEGATED'];

// CONCEPT_DICTIONARY — embedded: owned by and always loaded with its scenario.
const conceptSchema = new Schema(
  {
    conceptId: { type: String, required: true },
    osceDomain: { type: String, enum: OSCE_DOMAINS, required: true },
    label: bilingual,
    englishTerms: { type: [String], default: [] },
    arabicTerms: { type: [String], default: [] },
    // Which mention earns credit: any mention, an affirmed one, or a ruled-out (negated) one.
    expectedStatus: { type: String, enum: EXPECTED_STATUSES, default: 'ANY' },
  },
  { _id: false },
);

// PANEL_ACTION
const panelActionSchema = new Schema({
  actionCode: { type: String, required: true },
  category: { type: String, enum: PANEL_CATEGORIES, required: true },
  label: bilingual,
  finding: bilingual, // observation card revealed after performing the action
  payloadMediaUrl: { type: String, default: '' },
  isRelevant: { type: Boolean, default: false },
  isHarmful: { type: Boolean, default: false },
  safetyPenalty: { type: Number, min: 0, max: 5, default: 0 },
});

const keyedTermsSchema = new Schema(
  {
    key: { type: String, required: true },
    label: bilingual,
    englishTerms: { type: [String], default: [] },
    arabicTerms: { type: [String], default: [] },
  },
  { _id: false },
);

const protocolStepSchema = new Schema(
  {
    stepCode: { type: String, required: true },
    order: { type: Number, required: true },
    conceptId: { type: String, required: true },
  },
  { _id: false },
);

const scriptedReplySchema = new Schema({ conceptId: String, ...bilingual }, { _id: false });

const scenarioSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    title: bilingual,
    specialty: { type: String, required: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    isPublished: { type: Boolean, default: false },
    estimatedMinutes: { type: Number, default: 15 },

    triageBrief: bilingual,
    patient: {
      name: bilingual,
      age: Number,
      sex: { type: String, enum: ['male', 'female'] },
      setting: bilingual, // e.g. "Emergency Department, bed 4"
    },

    // Patient persona — consumed ONLY by the AI layer, never by the scoring engine.
    patientPersona: { type: String, default: '' },
    scriptedReplies: { type: [scriptedReplySchema], default: [] },
    defaultReply: bilingual,

    goldStandardDiagnosis: { type: keyedTermsSchema, required: true },
    acceptedDifferentials: { type: [keyedTermsSchema], default: [] },
    requiredDifferentialCount: { type: Number, default: 2, min: 1 },

    requiredProtocol: { type: String, enum: PROTOCOLS, default: 'NONE' },
    protocolSteps: { type: [protocolStepSchema], default: [] },

    conceptDictionary: { type: [conceptSchema], default: [] },
    panelActions: { type: [panelActionSchema], default: [] },

    disposition: {
      options: { type: [{ key: String, label: bilingual, _id: false }], default: [] },
      correctKey: { type: String, default: '' },
    },

    guidelineReferences: { type: [{ title: String, url: String, _id: false }], default: [] },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

/** Trainee-safe projection: hides gold standard, rubric, concept dictionary, relevance flags and findings. */
scenarioSchema.methods.toTraineeView = function toTraineeView() {
  return {
    id: this.id,
    slug: this.slug,
    title: this.title,
    specialty: this.specialty,
    difficulty: this.difficulty,
    estimatedMinutes: this.estimatedMinutes,
    triageBrief: this.triageBrief,
    patient: this.patient,
    requiredProtocol: this.requiredProtocol,
    panelActions: this.panelActions.map((a) => ({ id: a.id, actionCode: a.actionCode, category: a.category, label: a.label })),
    dispositionOptions: this.disposition.options,
  };
};

export const Scenario = mongoose.model('Scenario', scenarioSchema);
