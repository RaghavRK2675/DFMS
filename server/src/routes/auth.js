import { Router } from 'express';
import { z } from 'zod';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import { signToken, requireAuth } from '../middleware/auth.js';

const router = Router();

const signupSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(100),
  farmName: z.string().max(100).optional(),
});

router.post('/signup', async (req, res) => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { email, password, name, farmName } = parsed.data;
  if (await User.findOne({ email })) return res.status(409).json({ error: 'Email already registered' });
  const user = new User({ email, name, farmName: farmName || `${name}'s Farm` });
  await user.setPassword(password);
  await user.save();
  return res.json({ token: signToken(user), user: user.toPublic() });
});

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });
router.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const user = await User.findOne({ email: parsed.data.email });
  if (!user || !(await user.checkPassword(parsed.data.password))) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  return res.json({ token: signToken(user), user: user.toPublic() });
});

const googleSchema = z.object({ credential: z.string().min(10) });
router.post('/google', async (req, res) => {
  const parsed = googleSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) return res.status(500).json({ error: 'Google sign-in not configured on server' });
  try {
    const client = new OAuth2Client(clientId);
    const ticket = await client.verifyIdToken({ idToken: parsed.data.credential, audience: clientId });
    const payload = ticket.getPayload();
    const email = payload.email?.toLowerCase();
    if (!email) return res.status(400).json({ error: 'Google account has no email' });
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        email, name: payload.name || email.split('@')[0],
        googleId: payload.sub, avatarUrl: payload.picture,
        farmName: `${payload.given_name || 'My'} Farm`,
      });
      await user.save();
    } else if (!user.googleId) {
      user.googleId = payload.sub;
      if (payload.picture && !user.avatarUrl) user.avatarUrl = payload.picture;
      await user.save();
    }
    return res.json({ token: signToken(user), user: user.toPublic() });
  } catch (e) {
    return res.status(401).json({ error: 'Invalid Google token' });
  }
});

router.get('/me', requireAuth, (req, res) => res.json({ user: req.user.toPublic() }));

router.post('/logout', requireAuth, (_req, res) => res.json({ ok: true }));

export default router;
