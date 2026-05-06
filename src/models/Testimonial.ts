import mongoose, { Document } from 'mongoose';

export interface ITestimonial extends Document {
  name: string;
  role: string;
  text: string;
  rating: number;
  order: number;
  isActive: boolean;
  createdAt: Date;
}

const TestimonialSchema = new mongoose.Schema<ITestimonial>({
  name: { type: String, required: true, trim: true },
  role: { type: String, required: true, trim: true },
  text: { type: String, required: true, trim: true },
  rating: { type: Number, required: true, min: 1, max: 5, default: 5 },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Testimonial || mongoose.model<ITestimonial>('Testimonial', TestimonialSchema);
