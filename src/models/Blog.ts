import mongoose from 'mongoose';

const BlogSchema = new mongoose.Schema({
  title: { type: String, required: [true, 'Blog title is mandatory'] },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: [true, 'Internal content is mandatory'] },
  image: { type: String, required: [true, 'Featured display image is mandatory'] },
  category: { type: String, required: [true, 'Content classification is mandatory'] },
  status: { 
    type: String, 
    enum: ['published', 'draft'], 
    default: 'published' 
  },
  tags: {
    type: [String],
    validate: {
      validator: (v: string[]) => v.length > 0,
      message: 'At least one indexing tag is required'
    },
    required: true
  },
  metaTitle: { type: String, required: [true, 'SEO Header Title is mandatory'] },
  metaDescription: { type: String, required: [true, 'SEO Meta Description is mandatory'] },
  author: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  createdAt: { type: Date, default: Date.now },
  views: { type: Number, default: 0 },
});

export default mongoose.models.Blog || mongoose.model('Blog', BlogSchema);