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
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  views: { type: Number, default: 0 }
}, {
  timestamps: true
});

BlogSchema.index({ slug: 1 }, { unique: true });

export default mongoose.models.Blog || mongoose.model<IBlog>('Blog', BlogSchema);