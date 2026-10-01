import React from 'react';
import dbConnect from '@/lib/dbConnect';
import Campaign from '@/models/Campaign';
import CampaignStickyNav from '@/components/campaigns/CampaignStickyNav';
import HeroSection from '@/components/campaigns/HeroSection';
import VideoSection from '@/components/campaigns/VideoSection';
import { 
  FeaturesSection, SpecificationsSection, ComparisonSection, 
  FeedbackSection, ApplicationsSection, FAQSection 
} from '@/components/campaigns/Sections';
import CampaignEnquiryForm from '@/components/campaigns/CampaignEnquiryForm';
import { formatTitle, SectionHeader } from '@/components/campaigns/Typography';
import FadeIn from '@/components/ui/FadeIn';
import { 
  CheckCircle2, ShieldCheck, Wrench, Factory, Save, Activity, 
  Beaker, BookOpen, Phone, Mail, Download 
} from 'lucide-react';

export const metadata = {
  title: 'LabZenix Bursting Strength Tester | High-Precision Quality Control',
  description: 'Servo-controlled hydraulic bursting strength tester for paper, packaging, and textiles. ISO, ASTM, GB/T compliant high-precision measurement.',
};

// ─── Static Fallback Data ───────────────────────────────────────────────────

const FALLBACK_HERO = {
  title: 'Bursting Strength Testing Machine',
  description: `
    <p>The <strong>LabZenix Servo Hydraulic Bursting Strength Tester</strong> measures the multidirectional burst pressure of paper, corrugated paperboard, industrial textiles, non-wovens, and medicinal fabrics under strict ISO and ASTM standards.</p>
    <p>Engineered with precision servo-controlled hydraulics, constant rate diaphragm distension, and integrated touchscreen software for automated bursting point detection and real-time curve plotting.</p>
  `,
  images: [
    'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80'
  ],
  highlights: [
    'Servo-Hydraulic Drive',
    'ISO 13938-1 & ASTM D3786',
    'Auto Burst Point Detection',
    'Touchscreen HMI & Software Export'
  ],
  tabs: [
    {
      label: 'Key Features',
      content: `High-precision servo hydraulic drive ensuring constant rate of pressure increase (0.1–100 kPa/s)
Dual pneumatic clamping system with adjustable clamping pressure preventing sample slippage
7-inch color PLC touchscreen interface with real-time pressure-displacement curve display
Automatic specimen rupture detection with instant high-speed pressure relief
Quick-change interchangeable test heads (7.3 cm², 10 cm², 50 cm², 100 cm²)
Automatic diaphragm distension tare & zero-correction for high measurement repeatability
Onboard micro-printer and USB/RS-232 export for LIMS & factory quality systems
Transparent acrylic safety interlock shield protecting operators during high-pressure bursting`
    },
    {
      label: 'Applicable Test Standards',
      content: `ISO 13938-1: Textiles — Bursting properties of fabrics (Hydraulic method)
ASTM D3786 / D3786M: Standard Test Method for Bursting Strength of Textile Fabrics
ISO 2758: Paper — Determination of bursting strength (Low pressure method)
ISO 2759: Board — Determination of bursting strength (High pressure method)
GB/T 7742.1: Textiles — Bursting properties of fabrics (Hydraulic method)
TAPPI T810: Bursting strength of corrugated and solid fiberboard
EN 12332-2: Rubber or plastics coated fabrics — Determination of bursting strength
JIS L1096: Testing methods for woven and knitted fabrics`
    },
    {
      label: 'Applications',
      content: `Corrugated boxes, packaging cartons & multi-wall shipping sacks
Kraft paper, linerboard, greyboard, and specialty paper manufacturing
Knitted, woven, and technical industrial textiles (apparel & outdoor wear)
Medical non-wovens, surgical gowns, sterile packaging, and PPE barriers
Geotextiles, filter cloths, and technical synthetic fabrics
Automotive interior fabrics, airbags, and reinforced composites
Third-party testing laboratories, universities & quality inspection centers`
    }
  ]
};

