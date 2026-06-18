import mongoose, { Document, Schema } from 'mongoose';

export interface IBlog extends Document {
  title: string;
  slug: string;
  content: string;
  image: string;
  category: string;
  status: 'published' | 'draft';
  tags: string[];
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  ogTitle: string;
  ogDescription: string;
  author: mongoose.Types.ObjectId;
  createdAt: Date;
  views: number;
}

const BlogSchema = new Schema<IBlog>({
  title: { type: String, required: [true, 'Blog title is mandatory'] },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  status: { type: String, enum: ['published', 'draft'], default: 'published' },
  tags: [{ type: String }],
  metaTitle: { type: String, required: true },
  metaDescription: { type: String, required: true },
  focusKeyword: { type: String, default: '' },
  ogTitle: { type: String, default: '' },
  ogDescription: { type: String, default: '' },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  views: { type: Number, default: 0 }
}, {
  timestamps: true
});

export default mongoose.models.Blog || mongoose.model<IBlog>('Blog', BlogSchema);