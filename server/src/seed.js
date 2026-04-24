import 'dotenv/config';
import mongoose from 'mongoose';
import Animal from './models/Animal.js';
import Alert from './models/Alert.js';
import EnvReading from './models/EnvReading.js';
import IoTDevice from './models/IoTDevice.js';
import { FeedRecord, NutritionProfile } from './models/Nutrition.js';

const ANIMALS = [
  { tag: 'P-001', species: 'pig', breed: 'Yorkshire',  pen: 'Pen A', bodyTemp: 38.6, skinColorIndex: 12, activityScore: 88 },
  { tag: 'P-002', species: 'pig', breed: 'Yorkshire',  pen: 'Pen A', bodyTemp: 40.4, skinColorIndex: 67, activityScore: 42, isIsolated: true },
  { tag: 'P-003', species: 'pig', breed: 'Berkshire',  pen: 'Pen B', bodyTemp: 39.1, skinColorIndex: 34, activityScore: 71 },
  { tag: 'P-004', species: 'pig', breed: 'Berkshire',  pen: 'Pen B', bodyTemp: 38.8, skinColorIndex: 18, activityScore: 82 },
  { tag: 'P-005', species: 'pig', breed: 'Landrace',   pen: 'Pen C', bodyTemp: 39.8, skinColorIndex: 52, activityScore: 55 },
  { tag: 'P-006', species: 'pig', breed: 'Landrace',   pen: 'Pen C', bodyTemp: 38.4, skinColorIndex: 14, activityScore: 86 },
  { tag: 'P-007', species: 'pig', breed: 'Duroc',      pen: 'Pen A', bodyTemp: 39.0, skinColorIndex: 22, activityScore: 78 },
  { tag: 'P-008', species: 'pig', breed: 'Duroc',      pen: 'Pen B', bodyTemp: 38.7, skinColorIndex: 16, activityScore: 84 },
  { tag: 'BK-001', species: 'poultry', breed: 'Broiler', pen: 'House 1', bodyTemp: 41.1, skinColorIndex: 9, activityScore: 91 },
  { tag: 'BK-002', species: 'poultry', breed: 'Broiler', pen: 'House 1', bodyTemp: 42.8, skinColorIndex: 48, activityScore: 38, isIsolated: true },
  { tag: 'BK-003', species: 'poultry', breed: 'Layer',   pen: 'House 2', bodyTemp: 41.5, skinColorIndex: 21, activityScore: 79 },
  { tag: 'BK-004', species: 'poultry', breed: 'Layer',   pen: 'House 2', bodyTemp: 41.3, skinColorIndex: 17, activityScore: 83 },
  { tag: 'BK-005', species: 'poultry', breed: 'Layer',   pen: 'House 2', bodyTemp: 41.8, skinColorIndex: 25, activityScore: 75 },
];

const ALERTS = [
  { type: 'disease', severity: 'high', message: 'High fever detected — P-002 (Pen A). Possible Swine Fever. Animal isolated.', animal: 'P-002', pen: 'Pen A' },
  { type: 'disease', severity: 'high', message: 'Abnormal activity & elevated temp — BK-002 (House 1). Avian infection suspected.', animal: 'BK-002', pen: 'House 1' },
  { type: 'environment', severity: 'medium', message: 'Ammonia level approaching critical threshold (30 ppm). Improve ventilation.', pen: 'All Pens' },
  { type: 'behavior', severity: 'medium', message: 'Reduced activity & social isolation observed — P-005 (Pen C).', animal: 'P-005', pen: 'Pen C' },
  { type: 'nutrition', severity: 'low', message: 'Under-feeding pattern detected in Pen B for 2 consecutive days.', pen: 'Pen B', resolved: true },
  { type: 'environment', severity: 'low', message: 'Hygiene score dropped to 65 in House 1. Schedule cleaning.', pen: 'House 1', resolved: true },
];

