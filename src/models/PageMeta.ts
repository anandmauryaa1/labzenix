import mongoose, { Document, Schema } from 'mongoose';

export interface IPageMeta extends Document {
  pageKey: 'home' | 'about' | 'services' | 'products' | 'blogs' | 'contact';
  metaTitle: string;
  metaDescription: string;
  h1: string;
  keywords: string[];
  updatedAt: Date;
}

const PageMetaSchema = new Schema<IPageMeta>({
  pageKey: { 
    type: String, 
    required: true, 
    unique: true,
    enum: ['home', 'about', 'services', 'products', 'blogs', 'contact']
  },
  metaTitle: { type: String, required: [true, 'Browser title is mandatory'] },
  metaDescription: { type: String, required: [true, 'Search meta description is mandatory'] },
  h1: { type: String, required: [true, 'Primary page header (H1) is mandatory'] },
  keywords: {
    type: [String],
    validate: {
      validator: (v: string[]) => v.length > 0,
      message: 'At least one indexing keyword is required'
    },
    required: true
  },
  updatedAt: { type: Date, default: Date.now }
});

PageMetaSchema.pre('save', function() {
  this.updatedAt = new Date();
});

export default mongoose.models.PageMeta || mongoose.model<IPageMeta>('PageMeta', PageMetaSchema);
