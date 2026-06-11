import mongoose, { Document, Schema } from 'mongoose';

export interface IInquiry extends Document {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  productId?: mongoose.Types.ObjectId;
  source: string;
  createdAt: Date;
}

const InquirySchema = new Schema<IInquiry>({
  name: { type: String, required: true },
  email: { type: String, required: true, index: true },
  phone: { type: String },
  subject: { type: String },
  message: { type: String, required: true },
  productId: { type: Schema.Types.ObjectId, ref: 'Product' },
  source: { 
    type: String, 
    default: 'contact form' 
  }
}, {
  timestamps: true
});

InquirySchema.index({ source: 1, createdAt: -1 });

// Clear the model cache in development to ensure schema changes apply immediately
if (process.env.NODE_ENV !== 'production') {
  delete mongoose.models.Inquiry;
}

export default mongoose.models.Inquiry || mongoose.model<IInquiry>('Inquiry', InquirySchema);