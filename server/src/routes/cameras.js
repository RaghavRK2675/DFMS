import { Router } from 'express';
import { z } from 'zod';
import Camera from '../models/Camera.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (_req, res) => {
  const cams = await Camera.find().sort({ name: 1 });
  res.json({ cameras: cams.map((c) => ({
    id: c._id, name: c.name, location: c.location,
    streamUrl: c.streamUrl, streamType: c.streamType, isActive: c.isActive,
  })) });
});

const createSchema = z.object({
  name: z.string().min(1).max(80),
  location: z.string().min(1).max(80),
  streamUrl: z.string().url().max(500),
  streamType: z.enum(['hls', 'mp4']).default('hls'),
});
router.post('/', async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const cam = await Camera.create(parsed.data);
  res.json({ camera: cam });
});

router.delete('/:id', async (req, res) => {
  await Camera.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

export default router;
