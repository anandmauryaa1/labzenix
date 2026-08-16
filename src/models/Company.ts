import mongoose from 'mongoose';

export interface ICompany extends mongoose.Document {
  name: string;
  industry?: string;
  gstNumber?: string;
  website?: string;
  address?: string;
  assignedSalesExecutive?: mongoose.Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

if (mongoose.models && mongoose.models.Company) {
  delete mongoose.models.Company;
}

const CompanySchema = new mongoose.Schema<ICompany>({
  name: { type: String, required: true, unique: true, trim: true },
  industry: { type: String, trim: true },
  gstNumber: { type: String, trim: true },
  website: { type: String, trim: true },
  address: { type: String, trim: true },
  assignedSalesExecutive: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: { type: String },
}, { 
  timestamps: true 
});

// Indexes for pagination & search
CompanySchema.index({ name: 1 });
CompanySchema.index({ gstNumber: 1 });
CompanySchema.index({ assignedSalesExecutive: 1 });
CompanySchema.index({ createdAt: -1 });

CompanySchema.index({ 
  name: 'text', 
  gstNumber: 'text', 
  industry: 'text' 
}, {
  weights: {
    name: 10,
    gstNumber: 5,
    industry: 2
  },
  name: 'CompanyTextIndex'
});

export default mongoose.models.Company || mongoose.model<ICompany>('Company', CompanySchema);
