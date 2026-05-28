import mongoose, { Document } from 'mongoose';

export interface IAboutContent extends Document {
  singletonKey: string;
  subtitle: string;
  title: string;
  titleHighlight: string;
  description: string;
  updatedAt: Date;
}

const AboutContentSchema = new mongoose.Schema<IAboutContent>({
  singletonKey: { type: String, default: 'global', unique: true },
  subtitle: { type: String, default: 'Precision & Quality' },
  title: { type: String, default: 'About' },
  titleHighlight: { type: String, default: 'LabZenix' },
  description: { type: String, default: 'LabZenix delivers an extensive selection of testing devices and apparatus, combining exceptional quality with advanced technology. Our mission is to provide top-notch packaging testing instruments for material analysis and quality assurance at highly cost-effective and budget-friendly rates.' },
  updatedAt: { type: Date, default: Date.now }
});

AboutContentSchema.pre('save', function() {
  this.updatedAt = new Date();
});

export default mongoose.models.AboutContent || mongoose.model<IAboutContent>('AboutContent', AboutContentSchema);
