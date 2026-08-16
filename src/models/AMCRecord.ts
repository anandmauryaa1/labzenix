import mongoose from 'mongoose';

export interface IAMCRecord extends mongoose.Document {
  company: mongoose.Types.ObjectId;
  machineSerialNumber: string;
  productName: string;
  installationDate: Date;
  warrantyExpiryDate: Date;
  amcStartDate?: Date;
  amcEndDate?: Date;
  calibrationDueDate: Date;
  alert30Sent: boolean;
  alert15Sent: boolean;
  alert7Sent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

if (mongoose.models && mongoose.models.AMCRecord) {
  delete mongoose.models.AMCRecord;
}

const AMCRecordSchema = new mongoose.Schema<IAMCRecord>({
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  machineSerialNumber: { type: String, required: true, unique: true, trim: true },
  productName: { type: String, required: true },
  installationDate: { type: Date, required: true },
  warrantyExpiryDate: { type: Date, required: true },
  amcStartDate: { type: Date },
  amcEndDate: { type: Date },
  calibrationDueDate: { type: Date, required: true },
  alert30Sent: { type: Boolean, default: false },
  alert15Sent: { type: Boolean, default: false },
  alert7Sent: { type: Boolean, default: false },
}, { 
  timestamps: true 
});

AMCRecordSchema.index({ company: 1 });
AMCRecordSchema.index({ calibrationDueDate: 1 });
AMCRecordSchema.index({ warrantyExpiryDate: 1 });
AMCRecordSchema.index({ machineSerialNumber: 1 });

export default mongoose.models.AMCRecord || mongoose.model<IAMCRecord>('AMCRecord', AMCRecordSchema);
