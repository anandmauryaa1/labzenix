'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutGrid,
  SlidersHorizontal,
  Zap,
  PlayCircle,
  Star,
  HelpCircle,
  Mail,
  CheckCircle2,
  Settings as SettingsIcon,
  Box,
  MessageSquare,
} from 'lucide-react';
import InquiryForm from './InquiryForm';
import Image from 'next/image';

/* ─── Types ─────────────────────────────────────────────── */

interface Review {
  author: string;
  rating: number;
  comment: string;
  images?: string[];
}

interface FAQ {
  question: string;
  answer: string;
}

interface ProductTabsProps {
  product: {
    _id: string;
    title: string;
    description: string;
    specificationText?: string;
    specs?: Record<string, unknown>;
    features?: string[];
    youtubeUrl?: string;
    reviews?: Review[];
    faqs?: FAQ[];
  };
}

type TabId = 'overview' | 'specs' | 'features' | 'video' | 'reviews' | 'faq' | 'quote';

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'overview',  label: 'Overview',        icon: LayoutGrid },
  { id: 'specs',     label: 'Specifications',  icon: SlidersHorizontal },
  { id: 'features',  label: 'Features',        icon: Zap },
  { id: 'video',     label: 'Video',           icon: PlayCircle },
  { id: 'reviews',   label: 'Reviews',         icon: Star },
  { id: 'faq',       label: 'FAQ',             icon: HelpCircle },
  { id: 'quote',     label: 'Request a quote', icon: Mail },
];

/* ─── Component ─────────────────────────────────────────── */

