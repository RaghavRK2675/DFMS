import mongoose from 'mongoose';

const envSchema = new mongoose.Schema(
  {
    timestamp: { type: Date, default: Date.now, index: true },
    temperature: Number,
    humidity: Number,
    ammonia: Number,
    hygieneScore: Number,
  },
  { timestamps: false }
);

export default mongoose.model('EnvReading', envSchema);
