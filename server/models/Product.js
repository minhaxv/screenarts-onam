import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number, required: true },
    description: { type: String, default: '' },
    category: [{ type: String }],
    tags: [{ type: String }],
    colours: [{ type: String }],
    sizes: [{ type: String }],
    sizeType: { type: String, default: 'adult' },
    printLocation: { type: String, default: 'front' },
    printRatio: { type: String, default: '4:5' },
    imageType: { type: String, default: 'vector' },
    images: {
      front: { type: String, default: '/images/custom-flatlay.png' },
      lifestyle: { type: String, default: '/images/hero-lifestyle.png' },
    },
    isNew: { type: Boolean, default: false },
    isBestseller: { type: Boolean, default: false },
    inStock: { type: Boolean, default: true },
    rating: { type: Number, default: 5.0 },
    reviewsCount: { type: Number, default: 12 },
  },
  { timestamps: true, suppressReservedKeysWarning: true }
);

export default mongoose.model('Product', productSchema);
