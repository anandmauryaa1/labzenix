import { notFound } from 'next/navigation';
import { revalidateTag } from 'next/cache';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import Category from '@/models/Category';
import Settings from '@/models/Settings';
import InquiryForm from '@/components/products/InquiryForm';
import ImageCarousel from '@/components/products/ImageCarousel';
import { Metadata } from 'next';
import { Download, ChevronRight, CheckCircle2, Hash, ShieldCheck, Box, Zap, Settings as SettingsIcon, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';
import * as motion from 'framer-motion/client';

// Revalidate this page every 3600 seconds (1 hour)
export const revalidate = 3600;

// Use cache tag for on-demand revalidation
export async function generateStaticParams() {
  await dbConnect();
  const products = await Product.find({}, 'slug').lean();
  return products.map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  await dbConnect();
  const product = await Product.findOne({ slug });
  if (!product) return { title: 'Not Found' };
  return { 
    title: `${product.metaTitle} | LabZenix`, 
    description: product.metaDescription || product.description.substring(0, 160),
    keywords: [product.category, product.title, product.modelNumber],
    openGraph: {
      title: product.metaTitle,
      description: product.metaDescription,
      images: [product.images[0] || '/og-image.jpg'],
    }
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await dbConnect();
  const product = await Product.findOne({ slug }).lean() as any;
  if (!product) notFound();

  // Fetch category for catalog
  const category = await Category.findOne({ name: product.category }).lean() as any;
  
  // Fetch social media settings
  const settings = await Settings.findOne({ configKey: 'global' }).lean() as any;

  return (
    <div className="bg-white">
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
                    const url = settings.social[social.key];
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
                <a 
                  href={category.catalogUrl}
                  download={`catalog-${product.category.toLowerCase().replace(/\s+/g, '-')}.pdf`}
                  className="flex items-center justify-center px-8 py-4 border-2 border-secondary text-secondary font-black uppercase tracking-widest text-sm hover:bg-secondary hover:text-white transition-all active:scale-95"
                >
                  <Download className="w-4 h-4 mr-2" />
                  <span>Download Catalog</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Description Section */}
      <div className="bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="space-y-8">
            {/* Applications */}
            <div>
              <div className="flex items-center space-x-3 mb-6">
                 <div className="w-10 h-10 bg-primary text-white flex items-center justify-center font-black">
                    <Box className="w-5 h-5" />
                 </div>
                 <h2 className="text-2xl font-black text-secondary uppercase tracking-tighter">Product Overview & Applications</h2>
              </div>
              <p className="text-gray-700 leading-relaxed font-medium text-lg border-l-4 border-primary/20 pl-6 italic">
                {product.description}
              </p>
            </div>

            {/* Standards */}
            {product.specificationText && (
              <div>
                <h3 className="text-lg font-black text-secondary uppercase tracking-tight mb-4">Standards</h3>
                <p className="text-gray-700 leading-relaxed">{product.specificationText}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Specifications Table */}
      {product.specs && Object.keys(product.specs).length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-black text-secondary uppercase tracking-tighter mb-8">Key Specifications</h2>
          
          <div className="overflow-x-auto border border-gray-200">
            <table className="w-full">
              <thead className="bg-[#004aad]/5 border-b-2 border-[#004aad]/20">
                <tr>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-secondary uppercase tracking-[0.2em] flex items-center gap-2">
                    <SettingsIcon className="w-3.5 h-3.5 text-primary" />
                    Technical Parameter
                  </th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-secondary uppercase tracking-[0.2em]">Metric Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {Object.entries(product.specs).map(([key, value]) => (
                  <tr key={key} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-bold text-gray-700">{key}</td>
                    <td className="px-4 py-3 text-gray-600">{String(value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Features Section - List */}
      {(product.features && product.features.length > 0) && (
        <div className="bg-white border-y border-gray-200 py-16">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl font-black text-secondary uppercase tracking-tighter mb-8">Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {product.features.map((feature: string, i: number) => (
                <li key={i} className="flex items-center space-x-4 p-6 bg-gray-50 border border-gray-100 hover:border-primary/30 transition-all duration-300 hover:shadow-lg group">
                  <div className="w-10 h-10 rounded-none bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <span className="text-secondary font-bold text-sm tracking-tight">{feature}</span>
                </li>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* YouTube Video Section */}
      {product.youtubeUrl && (
        <div className="bg-gray-50 border-y border-gray-200 py-16">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl font-black text-secondary uppercase tracking-tighter mb-8">Product Video</h2>
            <div className="relative w-full bg-black rounded-lg overflow-hidden">
              <div className="relative pt-[56.25%]">
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src={product.youtubeUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                  title="Product Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inquiry Form Section */}
      <div className="bg-gray-50 border-t border-gray-200 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-black text-secondary uppercase tracking-tighter mb-8">Get in Touch</h2>
          <InquiryForm productId={product._id.toString()} productName={product.title} />
        </div>
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