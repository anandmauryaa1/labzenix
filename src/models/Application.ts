import mongoose, { Document } from 'mongoose';

export interface IApplication extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  image: string;
  imagePublicId: string;
  order: number;
  active: boolean;
  category?: mongoose.Types.ObjectId;
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  ogTitle: string;
  ogDescription: string;
  createdAt: Date;
}

const ApplicationSchema = new mongoose.Schema<IApplication>({
  name: { type: String, required: [true, 'Application name is required'], unique: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  image: { type: String, required: [true, 'Image is required'] },
  imagePublicId: { type: String, default: '' },
  order: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'ApplicationCategory' },
  metaTitle: { type: String, default: '' },
  metaDescription: { type: String, default: '' },
  focusKeyword: { type: String, default: '' },
  ogTitle: { type: String, default: '' },
  ogDescription: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

// Handle model compilation error in development with hot-reloading
if (process.env.NODE_ENV === 'development') {
  delete mongoose.models.Application;
}

export default mongoose.models.Application || mongoose.model<IApplication>('Application', ApplicationSchema);
