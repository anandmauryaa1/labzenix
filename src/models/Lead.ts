import mongoose from 'mongoose';

export interface ILead extends mongoose.Document {
  leadSource: string;
  productInterest: string; // Product name or category
  company: mongoose.Types.ObjectId;
  contactPerson: mongoose.Types.ObjectId;
  budget: number;
  expectedClosingDate?: Date;
  leadOwner: mongoose.Types.ObjectId; // User reference (Sales Executive)
  stage: 'New' | 'Contacted' | 'Qualified' | 'Demo Scheduled' | 'Quotation Sent' | 'Negotiation' | 'Won' | 'Lost';
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
  productInterest: { type: String, required: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  contactPerson: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact', required: true },
  budget: { type: Number, required: true, default: 0 },
  expectedClosingDate: { type: Date },
  leadOwner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  stage: {
    type: String,
    enum: ['New', 'Contacted', 'Qualified', 'Demo Scheduled', 'Quotation Sent', 'Negotiation', 'Won', 'Lost'],
    default: 'New',
    required: true
  },
  score: { type: Number, default: 50 }, // Initial middle score
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
