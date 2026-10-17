import React from 'react';
import { notFound } from 'next/navigation';
import dbConnect from '@/lib/dbConnect';
import Category, { ICategory } from '@/models/Category';
import Product, { IProduct } from '@/models/Product';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import PageBanner from '@/components/ui/PageBanner';
import { ChevronRight, Download, Package, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import CatalogButton from '@/components/products/CatalogButton';
import ProductRange from '@/components/home/ProductRange';

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

  // Fetch products in this category
  const products = (await Product.find({
    category: category.name
  })
    .select('title slug modelNumber images description features')
    .sort({ views: -1, createdAt: -1 })
    .lean()) as unknown as IProduct[];

  // Fetch other categories for sidebar/navigation
  const otherCategories = (await Category.find({
    _id: { $ne: category._id }
  })
    .select('name slug')
    .sort({ order: 1 })
    .lean()) as unknown as ICategory[];

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

      {/* Category Overview Section */}
      <section className="bg-gray-50 border-b border-gray-100 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="max-w-3xl space-y-4">
              <span className="text-primary font-black uppercase tracking-[0.2em] text-[11px] bg-primary/10 px-3 py-1 inline-block">
                Industrial Category
              </span>
              <h1 className="text-3xl md:text-5xl font-black text-secondary uppercase tracking-tight">
                {category.name}
              </h1>
              <p className="text-gray-600 font-medium leading-relaxed text-base md:text-lg">
                {category.description}
              </p>
            </div>

            {category.catalogUrl && (
              <div className="flex-shrink-0">
                <CatalogButton
                  productName={category.name}
                  productId={category._id.toString()}
                  catalogUrl={category.catalogUrl}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Product Grid & Navigation */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            
            {/* Sidebar Navigation */}
            <aside className="lg:col-span-1 space-y-8">
              <div className="border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-secondary mb-4 pb-3 border-b border-gray-100">
                  Testing Categories
                </h2>
                <ul className="space-y-2 text-sm font-medium">
                  {otherCategories.map((cat) => (
                    <li key={cat._id.toString()}>
                      <Link
                        href={`/category/${cat.slug}`}
                        className="flex items-center justify-between py-2 px-3 text-gray-600 hover:text-primary hover:bg-primary/5 transition-all group"
                      >
                        <span className="truncate">{cat.name}</span>
                        <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link
                      href="/products"
                      className="flex items-center justify-between py-2 px-3 text-primary font-bold hover:bg-primary/5 transition-all mt-4 border-t border-gray-100"
                    >
                      <span>View All Products</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Quality Standards Badge */}
              <div className="border border-primary/20 bg-primary/5 p-6 space-y-3">
                <div className="flex items-center gap-2 text-primary font-black uppercase tracking-wider text-xs">
                  <ShieldCheck className="w-4 h-4" />
                  Standards Compliant
                </div>
                <p className="text-xs text-gray-600 font-medium leading-relaxed">
                  All instruments in this category are designed to meet ASTM, ISO, TAPPI, and BIS testing standards.
                </p>
              </div>
            </aside>

            {/* Main Products Grid */}
            <div className="lg:col-span-3">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                <p className="text-sm font-bold uppercase tracking-wider text-gray-500">
                  Showing <span className="text-secondary font-black">{products.length}</span> Instruments
                </p>
                <Link
                  href="/contact"
                  className="text-xs font-black uppercase tracking-widest text-primary hover:text-secondary transition-colors"
                >
                  Need Custom Specifications?
                </Link>
              </div>

              {products.length === 0 ? (
                <div className="border border-dashed border-gray-200 p-16 text-center bg-gray-50/50">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-secondary font-bold text-lg mb-2">No Products In This Category Yet</p>
                  <p className="text-gray-400 text-sm max-w-md mx-auto mb-6">
                    We are currently expanding our range in this category. Contact us for custom machinery requirements.
                  </p>
                  <Link
                    href="/contact"
                    className="inline-block px-6 py-3 bg-primary text-white font-black uppercase tracking-widest text-xs hover:bg-secondary transition-colors"
                  >
                    Inquire Now
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => {
                    const stripTags = (str?: string) => (str || '').replace(/<[^>]*>/g, '').trim();
                    const cleanDesc = stripTags(product.description).substring(0, 110);
                    const imageSrc = product.images?.[0] || '/logo.webp';

                    return (
                      <div
                        key={product._id.toString()}
                        className="group flex flex-col bg-white border border-gray-200 hover:border-primary hover:shadow-xl transition-all duration-300 relative"
                      >
                        {/* Image */}
                        <div className="relative aspect-square w-full bg-gray-50 overflow-hidden border-b border-gray-100 p-6">
                          <Image
                            src={imageSrc}
                            alt={product.title}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                          />
                          {product.modelNumber && (
                            <span className="absolute top-3 right-3 text-[10px] font-black uppercase tracking-wider bg-secondary text-white px-2 py-0.5 shadow-sm">
                              {product.modelNumber}
                            </span>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 p-5 flex flex-col justify-between space-y-4">
                          <div>
                            <h3 className="font-black text-secondary uppercase tracking-tight text-base group-hover:text-primary transition-colors line-clamp-2">
                              {product.title}
                            </h3>
                            {cleanDesc && (
                              <p className="text-gray-500 font-medium text-xs mt-2 line-clamp-2 leading-relaxed">
                                {cleanDesc}...
                              </p>
                            )}
                          </div>

                          <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                            <Link
                              href={`/products/${product.slug}`}
                              className="text-xs font-black uppercase tracking-wider text-primary group-hover:text-secondary flex items-center gap-1.5 transition-colors"
                            >
                              Explore Details
                              <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                            <Link
                              href="/contact"
                              className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-primary transition-colors"
                            >
                              Quote
                            </Link>
                          </div>
                        </div>
                      </div>
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
