import mongoose, { Document } from 'mongoose';

export interface ICategory extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  image: string;
  imagePublicId: string;
  catalogUrl: string;
  catalogPublicId: string;
  createdAt: Date;
}

const CategorySchema = new mongoose.Schema<ICategory>({
  name: { type: String, required: [true, 'Category name is required'], unique: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: [true, 'Category description is required'] },
  image: { type: String, default: '' },
  imagePublicId: { type: String, default: '' },
  catalogUrl: { type: String, default: '' },
  catalogPublicId: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

// Handle model compilation error in development with hot-reloading
if (process.env.NODE_ENV === 'development') {
  delete mongoose.models.Category;
}

export default mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);
