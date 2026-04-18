import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Domain name is mandatory'], unique: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: [true, 'Domain description is mandatory'] },
  catalogUrl: { type: String, default: '' },
  catalogPublicId: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Category || mongoose.model('Category', CategorySchema);
