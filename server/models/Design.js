import mongoose from 'mongoose';

const designSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    category: { type: String, default: 'Malayalam' },
    previewEmoji: { type: String, default: '🌼' },
    imageUrl: { type: String },
    isPopular: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Design', designSchema);
