import { Router } from 'express';
import { z } from 'zod';
import Animal from '../models/Animal.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (_req, res) => {
  const animals = await Animal.find().sort({ tag: 1 });
  res.json({ animals: animals.map((a) => a.toClient()) });
});

const createSchema = z.object({
  tag: z.string().min(1).max(20),
  species: z.enum(['pig', 'poultry']),
  breed: z.string().max(50).optional(),
  pen: z.string().min(1).max(50),
});
router.post('/', async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const animal = await Animal.create(parsed.data);
  res.json({ animal: animal.toClient() });
});

router.post('/refresh', async (_req, res) => {
  // Trigger a one-shot jitter (useful when "Refresh" is clicked from UI)
  const animals = await Animal.find();
  for (const a of animals) {
    a.bodyTemp = clamp(a.bodyTemp + (Math.random() - 0.5) * 0.4, 37.5, 43);
    a.skinColorIndex = Math.round(clamp(a.skinColorIndex + (Math.random() - 0.5) * 4, 0, 100));
    a.activityScore = Math.round(clamp(a.activityScore + (Math.random() - 0.5) * 5, 0, 100));
    a.healthStatus = a.bodyTemp > 40.2 || a.skinColorIndex > 60 ? 'high'
      : a.bodyTemp > 39.5 || a.skinColorIndex > 35 ? 'medium' : 'low';
    a.lastChecked = new Date();
    await a.save();
  }
  const fresh = await Animal.find().sort({ tag: 1 });
  res.json({ animals: fresh.map((a) => a.toClient()) });
});

router.patch('/:id/isolate', async (req, res) => {
  const a = await Animal.findById(req.params.id);
  if (!a) return res.status(404).json({ error: 'Not found' });
  a.isIsolated = !!req.body.isIsolated;
  await a.save();
  res.json({ animal: a.toClient() });
});

function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }
export default router;
