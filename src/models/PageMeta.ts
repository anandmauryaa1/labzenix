import mongoose from 'mongoose';

const PageMetaSchema = new mongoose.Schema({
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

PageMetaSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.PageMeta || mongoose.model('PageMeta', PageMetaSchema);