const FALLBACK_FEATURES = [
  { title: 'High-Precision Pressure Sensor', description: 'Advanced pressure transducers record exact rupture points with ±0.5% full-scale accuracy.', icon: 'Gauge' },
  { title: 'Servo-Controlled Hydraulic System', description: 'Smooth, pulsation-free hydraulic fluid expansion ensuring uniform stress distribution.', icon: 'Cpu' },
  { title: 'Automated One-Touch Testing', description: 'Single-button operation with automated clamping, distension rate control, and test reset.', icon: 'Settings' },
  { title: 'Interchangeable Test Heads', description: 'Includes standard 7.3 cm², 10 cm², 50 cm², and 100 cm² fixtures for diverse materials.', icon: 'Maximize' },
];

const FALLBACK_SPECS = [
  { key: 'Pressure Measuring Range', value: '0 - 6000 kPa (6.0 MPa) / Custom options available' },
  { key: 'Measurement Accuracy', value: '± 0.5% of Full Scale' },
  { key: 'Test Head Area Options', value: '7.3 cm², 7.55 cm², 10 cm², 50 cm², 100 cm² (Quick Swap)' },
  { key: 'Pneumatic Clamping Pressure', value: '0.6 MPa (Requires external compressed air line)' },
  { key: 'Distension Expansion Height', value: 'Up to 75.0 mm (Linear displacement sensor)' },
  { key: 'Test Standards Compliance', value: 'ISO 13938-1, ISO 2758, ISO 2759, ASTM D3786, GB/T 7742.1' },
  { key: 'Hydraulic Medium', value: 'High-grade synthetic glycerol / silicone oil' },
  { key: 'HMI & Output', value: '7" Touchscreen PLC + RS232 / USB Data Export' },
];

const FALLBACK_COMPARISON = [
  { feature: 'Pressure Rate Control', ourValue: 'Servo Hydraulic Closed-Loop', ourBadge: 'Pulsation-Free', competitorValue: 'Manual / Basic Motor', competitorBadge: 'Fluctuating' },
  { feature: 'Sensor Accuracy', ourValue: '±0.5% Full Scale', ourBadge: 'High Precision', competitorValue: '±1.5% - 2.0%', competitorBadge: 'Standard' },
  { feature: 'Burst Point Detection', ourValue: 'Auto Rate Drop Sensing', ourBadge: 'Instant Auto-Stop', competitorValue: 'Manual Visual Observation', competitorBadge: 'Human Error' },
  { feature: 'Data Logging & Curve', ourValue: 'Real-time Touchscreen Graph', ourBadge: 'Export to Excel', competitorValue: 'Analog Gauge Only', competitorBadge: 'No Export' },
  { feature: 'Safety Interlocks', ourValue: 'Shield Door + E-Stop + Pressure Limit', ourBadge: 'Full Protection', competitorValue: 'Basic Guarding', competitorBadge: 'Basic' },
];

const FALLBACK_FAQS = [
  { q: 'What is bursting strength?', a: 'Bursting strength measures the maximum hydraulic pressure a material withstands before rupturing under multidirectional fluid expansion.' },
  { q: 'Which materials can be tested?', a: 'Paper, corrugated board, packaging boxes, woven & knitted textiles, non-wovens, denim, medical textiles, and geotextiles.' },
  { q: 'Are test heads interchangeable?', a: 'Yes. The machine includes quick-change fixtures conforming to standard test head areas (7.3 cm² to 100 cm²).' },
  { q: 'What after-sales calibration and warranty are provided?', a: 'LabZenix provides a 1-Year Comprehensive Warranty, factory calibration certificate traceable to NABL/NIST, and on-site engineering support.' },
];


