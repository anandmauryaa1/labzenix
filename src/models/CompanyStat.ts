import mongoose, { Document } from 'mongoose';

export interface ICompanyStat extends Document {
  _id: mongoose.Types.ObjectId;
  label: string;
  value: string;
  order: number;
  active: boolean;
  createdAt: Date;
}

const CompanyStatSchema = new mongoose.Schema<ICompanyStat>({
  label: { type: String, required: [true, 'Label is required'] },
  value: { type: String, required: [true, 'Value is required'] },
  order: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

if (process.env.NODE_ENV === 'development') {
  delete mongoose.models.CompanyStat;
}

export default mongoose.models.CompanyStat || mongoose.model<ICompanyStat>('CompanyStat', CompanyStatSchema);
