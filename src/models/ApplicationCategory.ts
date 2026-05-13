import mongoose, { Document } from 'mongoose';

export interface IApplicationCategory extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  image: string;
  imagePublicId: string;
  order: number;
  active: boolean;
  createdAt: Date;
}

const ApplicationCategorySchema = new mongoose.Schema<IApplicationCategory>({
  name: { type: String, required: [true, 'Category name is required'], unique: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  image: { type: String, default: '' },
  imagePublicId: { type: String, default: '' },
  order: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

// Handle model compilation error in development with hot-reloading
if (process.env.NODE_ENV === 'development') {
  delete mongoose.models.ApplicationCategory;
}

export default mongoose.models.ApplicationCategory || mongoose.model<IApplicationCategory>('ApplicationCategory', ApplicationCategorySchema);
