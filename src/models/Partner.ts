import mongoose, { Document } from 'mongoose';

export interface IPartner extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  logo: string;
  website: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
}

const PartnerSchema = new mongoose.Schema<IPartner>({
  name: { type: String, required: true, trim: true },
  logo: { type: String, required: true },
  website: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

// Handle model compilation error in development with hot-reloading
if (process.env.NODE_ENV === 'development') {
  delete mongoose.models.Partner;
}

export default mongoose.models.Partner || mongoose.model<IPartner>('Partner', PartnerSchema);
