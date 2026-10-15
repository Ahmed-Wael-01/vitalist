import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { RefreshToken } from '../models/index.js';

export const ACCESS_COOKIE = 'vitalist_access';
export const REFRESH_COOKIE = 'vitalist_refresh';
const REFRESH_PATH = '/api/auth';

const baseCookie = () => ({ httpOnly: true, secure: env.isProd, sameSite: 'lax' });

export function signAccessToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, env.jwt.accessSecret, { expiresIn: env.jwt.accessTtl });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.jwt.accessSecret);
}

async function issueRefreshToken(user) {
  const jti = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + env.jwt.refreshTtlDays * 864e5);
  await RefreshToken.create({ jti, user: user._id, expiresAt });
  const token = jwt.sign({ sub: user.id, jti }, env.jwt.refreshSecret, { expiresIn: `${env.jwt.refreshTtlDays}d` });
  return { token, jti, expiresAt };
}

/** Issue a fresh access + refresh pair and set them as httpOnly cookies. */
export async function setAuthCookies(res, user) {
  const access = signAccessToken(user);
  const refresh = await issueRefreshToken(user);
  const accessMaxAge = jwt.decode(access).exp * 1000 - Date.now();
  res.cookie(ACCESS_COOKIE, access, { ...baseCookie(), path: '/', maxAge: accessMaxAge });
  res.cookie(REFRESH_COOKIE, refresh.token, { ...baseCookie(), path: REFRESH_PATH, expires: refresh.expiresAt });
  return refresh.jti;
}

export function clearAuthCookies(res) {
  res.clearCookie(ACCESS_COOKIE, { ...baseCookie(), path: '/' });
  res.clearCookie(REFRESH_COOKIE, { ...baseCookie(), path: REFRESH_PATH });
}

/**
 * Validate and rotate a refresh token.
 * If a token that was already rotated is presented again, it has likely been stolen:
 * every refresh token for that user is revoked.
 * @returns {Promise<{userId: string, record: object}|null>} null if the token is invalid.
 */
export async function consumeRefreshToken(token) {
  let payload;
  try {
    payload = jwt.verify(token, env.jwt.refreshSecret);
  } catch {
    return null;
  }
  const record = await RefreshToken.findOne({ jti: payload.jti });
  if (!record || String(record.user) !== payload.sub) return null;
  if (record.revokedAt) {
    await RefreshToken.updateMany({ user: record.user, revokedAt: null }, { revokedAt: new Date() });
    return null;
  }
  record.revokedAt = new Date();
  await record.save();
  return { userId: payload.sub, record };
}

export async function revokeRefreshToken(token) {
  try {
    const { jti } = jwt.verify(token, env.jwt.refreshSecret);
    await RefreshToken.updateOne({ jti }, { revokedAt: new Date() });
  } catch {
    /* already invalid — nothing to revoke */
  }
}
