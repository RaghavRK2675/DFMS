import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String }, // null for Google-only accounts
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: ['farmer', 'admin'], default: 'farmer' },
    googleId: { type: String, index: true, sparse: true },
    avatarUrl: { type: String },
    farmName: { type: String, default: 'My Farm' },
    location: { type: String, default: '' },
    phone: { type: String, default: '' },
    licenseId: { type: String, default: '' },
    preferences: {
      emailAlerts: { type: Boolean, default: true },
      pushAlerts: { type: Boolean, default: true },
      smsAlerts: { type: Boolean, default: false },
      criticalOnly: { type: Boolean, default: false },
      digestFrequency: { type: String, enum: ['realtime', 'hourly', 'daily'], default: 'realtime' },
      theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
    },
  },
  { timestamps: true }
);

userSchema.methods.setPassword = async function (plain) {
  this.passwordHash = await bcrypt.hash(plain, 12);
};
userSchema.methods.checkPassword = function (plain) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(plain, this.passwordHash);
};
userSchema.methods.toPublic = function () {
  return {
    id: this._id,
    email: this.email,
    name: this.name,
    role: this.role,
    avatarUrl: this.avatarUrl,
    farmName: this.farmName,
    location: this.location,
    phone: this.phone,
    licenseId: this.licenseId,
    preferences: this.preferences,
    createdAt: this.createdAt,
  };
};

export default mongoose.model('User', userSchema);
