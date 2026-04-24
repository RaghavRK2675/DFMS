import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const profileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  farmName: z.string().max(100).optional(),
  location: z.string().max(200).optional(),
  phone: z.string().max(30).optional(),
  licenseId: z.string().max(50).optional(),
  avatarUrl: z.string().url().max(500).optional(),
});

router.patch('/me', requireAuth, async (req, res) => {
  const parsed = profileSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  Object.assign(req.user, parsed.data);
  await req.user.save();
  res.json({ user: req.user.toPublic() });
});

const prefsSchema = z.object({
  emailAlerts: z.boolean().optional(),
  pushAlerts: z.boolean().optional(),
  smsAlerts: z.boolean().optional(),
  criticalOnly: z.boolean().optional(),
  digestFrequency: z.enum(['realtime', 'hourly', 'daily']).optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
});

router.patch('/me/preferences', requireAuth, async (req, res) => {
  const parsed = prefsSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  req.user.preferences = { ...req.user.preferences.toObject(), ...parsed.data };
  await req.user.save();
  res.json({ preferences: req.user.preferences });
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128),
});

router.post('/me/change-password', requireAuth, async (req, res) => {
  const parsed = passwordSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  if (!(await req.user.checkPassword(parsed.data.currentPassword))) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }
  await req.user.setPassword(parsed.data.newPassword);
  await req.user.save();
  res.json({ ok: true });
});

router.delete('/me', requireAuth, async (req, res) => {
  await req.user.deleteOne();
  res.json({ ok: true });
});

export default router;
