import mongoose, { Document } from 'mongoose';

export interface ICompleteProductRange extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  description: string;
  image: string;
  coreComponents: string[];
  order: number;
  active: boolean;
  createdAt: Date;
}

const CompleteProductRangeSchema = new mongoose.Schema<ICompleteProductRange>({
  title: { type: String, required: [true, 'Title is required'], unique: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: [true, 'Description is required'] },
  image: { type: String, required: [true, 'Image is required'] },
  order: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

if (process.env.NODE_ENV === 'development') {
  delete mongoose.models.CompleteProductRange;
}

export default mongoose.models.CompleteProductRange || mongoose.model<ICompleteProductRange>('CompleteProductRange', CompleteProductRangeSchema);
