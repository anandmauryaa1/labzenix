
const mongoose = require('mongoose');

async function syncDb() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  const SettingsSchema = new mongoose.Schema({
    configKey: { type: String, default: 'global' },
    communication: {
      supportEmail: { type: String, default: 'support@labzenix.com' },
      supportPhone: { type: String, default: '+91 9565453120' },
      salesEmail: { type: String, default: 'sales@labzenix.com' },
      salesPhone: { type: String, default: '+91 9565453120' },
      marketingEmail: { type: String, default: 'marketing@labzenix.com' },
      marketingPhone: { type: String, default: '+91 9565453120' },
      seoEmail: { type: String, default: 'seo@labzenix.com' },
      seoPhone: { type: String, default: '+91 9565453120' },
      address: { type: String, default: '123, Instrument Square,\nIndustrial Area Phase II, Mohali,\nPunjab - 160062, India' },
    },
    social: {
      facebook: { type: String, default: 'https://facebook.com/labzenix' },
      twitter: { type: String, default: 'https://twitter.com/labzenix' },
      linkedin: { type: String, default: 'https://linkedin.com/company/labzenix' },
      instagram: { type: String, default: 'https://instagram.com/labzenix' },
    },
    seo: {
      titleSuffix: { type: String, default: '| LabZenix Laboratory Instruments' },
      globalDescription: { type: String, default: 'Precision laboratory testing instruments and equipment.' },
    },
    integrations: {
      inquiryCapture: { type: Boolean, default: true },
      nightlyBackup: { type: Boolean, default: false }
    }
  });

  const Settings = mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);
  
  let doc = await Settings.findOne({ configKey: 'global' });
  if (!doc) {
    console.log('No global settings found. Creating new...');
    doc = new Settings({ configKey: 'global' });
    await doc.save();
    console.log('Created defaults.');
  } else {
    console.log('Global settings found, updating to force schema defaults for empty string fields...');
    const defaults = new Settings({ configKey: 'global' }).toObject();
    
    doc.communication = doc.communication || {};
    doc.social = doc.social || {};
    doc.seo = doc.seo || {};

    for (const key in defaults.communication) {
       if (!doc.communication[key]) doc.communication[key] = defaults.communication[key];
    }
    for (const key in defaults.social) {
       if (!doc.social[key]) doc.social[key] = defaults.social[key];
    }
    for (const key in defaults.seo) {
       if (!doc.seo[key]) doc.seo[key] = defaults.seo[key];
    }
    
    await Settings.updateOne({ configKey: 'global' }, {
       $set: {
          communication: doc.communication,
          social: doc.social,
          seo: doc.seo,
          updatedAt: new Date()
       }
    });
    console.log('Successfully updated DB with missing schema fields!');
  }
  process.exit(0);
}
syncDb().catch(console.error);
