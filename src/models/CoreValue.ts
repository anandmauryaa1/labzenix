import mongoose, { Document } from 'mongoose';

export interface ICoreValue extends Document {
  title: string;
  description: string;
  icon: string;
  order: number;
}

const CoreValueSchema = new mongoose.Schema<ICoreValue>({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
  },
  icon: {
    type: String,
    required: [true, 'Please provide an icon name'],
    default: 'CheckCircle'
  },
  order: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

export default mongoose.models.CoreValue || mongoose.model<ICoreValue>('CoreValue', CoreValueSchema);
