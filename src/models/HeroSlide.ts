import mongoose, { Document } from 'mongoose';

export interface IHeroSlide extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  image: string;
  imagePublicId: string;
  link: string;
  order: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const HeroSlideSchema = new mongoose.Schema<IHeroSlide>({
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  image: { type: String, required: [true, 'Image is required'] },
  imagePublicId: { type: String, default: '' },
  link: { type: String, default: '/' },
  order: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
}, {
  timestamps: true
});

// Handle model compilation error in development with hot-reloading
if (process.env.NODE_ENV === 'development') {
  delete mongoose.models.HeroSlide;
}

export default mongoose.models.HeroSlide || mongoose.model<IHeroSlide>('HeroSlide', HeroSlideSchema);
