import mongoose from 'mongoose';

const { Schema } = mongoose;

// Bounded per-session state is embedded; unbounded logs (chat, actions) live in their own collections.

const checklistItemSchema = new Schema(
  {
    conceptId: String,
    status: { type: String, enum: ['AFFIRMED', 'NEGATED', 'NOT_MENTIONED'], default: 'NOT_MENTIONED' },
    isSatisfied: { type: Boolean, default: false },
    satisfiedAt: Date,
  },
  { _id: false },
);

const protocolStepStateSchema = new Schema(
  { stepCode: String, order: Number, isCompleted: Boolean, isCompletedInOrder: Boolean, completedAt: Date },
  { _id: false },
);

const scoreResultSchema = new Schema(
  {
    osceDomain: { type: String, enum: ['History', 'GateReasoning', 'Exam', 'FinalDiagnosis', 'Handoff', 'Safety'] },
    pointsEarned: Number,
    pointsMax: Number,
    penaltyApplied: Number,
  },
  { _id: false },
);

const sessionSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    scenario: { type: Schema.Types.ObjectId, ref: 'Scenario', required: true },
    startTime: { type: Date, default: Date.now },
    endTime: Date,
    status: { type: String, enum: ['active', 'completed'], default: 'active' },
    finalScore: Number,

    isDiagnosticGatePassed: { type: Boolean, default: false },
    diagnosticCommitment: {
      committedDifferential: String,
      reasoningNotes: String,
      matchedKeys: [String],
      committedAt: Date,
    },

    checklist: [checklistItemSchema],
    protocolSteps: [protocolStepStateSchema],

    finalSubmission: {
      diagnosisText: String,
      dispositionKey: String,
      handoffNote: String,
      submittedAt: Date,
      diagnosisCorrect: Boolean,
      dispositionCorrect: Boolean,
      handoffConcepts: [checklistItemSchema],
      handoffProtocolSteps: [protocolStepStateSchema],
    },

    scores: [scoreResultSchema],
  },
  // Rejects a save if another request modified the session in between (e.g. two chat messages racing).
  { timestamps: true, optimisticConcurrency: true },
);

sessionSchema.index({ user: 1, status: 1, createdAt: -1 });

export const Session = mongoose.model('Session', sessionSchema);
