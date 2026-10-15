import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { asyncHandler } from '../utils/httpError.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import * as ctrl from '../controllers/auth.controller.js';

const router = Router();
const credentialLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: 'draft-7', legacyHeaders: false });

router.post('/register', credentialLimiter, validateBody(ctrl.registerSchema), asyncHandler(ctrl.register));
router.post('/login', credentialLimiter, validateBody(ctrl.loginSchema), asyncHandler(ctrl.login));
router.post('/refresh', asyncHandler(ctrl.refresh));
router.post('/logout', asyncHandler(ctrl.logout));
router.get('/me', requireAuth, asyncHandler(ctrl.me));
router.patch('/me', requireAuth, validateBody(ctrl.updateMeSchema), asyncHandler(ctrl.updateMe));

export default router;
