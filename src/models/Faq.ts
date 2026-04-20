import mongoose from 'mongoose';

const FaqSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  question: { type: String, required: true, trim: true },
  answer:   { type: String, required: true, trim: true },
});
if (mongoose.models.Faq) {
  delete mongoose.models.Faq;
}

export default mongoose.model('Faq', FaqSchema);
