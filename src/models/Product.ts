import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  title:       { type: String, required: [true, 'Product title is required'],   trim: true },
  modelNumber: { type: String, required: [true, 'Model number is required'],    trim: true },
  slug:        { type: String, required: true, unique: true, lowercase: true, trim: true },
  description: { type: String, required: [true, 'Description is required'],    trim: true },
  category:    { type: String, required: [true, 'Category is required'],        trim: true },
  usage: {
    type: String,
    required: [true, 'Usage type is required'],
    enum: ['Laboratory', 'Production', 'R&D'],
  },
  images:            { type: [String], default: [] },
  features:          { type: [String], default: [] },
  specificationText: { type: String,   default: '',  trim: true },
  specs:             { type: mongoose.Schema.Types.Mixed, default: {} },
  youtubeUrl:        { type: String,   default: '',  trim: true },

  metaTitle: {
    type: String,
    required: [true, 'SEO title is required'],
    trim: true,
    maxlength: [70, 'SEO title should be 70 characters or fewer'],
  },
  metaDescription: {
    type: String,
    required: [true, 'SEO description is required'],
    trim: true,
    maxlength: [165, 'SEO description should be 165 characters or fewer'],
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});


export default mongoose.models.Product || mongoose.model('Product', ProductSchema);