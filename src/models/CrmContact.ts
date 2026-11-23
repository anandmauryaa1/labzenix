import mongoose from 'mongoose';

export interface ICrmContact extends mongoose.Document {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  status: 'Active' | 'Deactive' | 'Lead' | 'Opportunity' | 'Customer' | 'Inactive';
  owner?: mongoose.Types.ObjectId;
  source: string;
  notes?: string;
  tags?: string[];
  rating?: number;
  convertedDate?: Date;
  convertedBy?: string;
  address?: string;
  gstNo?: string;
  dob?: string;
  anniversaryDate?: string;
  isFavorite?: boolean;
  isDuplicate?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

if (mongoose.models && mongoose.models.CrmContact) {
  delete mongoose.models.CrmContact;
}

const CrmContactSchema = new mongoose.Schema<ICrmContact>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  phone: { type: String, trim: true },
  company: { type: String, trim: true },
  jobTitle: { type: String, trim: true },
  status: { 
    type: String, 
    enum: ['Active', 'Deactive', 'Lead', 'Opportunity', 'Customer', 'Inactive'], 
    default: 'Active',
    required: true 
  },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  source: { type: String, default: 'Manual Entry' },
  notes: { type: String },
  tags: { type: [String], default: [] },
  rating: { type: Number, default: 0 },
  convertedDate: { type: Date, default: Date.now },
  convertedBy: { type: String, default: 'LabZenix Industries' },
  address: { type: String },
  gstNo: { type: String },
  dob: { type: String },
  anniversaryDate: { type: String },
  isFavorite: { type: Boolean, default: false },
  isDuplicate: { type: Boolean, default: false },
}, { 
  timestamps: true 
});

// Single-field indexes for fast lookups
CrmContactSchema.index({ email: 1 });
CrmContactSchema.index({ status: 1 });
CrmContactSchema.index({ company: 1 });
CrmContactSchema.index({ createdAt: -1 });

// Compound index for owner-based queries
CrmContactSchema.index({ owner: 1, status: 1 });

// Text index for server-side full-text searches (vital for 10,000+ records)
CrmContactSchema.index({ 
  name: 'text', 
  email: 'text', 
  company: 'text', 
  phone: 'text' 
}, {
  weights: {
    name: 10,
    company: 5,
    email: 3,
    phone: 2
  },
  name: 'CrmContactTextIndex'
});

export default mongoose.models.CrmContact || mongoose.model<ICrmContact>('CrmContact', CrmContactSchema);
