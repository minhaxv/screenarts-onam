import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    workflow: {
      type: String,
      enum: ['PRINT_ONLY', 'PRINT_SETUP', 'FULL_DESIGN'],
      default: 'PRINT_ONLY',
    },
    customerName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, default: '' },
    deliveryMethod: { type: String, enum: ['pickup', 'home'], default: 'home' },
    deliveryAddress: { type: String, default: '' },
    pincode: { type: String, default: '' },
    items: [
      {
        productId: String,
        name: String,
        colour: String,
        size: String,
        printLocation: String,
        printRatio: String,
        quantity: Number,
        price: Number,
        customText: String,
        customImage: String,
        customDesignName: String,
      },
    ],
    totalAmount: { type: Number, required: true },
    paymentStatus: { type: String, default: 'Paid (UPI)' },
    status: {
      type: String,
      enum: [
        'Pending',
        'Design Review',
        'Artwork Approved',
        'Production',
        'Ready',
        'Shipped',
        'Completed',
        'Cancelled',
      ],
      default: 'Pending',
    },
    uploadedArtworkUrl: { type: String },
    designNotes: { type: String, default: '' },
    printSpecs: { type: String, default: 'High Definition DTG Printing' },
  },
  { timestamps: true }
);

export default mongoose.model('Order', orderSchema);
