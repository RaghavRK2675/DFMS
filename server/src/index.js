import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import animalRoutes from './routes/animals.js';
import alertRoutes from './routes/alerts.js';
import envRoutes from './routes/environment.js';
import iotRoutes from './routes/iot.js';
import cameraRoutes from './routes/cameras.js';
import nutritionRoutes from './routes/nutrition.js';
import statsRoutes from './routes/stats.js';
import { seedIfEmpty, startLiveSimulation } from './seed.js';

const app = express();

app.set('trust proxy', 1);
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('tiny'));

const allowedOrigins = (process.env.CORS_ORIGINS || '*')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return cb(null, true);
      }
      return cb(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  })
);

app.use(
  '/api/auth/',
  rateLimit({ windowMs: 15 * 60 * 1000, max: 50, standardHeaders: true })
);

app.get('/api/health', (_req, res) =>
  res.json({ ok: true, service: 'dfms-api', time: new Date().toISOString() })
);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/animals', animalRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/environment', envRoutes);
app.use('/api/iot', iotRoutes);
app.use('/api/cameras', cameraRoutes);
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/stats', statsRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

const { PORT = 4000, MONGODB_URI } = process.env;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not set. Copy .env.example → .env and fill it in.');
  process.exit(1);
}

mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log('✅ MongoDB connected');
    if (process.env.ENABLE_SEED !== 'false') await seedIfEmpty();
    if (process.env.ENABLE_LIVE_SIMULATION !== 'false') startLiveSimulation();
    app.listen(PORT, () => console.log(`🚀 DFMS API listening on :${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed', err);
    process.exit(1);
  });
