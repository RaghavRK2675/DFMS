import mongoose from 'mongoose';

const cameraSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: { type: String, required: true },
    streamUrl: { type: String, required: true }, // HLS .m3u8 or RTSP-to-HLS proxy URL
    streamType: { type: String, enum: ['hls', 'mp4'], default: 'hls' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Camera', cameraSchema);