export default function ProductTabs({ product }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const reviews = product.reviews ?? [];
  const faqs    = product.faqs    ?? [];

  return (
    <div className="w-full">
      {/* Tab Nav */}
      <div className="overflow-x-auto sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex min-w-max">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`tab-btn-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={[
                    'flex items-center gap-2 px-5 py-4 text-xs font-black uppercase tracking-widest whitespace-nowrap',
                    'transition-all duration-200 border-b-2 focus:outline-none',
                    isActive
                      ? tab.id === 'quote'
                        ? 'bg-secondary text-white border-secondary'
                        : 'bg-primary text-white border-primary'
                      : 'bg-white text-gray-500 border-transparent hover:bg-primary/5 hover:text-primary',
                  ].join(' ')}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Panels */}
      <div className="max-w-7xl mx-auto px-4 py-12">

        {activeTab === 'overview' && (
          <Panel id="overview">
            <SectionHeader icon={<Box className="w-5 h-5" />} title="Product Overview & Applications" />
            <p className="mt-6 text-gray-700 leading-relaxed font-medium text-lg border-l-4 border-primary/20 pl-6 italic">
              {product.description}
            </p>
            {product.specificationText && (
              <div className="mt-8">
                <h3 className="text-lg font-black text-secondary uppercase tracking-tight mb-4">Standards</h3>
                <p className="text-gray-700 leading-relaxed">{product.specificationText}</p>
              </div>
            )}
          </Panel>
        )}

        {activeTab === 'specs' && (
          <Panel id="specs">
            <SectionHeader icon={<SettingsIcon className="w-5 h-5" />} title="Key Specifications" />
            <div className="mt-8">
              {product.specs && Object.keys(product.specs).length > 0 ? (
                <div className="overflow-x-auto border border-gray-200">
                  <table className="w-full">
                    <thead className="bg-primary/5 border-b-2 border-primary/20">
                      <tr>
                        <th className="px-6 py-5 text-left text-[10px] font-black text-secondary uppercase tracking-[0.2em]">Technical Parameter</th>
                        <th className="px-6 py-5 text-left text-[10px] font-black text-secondary uppercase tracking-[0.2em]">Metric Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {Object.entries(product.specs).map(([key, value]) => (
                        <tr key={key} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-bold text-gray-700">{key}</td>
                          <td className="px-6 py-4 text-gray-600">{String(value)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState icon={<SettingsIcon className="w-10 h-10 text-gray-300" />} message="No specifications listed for this product yet." />
              )}
            </div>
          </Panel>
        )}

        {activeTab === 'features' && (
          <Panel id="features">
            <SectionHeader icon={<Zap className="w-5 h-5" />} title="Features" />
            <div className="mt-8">
              {product.features && product.features.length > 0 ? (
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {product.features.map((feature, i) => (
                    <li key={i} className="flex items-center space-x-4 p-5 bg-gray-50 border border-gray-100 hover:border-primary/30 transition-all duration-300 hover:shadow-md group">
                      <div className="w-10 h-10 bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <span className="text-secondary font-bold text-sm tracking-tight">{feature}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState icon={<Zap className="w-10 h-10 text-gray-300" />} message="No features listed for this product yet." />
              )}
            </div>
          </Panel>
        )}

        {activeTab === 'video' && (
          <Panel id="video">
            <SectionHeader icon={<PlayCircle className="w-5 h-5" />} title="Product Video" />
            <div className="mt-8">
              {product.youtubeUrl ? (
                <div className="relative w-full bg-black rounded-lg overflow-hidden shadow-xl">
                  <div className="relative pt-[56.25%]">
                    <iframe
                      className="absolute top-0 left-0 w-full h-full"
                      src={product.youtubeUrl
                        .replace('watch?v=', 'embed/')
                        .replace('youtu.be/', 'youtube.com/embed/')}
                      title="Product Video"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              ) : (
                <EmptyState icon={<PlayCircle className="w-10 h-10 text-gray-300" />} message="No product video available yet." />
              )}
            </div>
          </Panel>
        )}

        {activeTab === 'reviews' && (
          <Panel id="reviews">
            <SectionHeader icon={<Star className="w-5 h-5" />} title="Customer Reviews" />
            <div className="mt-8">
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {/* Average Rating Summary */}
                  <div className="flex items-center gap-4 p-6 bg-gray-50 border border-gray-100 mb-6">
                    <div className="text-5xl font-black text-secondary">
                      {(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)}
                    </div>
                    <div>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((r) => {
                          const avg = reviews.reduce((acc, rv) => acc + rv.rating, 0) / reviews.length;
                          return (
                            <Star key={r} className={`w-5 h-5 ${r <= Math.round(avg) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                          );
                        })}
                      </div>
                      <p className="text-sm text-gray-500 font-medium mt-1">
                        {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  {/* Individual reviews */}
                  {reviews.map((review, idx) => (
                    <div key={idx} className="p-6 border border-gray-100 bg-white hover:border-primary/20 transition-all">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 bg-primary/10 text-primary font-black flex items-center justify-center text-sm">
                          {review.author.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-black text-secondary">{review.author}</p>
                          <div className="flex mt-0.5">
                            {[1, 2, 3, 4, 5].map((r) => (
                              <Star key={r} className={`w-3 h-3 ${r <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 font-medium text-sm leading-relaxed">{review.comment}</p>
                      
                      {review.images && review.images.length > 0 && (
                        <div className="flex gap-3 mt-4">
                          {review.images.map((img, i) => (
                            <div key={i} className="relative w-20 h-20 border border-gray-200 p-0.5 bg-gray-50 overflow-hidden cursor-pointer hover:border-primary transition-colors">
                               <Image 
                                 src={img} 
                                 fill
                                 className="object-cover" 
                                 alt={`Customer review photo ${i + 1}`} 
                               />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState icon={<Star className="w-10 h-10 text-gray-300" />} message="No customer reviews yet. Check back soon." />
              )}
            </div>
          </Panel>
        )}

        {activeTab === 'faq' && (
          <Panel id="faq">
            <SectionHeader icon={<HelpCircle className="w-5 h-5" />} title="Frequently Asked Questions" />
            <div className="mt-8">
              {faqs.length > 0 ? (
                <div className="space-y-3">
                  {faqs.map((faq, idx) => (
                    <div key={idx} className="border border-gray-100 bg-white hover:border-primary/20 transition-all">
                      <div className="p-6">
                        <p className="text-base font-black text-secondary mb-3 flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-primary text-white text-[10px] font-black flex items-center justify-center mt-0.5">Q</span>
                          {faq.question}
                        </p>
                        <p className="text-gray-700 font-medium text-sm leading-relaxed pl-9">{faq.answer}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState icon={<HelpCircle className="w-10 h-10 text-gray-300" />} message="No FAQs available for this product yet." />
              )}
            </div>
          </Panel>
        )}

        {activeTab === 'quote' && (
          <Panel id="quote">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 bg-secondary text-white flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-black text-secondary uppercase tracking-tighter">Request a Quote</h2>
            </div>
            <div className="max-w-2xl">
              <p className="text-gray-500 font-medium mb-8">
                Fill in your details below and our team will get back to you with a personalised quote.
              </p>
              <InquiryForm productId={product._id} productName={product.title} />
            </div>
          </Panel>
        )}

      </div>
    </div>
  );
}

/* ─── Shared helpers ─────────────────────────────────────── */

function Panel({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <motion.div
      key={id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center space-x-3">
      <div className="w-10 h-10 bg-primary text-white flex items-center justify-center">
        {icon}
      </div>
      <h2 className="text-2xl font-black text-secondary uppercase tracking-tighter">{title}</h2>
    </div>
  );
}

function EmptyState({ icon, message }: { icon: React.ReactNode; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-gray-200 bg-gray-50/50">
      {icon}
      <p className="mt-4 text-gray-400 font-medium text-sm">{message}</p>
    </div>
  );
}