export default async function BurstingStrengthTesterCampaign() {
  let sections: any[] = [];
  try {
    await dbConnect();
    const campaign = await Campaign.findOne({ slug: 'bursting-strength-tester' })
      .select('title slug status seo sections')
      .lean();
    if (campaign?.sections?.length) {
      sections = campaign.sections;
    }
  } catch (_) {
    // Fall back to static data cleanly if DB disconnected
  }

  const heroDataRaw = sections.find(s => s.type === 'Hero')?.data;
  const heroData = heroDataRaw
    ? {
        ...FALLBACK_HERO,
        ...heroDataRaw,
        tabs: (Array.isArray(heroDataRaw.tabs) && heroDataRaw.tabs.length > 0)
          ? heroDataRaw.tabs
          : (heroDataRaw.tabs === undefined ? FALLBACK_HERO.tabs : heroDataRaw.tabs)
      }
    : FALLBACK_HERO;
  const featData = sections.find(s => s.type === 'FeaturesWithImage' || s.type === 'TextWithImage')?.data || { title: 'Uncompromising Engineering Precision', features: FALLBACK_FEATURES, image: FALLBACK_HERO.images[0] };
  const specsData = sections.find(s => s.type === 'Specifications')?.data || { title: 'Technical Specifications', specs: FALLBACK_SPECS };
  const compData = sections.find(s => s.type === 'ComparisonTable')?.data || { title: 'Why LabZenix Leads The Industry', rows: FALLBACK_COMPARISON };
  const faqData = sections.find(s => s.type === 'FAQs')?.data || { title: 'Frequently Asked Questions', faqs: FALLBACK_FAQS };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 font-sans selection:bg-primary selection:text-white">
      

      {/* Hero Section */}
      <HeroSection data={heroData} campaignTitle="Servo Hydraulic Bursting Strength Tester" />

      {/* Key Advantages / Features */}
      <FeaturesSection data={featData} index={0} />

      {/* Methodology & Testing Principle */}
      <section className="py-24 bg-slate-50 relative font-display border-t border-slate-200">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            
            <div className="lg:w-1/2">
              <FadeIn direction="right">
                <SectionHeader 
                  title="Testing Principle & Process" 
                  subtitle="How automated hydraulic diaphragm testing delivers reproducible quality control results."
                  topText="METHODOLOGY"
                  align="left"
                />
                
                <div className="space-y-6 mt-8">
                  {[
                    { title: '1. Pneumatic Sample Clamping', desc: 'Specimen is securely clamped over a circular elastic diaphragm with uniform pressure.' },
                    { title: '2. Servo Hydraulic Expansion', desc: 'Fluid pressure increases at a constant volumetric rate, expanding the diaphragm upward.' },
                    { title: '3. Multidirectional Rupture', desc: 'Sample distends until it bursts under maximum applied multidirectional stress.' },
                    { title: '4. Instant Peak Recording', desc: 'Pressure sensor records burst value; system immediately stops and retracts.' }
                  ].map((step, idx) => (
                    <div key={idx} className="flex gap-4 items-start bg-white p-4 border border-slate-200 shadow-sm">
                      <div className="flex-shrink-0 w-10 h-10 bg-primary text-white flex items-center justify-center font-bold text-sm border border-blue-400">
                        0{idx + 1}
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-slate-900 uppercase">{step.title}</h4>
                        <p className="text-slate-600 text-xs leading-relaxed mt-1">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </FadeIn>
            </div>

            <div className="lg:w-1/2 w-full">
              <FadeIn direction="left">
                <div className="bg-white p-8 border-2 border-slate-200 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 -z-0 rounded-full blur-2xl"></div>
                  
                  <h3 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-wider flex items-center">
                    <ShieldCheck className="w-6 h-6 text-primary mr-3" /> Built-in Machine Construction
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-700">
                    {[
                      'Heavy Rigid Frame', 'Servo Hydraulic Pump',
                      'Interchangeable Test Head', 'Pneumatic Cylinder Clamp',
                      'Precision Sensor Grade A', 'Displacement Transducer',
                      'PLC Touchscreen Controller', 'Safety Interlock Shield'
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center p-3 bg-slate-50 border border-slate-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-2 flex-shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-200 text-xs text-slate-500">
                    <span className="text-primary font-bold">Standard Fixtures Included:</span> 7.3 cm², 10 cm², 50 cm², 100 cm² clamping heads & spare diaphragms.
                  </div>
                </div>
              </FadeIn>
            </div>

          </div>
        </div>
      </section>

      {/* Video Demonstration */}
      <VideoSection data={{
        title: 'Machine Operation & Testing Demo',
        description: 'Watch the servo hydraulic system perform automated sample clamping, pressure ramping, and digital curve plotting.',
        videoUrl: 'https://www.youtube.com/embed/yEZQa4t-aUM',
      }} />

      {/* Technical Specifications */}
      <SpecificationsSection data={specsData} />

      {/* Matrix Comparison */}
      <ComparisonSection data={compData} />

      {/* Applications & Industries */}
      <section id="applications" className="py-24 bg-white font-display border-t border-slate-200">
        <div className="container mx-auto px-4 max-w-7xl">
          <FadeIn>
            <SectionHeader 
              title="Supported Standards & Key Industries" 
              subtitle="Tested and certified to comply with global international standard test protocols."
              topText="COMPLIANCE & USE CASES"
            />

            <div className="mb-14">
              <h3 className="text-center text-xs font-black uppercase tracking-[0.2em] text-primary mb-4">Supported International Test Standards</h3>
              <div className="flex flex-wrap justify-center gap-3">
                {['ISO 13938-1', 'ASTM D3786', 'GB/T 7742.1', 'ISO 2758 (Paper)', 'ISO 2759 (Board)', 'EN 12332-2', 'TAPPI T810'].map((std, idx) => (
                  <span key={idx} className="px-4 py-2 bg-slate-100 border border-slate-200 text-primary font-bold text-xs shadow-inner">
                    {std}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { icon: Factory, name: 'Paper & Pulp' },
                { icon: Save, name: 'Packaging' },
                { icon: Activity, name: 'Textiles' },
                { icon: Beaker, name: 'R&D Labs' },
                { icon: ShieldCheck, name: 'QC Testing' },
                { icon: BookOpen, name: 'Institutions' },
              ].map((ind, idx) => (
                <div key={idx} className="flex flex-col items-center justify-center p-6 bg-slate-50 border border-slate-200 hover:border-primary hover:bg-blue-50 transition-colors">
                  <ind.icon className="w-8 h-8 text-primary mb-3" />
                  <span className="text-xs font-bold uppercase tracking-wider text-center text-slate-700">{ind.name}</span>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* FAQs */}
      <FAQSection data={faqData} />

      {/* Global Fixed Enquiry Form & Footer CTA */}
      <section id="enquiry" className="py-24 bg-slate-50 relative overflow-hidden font-display border-t border-slate-200">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto bg-white border-2 border-slate-200 shadow-2xl overflow-hidden flex flex-col lg:flex-row rounded-none">
            
            {/* Left Info Panel */}
            <div className="lg:w-2/5 bg-slate-900 text-white p-10 md:p-12 flex flex-col justify-between border-r border-slate-800">
              <div>
                <div className="inline-flex items-center space-x-2 text-primary font-bold tracking-[0.2em] uppercase text-xs mb-4 bg-primary/10 border border-primary/20 px-3 py-1">
                  <span>GET IN TOUCH</span>
                </div>

                <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-4 text-white">
                  Request Official Quotation
                </h3>
                
                <p className="text-slate-400 mb-8 leading-relaxed text-sm">
                  Need a reliable Servo Hydraulic Bursting Strength Tester? Contact the LabZenix engineering team for custom pressure ranges and factory pricing.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center p-3 bg-slate-800 border border-slate-700">
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

                  <div className="flex items-center p-3 bg-slate-800 border border-slate-700">
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
              
              <div className="mt-8 pt-6 border-t border-slate-700">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">Instant Technical Downloads</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {['Datasheet', 'Product Brochure', 'User Operation Manual', 'ISO Certificate'].map((doc, i) => (
                    <a key={i} href="#enquiry" className="flex items-center text-primary hover:text-white transition-colors text-[11px] font-semibold">
                      <Download className="w-3 h-3 mr-1 shrink-0" /> {doc}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Form */}
            <CampaignEnquiryForm campaignTitle="Digital Servo Bursting Strength Tester" campaignSlug="bursting-strength-tester" className="lg:w-3/5" />
          </div>
        </div>
      </section>

    </div>
  );
}
