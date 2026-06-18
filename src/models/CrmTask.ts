import mongoose from 'mongoose';

export interface ICrmTask extends mongoose.Document {
  title: string;
  description?: string;
  dueDate: Date;
  status: 'Pending' | 'Completed' | 'Overdue';
  priority: 'Low' | 'Medium' | 'High';
  assignedTo?: mongoose.Types.ObjectId;
  contact?: mongoose.Types.ObjectId;
  deal?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

if (mongoose.models && mongoose.models.CrmTask) {
  delete mongoose.models.CrmTask;
}

const CrmTaskSchema = new mongoose.Schema<ICrmTask>({
  title: { type: String, required: true, trim: true },
  description: { type: String },
  dueDate: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Completed', 'Overdue'], 
    default: 'Pending',
    required: true 
  },
  priority: { 
    type: String, 
    enum: ['Low', 'Medium', 'High'], 
    default: 'Medium',
    required: true 
  },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  contact: { type: mongoose.Schema.Types.ObjectId, ref: 'CrmContact' },
  deal: { type: mongoose.Schema.Types.ObjectId, ref: 'CrmDeal' },
}, { 
  timestamps: true 
});

// Indexes for sorting/filtering tasks
CrmTaskSchema.index({ assignedTo: 1, status: 1 });
CrmTaskSchema.index({ dueDate: 1 });
CrmTaskSchema.index({ contact: 1 });
CrmTaskSchema.index({ deal: 1 });

export default mongoose.models.CrmTask || mongoose.model<ICrmTask>('CrmTask', CrmTaskSchema);
