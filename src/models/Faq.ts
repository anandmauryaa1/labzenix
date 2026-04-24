import mongoose, { Document } from 'mongoose';

export interface IFaq extends Document {
  _id: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  question: string;
  answer: string;
}

const FaqSchema = new mongoose.Schema<IFaq>({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  question: { type: String, required: true, trim: true },
  answer:   { type: String, required: true, trim: true },
});

if (mongoose.models.Faq) {
  delete mongoose.models.Faq;
}

export default mongoose.model<IFaq>('Faq', FaqSchema);
