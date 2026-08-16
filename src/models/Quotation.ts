import mongoose from 'mongoose';

export interface IQuotationItem {
  product: mongoose.Types.ObjectId;
  quantity: number;
  price: number; // Unit price at quote time
  hsnCode: string;
}

export interface IQuotation extends mongoose.Document {
  quotationNumber: string; // Unique formatted index
  company: mongoose.Types.ObjectId;
  contact: mongoose.Types.ObjectId;
  items: IQuotationItem[];
  gstRate: number; // Percentage (e.g. 18)
  discountPercentage: number;
  subTotal: number; // Sum of price * qty
  gstAmount: number; // subTotal * gstRate/100
  totalAmount: number; // subTotal - discount + gstAmount
  termsAndConditions?: string;
  status: 'Draft' | 'Sent' | 'Approved' | 'Rejected';
  createdBy: mongoose.Types.ObjectId; // User reference
  createdAt: Date;
  updatedAt: Date;
}

if (mongoose.models && mongoose.models.Quotation) {
  delete mongoose.models.Quotation;
}

const QuotationSchema = new mongoose.Schema<IQuotation>({
  quotationNumber: { type: String, required: true, unique: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  contact: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, default: 1 },
    price: { type: Number, required: true },
    hsnCode: { type: String, required: true },
  }],
  gstRate: { type: Number, required: true, default: 18 },
  discountPercentage: { type: Number, required: true, default: 0 },
  subTotal: { type: Number, required: true, default: 0 },
  gstAmount: { type: Number, required: true, default: 0 },
  totalAmount: { type: Number, required: true, default: 0 },
  termsAndConditions: { type: String },
  status: { 
    type: String, 
    enum: ['Draft', 'Sent', 'Approved', 'Rejected'], 
    default: 'Draft',
    required: true 
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { 
  timestamps: true 
});

QuotationSchema.index({ company: 1 });
QuotationSchema.index({ status: 1 });
QuotationSchema.index({ quotationNumber: 1 });

export default mongoose.models.Quotation || mongoose.model<IQuotation>('Quotation', QuotationSchema);
