'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Package, ChevronRight, ArrowLeft, Grid3X3 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';
import FadeIn from '@/components/ui/FadeIn';
import { motion, AnimatePresence } from 'framer-motion';
import PageBanner from '@/components/ui/PageBanner';
import { getOptimizedImageUrl } from '@/lib/image';

interface Product {
  _id: string;
  title: string;
  slug: string;
  modelNumber: string;
  images: string[];
  category: string;
  description: string;
  usage: string;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image?: string;
}

interface Application {
  _id: string;
  name: string;
  slug: string;
  description: string;
}

const ITEMS_PER_PAGE = 12;

function ProductsContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  const applicationParam = searchParams.get('application');
  const searchParam   = searchParams.get('search') ?? '';  // from navbar

  const [products, setProducts]     = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [certificateImage, setCertificateImage] = useState<string | null>(null);
  const [loading, setLoading]       = useState(true);
  const [visibleCount, setVisibleCount] = useState<number>(ITEMS_PER_PAGE);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const searchTerm = searchParam;

  const itemVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const selectedCategory = categories.find(
    c => c.slug === categoryParam || c.name === categoryParam
  );

  const selectedApplication = applications.find(
    a => a.slug === applicationParam
  );

  // Calculate PageBanner Title & Breadcrumbs & Description
  let pageTitle = 'Our Products';
  let pageDescription = 'Explore our range of ISO certified laboratory instruments.';
  const breadcrumbs: { label: string; href?: string }[] = [
    { label: 'Home', href: '/' },
    { label: 'Our Products', href: '/products' }
  ];

  if (searchTerm && !categoryParam && !applicationParam) {
    pageTitle = `Search: ${searchTerm}`;
    pageDescription = `Search results for "${searchTerm}" across all categories.`;
    breadcrumbs.push({ label: searchTerm });
  } else if (applicationParam) {
    const appName = selectedApplication?.name || applicationParam.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    pageTitle = appName;
    pageDescription = selectedApplication?.description || 'Instruments specialized for this industrial sector.';
    breadcrumbs.push({ label: appName });
  } else if (categoryParam) {
    const catName = selectedCategory?.name ?? categoryParam;
    pageTitle = catName;
    pageDescription = selectedCategory?.description || `Premium quality instruments for ${catName}.`;
    breadcrumbs.push({ label: catName });
  }

  useEffect(() => {
    // Fetch Categories
    fetch('/api/categories')
      .then(res => res.ok ? res.json() : [])
      .then(data => setCategories(Array.isArray(data) ? data : []))
      .catch((err) => console.error('Error loading categories:', err));

    // Fetch Applications
    fetch('/api/applications')
      .then(res => res.ok ? res.json() : [])
      .then(data => setApplications(Array.isArray(data) ? data : []))
      .catch((err) => console.error('Error loading applications:', err));

    // Fetch Certificates
    fetch('/api/company-certificates')
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data) && data.length > 0 && data[0]?.fileUrl) {
          setCertificateImage(data[0].fileUrl);
        }
      })
      .catch((err) => console.error('Error loading certificates:', err));
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [categoryParam, applicationParam]);

  // Reset pagination when category, application, or search params change
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [categoryParam, applicationParam, searchTerm]);

  function normalizeCategory(str: string): string {
    return decodeURIComponent(str)
      .toLowerCase()
      .replace(/&/g, 'and')
      .replace(/[^a-z0-9]/g, '');
  }

  async function fetchProducts() {
    setLoading(true);
    try {
      let url = '/api/products?fields=card';
      if (applicationParam) {
        url += `&application=${encodeURIComponent(applicationParam)}`;
      }
      if (categoryParam) {
        url += `&category=${encodeURIComponent(categoryParam)}`;
      }

      const res = await fetch(url);
      if (!res.ok) {
        setProducts([]);
        return;
      }
      let data: Product[] = await res.json();

      if (!Array.isArray(data)) {
        setProducts([]);
        return;
      }

      // Client fallback matching if server regex returns extra items
      if (categoryParam && data.length > 0) {
        const normTarget = normalizeCategory(categoryParam);
        const filtered = data.filter(p => p.category && normalizeCategory(p.category) === normTarget);
        if (filtered.length > 0) {
          data = filtered;
        }
      }

      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  const filteredProducts = searchTerm
    ? products.filter(p =>
        p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.modelNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : products;

  const displayedProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  useEffect(() => {
    if (!hasMore || loading || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setLoadingMore(true);
          setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
          requestAnimationFrame(() => {
            setLoadingMore(false);
          });
        }
      },
      { threshold: 0.1, rootMargin: '300px' }
    );

    const currentSentinel = sentinelRef.current;
    if (currentSentinel) {
      observer.observe(currentSentinel);
    }

    return () => {
      if (currentSentinel) {
        observer.unobserve(currentSentinel);
      }
    };
  }, [hasMore, loading, loadingMore, displayedProducts.length]);


  // If searching across all products (no category filter/search/application) — show grid directly
  if (!categoryParam && !searchTerm && !applicationParam) {
    return (
      <div className="bg-white overflow-hidden">
        <PageBanner 
          title="Our Products" 
          description="Precision laboratory instruments for industrial and research excellence."
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Our Products' }]} 
        />
        
        {/* Hero */}
        <section className="bg-gray-50 py-10 sm:py-16 md:py-24 border-b border-gray-100 bg-gradient-to-b from-gray-200 to-white-50">
          <div className="w-full sm:w-[90%] mx-auto px-[5px] sm:px-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8 md:gap-12">
              <FadeIn direction="right" className="max-w-2xl">
                <span className="text-primary font-black tracking-[0.3em] uppercase text-[10px] mb-3 sm:mb-4 block">
                  Industrial Catalog
                </span>
                <h1 className="text-3xl sm:text-5xl md:text-7xl font-black text-secondary uppercase tracking-tighter leading-none mb-4 sm:mb-6">
                  Precision <span className="text-primary">Testing</span> Mastery
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed font-medium mb-6 sm:mb-8">
                  Explore our range of ISO certified, technologically advanced laboratory instruments
                  designed for reliability, reproducibility, and precision.
                </p>
              </FadeIn>
              <FadeIn direction="left" className="hidden md:block w-full max-w-sm">
                <div className="aspect-[4/5] bg-gray-100 border-2 border-primary/20 p-4 relative shadow-2xl">
                  <Image
                    src={certificateImage || "https://images.unsplash.com/photo-1579313101805-39180766150e?auto=format&fit=crop&q=80&w=800"}
                    alt="LabZenix Certified"
                    fill
                    className="object-cover brightness-90 transition-all duration-700"
                    priority
                  />
                  <div className="absolute top-8 -right-12 bg-primary text-white p-6 font-black text-xs uppercase tracking-[0.2em] -rotate-90 origin-bottom-right shadow-xl">
                    LabZenix Certified
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* Categories from DB */}
        <section className="py-10 sm:py-16 md:py-24 px-[5px] sm:px-4">
          <div className="w-full sm:w-[90%] mx-auto px-[5px] sm:px-4">
            {categories.length === 0 ? (
              <div className="text-center py-12 sm:py-16">
                <Grid3X3 className="w-10 h-10 sm:w-12 sm:h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 font-medium text-sm sm:text-base">No categories available yet.</p>
              </div>
            ) : (
              <FadeIn stagger direction="none">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
                  {categories.map(cat => (
                    <motion.div
                      key={cat._id}
                      variants={itemVariant}
                      className="flex flex-col border border-gray-100 bg-white group shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer"
                    >
                      <Link href={cat.slug ? `/category/${cat.slug}` : `/products?category=${encodeURIComponent(cat.name)}`} className="flex flex-col h-full">
                        <div className="w-full h-48 sm:h-64 bg-gray-50 overflow-hidden flex items-center justify-center relative">
                          {cat.image ? (
                            <Image
                              src={cat.image}
                              alt={cat.name}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                          ) : (
                            <Grid3X3 className="w-12 h-12 sm:w-16 sm:h-16 text-gray-200" />
                          )}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500 z-10" />
                        </div>
                        <div className="p-5 sm:p-8 pb-3 sm:pb-4">
                          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-secondary uppercase mb-2 sm:mb-4 tracking-tighter group-hover:text-primary transition-colors leading-none">
                            {cat.name}
                          </h2>
                          <p className="text-gray-500 font-medium text-xs sm:text-sm leading-relaxed mb-4 sm:mb-8">{cat.description}</p>
                        </div>
                        <div
                          className="bg-gray-50 py-3.5 sm:py-5 px-5 sm:px-8 border-t border-gray-100 flex justify-between items-center group-hover:bg-secondary group-hover:text-white transition-all font-black uppercase text-[10px] tracking-[0.2em] text-secondary mt-auto"
                        >
                          View Full Category
                          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-2 transition-transform" />
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </FadeIn>
            )}
          </div>
        </section>
      </div>
    );
  }

  // ── Category / Search results view ───────────────────────
  return (
    <div className="bg-white overflow-hidden">
      <PageBanner 
        title={pageTitle} 
        breadcrumbs={breadcrumbs} 
        description={pageDescription} 
        showBackButton={!!(categoryParam || applicationParam || searchParam)}
        as="h1"
      />
      
      <section className="py-8 sm:py-14 md:py-20 px-[5px] sm:px-4 bg-gradient-to-b from-gray-200 to-white-50">
        <div className="w-full sm:w-[90%] mx-auto px-[5px] sm:px-4">
          {/* Products grid */}
          {loading ? (
            <div className="flex justify-center py-20 sm:py-32">
              <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-primary" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 sm:py-32">
              <Package className="w-12 h-12 sm:w-16 sm:h-16 text-gray-200 mx-auto mb-4 sm:mb-6" />
              <p className="text-base sm:text-xl text-gray-500 font-black uppercase tracking-widest">
                No products found{searchTerm ? ' for your search' : ' in this category'}.
              </p>
              {searchTerm && (
                <button
                  onClick={() => { if (searchParam) window.location.href = '/products'; }}
                  className="mt-4 sm:mt-6 text-primary font-black uppercase tracking-[0.2em] text-xs underline hover:no-underline cursor-pointer"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                {displayedProducts.map((product, idx) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: (idx % ITEMS_PER_PAGE) * 0.04 }}
                  >
                    <Link href={`/products/${product.slug}`} className="group block h-full cursor-pointer" style={{ perspective: '1000px' }}>
                      <div
                        style={{
                          borderRadius: '4px',
                          transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.35s ease',
                          transformStyle: 'preserve-3d',
                          boxShadow: '0 20px 25px -5px rgba(0, 74, 173, 0.12), 0 8px 10px -6px rgba(0, 74, 173, 0.08)',
                        }}
                        className="flex flex-col border border-gray-200 bg-white shadow-xl hover:shadow-2xl group-hover:[transform:translateY(-6px)_rotateX(2deg)] group-hover:[box-shadow:0_25px_50px_rgba(0,74,173,0.22),0_12px_24px_rgba(0,74,173,0.12),0_0_0_1px_rgba(0,74,173,0.16)] transition-all overflow-hidden h-full relative"
                      >
                        {/* Top gradient accent line */}
                        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary via-secondary to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
                        {/* Image */}
                        <div className="w-full h-48 sm:h-64 bg-gray-50 overflow-hidden flex items-center justify-center relative">
                          {product.images?.[0] ? (
                            <Image
                              src={getOptimizedImageUrl(product.images[0], { width: 400, height: 400, crop: 'fit' })}
                              alt={product.title}
                              fill
                              loading="lazy"
                              sizes="(max-width: 768px) 50vw, 25vw"
                              className="object-contain p-3 sm:p-4 group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <Package className="w-12 h-12 sm:w-16 sm:h-16 text-gray-200" />
                          )}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500 z-10" />
                        </div>

                        {/* Info */}
                        <div className="p-4 sm:p-6 flex flex-col flex-grow">
                          {product.modelNumber && (
                            <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2 sm:mb-3">
                              REF: {product.modelNumber}
                            </p>
                          )}
                          <h3 className="text-sm sm:text-base font-bold text-secondary uppercase tracking-tight mb-4 sm:mb-6 group-hover:text-primary transition-colors line-clamp-2 leading-snug flex-grow">
                            {product.title}
                          </h3>
                          <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-gray-100 mt-auto">
                            <span className="text-[10px] font-black uppercase tracking-widest text-secondary group-hover:text-primary transition-colors">
                              Explore Specs
                            </span>
                            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-primary group-hover:translate-x-1.5 transition-transform duration-300" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Infinite Scroll Trigger / Loader */}
              {hasMore && (
                <div ref={sentinelRef} className="py-12 flex justify-center items-center">
                  <div className="flex items-center space-x-3 bg-white px-6 py-3 border border-gray-200 shadow-md rounded-full">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
                    <span className="text-xs font-black uppercase tracking-widest text-secondary">
                      Loading more products... ({displayedProducts.length} of {filteredProducts.length})
                    </span>
                  </div>
                </div>
              )}

              {!hasMore && filteredProducts.length > ITEMS_PER_PAGE && (
                <div className="py-12 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Showing all {filteredProducts.length} products
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default function ProductsClient() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
