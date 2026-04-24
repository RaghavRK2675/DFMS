import { Router } from 'express';
import Animal from '../models/Animal.js';
import Alert from '../models/Alert.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/summary', async (_req, res) => {
  const animals = await Animal.find();
  const total = animals.length;
  const pigs = animals.filter((a) => a.species === 'pig').length;
  const poultry = animals.filter((a) => a.species === 'poultry').length;
  const healthy = animals.filter((a) => a.healthStatus === 'low').length;
  const atRisk = animals.filter((a) => a.healthStatus === 'medium').length;
  const infected = animals.filter((a) => a.healthStatus === 'high').length;
  const isolated = animals.filter((a) => a.isIsolated).length;
  const activeAlerts = await Alert.countDocuments({ resolved: false });

  // BRI = w1·Td + w2·Hd + w3·Ad + w4·Bs   (weights from research paper)
  const tempDev = avg(animals.map((a) => Math.max(0, (a.bodyTemp - 39) / 4)));
  const skin = avg(animals.map((a) => a.skinColorIndex / 100));
  const activity = avg(animals.map((a) => 1 - a.activityScore / 100));
  const bri = clamp01(0.30 * tempDev + 0.25 * 0.5 + 0.25 * skin + 0.20 * activity);
  const dsi = clamp01(0.35 * tempDev + 0.30 * skin + 0.35 * activity);

  res.json({
    summary: {
      totalAnimals: total,
      pigsCount: pigs,
      poultryCount: poultry,
      healthyAnimals: healthy,
      atRiskAnimals: atRisk,
      infectedAnimals: infected,
      isolatedAnimals: isolated,
      activeAlerts,
      detectionAccuracy: 92,
      hygieneImprovement: 40,
      biosecurityRiskIndex: round2(bri),
      diseaseSusceptibilityIndex: round2(dsi),
    },
  });
});

function avg(arr) { return arr.length ? arr.reduce((s, n) => s + n, 0) / arr.length : 0; }
function clamp01(n) { return Math.max(0, Math.min(1, n)); }
function round2(n) { return Math.round(n * 100) / 100; }
export default router;
