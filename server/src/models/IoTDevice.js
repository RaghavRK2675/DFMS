import mongoose from 'mongoose';

const iotSchema = new mongoose.Schema(
  {
    deviceId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    type: { type: String, enum: ['temp_sensor', 'humidity_sensor', 'ammonia_sensor', 'camera', 'rfid_reader', 'feeder', 'gateway'], required: true },
    location: { type: String, required: true },
    status: { type: String, enum: ['online', 'offline', 'warning'], default: 'online' },
    battery: { type: Number, min: 0, max: 100, default: 100 },
    pingMs: { type: Number, default: 30 },
    firmware: { type: String, default: 'v1.0.0' },
    lastSeen: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model('IoTDevice', iotSchema);
