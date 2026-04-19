import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Category name is required'], unique: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: [true, 'Category description is required'] },
  catalogUrl: { type: String, default: '' },
  catalogPublicId: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Category || mongoose.model('Category', CategorySchema);
