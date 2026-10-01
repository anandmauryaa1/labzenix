import React from 'react';
import { notFound } from 'next/navigation';
import dbConnect from '@/lib/dbConnect';
import Campaign from '@/models/Campaign';
import { Phone, Mail, Download, ShieldCheck, Clock, Award, CheckCircle2 } from 'lucide-react';
import HeroSection from '@/components/campaigns/HeroSection';
import VideoSection from '@/components/campaigns/VideoSection';
import { 
  FeaturesSection, SpecificationsSection, ComparisonSection, 
  FeedbackSection, ApplicationsSection, FAQSection, 
  TabbedContentSection, DownloadsSection, RelatedProductsSection 
} from '@/components/campaigns/Sections';
import CampaignEnquiryForm from '@/components/campaigns/CampaignEnquiryForm';
import CampaignStickyNav from '@/components/campaigns/CampaignStickyNav';
import { cachedFetch } from '@/lib/cache';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await dbConnect();
  const campaign = await Campaign.findOne({ slug }).select('title seo').lean();
  if (!campaign) return { title: 'Not Found' };
  return {
    title: campaign.seo?.metaTitle || campaign.title,
    description: campaign.seo?.metaDescription || '',
  };
}

export default async function DynamicCampaignPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const campaign: any = await cachedFetch(
    `campaign:${slug}`,
    async () => {
      await dbConnect();
      return Campaign.findOne({ slug, status: 'published' })
        .select('title slug status seo sections createdAt')
        .lean();
    },
    300 // Cache for 5 minutes
  );

  if (!campaign) {
    notFound();
  }

  // Helper to render sections
  const renderSection = (section: any, index: number) => {
    const { type, data } = section;

    switch (type) {
      case 'Hero':
        return <HeroSection key={section.id} data={data} campaignTitle={campaign.title} />;

      case 'Video':
        return <VideoSection key={section.id} data={data} />;

      case 'FeaturesWithImage':
      case 'TextWithImage':
        return <FeaturesSection key={section.id} data={data} index={index} />;

      case 'Specifications':
        return <SpecificationsSection key={section.id} data={data} />;

      case 'ComparisonTable':
        return <ComparisonSection key={section.id} data={data} />;

      case 'CustomerFeedback':
        return <FeedbackSection key={section.id} data={data} />;

      case 'ApplicationExamples':
        return <ApplicationsSection key={section.id} data={data} />;

      case 'FAQs':
        return <FAQSection key={section.id} data={data} />;

      case 'TabbedContent':
        return <TabbedContentSection key={section.id} data={data} />;

      case 'Downloads':
        return <DownloadsSection key={section.id} data={data} />;

      case 'RelatedProducts':
        return <RelatedProductsSection key={section.id} data={data} />;

      default:
        return null;
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 font-sans selection:bg-primary selection:text-white">
      
      {/* Sticky Sub-Navbar */}
      <CampaignStickyNav title={campaign.title} />

      {/* Dynamic Sections */}
      {campaign.sections?.length > 0 ? (
        campaign.sections.map((section: any, index: number) => renderSection(section, index))
      ) : (
        <div className="py-32 text-center text-slate-500 font-display">
          This campaign page has no content configured yet.
        </div>
      )}

      {/* Global Fixed Enquiry Form & Footer CTA */}
      <section id="enquiry" className="py-24 bg-slate-950 relative overflow-hidden font-display text-white border-t border-slate-900">
        
        {/* Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto bg-slate-900 border-2 border-slate-800 shadow-2xl overflow-hidden flex flex-col lg:flex-row rounded-none">
            
            {/* Left Info Panel */}
            <div className="lg:w-2/5 bg-slate-950 text-white p-10 md:p-12 flex flex-col justify-between border-r border-slate-800">
              <div>
                <div className="inline-flex items-center space-x-2 text-primary font-bold tracking-[0.2em] uppercase text-xs mb-4 bg-primary/10 border border-primary/20 px-3 py-1">
                  <span>GET IN TOUCH</span>
                </div>

                <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-4 text-white">
                  Request Official Quotation
                </h3>
                
                <p className="text-slate-400 mb-8 leading-relaxed text-sm">
                  Looking for accurate laboratory equipment? Consult with LabZenix technical sales for specifications, custom pressure ranges, and direct factory pricing.
                </p>
                
                <div className="space-y-5">
                  <div className="flex items-center p-3 bg-slate-900 border border-slate-800">
                    <div className="w-10 h-10 bg-primary/20 border border-primary/30 flex items-center justify-center mr-4 text-primary shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Direct Hotline</p>
                      <div className="flex flex-wrap gap-x-2 text-xs font-bold text-white">
                        <a href="tel:+919565453120" className="hover:text-primary transition-colors">+91 9565453120</a>
                        <span className="text-slate-600">/</span>
                        <a href="tel:+919354572961" className="hover:text-primary transition-colors">+91 9354572961</a>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center p-3 bg-slate-900 border border-slate-800">
                    <div className="w-10 h-10 bg-primary/20 border border-primary/30 flex items-center justify-center mr-4 text-primary shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Official Email</p>
                      <a href="mailto:info@labzenix.com" className="font-bold text-xs text-white hover:text-primary transition-colors">
                        info@labzenix.com
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-slate-800">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">Instant PDF Downloads</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {['Technical Datasheet', 'Product Brochure', 'User Operation Manual', 'ISO Compliance Cert'].map((doc, i) => (
                    <a key={i} href="#enquiry" className="flex items-center text-primary hover:text-white transition-colors text-[11px] font-semibold">
                      <Download className="w-3 h-3 mr-1 shrink-0" /> {doc}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Form */}
            <CampaignEnquiryForm campaignTitle={campaign.title} campaignSlug={campaign.slug} className="lg:w-3/5" />
          </div>
        </div>
      </section>

    </div>
  );
}
