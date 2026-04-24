import mongoose, { Document } from 'mongoose';

export interface ICategory extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  catalogUrl: string;
  catalogPublicId: string;
  createdAt: Date;
}

const CategorySchema = new mongoose.Schema<ICategory>({
  name: { type: String, required: [true, 'Category name is required'], unique: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: [true, 'Category description is required'] },
  catalogUrl: { type: String, default: '' },
  catalogPublicId: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);
