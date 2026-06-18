import mongoose from 'mongoose';

export interface ICrmActivity extends mongoose.Document {
  contact: mongoose.Types.ObjectId;
  deal?: mongoose.Types.ObjectId;
  type: 'Call' | 'Email' | 'Meeting' | 'Note';
  subject: string;
  description: string;
  date: Date;
  duration?: number; // duration in seconds (mainly for calls)
  status?: string; // e.g. Sent, Received, Completed, Scheduled
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

if (mongoose.models && mongoose.models.CrmActivity) {
  delete mongoose.models.CrmActivity;
}

const CrmActivitySchema = new mongoose.Schema<ICrmActivity>({
  contact: { type: mongoose.Schema.Types.ObjectId, ref: 'CrmContact', required: true },
  deal: { type: mongoose.Schema.Types.ObjectId, ref: 'CrmDeal' },
  type: { 
    type: String, 
    enum: ['Call', 'Email', 'Meeting', 'Note'], 
    required: true 
  },
  subject: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  date: { type: Date, default: Date.now, required: true },
  duration: { type: Number }, // in seconds
  status: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { 
  timestamps: { createdAt: true, updatedAt: false } 
});

// Indexing for timeline loads
CrmActivitySchema.index({ contact: 1, date: -1 });
CrmActivitySchema.index({ deal: 1, date: -1 });
CrmActivitySchema.index({ date: -1 });

export default mongoose.models.CrmActivity || mongoose.model<ICrmActivity>('CrmActivity', CrmActivitySchema);
