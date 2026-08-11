import mongoose from 'mongoose';

const variantSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    colour: { type: String, required: true },
    size: { type: String, required: true },
    sku: { type: String, required: true, unique: true },
    stock: { type: Number, default: 50 },
    priceModifier: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Variant', variantSchema);
