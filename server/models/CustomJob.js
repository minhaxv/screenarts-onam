import mongoose from 'mongoose';

const customJobSchema = new mongoose.Schema(
  {
    jobId: { type: String, required: true, unique: true },
    customer: { type: String, required: true },
    phone: { type: String, required: true },
    type: { type: String, required: true },
    fileName: { type: String },
    concept: { type: String },
    shirtColour: { type: String, default: 'White' },
    printLocation: { type: String, default: 'Front Center' },
    qty: { type: Number, default: 1 },
    date: { type: String, default: 'Today' },
    status: { type: String, default: 'Artwork Verified' },
  },
  { timestamps: true }
);

export default mongoose.model('CustomJob', customJobSchema);
