import mongoose from 'mongoose';

const InquirySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  subject: { type: String },
  message: { type: String, required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  source: { 
    type: String, 
    enum: ['contact form', 'product page', 'download catalog'],
    default: 'contact form'
  },
  createdAt: { type: Date, default: Date.now },
});

// Handle model cache during development to ensure schema changes are picked up
if (mongoose.models.Inquiry) {
  delete mongoose.models.Inquiry;
}

export default mongoose.model('Inquiry', InquirySchema);