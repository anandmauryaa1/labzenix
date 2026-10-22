'use client';

import { useState, useEffect } from 'react';
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
import { cleanSeoHtml } from '@/lib/seoContent';

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
    slug?: string;
    title: string;
    description: string;
    specificationText?: string;
    specs?: Record<string, unknown>;
    features?: string[];
    featuresText?: string;
    youtubeUrl?: string;
    reviews?: Review[];
    faqs?: FAQ[];
  };
}

type TabId = 'overview' | 'specs' | 'features' | 'video' | 'reviews' | 'faq' | 'quote';

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'specs', label: 'Specifications', icon: SlidersHorizontal },
  { id: 'features', label: 'Features', icon: Zap },
  { id: 'video', label: 'Video', icon: PlayCircle },
  { id: 'reviews', label: 'Reviews', icon: Star },
  { id: 'faq', label: 'FAQ', icon: HelpCircle },
  { id: 'quote', label: 'Request a quote', icon: Mail },
];

/* ─── Helpers ───────────────────────────────────────────── */

const getYouTubeEmbedUrl = (url: string) => {
  if (!url) return '';
  const trimmedUrl = url.trim();

  // Regex to match exact 11 characters of YouTube video ID
  const regExp = /(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/|live\/)([a-zA-Z0-9_-]{11})/;
  const match = trimmedUrl.match(regExp);

  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}`;
  }

  // Fallback if the user just inputs the 11-char ID
  if (trimmedUrl.length === 11 && !trimmedUrl.includes('/') && !trimmedUrl.includes('.')) {
    return `https://www.youtube.com/embed/${trimmedUrl}`;
  }

  return trimmedUrl;
};

/* ─── Component ─────────────────────────────────────────── */

