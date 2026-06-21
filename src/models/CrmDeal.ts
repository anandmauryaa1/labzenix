import mongoose from 'mongoose';

export interface ICrmDeal extends mongoose.Document {
  title: string;
  contact: mongoose.Types.ObjectId;
  value: number;
  stage: 'Lead' | 'Qualification' | 'Proposal' | 'Negotiation' | 'Won' | 'Lost';
  expectedCloseDate?: Date;
  owner?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

if (mongoose.models && mongoose.models.CrmDeal) {
  delete mongoose.models.CrmDeal;
}

const CrmDealSchema = new mongoose.Schema<ICrmDeal>({
  title: { type: String, required: true, trim: true },
  contact: { type: mongoose.Schema.Types.ObjectId, ref: 'CrmContact', required: true },
  value: { type: Number, required: true, default: 0 },
  stage: { 
    type: String, 
    enum: ['Lead', 'Qualification', 'Proposal', 'Negotiation', 'Won', 'Lost'], 
    default: 'Lead',
    required: true 
  },
  expectedCloseDate: { type: Date },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { 
  timestamps: true 
});

// Indexing for high-performance sorting and aggregations
CrmDealSchema.index({ stage: 1 });
CrmDealSchema.index({ owner: 1 });
CrmDealSchema.index({ contact: 1 });
CrmDealSchema.index({ value: -1 });
CrmDealSchema.index({ createdAt: -1 });
CrmDealSchema.index({ stage: 1, value: -1 });

// Full-text search
CrmDealSchema.index(
  { title: 'text' },
  { weights: { title: 10 }, name: 'CrmDealTextIndex' }
);

export default mongoose.models.CrmDeal || mongoose.model<ICrmDeal>('CrmDeal', CrmDealSchema);
