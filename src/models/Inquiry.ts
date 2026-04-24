import mongoose, { Document, Schema } from 'mongoose';

export interface IInquiry extends Document {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  productId?: mongoose.Types.ObjectId;
  source: 'contact form' | 'product page' | 'download catalog';
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
    enum: ['contact form', 'product page', 'download catalog'],
    default: 'contact form' 
  }
}, {
  timestamps: true
});

InquirySchema.index({ source: 1, createdAt: -1 });

export default mongoose.models.Inquiry || mongoose.model<IInquiry>('Inquiry', InquirySchema);