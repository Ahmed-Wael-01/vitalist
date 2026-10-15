import { Scenario } from '../models/index.js';
import { HttpError } from '../utils/httpError.js';

export async function listScenarios(req, res) {
  const filter = { isPublished: true };
  if (req.query.specialty) filter.specialty = String(req.query.specialty);
  const scenarios = await Scenario.find(filter).sort({ specialty: 1, createdAt: -1 });
  res.json({ scenarios: scenarios.map((s) => s.toTraineeView()) });
}

export async function getScenario(req, res) {
  const scenario = await Scenario.findById(req.params.id);
  if (!scenario || (!scenario.isPublished && req.auth.role !== 'admin')) throw new HttpError(404, 'Scenario not found');
  res.json({ scenario: scenario.toTraineeView() });
}
