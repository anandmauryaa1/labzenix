import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  title: { type: String, required: [true, 'Instrument title is mandatory'] },
  modelNumber: { type: String, required: [true, 'Technical model number is mandatory'] },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: [true, 'Marketing description is mandatory'] },
  category: { type: String, required: [true, 'Category classification is mandatory'] },
  usage: { type: String, required: [true, 'Usage layer must be specified'], enum: ['Laboratory', 'Production', 'R&D'] },
  images: {
    type: [String],
    default: []
  },
  features: {
    type: [String],
    default: []
  },
  specificationText: { type: String, default: '' },
  specs: { type: mongoose.Schema.Types.Mixed, default: {} },

  metaTitle: { type: String, required: [true, 'SEO Title is mandatory'] },
  metaDescription: { type: String, required: [true, 'SEO Description is mandatory'] },
  author: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);