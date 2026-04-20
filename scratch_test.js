import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const ReviewSchema = new mongoose.Schema({
  author:  { type: String, required: true },
  rating:  { type: Number, required: true },
  comment: { type: String, required: true },
}, { _id: true });

const FAQSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer:   { type: String, required: true },
}, { _id: true });

const ProductSchema = new mongoose.Schema({
  title: String,
  reviews: [ReviewSchema],
  faqs: [FAQSchema]
}, { strict: false });

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected.');
  
  const p = await Product.findOne();
  console.log('Found product ID:', p._id);
  
  const updated = await Product.findByIdAndUpdate(p._id, {
    $set: {
      reviews: [{ author: 'Script', rating: 5, comment: 'Test' }],
      faqs: [{ question: 'Q?', answer: 'A.' }]
    }
  }, { new: true }).lean();
  
  console.log('Updated reviews:', updated.reviews);
  console.log('Updated faqs:', updated.faqs);
  
  process.exit(0);
}

run();