const IOT = [
  { deviceId: 'TS-001', name: 'Temp Sensor — Pen A', type: 'temp_sensor', location: 'Pen A', battery: 87, pingMs: 28, firmware: 'v2.1.4' },
  { deviceId: 'TS-002', name: 'Temp Sensor — Pen B', type: 'temp_sensor', location: 'Pen B', battery: 72, pingMs: 35, firmware: 'v2.1.4' },
  { deviceId: 'HS-001', name: 'Humidity — Pen A',     type: 'humidity_sensor', location: 'Pen A', battery: 91, pingMs: 22, firmware: 'v2.0.8' },
  { deviceId: 'AM-001', name: 'Ammonia — House 1',    type: 'ammonia_sensor',  location: 'House 1', battery: 64, pingMs: 41, firmware: 'v1.9.2', status: 'warning' },
  { deviceId: 'CAM-01', name: 'Camera — Pen A',       type: 'camera', location: 'Pen A', battery: 100, pingMs: 18, firmware: 'v3.2.0' },
  { deviceId: 'CAM-02', name: 'Camera — House 1',     type: 'camera', location: 'House 1', battery: 100, pingMs: 24, firmware: 'v3.2.0' },
  { deviceId: 'RFID-01', name: 'RFID Reader — Gate',  type: 'rfid_reader', location: 'Main Gate', battery: 100, pingMs: 12, firmware: 'v1.4.0' },
  { deviceId: 'FD-001', name: 'Auto Feeder — Pen B',  type: 'feeder', location: 'Pen B', battery: 55, pingMs: 33, firmware: 'v2.3.1' },
  { deviceId: 'FD-002', name: 'Auto Feeder — House 2',type: 'feeder', location: 'House 2', battery: 48, pingMs: 38, firmware: 'v2.3.1', status: 'warning' },
  { deviceId: 'GW-001', name: 'IoT Gateway — Main',   type: 'gateway', location: 'Control Room', battery: 100, pingMs: 8, firmware: 'v4.0.1' },
  { deviceId: 'TS-003', name: 'Temp Sensor — House 2',type: 'temp_sensor', location: 'House 2', battery: 0, pingMs: 0, firmware: 'v2.1.4', status: 'offline' },
];

const FEED = [
  { date: 'Mon', pigStarter: 48, pigGrower: 62, pigFinisher: 75, poultryStarter: 32, poultryGrower: 45, poultryLayer: 38 },
  { date: 'Tue', pigStarter: 50, pigGrower: 60, pigFinisher: 78, poultryStarter: 30, poultryGrower: 47, poultryLayer: 40 },
  { date: 'Wed', pigStarter: 45, pigGrower: 58, pigFinisher: 72, poultryStarter: 28, poultryGrower: 44, poultryLayer: 36 },
  { date: 'Thu', pigStarter: 52, pigGrower: 65, pigFinisher: 80, poultryStarter: 33, poultryGrower: 49, poultryLayer: 42 },
  { date: 'Fri', pigStarter: 49, pigGrower: 61, pigFinisher: 76, poultryStarter: 31, poultryGrower: 46, poultryLayer: 39 },
  { date: 'Sat', pigStarter: 47, pigGrower: 59, pigFinisher: 73, poultryStarter: 29, poultryGrower: 43, poultryLayer: 37 },
  { date: 'Sun', pigStarter: 51, pigGrower: 63, pigFinisher: 77, poultryStarter: 34, poultryGrower: 48, poultryLayer: 41 },
];

const NUTRITION = [
  { species: 'pig', stage: 'Starter (0–8 wk)', crudeProtein: 20, energy: 3400, lysine: 1.35, threonine: 0.88, minerals: 2 },
  { species: 'pig', stage: 'Grower (8–16 wk)', crudeProtein: 18, energy: 3300, lysine: 1.10, threonine: 0.72, minerals: 2 },
  { species: 'pig', stage: 'Finisher (>16 wk)', crudeProtein: 16, energy: 3200, lysine: 0.95, threonine: 0.62, minerals: 2 },
  { species: 'poultry', stage: 'Starter', crudeProtein: 22, energy: 3000, lysine: 1.40, threonine: 0.90, minerals: 1.8 },
  { species: 'poultry', stage: 'Grower', crudeProtein: 19, energy: 3100, lysine: 1.15, threonine: 0.75, minerals: 1.9 },
  { species: 'poultry', stage: 'Layer/Finisher', crudeProtein: 16, energy: 2900, lysine: 0.85, threonine: 0.65, minerals: 3.5 },
];

