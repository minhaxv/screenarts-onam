import mongoose from 'mongoose';

const uploadedArtworkSchema = new mongoose.Schema(
  {
    fileName: { type: String, required: true },
    originalName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileType: { type: String, required: true },
    fileSize: { type: Number, required: true }, // in bytes
    customerName: { type: String, default: 'Guest Customer' },
    customerPhone: { type: String, default: '' },
    isApproved: { type: Boolean, default: false },
    securityStatus: { type: String, default: 'Verified Clean' },
  },
  { timestamps: true }
);

export default mongoose.model('UploadedArtwork', uploadedArtworkSchema);
