import { Router } from 'express';
import Alert from '../models/Alert.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  const filter = {};
  if (req.query.resolved === 'false') filter.resolved = false;
  if (req.query.resolved === 'true') filter.resolved = true;
  const alerts = await Alert.find(filter).sort({ createdAt: -1 }).limit(100);
  res.json({ alerts: alerts.map((a) => a.toClient()) });
});

router.patch('/:id/resolve', async (req, res) => {
  const a = await Alert.findById(req.params.id);
  if (!a) return res.status(404).json({ error: 'Not found' });
  a.resolved = true;
  a.resolvedAt = new Date();
  await a.save();
  res.json({ alert: a.toClient() });
});

export default router;
