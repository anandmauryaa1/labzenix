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
      'ProductTabs',
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
    index: true,
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'published',
    index: true,
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
  },
  sections: [SectionSchema],
}, { timestamps: true });

// ─── ESR Rule Compound Indexes ────────────────────────────────────────────────
// Rule: Equality (status, slug) -> Sort (createdAt) -> Range
CampaignSchema.index({ status: 1, slug: 1 });          // E: status, E: slug
CampaignSchema.index({ status: 1, createdAt: -1 });     // E: status, S: createdAt (newest campaigns first)

export default mongoose.models.Campaign || mongoose.model('Campaign', CampaignSchema);
