import { Router } from 'express';
import { FeedRecord, NutritionProfile } from '../models/Nutrition.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/feed', async (_req, res) => {
  const records = await FeedRecord.find().sort({ _id: 1 });
  res.json({ feed: records });
});

router.get('/profiles', async (_req, res) => {
  const profiles = await NutritionProfile.find();
  res.json({
    pig: profiles.filter((p) => p.species === 'pig'),
    poultry: profiles.filter((p) => p.species === 'poultry'),
  });
});

export default router;
