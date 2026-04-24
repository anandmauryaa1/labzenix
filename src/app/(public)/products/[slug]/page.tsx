import { notFound } from 'next/navigation';
import { revalidateTag } from 'next/cache';
import dbConnect from '@/lib/dbConnect';
import Product, { IProduct } from '@/models/Product';
import Review, { IReview } from '@/models/Review';
import Faq, { IFaq } from '@/models/Faq';
import Category, { ICategory } from '@/models/Category';
import Settings, { ISettings } from '@/models/Settings';
import ImageCarousel from '@/components/products/ImageCarousel';
import ProductTabs from '@/components/products/ProductTabs';
import { Metadata } from 'next';
import { Download, ChevronRight, Hash, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import * as motion from 'framer-motion/client';
import CatalogButton from '@/components/products/CatalogButton';

// Always fetch fresh — reviews and FAQs must appear immediately after admin saves
export const dynamic = 'force-dynamic';
export const revalidate = 0;



export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  await dbConnect();
  const product = await Product.findOne({ slug }).lean() as IProduct | null;
  if (!product) return { title: 'Not Found' };
  
  const title = product.metaTitle || product.title;
  const description = product.metaDescription || product.description?.substring(0, 160);

  return { 
    title: `${title} | LabZenix`, 
    description: description,
    keywords: [product.category, product.title, product.modelNumber],
    openGraph: {
      title: `${title} | LabZenix`,
      description: description,
      images: [product.images?.[0] || '/og-image.jpg'],
    }
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await dbConnect();
  const product = await Product.findOne({ slug }).lean() as IProduct | null;
  if (!product) notFound();

  // Fetch category for catalog
  const category = await Category.findOne({ name: product.category }).lean() as ICategory | null;
  
  // Fetch social media settings
  const settings = await Settings.findOne({ configKey: 'global' }).lean() as ISettings | null;

  // Explicitly fetch reviews and FAQs from new collections
  const rawReviews = await Review.find({ product: product._id }).lean() as IReview[];
  const rawFaqs    = await Faq.find({ product: product._id }).lean() as IFaq[];

  /* ─── JSON-LD Structured Data ─────────────────────────── */
  const reviews: { author: string; rating: number; comment: string; date?: string; images?: string[] }[] = JSON.parse(JSON.stringify(rawReviews ?? []));
  const faqs:    { question: string; answer: string }[]                                 = JSON.parse(JSON.stringify(rawFaqs ?? []));

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://labzenix.com';
  const productUrl = `${siteUrl}/products/${product.slug}`;

  // Product schema
  const productSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    sku: product.modelNumber,
    brand: {
      '@type': 'Brand',
      name: 'LabZenix',
    },
    image: (product.images ?? []).map((img: string) =>
      img.startsWith('http') ? img : `${siteUrl}${img}`
    ),
    url: productUrl,
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'LabZenix',
      },
    },
  };

  // AggregateRating — only if there are reviews
  if (reviews.length > 0) {
    const totalRating = reviews.reduce((sum, r) => sum + (r.rating ?? 0), 0);
    const avgRating   = totalRating / reviews.length;
    productSchema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: parseFloat(avgRating.toFixed(1)),
      bestRating: 5,
      worstRating: 1,
      reviewCount: reviews.length,
    };
    productSchema.review = reviews.map((r) => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: r.author },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: r.rating,
        bestRating: 5,
        worstRating: 1,
      },
      reviewBody: r.comment,
      ...(r.date ? { datePublished: new Date(r.date).toISOString().split('T')[0] } : {}),
    }));
  }

  // FAQPage schema — only if FAQs exist
  const faqSchema = faqs.length > 0
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((f) => ({
          '@type': 'Question',
          name: f.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: f.answer,
          },
        })),
      }
    : null;

  return (
    <div className="bg-white">
      {/* ── JSON-LD Structured Data (in <head> via Next.js) ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 py-6 border-b border-gray-100">
        <div className="flex items-center space-x-2 text-sm">
          <Link href="/" className="text-gray-500 hover:text-secondary transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4 text-gray-300" />
          <Link href="/products" className="text-gray-500 hover:text-secondary transition-colors">Products</Link>
          <ChevronRight className="w-4 h-4 text-gray-300" />
          <span className="text-secondary font-medium">{product.title}</span>
        </div>
      </div>

      {/* Product Detail Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Left Column - Image Carousel */}
          <div>
            <ImageCarousel images={product.images || []} alt={product.title} />
          </div>

          {/* Right Column - Product Info */}
          <div className="space-y-8">
            {/* Category Badge */}
            <div>
              <span className="inline-block px-4 py-1.5 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-[0.2em] border border-primary/20 rounded-none mb-6 shadow-sm">
                Category: {product.category}
              </span>
            </div>

            {/* Title */}
            <div>
              <h1 className="text-4xl font-black text-secondary uppercase tracking-tighter leading-tight mb-2">
                {product.title}
              </h1>
              {product.modelNumber && (
                <p className="text-gray-500 font-medium">{product.modelNumber}</p>
              )}
            </div>

            {/* Key Information Grid */}
            <div className="grid grid-cols-2 gap-8 py-8 border-y border-gray-100">
              {product.modelNumber && (
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] flex items-center gap-2">
                    <Hash className="w-3 h-3 text-primary" />
                    Reference ID
                  </p>
                  <p className="text-xl font-black text-secondary tracking-tighter">{product.modelNumber}</p>
                </div>
              )}
              <div className="space-y-1">
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] flex items-center gap-2">
                    <ShieldCheck className="w-3 h-3 text-primary" />
                    Status
                  </p>
                  <p className="text-xl font-black text-secondary tracking-tighter uppercase transition-colors hover:text-primary">In Regular Stock</p>
              </div>
            </div>

            {/* Social Media Links */}
            {settings && settings.social && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-6 py-6 border-b border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Follow our updates:</p>
                <div className="flex items-center gap-6">
                  {[
                    { 
                      key: 'facebook', 
                      icon: (props: any) => (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
                          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                        </svg>
                      ), 
                      hover: 'hover:bg-[#1877F2]' 
                    },
                    { 
                      key: 'linkedin', 
                      icon: (props: any) => (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
                          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>
                        </svg>
                      ), 
                      hover: 'hover:bg-[#0A66C2]' 
                    },
                    { 
                      key: 'instagram', 
                      icon: (props: any) => (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
                          <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                        </svg>
                      ), 
                      hover: 'hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888]' 
                    },
                    { 
                      key: 'twitter', 
                      icon: (props: any) => (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
                          <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
                        </svg>
                      ), 
                      hover: 'hover:bg-[#1DA1F2]' 
                    }
                  ].map((social) => {
                    if (!settings) return null;
                    const url = (settings.social as any)[social.key];
                    if (!url) return null;
                    const Icon = social.icon;
                    return (
                      <motion.a
                        key={social.key}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.1, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className={`flex items-center justify-center w-10 h-10 border border-gray-100 text-gray-400 transition-all duration-300 hover:text-white hover:border-transparent ${social.hover} shadow-sm bg-white hover:shadow-xl`}
                        title={social.key.charAt(0).toUpperCase() + social.key.slice(1)}
                      >
                        <Icon className="w-5 h-5" />
                      </motion.a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/contact" className="flex items-center justify-center px-8 py-4 bg-primary text-white font-black uppercase tracking-widest text-sm hover:bg-secondary transition-all shadow-lg active:scale-95 flex-1">
                Contact Now
              </Link>
              {category && category.catalogUrl && (
                <CatalogButton 
                  productName={product.title}
                  productId={product._id.toString()}
                  catalogUrl={category.catalogUrl}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Product Tabs Section */}
      <div className="border-t border-gray-200">
        <ProductTabs
          product={{
            _id: product._id.toString(),
            title: product.title,
            description: product.description,
            specificationText: product.specificationText,
            specs: product.specs,
            features: product.features,
            youtubeUrl: product.youtubeUrl,
            reviews: reviews,
            faqs: faqs,
          }}
        />
      </div>

      {/* Related Products */}
      {product.category && (
        <div className="max-w-7xl mx-auto px-4 py-16 border-t border-gray-200">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-secondary uppercase tracking-tighter">Related Products</h2>
            <Link href={`/products?category=${product.category.toLowerCase().replace(/\s+/g, '-')}`} className="flex items-center text-primary hover:text-secondary transition-colors font-bold uppercase text-sm">
              View All <ChevronRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
          <p className="text-gray-500">Browse more products in the {product.category} category.</p>
        </div>
      )}
    </div>
  );
}