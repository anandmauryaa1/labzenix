import mongoose from 'mongoose';

export interface ICrmNotification extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: 'Task' | 'LeadUpdate' | 'CallSchedule' | 'DealWon';
  read: boolean;
  createdAt: Date;
}

if (mongoose.models && mongoose.models.CrmNotification) {
  delete mongoose.models.CrmNotification;
}

const CrmNotificationSchema = new mongoose.Schema<ICrmNotification>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['Task', 'LeadUpdate', 'CallSchedule', 'DealWon'], 
    required: true 
  },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

CrmNotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

export default mongoose.models.CrmNotification || mongoose.model<ICrmNotification>('CrmNotification', CrmNotificationSchema);
