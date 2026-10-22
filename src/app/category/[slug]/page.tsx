import React from 'react';
import { notFound } from 'next/navigation';
import dbConnect from '@/lib/dbConnect';
import Category, { ICategory } from '@/models/Category';
import Product, { IProduct } from '@/models/Product';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import PageBanner from '@/components/ui/PageBanner';
import { ChevronRight, Package } from 'lucide-react';
import CatalogButton from '@/components/products/CatalogButton';
import ProductRange from '@/components/home/ProductRange';
import { getOptimizedImageUrl } from '@/lib/image';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  await dbConnect();

  const category = (await Category.findOne({
    $or: [{ slug }, { slug: slug.toLowerCase() }]
  }).lean()) as unknown as ICategory | null;

  if (!category) return { title: 'Category Not Found | LabZenix' };

  const title = category.metaTitle || `${category.name} | LabZenix`;
  const description =
    category.metaDescription ||
    category.description ||
    `Explore LabZenix's range of high-precision ${category.name} for quality testing and industrial compliance.`;

  return {
    title: `${title} | LabZenix`,
    description,
    keywords: category.focusKeyword ? [category.focusKeyword, category.name, 'testing instruments', 'LabZenix'] : [category.name, 'testing instruments', 'LabZenix'],
    alternates: {
      canonical: `/category/${category.slug}`,
    },
    openGraph: {
      title: category.ogTitle ? `${category.ogTitle} | LabZenix` : `${title} | LabZenix`,
      description: category.ogDescription || description,
      url: `/category/${category.slug}`,
      images: [category.image || '/og-image.png'],
    },
  };
}

export default async function CategoryDetailPage({ params }: PageProps) {
  const { slug } = await params;
  await dbConnect();

  // Find category by slug (or case-insensitive)
  const category = (await Category.findOne({
    $or: [{ slug }, { slug: slug.toLowerCase() }]
  }).lean()) as unknown as ICategory | null;

  if (!category) notFound();

  // Fetch products in this category (older products first, recently added last)
  const products = (await Product.find({
    category: category.name
  })
    .select('title slug modelNumber images description features')
    .sort({ createdAt: 1, _id: 1 })
    .lean()) as unknown as IProduct[];


  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://labzenix.com';
  const categoryUrl = `${siteUrl}/category/${category.slug}`;

  // JSON-LD ItemList / CollectionPage Schema
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: category.name,
    description: category.description,
    url: categoryUrl,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: products.map((prod, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${siteUrl}/products/${prod.slug}`,
        name: prod.title,
      })),
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Products',
        item: `${siteUrl}/products`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: category.name,
        item: categoryUrl,
      },
    ],
  };

  return (
    <div className="bg-white min-h-screen">
      {/* ─── Structured Data (JSON-LD) ─────────────────────────── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Page Banner */}
      <PageBanner
        title={category.name}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Products', href: '/products' },
          { label: category.name },
        ]}
        showBackButton={true}
        backUrl="/products"
      />

      {/* Product Grid & Navigation */}
      <section className="py-6 sm:py-10 md:py-16">
        <div className="w-full sm:w-[90%] mx-auto px-[5px] sm:px-4">
          <div className="w-full">
            {/* Sidebar Navigation - 'Testing Categories' & 'Standards Compliant' hidden per user request */}
            <aside className="hidden" aria-hidden="true" />

            {/* Main Products Grid */}
            <div>
              <div className="flex items-center justify-end mb-4 sm:mb-6 pb-2.5 sm:pb-3 border-b border-gray-100">
                <Link
                  href="/contact"
                  className="text-[11px] sm:text-xs font-black uppercase tracking-widest text-primary hover:text-secondary transition-colors"
                >
                  Need Custom Specifications?
                </Link>
              </div>

              {products.length === 0 ? (
                <div className="border border-dashed border-gray-200 p-8 sm:p-14 text-center bg-gray-50/50">
                  <Package className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-secondary font-bold text-base sm:text-lg mb-1.5">No Products In This Category Yet</p>
                  <p className="text-gray-400 text-xs sm:text-sm max-w-md mx-auto mb-5">
                    We are currently expanding our range in this category. Contact us for custom machinery requirements.
                  </p>
                  <Link
                    href="/contact"
                    className="inline-block px-5 py-2.5 bg-primary text-white font-black uppercase tracking-widest text-xs hover:bg-secondary transition-colors"
                  >
                    Inquire Now
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                  {products.map((product) => {
                    const stripTags = (str?: string) => (str || '').replace(/<[^>]*>/g, '').trim();
                    const cleanDesc = stripTags(product.description).substring(0, 90);
                    const imageSrc = product.images?.[0] || '/logo.webp';

                    return (
                      <Link
                        key={product._id.toString()}
                        href={`/products/${product.slug}`}
                        style={{ perspective: '1000px' }}
                        className="group block cursor-pointer"
                      >
                        <div
                          style={{
                            borderRadius: '4px',
                            transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.35s ease',
                            transformStyle: 'preserve-3d',
                            boxShadow: '0 20px 25px -5px rgba(0, 74, 173, 0.12), 0 8px 10px -6px rgba(0, 74, 173, 0.08)',
                          }}
                          className="flex flex-col bg-white border border-gray-200 relative overflow-hidden shadow-xl hover:shadow-2xl group-hover:[transform:translateY(-6px)_rotateX(2deg)] group-hover:[box-shadow:0_25px_50px_rgba(0,74,173,0.22),0_12px_24px_rgba(0,74,173,0.12),0_0_0_1px_rgba(0,74,173,0.16)] h-full"
                        >
                          {/* Top gradient accent line */}
                          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary via-secondary to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
                          {/* Image */}
                          <div className="relative aspect-[4/3] w-full bg-gray-50 overflow-hidden border-b border-gray-100">
                            <Image
                              src={getOptimizedImageUrl(imageSrc, { width: 400, height: 300, crop: 'fit' })}
                              alt={product.title}
                              fill
                              loading="lazy"
                              sizes="(max-width: 768px) 50vw, 25vw"
                              className="object-contain group-hover:scale-108 transition-transform duration-500 ease-out"
                            />
                            {product.modelNumber && (
                              <span className="absolute top-1.5 right-1.5 text-[9px] font-black uppercase tracking-wider bg-secondary text-white px-1.5 py-0.5 shadow-sm">
                                {product.modelNumber}
                              </span>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 p-3 sm:p-4 flex flex-col justify-between gap-2">
                            <div>
                              <h3 className="font-bold text-secondary uppercase tracking-tight text-xs sm:text-sm line-clamp-2 leading-snug m-0 p-0">
                                {product.title}
                              </h3>
                              {cleanDesc && (
                                <p className="text-gray-500 font-medium text-[11px] sm:text-xs mt-1 line-clamp-2 leading-relaxed m-0 p-0">
                                  {cleanDesc}...
                                </p>
                              )}
                            </div>

                            <div className="pt-2 border-t border-gray-100 flex items-center justify-between mt-auto">
                              <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-primary flex items-center gap-1">
                                Explore
                                <ChevronRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* Global Product Range */}
      <div className="border-t border-gray-100">
        <ProductRange />
      </div>
    </div>
  );
}
