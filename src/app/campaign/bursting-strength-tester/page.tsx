import React from 'react';
import FadeIn from '@/components/ui/FadeIn';
import { 
  ArrowRight, Activity, Cpu, ShieldCheck, Factory, Beaker, Wrench, 
  Settings, Save, BookOpen, Download, HelpCircle, Phone, Mail, 
  CheckCircle2, Gauge, Maximize
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import dbConnect from '@/lib/dbConnect';
import Campaign from '@/models/Campaign';
import CampaignEnquiryForm from '@/components/campaigns/CampaignEnquiryForm';

export const metadata = {
  title: 'LabZenix Bursting Strength Tester | High-Precision Quality Control',
  description: 'Servo-controlled hydraulic bursting strength tester for paper, packaging, and textiles. ISO, ASTM, GB/T compliant high-precision measurement.',
};

// Helper to format titles with alternating black/primary colors
const formatTitle = (title: string) => {
  if (!title) return null;
  const words = title.split(' ');
  return (
    <>
      {words.map((word, index) => (
        <span key={index} className={index % 2 === 1 ? 'text-primary' : 'text-black'}>
          {word}{' '}
        </span>
      ))}
    </>
  );
};

// Helper to find a section by type from the DB campaign sections array
function getSectionData(sections: any[], type: string): any {
  return sections?.find((s: any) => s.type === type)?.data || null;
}

// ─── Static Fallback Data ───────────────────────────────────────────────────

const FALLBACK_HERO = {
  title: 'Bursting Strength Testing Machine',
  description: `
    <p>The LabZenix Bursting Strength Tester uses the diaphragm as a method to test hydraulic bursting. It determines the maximum pressure a material withstands before bursting. This tester is ideal for a variety of materials, including industrial textiles, seat covers, denim, medicinal textiles, and geotextiles.</p>
    <p>It also measures expansion and bursting strength for various materials such as non-woven, knitted, woven fabrics, plus paper, elastic-woven fabric, and laminated fabric. This burst tester strictly complies with international standards like ISO 13938-1 or ASTM D3786.</p>
    <p>There are two models available, the Hydraulic Bursting Strength Tester and the Pneumatic Bursting Strength Tester.</p>
    <p>Moreover, the Bursting Strength tester can be customized. You can choose the test cup size and testing pressure to match your needs. This ensures reliable and consistent test results.</p>
    <p>Additionally, the tester evaluates material resistance in both machine and cross directions, as well as in other orientations.</p>
    <p class="font-medium text-slate-800 mt-6">Be curious about the bursting strength tester price? Feel free to contact us now!</p>
  `,
  images: [],
};

const FALLBACK_FEATURES = [
  { title: 'High-Precision Measurement', description: 'Accurate pressure sensors for exact bursting point detection.' },
  { title: 'Servo-Controlled System', description: 'Smooth, consistent hydraulic pressure generation.' },
  { title: 'Automatic Operation', description: 'One-touch testing with auto result calculation.' },
  { title: 'Multiple Test Areas', description: 'Versatile fixtures from 7.3 cm² to 100 cm².' },
];

const FALLBACK_SPECS = [
  ['Pressure Range', 'Up to 6000 kPa (or as specified)'],
  ['Accuracy', '± 0.5% of full scale'],
  ['Test Area', '7.3 cm², 7.55 cm², 10 cm², 50 cm², 100 cm² (Interchangeable)'],
  ['Test Speed', 'Constant volume rate or constant time-to-burst (Programmable)'],
  ['Expansion Range', 'Up to 75mm (depending on test area)'],
  ['Hydraulic Medium', 'High-grade synthetic glycerol / silicone oil'],
  ['Clamping System', 'Pneumatic (Air requirement: 0.6 MPa)'],
  ['Power Supply', '220V, 50/60Hz, Single Phase'],
];

const FALLBACK_FAQS = [
  { q: 'What is bursting strength?', a: 'Bursting strength is the maximum pressure a material can withstand before rupturing under multidirectional stress. It indicates the overall durability of paper, packaging, or textiles.' },
  { q: 'What materials can be tested?', a: 'This instrument can test paper, paperboard, corrugated packaging, textiles, nonwoven materials, foils, and other flat sheet materials.' },
  { q: 'What test areas are available?', a: 'The tester comes with interchangeable test heads offering standard areas like 7.3 cm², 7.55 cm², 10 cm², 50 cm², and 100 cm² depending on the specific standard requirements.' },
  { q: 'Can the machine be customized?', a: 'Yes, LabZenix offers custom configurations for specific pressure ranges, customized test areas, and specialized software outputs to meet unique R&D requirements.' },
];

// ─── Feature Icons (static, mapped by index) ────────────────────────────────
const FEATURE_ICONS = [Gauge, Cpu, Settings, Maximize];

// ─── Page Component ──────────────────────────────────────────────────────────

export default async function BurstingStrengthTesterCampaign() {
  // Fetch DB campaign data — page stays static if not found
  let sections: any[] = [];
  try {
    await dbConnect();
    const campaign = await Campaign.findOne({ slug: 'bursting-strength-tester' });
    if (campaign?.sections?.length) {
      sections = campaign.sections;
    }
  } catch (_) {
    // Silently fall back to static data — DB failure must not break the page
  }

  // Resolve section data: DB data takes priority, static fallback used if missing
  const heroData    = getSectionData(sections, 'Hero');
  const featData    = getSectionData(sections, 'FeaturesWithImage') || getSectionData(sections, 'TextWithImage');
  const specsData   = getSectionData(sections, 'Specifications');
  const faqData     = getSectionData(sections, 'FAQs');

  const heroTitle       = heroData?.title || FALLBACK_HERO.title;
  const heroDesc        = heroData?.description || FALLBACK_HERO.description;
  const heroImages      = heroData?.images?.length ? heroData.images : FALLBACK_HERO.images;
  const features        = featData?.features?.length ? featData.features : FALLBACK_FEATURES;
  const featTitle       = featData?.title || 'Uncompromising Precision';
  const specs           = specsData?.specs?.length
    ? specsData.specs.map((s: any) => [s.key, s.value])
    : FALLBACK_SPECS;
  const faqs            = faqData?.faqs?.length ? faqData.faqs : FALLBACK_FAQS;

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 font-sans selection:bg-primary selection:text-white">

      {/* ── EDITABLE: Hero / Product Presentation ────────────────────────── */}
      <section className="pt-24 pb-16 bg-[#eaf0f6]">
        <div className="container mx-auto px-4 max-w-7xl font-display">
          <div className="flex flex-col lg:flex-row gap-12 items-start">

            {/* Left: Gallery */}
            <div className="w-full lg:w-[55%] flex gap-4">
              {/* Thumbnails */}
              <div className="flex flex-col gap-3 w-20 shrink-0">
                {(heroImages.length > 0 ? heroImages : [1, 2, 3, 4]).slice(0, 4).map((img: any, i: number) => (
                  <div key={i} className="aspect-square bg-white border border-slate-200 flex items-center justify-center p-1 cursor-pointer hover:border-primary transition-colors rounded-none">
                    <div className="w-full h-full bg-slate-50 flex items-center justify-center rounded-none">
                      <Image
                        src={typeof img === 'string' ? img : `/api/placeholder/80/80`}
                        alt={`Thumbnail ${i + 1}`}
                        width={80} height={80}
                        className="object-contain opacity-50"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Main Image */}
              <div className="flex-1 bg-white border border-slate-200 aspect-[4/3] flex items-center justify-center relative group cursor-pointer p-4 rounded-none">
                <div className="absolute bottom-4 left-4 p-2 bg-slate-100 border border-slate-200 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors cursor-pointer rounded-none">
                  <Maximize className="w-4 h-4" />
                </div>
                <div className="w-full h-full flex items-center justify-center">
                  <Image
                    src={heroImages[0] || `/api/placeholder/600/450`}
                    alt={heroTitle}
                    width={600} height={450}
                    className="object-contain opacity-50"
                  />
                </div>
              </div>
            </div>

            {/* Right: Product Details */}
            <div className="w-full lg:w-[45%] mt-4">
              <FadeIn direction="up">
                <div className="text-primary font-semibold tracking-[0.2em] uppercase text-sm mb-4">
                  PREMIUM QUALITY
                </div>
                <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-6 leading-tight">
                  {formatTitle(heroTitle)}
                </h1>

                <div
                  className="space-y-4 text-slate-600 leading-relaxed mb-8 text-sm"
                  dangerouslySetInnerHTML={{ __html: heroDesc }}
                />

                <Link
                  href="#enquiry"
                  className="inline-block px-8 py-3 text-sm font-bold tracking-wide uppercase text-primary border-2 border-primary hover:bg-primary hover:text-white transition-colors rounded-none"
                >
                  Get A Quote Now!
                </Link>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* ── EDITABLE: Key Features / Advantages ──────────────────────────── */}
      <section className="py-24 bg-white relative font-display">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <FadeIn>
              <div className="text-primary font-semibold tracking-[0.2em] uppercase text-sm mb-4">PERFORMANCE</div>
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-6">
                {formatTitle(featTitle)}
              </h2>
              <p className="text-lg text-slate-600">
                Determine the bursting strength and distension at burst of diverse materials using our state-of-the-art hydraulic measurement system.
              </p>
            </FadeIn>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature: any, idx: number) => {
              const Icon = FEATURE_ICONS[idx % FEATURE_ICONS.length];
              const title = feature.title || feature.name || `Feature ${idx + 1}`;
              const desc  = feature.description || feature.desc || '';
              return (
                <FadeIn key={idx} delay={0.1 * idx} direction="up" className="bg-slate-50 border border-slate-100 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-none">
                  <div className="w-12 h-12 bg-blue-100 text-primary flex items-center justify-center mb-4 rounded-none border border-blue-200">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
                  <p className="text-slate-600">{desc}</p>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── STATIC: Testing Principle (hardcoded — not admin editable) ─────── */}
      <section className="py-24 bg-slate-50 border-y border-slate-200 font-display">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/2">
              <FadeIn direction="right">
                <div className="text-primary font-semibold tracking-[0.2em] uppercase text-sm mb-4">METHODOLOGY</div>
                <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-10">
                  {formatTitle("Testing Principle")}
                </h2>
                <div className="space-y-6">
                  {[
                    { title: 'Sample Clamping', desc: 'Specimen is securely clamped over a circular elastic diaphragm.' },
                    { title: 'Hydraulic Generation', desc: 'Fluid pressure is increased at a constant rate, expanding the diaphragm.' },
                    { title: 'Sample Bursting', desc: 'The sample distends until it ruptures under the applied pressure.' },
                    { title: 'Result Calculation', desc: 'Maximum pressure is recorded as the bursting strength automatically.' }
                  ].map((step, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-primary text-white flex items-center justify-center font-bold shadow-lg shadow-primary/20 rounded-none border border-primary">
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-slate-900">{step.title}</h4>
                        <p className="text-slate-600">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </FadeIn>
            </div>
            <div className="lg:w-1/2">
              <FadeIn direction="left">
                <div className="bg-white p-8 shadow-xl border border-slate-100 relative overflow-hidden rounded-none">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 -z-0"></div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-6 relative z-10 uppercase tracking-wide">Machine Construction</h3>
                  <ul className="grid grid-cols-2 gap-y-4 gap-x-8 text-slate-700 relative z-10">
                    {['Machine frame', 'Hydraulic system', 'Test head', 'Clamping system', 'Pressure sensor', 'Displacement sensor', 'Controller', 'HMI Touchscreen'].map((item, idx) => (
                      <li key={idx} className="flex items-center">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* ── EDITABLE: Technical Specifications ───────────────────────────── */}
      <section className="py-24 bg-white font-display">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="text-center mb-16">
              <div className="text-primary font-semibold tracking-[0.2em] uppercase text-sm mb-4">DATA & DETAILS</div>
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-6">
                {formatTitle("Technical Specifications")}
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                {specsData?.subtitle || 'Engineered to meet the most demanding laboratory testing requirements.'}
              </p>
            </div>
          </FadeIn>

          <div className="max-w-4xl mx-auto bg-white shadow-lg border border-slate-200 overflow-hidden rounded-none">
            <FadeIn direction="up">
              <table className="w-full text-left border-collapse">
                <tbody>
                  {specs.map((row: [string, string], idx: number) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                      <td className="py-4 px-6 font-bold text-slate-900 w-1/3 border-b border-slate-100">{row[0]}</td>
                      <td className="py-4 px-6 text-slate-700 border-b border-slate-100">{row[1]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── STATIC: Applications & Industries (hardcoded — not admin editable) */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden font-display">
        <div className="absolute inset-0 z-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTU0LjYyNyAwTDYwIDUuMzczdjU0LjYyN0g1NC42MjdWMHoiIGZpbGw9IiNmZmYiIGZpbGwtcnVsZT0iZXZlbm9kZCIgZmlsbC1vcGFjaXR5PSIuMDUiLz48L3N2Zz4=')]"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16">
            <FadeIn direction="right">
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-8 text-white">
                Supported Standards
              </h2>
              <div className="flex flex-wrap gap-3 mb-12">
                {['ISO 13938-1', 'ASTM D3786/D3786M', 'GB/T 7742.1', 'EN 12332-2', 'ISO 2758', 'ISO 2759'].map((std, idx) => (
                  <span key={idx} className="px-4 py-2 bg-slate-800 border border-slate-700 text-primary font-bold text-sm shadow-inner rounded-none">
                    {std}
                  </span>
                ))}
              </div>

              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-8 text-white">
                Industries Served
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { icon: Factory, name: 'Paper & Pulp' },
                  { icon: Save, name: 'Packaging' },
                  { icon: Activity, name: 'Textile' },
                  { icon: Beaker, name: 'R&D Labs' },
                  { icon: ShieldCheck, name: 'QC Labs' },
                  { icon: BookOpen, name: 'Institutions' },
                ].map((ind, idx) => (
                  <div key={idx} className="flex flex-col items-center justify-center p-4 bg-slate-800/50 border border-slate-700 hover:bg-primary/20 transition-colors rounded-none">
                    <ind.icon className="w-8 h-8 text-primary mb-3" />
                    <span className="text-sm font-bold uppercase tracking-wider text-center">{ind.name}</span>
                  </div>
                ))}
              </div>
            </FadeIn>

            <FadeIn direction="left">
              <div className="bg-slate-800 p-8 border border-slate-700 h-full rounded-none">
                <h3 className="text-3xl font-black uppercase tracking-wide mb-8 text-white flex items-center">
                  <ShieldCheck className="w-8 h-8 mr-4 text-primary" /> Safety & Control
                </h3>
                <div className="space-y-8">
                  <div>
                    <h4 className="text-lg font-bold text-primary mb-4 uppercase tracking-wider">Intelligent Software</h4>
                    <ul className="space-y-3 text-slate-300">
                      <li className="flex items-start"><CheckCircle2 className="w-5 h-5 text-green-400 mr-3 mt-0.5 shrink-0" /> Real-time pressure curve display</li>
                      <li className="flex items-start"><CheckCircle2 className="w-5 h-5 text-green-400 mr-3 mt-0.5 shrink-0" /> Automatic burst detection</li>
                      <li className="flex items-start"><CheckCircle2 className="w-5 h-5 text-green-400 mr-3 mt-0.5 shrink-0" /> Comprehensive test history</li>
                      <li className="flex items-start"><CheckCircle2 className="w-5 h-5 text-green-400 mr-3 mt-0.5 shrink-0" /> Data export & Report generation</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-primary mb-4 uppercase tracking-wider">Built-in Safety</h4>
                    <ul className="space-y-3 text-slate-300">
                      <li className="flex items-start"><CheckCircle2 className="w-5 h-5 text-green-400 mr-3 mt-0.5 shrink-0" /> Emergency stop button</li>
                      <li className="flex items-start"><CheckCircle2 className="w-5 h-5 text-green-400 mr-3 mt-0.5 shrink-0" /> Over-pressure protection</li>
                      <li className="flex items-start"><CheckCircle2 className="w-5 h-5 text-green-400 mr-3 mt-0.5 shrink-0" /> Safety enclosure & Door interlock</li>
                      <li className="flex items-start"><CheckCircle2 className="w-5 h-5 text-green-400 mr-3 mt-0.5 shrink-0" /> Automatic test termination</li>
                    </ul>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── STATIC: Why LabZenix (hardcoded — not admin editable) ─────────── */}
      <section className="py-24 bg-white font-display">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <FadeIn>
              <div className="text-primary font-semibold tracking-[0.2em] uppercase text-sm mb-4">OUR ADVANTAGE</div>
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-6">
                {formatTitle("Why Choose LabZenix?")}
              </h2>
            </FadeIn>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Indian Engineering', desc: 'Robust build quality designed and manufactured in India for local and global needs.' },
              { title: 'Custom Configurations', desc: 'Tailored solutions to match your exact testing requirements and material types.' },
              { title: 'Technical & Calibration Support', desc: 'Expert after-sales service, spare parts availability, and timely calibration.' }
            ].map((item, idx) => (
              <FadeIn key={idx} delay={0.1 * idx} direction="up" className="bg-slate-50 p-8 border border-slate-100 text-center rounded-none hover:border-primary transition-colors">
                <div className="w-16 h-16 bg-blue-50 flex items-center justify-center mx-auto mb-6 text-primary rounded-none border border-primary/20">
                  <Wrench className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 uppercase tracking-wide">{item.title}</h3>
                <p className="text-slate-600">{item.desc}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── EDITABLE: FAQ Section ─────────────────────────────────────────── */}
      <section className="py-24 bg-slate-50 border-t border-slate-200 font-display">
        <div className="container mx-auto px-4 max-w-4xl">
          <FadeIn>
            <div className="text-primary font-semibold tracking-[0.2em] uppercase text-sm mb-4 text-center">KNOWLEDGE BASE</div>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-12 text-center">
              {formatTitle("Frequently Asked Questions")}
            </h2>
          </FadeIn>
          <div className="space-y-4">
            {faqs.map((faq: any, idx: number) => {
              const question = faq.question || faq.q || '';
              const answer   = faq.answer   || faq.a || '';
              return (
                <FadeIn key={idx} delay={0.1 * idx} direction="up" className="bg-white p-8 border border-slate-200 shadow-sm rounded-none">
                  <h4 className="text-xl font-bold text-slate-900 mb-4">{question}</h4>
                  <p className="text-slate-600 leading-relaxed">{answer}</p>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── STATIC: Enquiry Form & Footer CTA (hardcoded — not admin editable) */}
      <section id="enquiry" className="py-24 bg-primary relative overflow-hidden font-display">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto bg-white shadow-2xl overflow-hidden flex flex-col lg:flex-row rounded-none border border-primary/30">

            {/* CTA Content */}
            <div className="lg:w-2/5 bg-slate-900 text-white p-12 flex flex-col justify-between">
              <div>
                <div className="text-primary font-bold tracking-[0.2em] uppercase text-xs mb-4">GET IN TOUCH</div>
                <h3 className="text-4xl font-black uppercase tracking-tight mb-6 text-black bg-white inline-block px-4 py-2">
                  {formatTitle("Request a Quotation")}
                </h3>
                <p className="text-slate-400 mb-10 leading-relaxed mt-4">
                  Need a reliable solution for bursting strength testing? Talk to the LabZenix technical team about your testing requirements.
                </p>

                <div className="space-y-8">
                  <div className="flex items-center">
                    <div className="w-14 h-14 bg-slate-800 flex items-center justify-center mr-5 text-primary rounded-none border border-slate-700">
                      <Phone className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-1">Call Us directly</p>
                      <p className="font-semibold text-lg">+91 123 456 7890</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-14 h-14 bg-slate-800 flex items-center justify-center mr-5 text-primary rounded-none border border-slate-700">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-1">Email Us</p>
                      <p className="font-semibold text-lg">sales@labzenix.com</p>
                    </div>
                  </div>
                </div>
              </div>

              <div id="downloads" className="mt-14 pt-8 border-t border-slate-800">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">Technical Downloads</h4>
                <div className="grid grid-cols-2 gap-4">
                  {['Datasheet', 'Brochure', 'User Manual', 'Standards'].map((doc, i) => (
                    <button key={i} className="flex items-center text-sm font-semibold text-primary hover:text-white transition-colors text-left">
                      <Download className="w-4 h-4 mr-2" /> {doc}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Form */}
            <CampaignEnquiryForm campaignTitle="Digital Bursting Strength Tester" campaignSlug="bursting-strength-tester" className="lg:w-3/5" />
          </div>
        </div>
      </section>
    </div>
  );
}
