import mongoose from 'mongoose';

export interface ILead extends mongoose.Document {
  leadSource: string;
  name?: string;
  phone?: string;
  productInterest?: string; // Product name or category
  company?: mongoose.Types.ObjectId;
  companyName?: string;
  contactPerson?: mongoose.Types.ObjectId;
  budget: number;
  estimatedAmount?: number;
  rating?: number;
  expectedClosingDate?: Date;
  leadOwner?: mongoose.Types.ObjectId; // User reference (Sales Executive)
  createdBy?: string;
  assignedTo?: string;
  address?: string;
  stage: 'New' | 'Processing' | 'Close-by' | 'Confirm' | 'Cancel' | 'Contacted' | 'Qualified' | 'Demo Scheduled' | 'Quotation Sent' | 'Negotiation' | 'Won' | 'Lost';
  score: number; // Lead Score (0 - 100)
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

if (mongoose.models && mongoose.models.Lead) {
  delete mongoose.models.Lead;
}

const LeadSchema = new mongoose.Schema<ILead>({
  leadSource: { type: String, required: true, default: 'Website' },
  name: { type: String },
  phone: { type: String },
  productInterest: { type: String, default: 'General Inquiry' },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'CrmContact' },
  companyName: { type: String },
  contactPerson: { type: mongoose.Schema.Types.ObjectId, ref: 'CrmContact' },
  budget: { type: Number, default: 0 },
  estimatedAmount: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  expectedClosingDate: { type: Date },
  leadOwner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: String, default: 'LabZenix Industries' },
  assignedTo: { type: String, default: 'LabZenix Industries' },
  address: { type: String },
  stage: {
    type: String,
    enum: ['New', 'Processing', 'Close-by', 'Confirm', 'Cancel', 'Contacted', 'Qualified', 'Demo Scheduled', 'Quotation Sent', 'Negotiation', 'Won', 'Lost'],
    default: 'New',
    required: true
  },
  score: { type: Number, default: 50 },
  notes: { type: String },
}, { 
  timestamps: true 
});

LeadSchema.index({ company: 1 });
LeadSchema.index({ stage: 1 });
LeadSchema.index({ leadOwner: 1 });
LeadSchema.index({ budget: -1 });

LeadSchema.index({
  productInterest: 'text',
  leadSource: 'text',
  notes: 'text'
}, {
  weights: {
    productInterest: 10,
    leadSource: 3,
    notes: 1
  },
  name: 'LeadTextIndex'
});

export default mongoose.models.Lead || mongoose.model<ILead>('Lead', LeadSchema);
