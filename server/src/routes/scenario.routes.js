import { Router } from 'express';
import { asyncHandler } from '../utils/httpError.js';
import { requireAuth } from '../middleware/auth.js';
import * as ctrl from '../controllers/scenario.controller.js';

const router = Router();
router.use(requireAuth);
router.get('/', asyncHandler(ctrl.listScenarios));
router.get('/:id', asyncHandler(ctrl.getScenario));

export default router;
