import mongoose, { Document } from 'mongoose';

export interface IReview extends Document {
  _id: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  author: string;
  rating: number;
  comment: string;
  images: string[];
  date: Date;
}

const ReviewSchema = new mongoose.Schema<IReview>({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  author:  { type: String, required: true, trim: true },
  rating:  { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true, trim: true },
  images:  { type: [String], default: [] },
  date:    { type: Date, default: Date.now },
});

if (mongoose.models.Review) {
  delete mongoose.models.Review;
}

export default mongoose.model<IReview>('Review', ReviewSchema);
