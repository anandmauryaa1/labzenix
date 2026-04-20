import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema({
  configKey: { type: String, default: 'global', unique: true }, // Singleton pattern
  communication: {
    supportEmail: { type: String, default: 'support@labzenix.com' },
    supportPhone: { type: String, default: '+91 98765 00001' },
    salesEmail: { type: String, default: 'sales@labzenix.com' },
    salesPhone: { type: String, default: '+91 98765 00002' },
    marketingEmail: { type: String, default: 'marketing@labzenix.com' },
    marketingPhone: { type: String, default: '+91 98765 00003' },
    seoEmail: { type: String, default: 'seo@labzenix.com' },
    seoPhone: { type: String, default: '+91 98765 00004' },
    address: { type: String, default: 'Industrial Park, Sector 4, New Delhi' },
  },
  social: {
    facebook: { type: String, default: '' },
    twitter: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    instagram: { type: String, default: '' },
  },
  seo: {
    titleSuffix: { type: String, default: '| LabZenix Laboratory Instruments' },
    globalDescription: { type: String, default: 'Precision laboratory testing instruments and equipment.' },
  },
  integrations: {
    inquiryCapture: { type: Boolean, default: true },
    nightlyBackup: { type: Boolean, default: false }
  },
  updatedAt: { type: Date, default: Date.now }
});

SettingsSchema.pre('save', function(this: any, next: any) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);
