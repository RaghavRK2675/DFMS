import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['disease', 'environment', 'nutrition', 'behavior'], required: true },
    severity: { type: String, enum: ['low', 'medium', 'high'], required: true },
    message: { type: String, required: true },
    animal: { type: String },
    pen: { type: String },
    resolved: { type: Boolean, default: false },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

alertSchema.methods.toClient = function () {
  return {
    id: this._id,
    type: this.type,
    severity: this.severity,
    message: this.message,
    animal: this.animal,
    pen: this.pen,
    resolved: this.resolved,
    timestamp: new Date(this.createdAt).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
    }),
  };
};

export default mongoose.model('Alert', alertSchema);
