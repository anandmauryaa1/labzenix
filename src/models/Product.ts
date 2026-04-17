import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  category: { type: String, required: true, enum: ['Tensile Testers', 'Compression Testers', 'Heat Sealers', 'Leak Detectors', 'Friction Testers', 'Drop Testers'] },
  usage: { type: String, required: true, enum: ['Laboratory', 'Production', 'R&D'] },
  images: [{ type: String }],
  specs: { type: mongoose.Schema.Types.Mixed, default: {} },
  price: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);