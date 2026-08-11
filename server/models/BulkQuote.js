import mongoose from 'mongoose';

const bulkQuoteSchema = new mongoose.Schema(
  {
    quoteId: { type: String, required: true, unique: true },
    groupType: { type: String, required: true },
    organization: { type: String, required: true },
    contactPerson: { type: String, required: true },
    phone: { type: String, required: true },
    quantity: { type: Number, required: true },
    estimatedRatePerPc: { type: Number, required: true },
    estimatedTotal: { type: Number, required: true },
    notes: { type: String },
    requestDate: { type: String, default: 'Today' },
    status: { type: String, default: 'Pending Review' },
  },
  { timestamps: true }
);

export default mongoose.model('BulkQuote', bulkQuoteSchema);
