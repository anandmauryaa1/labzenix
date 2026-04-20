const mongoose = require('mongoose');

async function run() {
  await mongoose.connect('mongodb://localhost:27017/labzenix');
  
  const ReviewSchema = new mongoose.Schema({ author: String, rating: Number, comment: String }, { _id: true });
  const FAQSchema = new mongoose.Schema({ question: String, answer: String }, { _id: true });
  
  const ProductSchema = new mongoose.Schema({
    title: String,
    reviews: { type: [ReviewSchema], default: [] },
    faqs: { type: [FAQSchema], default: [] }
  }, { strict: false });
  
  const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
  
  const p = await Product.findOne();
  if(!p) {
    console.log('No product found');
    process.exit(1);
  }
  
  console.log('Found product. Existing reviews length:', p.reviews.length, 'faqs:', p.faqs.length);
  
  const updated = await Product.findByIdAndUpdate(
    p._id,
    { $set: { 
        reviews: [{ author: 'Console Tester', rating: 5, comment: 'It works' }],
        faqs: [{ question: 'Q?', answer: 'A!' }]
      } 
    },
    { new: true }
  ).lean();
  
  console.log('After update Reviews:', updated.reviews);
  console.log('After update FAQs:', updated.faqs);
  process.exit(0);
}

run().catch(console.error);
