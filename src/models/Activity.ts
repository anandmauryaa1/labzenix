import mongoose from 'mongoose';

export interface IActivity extends mongoose.Document {
  company: mongoose.Types.ObjectId;
  lead?: mongoose.Types.ObjectId;
  type: 'Call' | 'Email' | 'Meeting' | 'WhatsApp' | 'Quotation' | 'Service Visit';
  subject: string;
  description: string;
  date: Date;
  duration?: number; // duration in seconds (calls/meetings)
  status?: string; // e.g. Sent, Received, Completed
  createdBy: mongoose.Types.ObjectId; // User reference
  createdAt: Date;
}

if (mongoose.models && mongoose.models.Activity) {
  delete mongoose.models.Activity;
}

const ActivitySchema = new mongoose.Schema<IActivity>({
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
  type: { 
    type: String, 
    enum: ['Call', 'Email', 'Meeting', 'WhatsApp', 'Quotation', 'Service Visit'], 
    required: true 
  },
  subject: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  date: { type: Date, default: Date.now, required: true },
  duration: { type: Number },
  status: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { 
  timestamps: { createdAt: true, updatedAt: false } 
});

ActivitySchema.index({ company: 1, date: -1 });
ActivitySchema.index({ lead: 1, date: -1 });
ActivitySchema.index({ date: -1 });

export default mongoose.models.Activity || mongoose.model<IActivity>('Activity', ActivitySchema);
