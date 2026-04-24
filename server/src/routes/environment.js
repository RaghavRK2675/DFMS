import { Router } from 'express';
import EnvReading from '../models/EnvReading.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/trend', async (_req, res) => {
  const since = new Date(Date.now() - 12 * 60 * 60 * 1000);
  const readings = await EnvReading.find({ timestamp: { $gte: since } }).sort({ timestamp: 1 });
  res.json({
    trend: readings.map((r) => ({
      time: new Date(r.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }),
      temperature: r.temperature,
      humidity: r.humidity,
      ammonia: r.ammonia,
      hygieneScore: r.hygieneScore,
    })),
  });
});

router.get('/current', async (_req, res) => {
  const latest = await EnvReading.findOne().sort({ timestamp: -1 });
  if (!latest) return res.json({ current: null });
  res.json({
    current: {
      temperature: latest.temperature,
      humidity: latest.humidity,
      ammonia: latest.ammonia,
      hygieneScore: latest.hygieneScore,
      airQuality:
        latest.ammonia < 15 && latest.humidity < 65 ? 'Good' :
        latest.ammonia < 30 ? 'Moderate' : 'Poor',
    },
  });
});

export default router;
