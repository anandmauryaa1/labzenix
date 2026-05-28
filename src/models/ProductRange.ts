import mongoose, { Document } from 'mongoose';

export interface IProductRange extends Document {
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

const ProductRangeSchema = new mongoose.Schema<IProductRange>({
  title: { type: String, required: [true, 'Title is required'], unique: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: [true, 'Description is required'] },
  image: { type: String, required: [true, 'Image is required'] },
  order: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

// Handle model compilation error in development with hot-reloading
if (process.env.NODE_ENV === 'development') {
  delete mongoose.models.ProductRange;
}

export default mongoose.models.ProductRange || mongoose.model<IProductRange>('ProductRange', ProductRangeSchema);
