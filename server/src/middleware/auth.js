import { ACCESS_COOKIE, verifyAccessToken } from '../utils/tokens.js';
import { HttpError } from '../utils/httpError.js';

export function requireAuth(req, _res, next) {
  const token = req.cookies?.[ACCESS_COOKIE];
  if (!token) return next(new HttpError(401, 'Authentication required'));
  try {
    const payload = verifyAccessToken(token);
    req.auth = { userId: payload.sub, role: payload.role };
    next();
  } catch {
    next(new HttpError(401, 'Access token expired or invalid'));
  }
}

export const requireRole = (...roles) => (req, _res, next) => {
  if (!req.auth || !roles.includes(req.auth.role)) return next(new HttpError(403, 'Insufficient permissions'));
  next();
};
