import { z } from 'zod';
import { User } from '../models/index.js';
import { HttpError } from '../utils/httpError.js';
import {
  REFRESH_COOKIE, setAuthCookies, clearAuthCookies, consumeRefreshToken, revokeRefreshToken,
} from '../utils/tokens.js';

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  password: z.string().min(8).max(128),
  role: z.enum(['student', 'intern']).default('student'), // admin accounts are never self-registered
  preferredLanguage: z.enum(['en', 'ar']).default('en'),
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export const updateMeSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  preferredLanguage: z.enum(['en', 'ar']).optional(),
});

export async function register(req, res) {
  const { password, ...rest } = req.body;
  if (await User.exists({ email: rest.email.toLowerCase() })) throw new HttpError(409, 'Email already registered');
  const user = await User.create({ ...rest, passwordHash: await User.hashPassword(password) });
  await setAuthCookies(res, user);
  res.status(201).json({ user: user.toPublic() });
}

export async function login(req, res) {
  const user = await User.findOne({ email: req.body.email.toLowerCase() }).select('+passwordHash');
  if (!user || !(await user.verifyPassword(req.body.password))) throw new HttpError(401, 'Invalid email or password');
  await setAuthCookies(res, user);
  res.json({ user: user.toPublic() });
}

export async function refresh(req, res) {
  const result = await consumeRefreshToken(req.cookies?.[REFRESH_COOKIE]);
  const user = result && (await User.findById(result.userId));
  if (!user) {
    clearAuthCookies(res);
    throw new HttpError(401, 'Session expired, please sign in again');
  }
  const newJti = await setAuthCookies(res, user);
  result.record.replacedBy = newJti;
  await result.record.save();
  res.json({ user: user.toPublic() });
}

export async function logout(req, res) {
  await revokeRefreshToken(req.cookies?.[REFRESH_COOKIE]);
  clearAuthCookies(res);
  res.status(204).end();
}

export async function me(req, res) {
  const user = await User.findById(req.auth.userId);
  if (!user) throw new HttpError(401, 'User no longer exists');
  res.json({ user: user.toPublic() });
}

export async function updateMe(req, res) {
  const user = await User.findByIdAndUpdate(req.auth.userId, req.body, { returnDocument: 'after', runValidators: true });
  res.json({ user: user.toPublic() });
}
