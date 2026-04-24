import mongoose from 'mongoose';

const animalSchema = new mongoose.Schema(
  {
    tag: { type: String, required: true, unique: true },
    species: { type: String, enum: ['pig', 'poultry'], required: true },
    breed: { type: String, default: '' },
    pen: { type: String, required: true },
    bodyTemp: { type: Number, default: 38.5 },
    skinColorIndex: { type: Number, default: 15, min: 0, max: 100 },
    activityScore: { type: Number, default: 80, min: 0, max: 100 },
    healthStatus: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
    isIsolated: { type: Boolean, default: false },
    lastChecked: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

animalSchema.methods.toClient = function () {
  return {
    id: this._id,
    tag: this.tag,
    species: this.species,
    breed: this.breed,
    pen: this.pen,
    bodyTemp: this.bodyTemp,
    skinColorIndex: this.skinColorIndex,
    activityScore: this.activityScore,
    healthStatus: this.healthStatus,
    isIsolated: this.isIsolated,
    lastChecked: timeAgo(this.lastChecked),
  };
};

export function timeAgo(date) {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return `${Math.floor(diff / 86400)} d ago`;
}

export default mongoose.model('Animal', animalSchema);
