import { Router } from 'express';
import { asyncHandler } from '../utils/httpError.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import * as ctrl from '../controllers/admin.controller.js';

const router = Router();
router.use(requireAuth, requireRole('admin'));
router.get('/overview', asyncHandler(ctrl.overview));
router.get('/scenarios', asyncHandler(ctrl.listScenarios));
router.post('/scenarios', validateBody(ctrl.scenarioSchema), asyncHandler(ctrl.createScenario));
router.get('/scenarios/:id', asyncHandler(ctrl.getScenario));
router.put('/scenarios/:id', validateBody(ctrl.scenarioSchema), asyncHandler(ctrl.updateScenario));
router.patch('/scenarios/:id/publish', validateBody(ctrl.publishSchema), asyncHandler(ctrl.setPublished));
router.delete('/scenarios/:id', asyncHandler(ctrl.deleteScenario));

export default router;
