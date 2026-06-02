import mongoose, { Document } from 'mongoose';

export interface ICompanyCertificate extends Document {
  _id: mongoose.Types.ObjectId;
  title?: string;
  description?: string;
  fileUrl: string;
  filePublicId: string;
  order: number;
  createdAt: Date;
}

const CompanyCertificateSchema = new mongoose.Schema<ICompanyCertificate>({
  title: { type: String, default: 'Certificate' },
  description: { type: String, default: '' },
  fileUrl: { type: String, required: [true, 'File URL is required'] },
  filePublicId: { type: String, required: [true, 'File Public ID is required'] },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

// Handle model compilation error in development with hot-reloading
if (process.env.NODE_ENV === 'development') {
  delete mongoose.models.CompanyCertificate;
}

export default mongoose.models.CompanyCertificate || mongoose.model<ICompanyCertificate>('CompanyCertificate', CompanyCertificateSchema);
