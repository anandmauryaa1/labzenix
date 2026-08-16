import mongoose from 'mongoose';

export interface IOrder extends mongoose.Document {
  orderNumber: string;
  quotation: mongoose.Types.ObjectId;
  company: mongoose.Types.ObjectId;
  totalAmount: number;
  stage: 'Pending' | 'Production' | 'Ready' | 'Dispatched' | 'Delivered';
  invoiceNumber?: string;
  dispatchTrackingId?: string;
  dispatchDetails?: string;
  deliveryDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

if (mongoose.models && mongoose.models.Order) {
  delete mongoose.models.Order;
}

const OrderSchema = new mongoose.Schema<IOrder>({
  orderNumber: { type: String, required: true, unique: true },
  quotation: { type: mongoose.Schema.Types.ObjectId, ref: 'Quotation', required: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  totalAmount: { type: Number, required: true },
  stage: { 
    type: String, 
    enum: ['Pending', 'Production', 'Ready', 'Dispatched', 'Delivered'], 
    default: 'Pending',
    required: true 
  },
  invoiceNumber: { type: String },
  dispatchTrackingId: { type: String },
  dispatchDetails: { type: String },
  deliveryDate: { type: Date },
}, { 
  timestamps: true 
});

OrderSchema.index({ company: 1 });
OrderSchema.index({ stage: 1 });
OrderSchema.index({ orderNumber: 1 });

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
