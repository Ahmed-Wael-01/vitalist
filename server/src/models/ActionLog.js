import mongoose from 'mongoose';

const actionLogSchema = new mongoose.Schema({
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true, index: true },
  panelActionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  actionCode: { type: String, required: true },
  wasGateUnlocked: { type: Boolean, required: true },
  timestamp: { type: Date, default: Date.now },
});

actionLogSchema.index({ session: 1, actionCode: 1 }, { unique: true });

export const ActionLog = mongoose.model('ActionLog', actionLogSchema);
