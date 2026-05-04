import mongoose, { Document } from 'mongoose';

export interface ISiteFaq extends Document {
  _id: mongoose.Types.ObjectId;
  question: string;
  answer: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
}

const SiteFaqSchema = new mongoose.Schema<ISiteFaq>({
  question: { type: String, required: true, trim: true },
  answer:   { type: String, required: true, trim: true },
  isActive: { type: Boolean, default: true, index: true },
  order:    { type: Number, default: 0, index: true },
  createdAt: { type: Date, default: Date.now },
});

SiteFaqSchema.index({ isActive: 1, order: 1 });

export default mongoose.models.SiteFaq || mongoose.model<ISiteFaq>('SiteFaq', SiteFaqSchema);
