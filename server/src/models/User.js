import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export const ROLES = ['student', 'intern', 'admin'];
export const LANGUAGES = ['en', 'ar'];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, default: 'student' },
    preferredLanguage: { type: String, enum: LANGUAGES, default: 'en' },
  },
  { timestamps: true },
);

userSchema.methods.verifyPassword = function verifyPassword(password) {
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.statics.hashPassword = (password) => bcrypt.hash(password, 12);

userSchema.methods.toPublic = function toPublic() {
  return { id: this.id, name: this.name, email: this.email, role: this.role, preferredLanguage: this.preferredLanguage };
};

export const User = mongoose.model('User', userSchema);
