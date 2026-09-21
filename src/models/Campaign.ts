import mongoose from 'mongoose';

const SectionSchema = new mongoose.Schema({
  id: { type: String, required: true }, // Unique ID for React rendering and reordering
  type: {
    type: String,
    enum: [
      'Hero',
      'TextWithImage',
      'FeaturesWithImage',
      'Specifications',
      'ComparisonTable',
      'FAQs',
      'Contact',
      'ApplicationExamples',
      'CustomerFeedback',
      'Downloads',
      'TabbedContent',
      'RelatedProducts',
      'Video'
    ],
    required: true,
  },
  data: mongoose.Schema.Types.Mixed, // Flexible data payload based on section type
});

const CampaignSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'published',
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
  },
  sections: [SectionSchema],
}, { timestamps: true });

// Check if the model already exists to avoid hot-reloading errors in Next.js
export default mongoose.models.Campaign || mongoose.model('Campaign', CampaignSchema);
