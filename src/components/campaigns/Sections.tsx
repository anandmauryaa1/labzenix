'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import FadeIn from '@/components/ui/FadeIn';
import { formatTitle, SectionHeader } from './Typography';
import { getOptimizedImageUrl } from '@/lib/image';
import { 
  Star, Check, X, Search, FileText, Download, CheckCircle2, 
  ShieldCheck, ArrowRight, ChevronDown, Copy, Sparkles, Activity, 
  Cpu, Gauge, Settings, Maximize, Factory, Save, Beaker, BookOpen, Wrench, Building2, ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';

// Icon Map for dynamic icon selection
const ICON_MAP: Record<string, any> = {
  Gauge, Cpu, Settings, Maximize, Factory, Save, Activity, Beaker, 
  ShieldCheck, BookOpen, Wrench, CheckCircle2, Sparkles, FileText
};

// ─── 1. FEATURES / KEY ADVANTAGES SECTION ─────────────────────────────────────
export const FeaturesSection = ({ data, index = 0 }: { data: any, index?: number }) => {
  const isLeft = data?.imagePosition === 'left';
  const features = data?.features || [];

  return (
    <section id="features" className={`py-24 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50 border-y border-slate-200'} font-display relative overflow-hidden`}>
      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <div className={`flex flex-col ${isLeft ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-12 lg:gap-16 items-center`}>
          
          {/* Image Showcase side */}
          <div className="lg:w-1/2 w-full">
            <FadeIn direction={isLeft ? 'right' : 'left'}>
              <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-primary to-blue-600 opacity-20 blur-lg group-hover:opacity-30 transition-opacity"></div>
                
                <div className="relative bg-white p-3 border-2 border-slate-200 shadow-2xl rounded-none">
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 flex items-center justify-center">
                    <Image 
                      src={getOptimizedImageUrl(data?.image, { width: 600, height: 400 })} 
                      alt={data?.title || "Feature"} 
                      width={600} 
                      height={400} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  </div>

                  <div className="absolute bottom-6 left-6 bg-slate-900/90 text-white text-xs font-black uppercase tracking-widest px-4 py-2 border border-slate-700">
                    ENGINEERED EXCELLENCE
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>

          {/* Features Content side */}
          <div className="lg:w-1/2 w-full">
            <FadeIn direction={isLeft ? 'left' : 'right'}>
              
              <SectionHeader 
                title={data?.title || "Key Advantages & Features"} 
                topText="PERFORMANCE & RELIABILITY"
                align="left"
              />

              {data?.description && (
                <div 
                  className="text-slate-600 mb-8 text-base leading-relaxed prose prose-slate"
                  dangerouslySetInnerHTML={{ __html: data.description }}
                />
              )}

              {features.length > 0 && (
                <div className="space-y-6">
                  {features.map((feat: any, idx: number) => {
                    const IconComponent = (feat.icon && ICON_MAP[feat.icon]) || CheckCircle2;
                    return (
                      <div 
                        key={idx} 
                        className="bg-white border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-primary transition-all flex items-start space-x-4 group rounded-none"
                      >
                        <div className="w-12 h-12 bg-blue-50 border border-blue-200 text-primary flex items-center justify-center font-bold text-lg shrink-0 group-hover:bg-primary group-hover:text-white transition-colors rounded-none">
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-slate-900 mb-1 uppercase tracking-tight group-hover:text-primary transition-colors">
                            {feat.title || feat.name}
                          </h4>
                          <p className="text-slate-600 text-sm leading-relaxed">
                            {feat.description || feat.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </FadeIn>
          </div>

        </div>
      </div>
    </section>
  );
};

// ─── 2. TECHNICAL SPECIFICATIONS SECTION ──────────────────────────────────────
export const SpecificationsSection = ({ data }: { data: any }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const specs = data?.specs || [];

  const filteredSpecs = specs.filter((s: any) => 
    (s.key || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.value || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopySpecs = () => {
    if (!specs.length) return;
    const text = specs.map((s: any) => `${s.key}: ${s.value}`).join('\n');
    navigator.clipboard.writeText(text);
    toast.success('Technical specifications copied to clipboard!');
  };

  return (
    <section id="specifications" className="py-24 bg-slate-50 font-display border-t border-slate-200">
      <div className="container mx-auto px-4 max-w-5xl">
        <FadeIn>
          <SectionHeader 
            title={data?.title || "Technical Specifications"} 
            subtitle={data?.subtitle || "Rigorous engineering standards tailored for precision laboratory testing."} 
            topText="DATA & SPECIFICATIONS"
          />
        </FadeIn>

        {/* Search & Actions Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search specs (e.g., pressure, area)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary rounded-none"
            />
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleCopySpecs}
              className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:border-primary hover:text-primary transition-colors text-xs font-bold uppercase tracking-wider rounded-none"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Specs</span>
            </button>

            <a
              href="#enquiry"
              className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-4 py-2 bg-primary text-white hover:bg-slate-900 transition-colors text-xs font-black uppercase tracking-widest rounded-none shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Full Datasheet</span>
            </a>
          </div>
        </div>

        {/* Specifications Table */}
        <div className="bg-white shadow-xl border border-slate-200 overflow-hidden rounded-none">
          <FadeIn direction="up">
            {data?.content ? (
              <div className="p-8 text-slate-700 prose max-w-none" dangerouslySetInnerHTML={{ __html: data.content }}></div>
            ) : filteredSpecs.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white text-xs font-black uppercase tracking-wider">
                    <th className="py-4 px-6 border-b border-slate-800 w-1/3">Parameter</th>
                    <th className="py-4 px-6 border-b border-slate-800">Specification Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredSpecs.map((row: any, idx: number) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-slate-50/50 hover:bg-blue-50/40 transition-colors' : 'bg-white hover:bg-blue-50/40 transition-colors'}>
                      <td className="py-4 px-6 font-bold text-slate-900 w-1/3 border-r border-slate-100">
                        {row.key}
                      </td>
                      <td className="py-4 px-6 text-slate-700 font-medium">
                        {row.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-12 text-center text-slate-500 text-sm">
                No matching specifications found for "{searchTerm}".
              </div>
            )}
          </FadeIn>
        </div>
      </div>
    </section>
  );
};

// ─── 3. MATRIX COMPARISON SECTION ─────────────────────────────────────────────
export const ComparisonSection = ({ data }: { data: any }) => {
  const rows = data?.rows || [];

  return (
    <section id="comparison" className="py-24 bg-white font-display border-t border-slate-200">
      <div className="container mx-auto px-4 max-w-6xl">
        <FadeIn>
          <SectionHeader 
            title={data?.title || "Why LabZenix Leads The Industry"} 
            subtitle="Side-by-side feature comparison demonstrating precision engineering superiority."
            topText="SOLUTION COMPARISON"
          />

          <div className="bg-white border-2 border-slate-200 shadow-2xl overflow-x-auto rounded-none">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr>
                  <th className="p-6 bg-slate-100 border-b-2 border-r border-slate-200 w-1/3 text-xs font-black uppercase text-slate-700 tracking-wider">
                    Testing Capabilities & Features
                  </th>
                  <th className="p-6 bg-primary text-white border-b-2 border-r border-primary text-center font-black text-lg uppercase tracking-wider w-1/3 relative">
                    <span className="absolute top-2 left-1/2 -translate-x-1/2 bg-yellow-400 text-slate-900 text-[10px] font-black uppercase tracking-widest px-3 py-0.5 shadow-md">
                      ★ RECOMMENDED CHOICE
                    </span>
                    {data?.productName || "LabZenix Solution"}
                  </th>
                  <th className="p-6 bg-slate-800 text-slate-300 border-b-2 border-slate-700 text-center font-bold text-base uppercase tracking-wider w-1/3">
                    {data?.competitorName || "Conventional Machine"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {rows.map((row: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-5 border-r border-slate-200 font-bold text-slate-900 text-xs uppercase tracking-wide">
                      {row.feature}
                    </td>
                    <td className="p-5 border-r border-slate-200 text-center bg-blue-50/30">
                      <div className="text-sm font-black text-primary mb-1">{row.ourValue}</div>
                      {row.ourBadge ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-black uppercase tracking-wider rounded-none">
                          <Check className="w-3 h-3 mr-1" /> {row.ourBadge}
                        </span>
                      ) : (
                        <Check className="w-5 h-5 text-emerald-600 mx-auto" />
                      )}
                    </td>
                    <td className="p-5 text-center">
                      <div className="text-sm font-semibold text-slate-500 mb-1">{row.competitorValue}</div>
                      {row.competitorBadge ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 bg-rose-100 text-rose-800 text-[11px] font-bold uppercase tracking-wider rounded-none">
                          <X className="w-3 h-3 mr-1" /> {row.competitorBadge}
                        </span>
                      ) : (
                        <X className="w-5 h-5 text-slate-400 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

// ─── 4. CUSTOMER TESTIMONIALS / FEEDBACK ─────────────────────────────────────
export const FeedbackSection = ({ data }: { data: any }) => {
  const feedbacks = data?.feedbacks || [];

  return (
    <section className="py-24 bg-slate-50 font-display border-t border-slate-200">
      <div className="container mx-auto px-4 max-w-7xl">
        <FadeIn>
          <SectionHeader 
            title={data?.title || "Trusted By Industry Leaders"} 
            subtitle="Read real feedback from quality assurance managers and laboratory heads."
            topText="CLIENT TESTIMONIALS"
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {feedbacks.map((fb: any, idx: number) => (
              <div 
                key={idx} 
                className="bg-white border border-slate-200 p-8 shadow-sm hover:shadow-xl transition-all duration-300 rounded-none flex flex-col justify-between relative group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                      Verified User
                    </span>
                  </div>

                  <p className="text-slate-700 italic mb-6 text-sm leading-relaxed">
                    "{fb.quote}"
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 border border-primary/20 text-primary font-black flex items-center justify-center text-sm rounded-none">
                    {fb.author ? fb.author.charAt(0) : 'C'}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">{fb.author}</h4>
                    <p className="text-[11px] text-slate-500 font-medium">{fb.company || 'Quality Control Division'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

// ─── 5. APPLICATIONS & INDUSTRIES SECTION ─────────────────────────────────────
export const ApplicationsSection = ({ data }: { data: any }) => {
  const examples = data?.examples || [];

  return (
    <section id="applications" className="py-24 bg-white font-display border-t border-slate-200">
      <div className="container mx-auto px-4 max-w-7xl">
        <FadeIn>
          <SectionHeader 
            title={data?.title || "Versatile Industry Applications"} 
            subtitle="Serving paper, packaging, textile, and industrial R&D laboratories worldwide."
            topText="USE CASES & SECTORS"
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {examples.map((ex: any, idx: number) => (
              <div 
                key={idx} 
                className="group bg-slate-50 border border-slate-200 p-3 shadow-sm hover:shadow-xl hover:border-primary transition-all rounded-none"
              >
                <div className="aspect-[4/3] bg-white overflow-hidden relative border border-slate-200 mb-3">
                  <Image 
                    src={ex.image || `/api/placeholder/400/300`} 
                    alt={ex.title} 
                    width={400} 
                    height={300} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                </div>
                <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wide text-center group-hover:text-primary transition-colors py-1">
                  {ex.title}
                </h4>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

// ─── 6. INTERACTIVE FAQ SECTION ──────────────────────────────────────────────
export const FAQSection = ({ data }: { data: any }) => {
  const faqs = data?.faqs || [];
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleIndex = (i: number) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <section id="faqs" className="py-24 bg-slate-50 font-display border-t border-slate-200">
      <div className="container mx-auto px-4 max-w-4xl">
        <FadeIn>
          <SectionHeader 
            title={data?.title || "Frequently Asked Questions"} 
            subtitle="Get clear answers to common questions about calibration, standards, and operation."
            topText="KNOWLEDGE BASE"
          />

          <div className="space-y-3">
            {faqs.map((faq: any, idx: number) => {
              const isOpen = openIndex === idx;
              const question = faq.question || faq.q || '';
              const answer = faq.answer || faq.a || '';

              return (
                <div 
                  key={idx} 
                  className={`border transition-all rounded-none ${
                    isOpen ? 'border-primary bg-white shadow-md' : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleIndex(idx)}
                    className="w-full py-5 px-6 text-left flex items-center justify-between font-bold text-slate-900 text-sm md:text-base uppercase tracking-tight"
                  >
                    <span>{question}</span>
                    <ChevronDown className={`w-5 h-5 text-primary shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6 pt-1 text-slate-600 text-sm leading-relaxed border-t border-slate-100 animate-in fade-in duration-200">
                      {answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-12 p-6 bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-800">
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-white">Have a specific technical question?</h4>
              <p className="text-xs text-slate-400 mt-1">Our lab engineers are available to review your material testing requirements.</p>
            </div>
            <a
              href="#enquiry"
              className="bg-primary hover:bg-blue-600 text-white font-black uppercase text-xs tracking-widest px-6 py-3 transition-colors shrink-0 rounded-none"
            >
              Ask an Engineer
            </a>
          </div>

        </FadeIn>
      </div>
    </section>
  );
};

// ─── 7. TABBED CONTENT SECTION ───────────────────────────────────────────────
export const TabbedContentSection = ({ data }: { data: any }) => {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = data?.tabs || [];

  if (!tabs.length) return null;

  return (
    <section className="py-24 bg-white font-display border-t border-slate-200">
      <div className="container mx-auto px-4 max-w-5xl">
        <FadeIn>
          <SectionHeader title={data?.title || "Detailed Information"} topText="EXPLORE DETAILS" />
          
          <div className="border-2 border-slate-200 bg-white p-6 md:p-8 shadow-xl">
            <div className="flex flex-wrap border-b border-slate-200 gap-2 mb-6">
              {tabs.map((tab: any, idx: number) => (
                <button 
                  key={idx} 
                  onClick={() => setActiveTab(idx)}
                  className={`py-3 px-5 uppercase font-black text-xs tracking-wider transition-all rounded-none ${
                    activeTab === idx 
                      ? 'bg-primary text-white border-b-2 border-primary shadow-md' 
                      : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="text-slate-700 text-sm leading-relaxed prose max-w-none">
              {tabs[activeTab]?.content}
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

// ─── 8. DOWNLOADS SECTION ───────────────────────────────────────────────────
export const DownloadsSection = ({ data }: { data: any }) => {
  const files = data?.files || [];

  return (
    <section id="downloads" className="py-24 bg-slate-50 font-display border-t border-slate-200">
      <div className="container mx-auto px-4 max-w-5xl">
        <FadeIn>
          <SectionHeader title={data?.title || "Technical Documentation & Downloads"} topText="RESOURCES" />
          
          <div className="grid md:grid-cols-3 gap-6">
            {files.map((file: any, idx: number) => (
              <a 
                key={idx} 
                href={file.url || '#enquiry'} 
                className="bg-white p-6 border border-slate-200 hover:border-primary shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group rounded-none"
              >
                <div>
                  <div className="w-10 h-10 bg-blue-50 border border-blue-200 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wide mb-2 group-hover:text-primary transition-colors">
                    {file.name}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">PDF Document • Technical Brochure</p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-primary">
                  <span>Download Now</span>
                  <Download className="w-4 h-4 transform group-hover:translate-y-0.5 transition-transform" />
                </div>
              </a>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

// ─── 9. CONTACT SECTION FALLBACK ─────────────────────────────────────────────
export const ContactSection = ({ data }: { data: any }) => null;

// ─── 10. RELATED PRODUCTS SECTION ──────────────────────────────────────────────
export const RelatedProductsSection = ({ data }: { data: any }) => {
  const products = data?.products || [];
  if (!products.length) return null;

  return (
    <section className="py-24 bg-white font-display border-t border-slate-200">
      <div className="container mx-auto px-4 max-w-7xl">
        <FadeIn>
          <SectionHeader 
            title={data?.title || "Related Testing Equipment"} 
            topText="COMPLETE LABORATORY SOLUTIONS"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((prod: any, idx: number) => (
              <a 
                key={idx} 
                href={prod.link || '#'} 
                className="group bg-slate-50 border border-slate-200 hover:border-primary transition-all p-5 shadow-sm hover:shadow-xl flex flex-col rounded-none"
              >
                <div className="aspect-[4/3] bg-white mb-4 overflow-hidden relative border border-slate-200 flex items-center justify-center">
                  <Image 
                    src={prod.image || `/api/placeholder/400/300`} 
                    alt={prod.title || "Product"} 
                    width={400} 
                    height={300} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h4 className="font-bold text-slate-900 text-base uppercase group-hover:text-primary transition-colors mb-2">
                  {prod.title}
                </h4>
                {prod.description && (
                  <p className="text-slate-600 text-xs leading-relaxed line-clamp-2 mb-4 font-normal">{prod.description}</p>
                )}
                <span className="text-primary text-xs font-black uppercase tracking-wider mt-auto flex items-center pt-3 border-t border-slate-200">
                  <span>Explore Product</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1 transform group-hover:translate-x-1 transition-transform" />
                </span>
              </a>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

// --- PRODUCT TABS SECTION (Key Features / Standards / Applications) ---
export const ProductTabsSection = ({ data }: { data: any }) => {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { 
      id: 'features', 
      label: 'Key Features', 
      Icon: Settings, 
      points: data?.keyFeatures || [] 
    },
    { 
      id: 'standards', 
      label: 'Applicable Test Standards', 
      Icon: FileText, 
      points: data?.testStandards || [] 
    },
    { 
      id: 'applications', 
      label: 'Applications', 
      Icon: Factory, 
      points: data?.applications || [] 
    },
  ];

  const active = tabs[activeTab];

  return (
    <section id="product-tabs" className="py-20 md:py-24 bg-slate-50 font-display border-t border-slate-200">
      <div className="container mx-auto px-4 max-w-6xl">
        <FadeIn>
          <SectionHeader 
            title={data?.title || 'Comprehensive Specifications & Details'} 
            subtitle={data?.subtitle || 'Explore key engineering features, compliant international test standards, and industrial application sectors.'} 
            topText="TECHNICAL CAPABILITIES" 
          />

          {/* Tabs Navigation */}
          <div className="mt-10 flex border-b-2 border-slate-200 overflow-x-auto no-scrollbar">
            {tabs.map((tab, i) => {
              const TabIcon = tab.Icon;
              const isActive = activeTab === i;
              return (
                <button 
                  key={tab.id} 
                  type="button" 
                  onClick={() => setActiveTab(i)} 
                  className={`flex items-center gap-2.5 px-6 md:px-8 py-4 text-xs md:text-sm font-black uppercase tracking-wider whitespace-nowrap transition-all border-b-2 -mb-[2px] ${
                    isActive 
                      ? 'border-primary text-primary bg-white shadow-sm' 
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                  }`}
                >
                  <TabIcon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {tab.points && tab.points.length > 0 && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-primary/10 text-primary' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {tab.points.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Content Box */}
          <div className="bg-white border border-t-0 border-slate-200 p-6 md:p-10 shadow-sm">
            {!active.points || active.points.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <active.Icon className="w-10 h-10 mx-auto text-slate-300 mb-2 opacity-50" />
                <p className="text-sm italic">No points specified for {active.label.toLowerCase()} yet.</p>
              </div>
            ) : (
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                {active.points.map((point: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 p-3 bg-slate-50/70 border border-slate-100 rounded-none hover:border-primary/30 transition-colors">
                    <span className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary" />
                    </span>
                    <span className="text-sm text-slate-700 font-medium leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </FadeIn>
      </div>
    </section>
  );
};