export async function seedIfEmpty() {
  if ((await Animal.countDocuments()) > 0) {
    console.log('ℹ️  Seed skipped — data already exists');
    return;
  }
  console.log('🌱 Seeding demo data…');
  await Animal.insertMany(ANIMALS.map((a) => ({ ...a, healthStatus: classify(a) })));
  await Alert.insertMany(ALERTS);
  await IoTDevice.insertMany(IOT);
  await FeedRecord.insertMany(FEED);
  await NutritionProfile.insertMany(NUTRITION);
  // 12h env trend, one reading every 30 min
  const now = Date.now();
  const trend = [];
  for (let i = 24; i >= 0; i--) {
    const t = new Date(now - i * 30 * 60 * 1000);
    const hour = t.getHours() + t.getMinutes() / 60;
    const diurnal = Math.sin(((hour - 6) / 24) * Math.PI * 2);
    trend.push({
      timestamp: t,
      temperature: round1(24 + 4 * diurnal + (Math.random() - 0.5)),
      humidity: Math.round(60 - 6 * diurnal + (Math.random() - 0.5) * 3),
      ammonia: Math.round(15 + 8 * diurnal + (Math.random() - 0.5) * 3),
      hygieneScore: Math.round(78 - 8 * diurnal + (Math.random() - 0.5) * 3),
    });
  }
  await EnvReading.insertMany(trend);
  console.log('✅ Seed complete');
}

export function startLiveSimulation() {
  console.log('⚡ Live simulation enabled — sensors update every 30s');
  setInterval(async () => {
    try {
      // 1. Append a new env reading
      const last = await EnvReading.findOne().sort({ timestamp: -1 });
      const base = last || { temperature: 26, humidity: 60, ammonia: 18, hygieneScore: 75 };
      await EnvReading.create({
        timestamp: new Date(),
        temperature: round1(clamp(base.temperature + (Math.random() - 0.5) * 0.6, 18, 38)),
        humidity: Math.round(clamp(base.humidity + (Math.random() - 0.5) * 2, 40, 90)),
        ammonia: Math.round(clamp(base.ammonia + (Math.random() - 0.5) * 1.5, 5, 45)),
        hygieneScore: Math.round(clamp(base.hygieneScore + (Math.random() - 0.5) * 2, 50, 95)),
      });
      // Cap to last 48 readings (~24h at 30min resolution)
      const docs = await EnvReading.find().sort({ timestamp: -1 }).skip(48);
      if (docs.length) await EnvReading.deleteMany({ _id: { $in: docs.map((d) => d._id) } });

      // 2. Jitter animals slightly
      const animals = await Animal.find();
      for (const a of animals) {
        a.bodyTemp = round1(clamp(a.bodyTemp + (Math.random() - 0.5) * 0.2, 37.5, 43));
        a.activityScore = Math.round(clamp(a.activityScore + (Math.random() - 0.5) * 2, 0, 100));
        a.healthStatus = a.bodyTemp > 40.2 || a.skinColorIndex > 60 ? 'high'
          : a.bodyTemp > 39.5 || a.skinColorIndex > 35 ? 'medium' : 'low';
        a.lastChecked = new Date();
        await a.save();
      }

      // 3. Update IoT pings/batteries
      const devices = await IoTDevice.find();
      for (const d of devices) {
        if (d.status === 'offline') continue;
        d.pingMs = Math.max(5, Math.round(d.pingMs + (Math.random() - 0.5) * 4));
        if (d.battery > 0) d.battery = Math.max(0, d.battery - (Math.random() < 0.05 ? 1 : 0));
        d.lastSeen = new Date();
        if (d.battery < 20 && d.status === 'online') d.status = 'warning';
        await d.save();
      }
    } catch (e) {
      console.error('simulation tick failed', e.message);
    }
  }, 30_000);
}

function classify(a) {
  if (a.bodyTemp > 40.2 || a.skinColorIndex > 60) return 'high';
  if (a.bodyTemp > 39.5 || a.skinColorIndex > 35) return 'medium';
  return 'low';
}
function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }
function round1(n) { return Math.round(n * 10) / 10; }

// Allow `npm run seed` standalone
if (import.meta.url === `file://${process.argv[1]}`) {
  mongoose.connect(process.env.MONGODB_URI).then(async () => {
    await Animal.deleteMany({}); await Alert.deleteMany({}); await EnvReading.deleteMany({});
    await IoTDevice.deleteMany({}); await FeedRecord.deleteMany({}); await NutritionProfile.deleteMany({});
    await seedIfEmpty();
    process.exit(0);
  });
}
