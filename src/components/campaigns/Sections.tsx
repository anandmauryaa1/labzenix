import React from 'react';
import Image from 'next/image';
import FadeIn from '@/components/ui/FadeIn';
import { formatTitle, SectionHeader } from './Typography';
import { Star } from 'lucide-react';

export const FeaturesSection = ({ data, index }: { data: any, index: number }) => {
  const isLeft = data?.imagePosition === 'left';
  return (
    <section className={`py-24 ${index % 2 === 0 ? 'bg-light' : 'bg-slate-50 border-y border-border'}`}>
      <div className="container mx-auto px-4 max-w-7xl font-display">
        <div className={`flex flex-col ${isLeft ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-16 items-center`}>
          <div className="lg:w-1/2">
            <FadeIn direction={isLeft ? 'right' : 'left'}>
              <div className="bg-light p-2 border border-border rounded-none shadow-sm">
                 <Image src={data?.image || `/api/placeholder/600/400`} alt={data?.title || "Feature"} width={600} height={400} className="w-full h-auto object-cover rounded-none" />
              </div>
            </FadeIn>
          </div>
          <div className="lg:w-1/2">
            <FadeIn direction={isLeft ? 'left' : 'right'}>
              <div className="mb-8">
                 <div className="text-primary font-semibold tracking-[0.2em] uppercase text-sm mb-4">KEY ADVANTAGES</div>
                 <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-6">
                   {formatTitle(data?.title || "Features")}
                 </h2>
              </div>

              {data?.description && (
                <div className="text-slate-600 mb-10 text-lg leading-relaxed" dangerouslySetInnerHTML={{ __html: data.description }}></div>
              )}
              
              {data?.features && data.features.length > 0 && (
                <div className="space-y-8">
                  {data.features.map((feat: any, idx: number) => (
                    <div key={idx} className="flex gap-6 items-start">
                      <div className="flex-shrink-0 w-12 h-12 bg-primary text-light flex items-center justify-center font-bold text-lg shadow-lg shadow-primary/20 rounded-none border border-primary mt-1">
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-dark mb-2 uppercase">{feat.title}</h4>
                        <p className="text-slate-600 leading-relaxed">{feat.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
};

export const SpecificationsSection = ({ data }: { data: any }) => {
  return (
    <section className="py-24 bg-light font-display">
      <div className="container mx-auto px-4">
        <FadeIn>
          <SectionHeader 
            title={data?.title || "Technical Specifications"} 
            subtitle={data?.subtitle} 
            topText="DATA & DETAILS"
          />
        </FadeIn>
        
        <div className="max-w-4xl mx-auto bg-light shadow-lg border border-border overflow-hidden rounded-none">
          <FadeIn direction="up">
            {data?.content ? (
              <div className="p-8 text-slate-700 prose max-w-none" dangerouslySetInnerHTML={{ __html: data.content }}></div>
            ) : (
              <table className="w-full text-left border-collapse">
                <tbody>
                  {data?.specs?.map((row: any, idx: number) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-slate-50' : 'bg-light'}>
                      <td className="py-5 px-8 font-bold text-dark w-1/3 border-b border-slate-100">{row.key}</td>
                      <td className="py-5 px-8 text-slate-600 border-b border-slate-100">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </FadeIn>
        </div>
      </div>
    </section>
  );
};

export const ComparisonSection = ({ data }: { data: any }) => {
  return (
    <section className="py-24 bg-slate-50 font-display">
      <div className="container mx-auto px-4 max-w-6xl">
        <FadeIn>
          <SectionHeader 
            title={data?.title || "Comparison"} 
            topText="WHY CHOOSE US"
          />
          <div className="bg-light border border-border shadow-xl overflow-x-auto rounded-none">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="p-6 bg-slate-50 border-b border-r border-border w-1/4"></th>
                  <th className="p-6 bg-primary text-light border-b border-r border-border text-center font-bold text-xl uppercase tracking-wider w-3/8">
                    {data?.productName || "Our Product"}
                  </th>
                  <th className="p-6 bg-slate-200 text-slate-600 border-b border-border text-center font-bold text-xl uppercase tracking-wider w-3/8">
                    {data?.competitorName || "Conventional"}
                  </th>
                </tr>
              </thead>
              <tbody>
                {data?.rows?.map((row: any, idx: number) => (
                  <tr key={idx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="p-5 border-r border-slate-100 font-bold text-dark text-sm uppercase tracking-wide">{row.feature}</td>
                    <td className="p-5 border-r border-slate-100 text-center">
                      <div className="text-base font-bold text-primary mb-2">{row.ourValue}</div>
                      {row.ourBadge && <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-black uppercase tracking-wider rounded-none">{row.ourBadge}</span>}
                    </td>
                    <td className="p-5 text-center">
                      <div className="text-base font-semibold text-slate-500 mb-2">{row.competitorValue}</div>
                      {row.competitorBadge && <span className="inline-block px-3 py-1 bg-red-100 text-red-700 text-xs font-black uppercase tracking-wider rounded-none">{row.competitorBadge}</span>}
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

export const FeedbackSection = ({ data }: { data: any }) => {
  return (
    <section className="py-24 bg-light font-display">
      <div className="container mx-auto px-4 max-w-7xl">
        <FadeIn>
          <SectionHeader 
            title={data?.title || "Customer Feedback"} 
            topText="TESTIMONIALS"
          />
          <div className="grid md:grid-cols-2 gap-8">
            {data?.feedbacks?.map((fb: any, idx: number) => (
              <div key={idx} className="bg-slate-50 border border-border p-10 rounded-none">
                <div className="flex text-primary mb-6">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
                </div>
                <p className="text-slate-700 italic mb-8 text-lg leading-relaxed">"{fb.quote}"</p>
                <p className="text-sm text-slate-500 uppercase tracking-wide">
                  <strong className="text-dark font-bold">{fb.author}</strong> / {fb.company}
                </p>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

export const ApplicationsSection = ({ data }: { data: any }) => {
  return (
    <section className="py-24 bg-slate-50 font-display">
      <div className="container mx-auto px-4 max-w-7xl">
        <FadeIn>
          <SectionHeader 
            title={data?.title || "Application Examples"} 
            topText="USE CASES"
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {data?.examples?.map((ex: any, idx: number) => (
              <div key={idx} className="group">
                <div className="bg-light border border-border p-2 mb-4 rounded-none shadow-sm group-hover:border-primary transition-colors">
                  <Image src={ex.image || `/api/placeholder/400/300`} alt={ex.title} width={400} height={300} className="w-full aspect-[4/3] object-cover rounded-none" />
                </div>
                <p className="text-center font-bold text-dark uppercase tracking-wide">{ex.title}</p>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

export const FAQSection = ({ data }: { data: any }) => {
  return (
    <section className="py-24 bg-slate-50 border-t border-border font-display">
      <div className="container mx-auto px-4 max-w-4xl">
        <FadeIn>
          <SectionHeader 
            title={data?.title || "Frequently Asked Questions"} 
            topText="KNOWLEDGE BASE"
          />
        </FadeIn>
        <div className="space-y-4">
          {data?.faqs?.map((faq: any, idx: number) => (
            <FadeIn key={idx} delay={0.1 * idx} direction="up" className="bg-light p-8 border border-border shadow-sm rounded-none">
              <h4 className="text-xl font-bold text-dark mb-4">{faq.question}</h4>
              <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};

export const TabbedContentSection = ({ data }: { data: any }) => {
  const [activeTab, setActiveTab] = React.useState(0);
  return (
    <section className="py-24 bg-light font-display">
      <div className="container mx-auto px-4 max-w-5xl">
        <FadeIn>
          <SectionHeader title={data?.title || "Tabbed Content"} topText="DETAILS" />
          <div className="border border-border bg-white p-6 shadow-sm">
            <div className="flex border-b border-border space-x-4 mb-6">
              {data?.tabs?.map((tab: any, idx: number) => (
                <button 
                  key={idx} 
                  onClick={() => setActiveTab(idx)}
                  className={`pb-2 px-4 uppercase font-bold text-sm tracking-wider ${activeTab === idx ? 'border-b-2 border-primary text-primary' : 'text-slate-500 hover:text-dark'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="text-slate-600 prose">
              {data?.tabs?.[activeTab]?.content}
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

export const DownloadsSection = ({ data }: { data: any }) => {
  return (
    <section className="py-24 bg-slate-50 font-display">
      <div className="container mx-auto px-4 max-w-5xl text-center">
        <FadeIn>
          <SectionHeader title={data?.title || "Downloads"} topText="RESOURCES" />
          <div className="grid md:grid-cols-3 gap-6">
            {data?.files?.map((file: any, idx: number) => (
              <a key={idx} href={file.url} className="bg-white p-6 border border-border hover:border-primary hover:shadow-md transition-all">
                <p className="font-bold uppercase tracking-wider mb-2">{file.name}</p>
                <span className="text-primary text-sm">Download ↓</span>
              </a>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

export const ContactSection = ({ data }: { data: any }) => null; // Use the global footer CTA instead for now

export const RelatedProductsSection = ({ data }: { data: any }) => {
  const products = data?.products || [];
  if (!products || products.length === 0) return null;

  return (
    <section className="py-24 bg-slate-50 font-display border-t border-border">
      <div className="container mx-auto px-4 max-w-7xl">
        <FadeIn>
          <SectionHeader 
            title={data?.title || "Related Equipment"} 
            topText="RECOMMENDED SOLUTIONS"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((prod: any, idx: number) => (
              <a 
                key={idx} 
                href={prod.link || '#'} 
                className="group bg-white border border-border hover:border-primary transition-all p-4 shadow-sm hover:shadow-md flex flex-col rounded-none"
              >
                <div className="aspect-[4/3] bg-slate-50 mb-4 overflow-hidden relative border border-slate-100 flex items-center justify-center">
                  <Image 
                    src={prod.image || `/api/placeholder/400/300`} 
                    alt={prod.title || "Product"} 
                    width={400} 
                    height={300} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h4 className="font-bold text-dark text-lg uppercase group-hover:text-primary transition-colors mb-1">
                  {prod.title}
                </h4>
                {prod.description && (
                  <p className="text-slate-500 text-sm line-clamp-2 mb-3">{prod.description}</p>
                )}
                <span className="text-primary text-xs font-bold uppercase tracking-wider mt-auto flex items-center pt-2">
                  Learn More &rarr;
                </span>
              </a>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

