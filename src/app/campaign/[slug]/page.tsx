import React from 'react';
import { notFound } from 'next/navigation';
import dbConnect from '@/lib/dbConnect';
import Campaign from '@/models/Campaign';
import FadeIn from '@/components/ui/FadeIn';
import { 
  ArrowRight, Activity, Cpu, ShieldCheck, Factory, Beaker, Wrench, 
  Settings, Save, BookOpen, Download, HelpCircle, Phone, Mail, 
  CheckCircle2, Gauge, Maximize, Star, Play
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { formatTitle, SectionHeader } from '@/components/campaigns/Typography';
import HeroSection from '@/components/campaigns/HeroSection';
import VideoSection from '@/components/campaigns/VideoSection';
import { FeaturesSection, SpecificationsSection, ComparisonSection, FeedbackSection, ApplicationsSection, FAQSection, TabbedContentSection, DownloadsSection, RelatedProductsSection } from '@/components/campaigns/Sections';
import CampaignEnquiryForm from '@/components/campaigns/CampaignEnquiryForm';

// Map string icon names to Lucide components
const IconMap: Record<string, any> = {
  Gauge, Cpu, Settings, Maximize, Factory, Save, Activity, Beaker, ShieldCheck, BookOpen, Wrench, CheckCircle2
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await dbConnect();
  const campaign = await Campaign.findOne({ slug });
  if (!campaign) return { title: 'Not Found' };
  return {
    title: campaign.seo?.metaTitle || campaign.title,
    description: campaign.seo?.metaDescription || '',
  };
}

export default async function DynamicCampaignPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await dbConnect();
  const campaign = await Campaign.findOne({ slug, status: 'published' });

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
    <div className="bg-slate-50 min-h-screen text-dark font-sans selection:bg-primary selection:text-light">
      
      {/* Dynamic Sections */}
      {campaign.sections?.length > 0 ? (
        campaign.sections.map((section: any, index: number) => renderSection(section, index))
      ) : (
        <div className="py-32 text-center text-slate-500 font-display">
          This campaign page has no content yet.
        </div>
      )}

      {/* Global Fixed Enquiry Form & Footer CTA */}
      <section id="enquiry" className="py-24 bg-primary relative overflow-hidden font-display">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto bg-light shadow-2xl overflow-hidden flex flex-col lg:flex-row rounded-none border border-primary/20">
            
            {/* CTA Content */}
            <div className="lg:w-2/5 bg-slate-900 text-white p-10 md:p-12 flex flex-col justify-between">
              <div>
                <div className="text-primary font-bold tracking-[0.2em] uppercase text-xs mb-4">GET IN TOUCH</div>
                <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-4 text-white">
                  Request a Quotation
                </h3>
                <p className="text-slate-400 mb-8 leading-relaxed text-sm">
                  Need a reliable testing solution? Talk to the LabZenix technical team about your equipment requirements.
                </p>
                
                <div className="space-y-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-slate-800 flex items-center justify-center mr-4 text-primary rounded-none border border-slate-700 shrink-0">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-0.5">Call Us directly</p>
                      <div className="flex flex-wrap gap-x-2 text-sm font-semibold">
                        <a href="tel:+919565453120" className="hover:text-primary transition-colors">+91 9565453120</a>
                        <span className="text-slate-600">/</span>
                        <a href="tel:+919354572961" className="hover:text-primary transition-colors">+91 9354572961</a>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-slate-800 flex items-center justify-center mr-4 text-primary rounded-none border border-slate-700 shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-0.5">Email Us</p>
                      <a href="mailto:info@labzenix.com" className="font-semibold text-sm hover:text-primary transition-colors">info@labzenix.com</a>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-10 pt-6 border-t border-slate-800">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Technical Downloads</h4>
                <div className="grid grid-cols-2 gap-3">
                  {['Datasheet', 'Brochure', 'User Manual', 'Standards'].map((doc, i) => (
                    <button key={i} type="button" className="flex items-center text-xs font-semibold text-primary hover:text-white transition-colors text-left">
                      <Download className="w-3.5 h-3.5 mr-1.5 shrink-0" /> {doc}
                    </button>
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
