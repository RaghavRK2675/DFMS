import { Router } from 'express';
import IoTDevice from '../models/IoTDevice.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (_req, res) => {
  const devices = await IoTDevice.find().sort({ name: 1 });
  res.json({
    devices: devices.map((d) => ({
      id: d._id, deviceId: d.deviceId, name: d.name, type: d.type, location: d.location,
      status: d.status, battery: d.battery, pingMs: d.pingMs, firmware: d.firmware,
      lastSeen: d.lastSeen,
    })),
  });
});

export default router;
