import mongoose from 'mongoose';

export interface IServiceTicket extends mongoose.Document {
  company: mongoose.Types.ObjectId;
  machineSerialNumber: string;
  productInterest?: string; // Machine model name
  problemDescription: string;
  priority: 'Low' | 'Medium' | 'High';
  assignedEngineer?: mongoose.Types.ObjectId; // User reference
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  createdAt: Date;
  updatedAt: Date;
}

if (mongoose.models && mongoose.models.ServiceTicket) {
  delete mongoose.models.ServiceTicket;
}

const ServiceTicketSchema = new mongoose.Schema<IServiceTicket>({
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  machineSerialNumber: { type: String, required: true, trim: true },
  productInterest: { type: String },
  problemDescription: { type: String, required: true },
  priority: { 
    type: String, 
    enum: ['Low', 'Medium', 'High'], 
    default: 'Medium',
    required: true 
  },
  assignedEngineer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { 
    type: String, 
    enum: ['Open', 'In Progress', 'Resolved', 'Closed'], 
    default: 'Open',
    required: true 
  },
}, { 
  timestamps: true 
});

ServiceTicketSchema.index({ company: 1 });
ServiceTicketSchema.index({ status: 1 });
ServiceTicketSchema.index({ assignedEngineer: 1 });
ServiceTicketSchema.index({ machineSerialNumber: 1 });

export default mongoose.models.ServiceTicket || mongoose.model<IServiceTicket>('ServiceTicket', ServiceTicketSchema);
