import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true, index: true },
  sender: { type: String, enum: ['doctor', 'patient'], required: true },
  rawText: { type: String, required: true },
  normalizedText: { type: String, default: '' },
  language: { type: String, enum: ['en', 'ar'], default: 'en' },
  source: { type: String, enum: ['trainee', 'ai', 'scripted'], default: 'trainee' },
  timestamp: { type: Date, default: Date.now },
});

export const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);
