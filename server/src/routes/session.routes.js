import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { asyncHandler } from '../utils/httpError.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import * as ctrl from '../controllers/session.controller.js';

const router = Router();
// Each chat message may call the patient AI — cap per-user throughput.
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  keyGenerator: (req) => req.auth.userId,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

router.use(requireAuth);
router.post('/', validateBody(ctrl.startSchema), asyncHandler(ctrl.startSession));
router.get('/', asyncHandler(ctrl.listMySessions));
router.get('/:id', asyncHandler(ctrl.getSession));
router.post('/:id/messages', chatLimiter, validateBody(ctrl.messageSchema), asyncHandler(ctrl.postMessage));
router.post('/:id/commit', validateBody(ctrl.commitSchema), asyncHandler(ctrl.commitDifferential));
router.post('/:id/actions', validateBody(ctrl.actionSchema), asyncHandler(ctrl.performAction));
router.post('/:id/submit', validateBody(ctrl.submitSchema), asyncHandler(ctrl.submitSession));
router.get('/:id/scorecard', asyncHandler(ctrl.getScorecard));

export default router;