export default function ProductTabs({ product }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const reviews = product.reviews ?? [];
  const faqs = product.faqs ?? [];
  const currentProductPath = product.slug ? `/products/${product.slug}` : undefined;

  // Sync tab with URL hash for Google sitelinks & deep-linked indexing (#specs, #faq, etc.)
  useEffect(() => {
    const handleHash = () => {
      const rawHash = window.location.hash.replace('#', '').toLowerCase();
      if (!rawHash) return;

      const aliasMap: Record<string, TabId> = {
        overview: 'overview',
        specs: 'specs',
        specifications: 'specs',
        specification: 'specs',
        features: 'features',
        feature: 'features',
        video: 'video',
        videos: 'video',
        reviews: 'reviews',
        review: 'reviews',
        faq: 'faq',
        faqs: 'faq',
        quote: 'quote',
        inquiry: 'quote',
      };

      const matched = aliasMap[rawHash];
      if (matched) {
        setActiveTab(matched);
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleTabClick = (e: React.MouseEvent<HTMLAnchorElement>, tabId: TabId) => {
    e.preventDefault();
    setActiveTab(tabId);
    if (typeof window !== 'undefined' && window.history?.pushState) {
      window.history.pushState(null, '', `#${tabId}`);
    } else if (typeof window !== 'undefined') {
      window.location.hash = `#${tabId}`;
    }
  };

  return (
    <div className="w-full">
      {/* Tab Nav - Google-indexable crawlable links with role="tablist" */}
      <div 
        style={{ top: 'var(--header-height, 80px)' }}
        className="overflow-x-auto sticky top-[80px] sm:top-[100px] md:top-[110px] lg:top-[116px] xl:top-[120px] z-20 bg-white border-b border-gray-200 shadow-sm"
      >
        <div className="w-full sm:w-[90%] mx-auto px-[5px] sm:px-4">
          <nav className="flex min-w-max" role="tablist" aria-label="Product Sections">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <a
                  key={tab.id}
                  id={`tab-btn-${tab.id}`}
                  href={`#${tab.id}`}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={tab.id}
                  onClick={(e) => handleTabClick(e, tab.id)}
                  className={[
                    'flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-3 sm:py-4 text-[11px] sm:text-xs font-black uppercase tracking-wider sm:tracking-widest whitespace-nowrap cursor-pointer',
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
                </a>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Panels — All rendered in DOM for SEO crawlability with CSS visibility toggling */}
      <div className="w-full sm:w-[90%] mx-auto px-[5px] sm:px-4 py-6 md:py-12">

        <Panel id="overview" active={activeTab === 'overview'}>
          <div
            style={{
              borderRadius: '5px',
              border: '1px solid #e5e7eb',
              borderTop: '4px solid transparent',
              backgroundImage: 'linear-gradient(white, white), linear-gradient(90deg, #004aad 0%, #8b5cf6 100%)',
              backgroundOrigin: 'border-box',
              backgroundClip: 'padding-box, border-box',
              boxShadow: '0 4px 24px rgba(0,74,173,0.08), 0 1px 4px rgba(0,0,0,0.04)',
            }}
            className="p-4 sm:p-6 md:p-8 bg-white"
          >
            <SectionHeader icon={<Box className="w-5 h-5" />} title="Product Overview & Applications" />
            {product.description && (
              <div
                className="mt-4 sm:mt-6 text-gray-700 leading-relaxed font-medium text-sm sm:text-base md:text-lg border-l-2 sm:border-l-4 border-primary/20 pl-3 sm:pl-6 blog-content max-w-none overflow-x-auto"
                dangerouslySetInnerHTML={{ __html: cleanSeoHtml(product.description, currentProductPath) }}
              />
            )}
          </div>
        </Panel>

        <Panel id="specs" active={activeTab === 'specs'}>
          <div
            style={{
              borderRadius: '5px',
              border: '1px solid #e5e7eb',
              borderTop: '4px solid transparent',
              backgroundImage: 'linear-gradient(white, white), linear-gradient(90deg, #004aad 0%, #8b5cf6 100%)',
              backgroundOrigin: 'border-box',
              backgroundClip: 'padding-box, border-box',
              boxShadow: '0 4px 24px rgba(0,74,173,0.08), 0 1px 4px rgba(0,0,0,0.04)',
            }}
            className="p-4 sm:p-6 md:p-8 bg-white"
          >
            <SectionHeader icon={<SettingsIcon className="w-5 h-5" />} title="Specifications" />
            {product.specificationText && product.specificationText.replace(/<[^>]*>?/gm, '').trim() !== '' ? (
              <div className="mt-6">
                <div
                  className="blog-content max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{ __html: cleanSeoHtml(product.specificationText, currentProductPath) }}
                />
              </div>
            ) : (
              <div className="mt-6">
                <EmptyState icon={<SettingsIcon className="w-10 h-10 text-gray-300" />} message="No specifications listed for this product yet." />
              </div>
            )}
          </div>
        </Panel>

        <Panel id="features" active={activeTab === 'features'}>
          <div
            style={{
              borderRadius: '5px',
              border: '1px solid #e5e7eb',
              borderTop: '4px solid transparent',
              backgroundImage: 'linear-gradient(white, white), linear-gradient(90deg, #004aad 0%, #8b5cf6 100%)',
              backgroundOrigin: 'border-box',
              backgroundClip: 'padding-box, border-box',
              boxShadow: '0 4px 24px rgba(0,74,173,0.08), 0 1px 4px rgba(0,0,0,0.04)',
            }}
            className="p-4 sm:p-6 md:p-8 bg-white"
          >
            <SectionHeader icon={<Zap className="w-5 h-5" />} title="Features" />
            {product.featuresText && product.featuresText.replace(/<[^>]*>?/gm, '').trim() !== '' ? (
              <div className="mt-6">
                <div
                  className="blog-content max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{ __html: cleanSeoHtml(product.featuresText, currentProductPath) }}
                />
              </div>
            ) : product.features && product.features.length > 0 ? (
              <ul className="mt-6 grid grid-cols-1 gap-4">
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
              <div className="mt-6">
                <EmptyState icon={<Zap className="w-10 h-10 text-gray-300" />} message="No features listed for this product yet." />
              </div>
            )}
          </div>
        </Panel>

        <Panel id="video" active={activeTab === 'video'}>
          <div
            style={{
              borderRadius: '5px',
              border: '1px solid #e5e7eb',
              borderTop: '4px solid transparent',
              backgroundImage: 'linear-gradient(white, white), linear-gradient(90deg, #004aad 0%, #8b5cf6 100%)',
              backgroundOrigin: 'border-box',
              backgroundClip: 'padding-box, border-box',
              boxShadow: '0 4px 24px rgba(0,74,173,0.08), 0 1px 4px rgba(0,0,0,0.04)',
            }}
            className="p-4 sm:p-6 md:p-8 bg-white"
          >
            <SectionHeader icon={<PlayCircle className="w-5 h-5" />} title="Product Video" />
            {product.youtubeUrl ? (
              <div className="mt-6 relative w-full bg-black rounded-lg overflow-hidden shadow-xl">
                <div className="relative pt-[56.25%]">
                  <iframe
                    className="absolute top-0 left-0 w-full h-full"
                    src={getYouTubeEmbedUrl(product.youtubeUrl)}
                    title="Product Video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            ) : (
              <div className="mt-6">
                <EmptyState icon={<PlayCircle className="w-10 h-10 text-gray-300" />} message="No product video available yet." />
              </div>
            )}
          </div>
        </Panel>

        <Panel id="reviews" active={activeTab === 'reviews'}>
          <div
            style={{
              borderRadius: '5px',
              border: '1px solid #e5e7eb',
              borderTop: '4px solid transparent',
              backgroundImage: 'linear-gradient(white, white), linear-gradient(90deg, #004aad 0%, #8b5cf6 100%)',
              backgroundOrigin: 'border-box',
              backgroundClip: 'padding-box, border-box',
              boxShadow: '0 4px 24px rgba(0,74,173,0.08), 0 1px 4px rgba(0,0,0,0.04)',
            }}
            className="p-4 sm:p-6 md:p-8 bg-white"
          >
            <SectionHeader icon={<Star className="w-5 h-5" />} title="Customer Reviews" />
            <div className="mt-6">
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
          </div>
        </Panel>

        <Panel id="faq" active={activeTab === 'faq'}>
          <div
            style={{
              borderRadius: '5px',
              border: '1px solid #e5e7eb',
              borderTop: '4px solid transparent',
              backgroundImage: 'linear-gradient(white, white), linear-gradient(90deg, #004aad 0%, #8b5cf6 100%)',
              backgroundOrigin: 'border-box',
              backgroundClip: 'padding-box, border-box',
              boxShadow: '0 4px 24px rgba(0,74,173,0.08), 0 1px 4px rgba(0,0,0,0.04)',
            }}
            className="p-4 sm:p-6 md:p-8 bg-white"
          >
            <SectionHeader icon={<HelpCircle className="w-5 h-5" />} title="Frequently Asked Questions" />
            <div className="mt-6">
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
          </div>
        </Panel>

        <Panel id="quote" active={activeTab === 'quote'}>
          <div
            style={{
              borderRadius: '5px',
              border: '1px solid #e5e7eb',
              borderTop: '4px solid transparent',
              backgroundImage: 'linear-gradient(white, white), linear-gradient(90deg, #8b5cf6 0%, #004aad 100%)',
              backgroundOrigin: 'border-box',
              backgroundClip: 'padding-box, border-box',
              boxShadow: '0 4px 24px rgba(139,92,246,0.10), 0 1px 4px rgba(0,0,0,0.04)',
            }}
            className="p-4 sm:p-6 md:p-8 bg-white max-w-2xl"
          >
            <div className="flex items-center space-x-2.5 sm:space-x-3 mb-6 sm:mb-8">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-secondary text-white flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-black text-secondary uppercase tracking-tight">Request a Quote</h2>
            </div>
            <p className="text-gray-500 font-medium text-sm sm:text-base mb-6 sm:mb-8">
              Fill in your details below and our team will get back to you with a personalised quote.
            </p>
            <InquiryForm productId={product._id} productName={product.title} />
          </div>
        </Panel>

      </div>
    </div>
  );
}

/* ─── Shared helpers ─────────────────────────────────────── */

function Panel({ id, active, children }: { id: string; active: boolean; children: React.ReactNode }) {
  return (
    <div
      id={id}
      data-panel-id={`panel-${id}`}
      role="tabpanel"
      aria-labelledby={`tab-btn-${id}`}
      aria-hidden={!active}
      className={active ? 'block scroll-mt-44 sm:scroll-mt-52 md:scroll-mt-44' : 'hidden'}
    >
      <motion.div
        key={id}
        initial={{ opacity: 0, y: 12 }}
        animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
      >
        {children}
      </motion.div>
    </div>
  );
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center space-x-2.5 sm:space-x-3">
      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary text-white flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <h2 className="text-lg sm:text-xl md:text-2xl font-black text-secondary uppercase tracking-tight">{title}</h2>
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
