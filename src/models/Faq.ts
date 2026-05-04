import mongoose, { Document } from 'mongoose';

export interface IFaq extends Document {
  _id: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  question: string;
  answer: string;
  date: Date;
}

const FaqSchema = new mongoose.Schema<IFaq>({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  question: { type: String, required: true, trim: true },
  answer: { type: String, required: true, trim: true },
  date: { type: Date, default: Date.now },
});

// Explicitly handle model compilation to avoid "OverwriteModelError"
export default mongoose.models.Faq || mongoose.model<IFaq>('Faq', FaqSchema);
