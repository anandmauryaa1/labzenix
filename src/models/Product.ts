import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  title: { type: String, required: [true, 'Product title is required'] },
  modelNumber: { type: String, required: [true, 'Model number is required'] },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: [true, 'Description is required'] },
  category: { type: String, required: [true, 'Category is required'] },
  usage: { type: String, required: [true, 'Usage type is required'], enum: ['Laboratory', 'Production', 'R&D'] },
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

  // Additional product details
  leadTime: { type: String, default: '' },
  brand: { type: String, default: '' },
  certificate: { type: String, default: '' },

  metaTitle: { type: String, required: [true, 'SEO title is required'] },
  metaDescription: { type: String, required: [true, 'SEO description is required'] },
  author: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);