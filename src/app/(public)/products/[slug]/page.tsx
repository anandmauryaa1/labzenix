import { notFound } from 'next/navigation';
import { revalidateTag } from 'next/cache';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import InquiryForm from '@/components/products/InquiryForm';
import ImageCarousel from '@/components/products/ImageCarousel';
import { Metadata } from 'next';
import { Download, ChevronRight } from 'lucide-react';
import Link from 'next/link';

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
              <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-xs font-black uppercase tracking-widest rounded-none border border-blue-200 mb-4">
                {product.category}
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
            <div className="grid grid-cols-2 gap-8 py-8 border-y border-gray-200">
              {product.modelNumber && (
                <div>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">Item NO.</p>
                  <p className="text-lg font-black text-secondary">{product.modelNumber}</p>
                </div>
              )}
              {product.leadTime && (
                <div>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">Lead Time</p>
                  <p className="text-lg font-bold text-secondary">{product.leadTime}</p>
                </div>
              )}
              {product.brand && (
                <div>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">Brand</p>
                  <p className="text-lg font-bold text-secondary">{product.brand}</p>
                </div>
              )}
              {product.certificate && (
                <div>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">Certificate</p>
                  <p className="text-lg font-bold text-secondary">{product.certificate}</p>
                </div>
              )}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="flex items-center justify-center px-8 py-4 bg-primary text-white font-black uppercase tracking-widest text-sm hover:bg-secondary transition-all shadow-lg active:scale-95 flex-1">
                Contact Now
              </button>
              {product.category && (
                <a 
                  href={`/api/catalog?category=${encodeURIComponent(product.category)}`}
                  download={`catalog-${product.category.toLowerCase().replace(/\s+/g, '-')}.csv`}
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
              <h2 className="text-2xl font-black text-secondary uppercase tracking-tighter mb-4">Applications</h2>
              <p className="text-gray-700 leading-relaxed">
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
              <thead className="bg-blue-100 border-b border-gray-300">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-black text-secondary uppercase tracking-wider">Specification</th>
                  <th className="px-4 py-3 text-left text-xs font-black text-secondary uppercase tracking-wider">Details</th>
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
            <ul className="space-y-3">
              {product.features.map((feature: string, i: number) => (
                <li key={i} className="flex items-start space-x-4">
                  <span className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 text-white font-black text-xs">{i + 1}</span>
                  <span className="text-gray-700 font-medium leading-relaxed pt-1">{feature}</span>
                </li>
              ))}
            </ul>
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