'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Package, Search, ChevronRight, ArrowLeft, Grid3X3 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';
import FadeIn from '@/components/ui/FadeIn';
import { motion, AnimatePresence } from 'framer-motion';
import PageBanner from '@/components/ui/PageBanner';

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
}

interface Application {
  _id: string;
  name: string;
  slug: string;
  description: string;
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  const applicationParam = searchParams.get('application');
  const searchParam   = searchParams.get('search') ?? '';  // from navbar

  const [products, setProducts]     = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading]       = useState(true);
  const [localSearch, setLocalSearch] = useState('');

  const searchTerm = searchParam || localSearch;

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
      .catch(() => {});

    // Fetch Applications
    fetch('/api/applications')
      .then(res => res.ok ? res.json() : [])
      .then(data => setApplications(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [categoryParam, applicationParam]);

  async function fetchProducts() {
    setLoading(true);
    try {
      let url = '/api/products';
      if (applicationParam) {
        url += `?application=${encodeURIComponent(applicationParam)}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch');
      let data: Product[] = await res.json();

      if (!Array.isArray(data)) {
        setProducts([]);
        return;
      }

      if (categoryParam) {
        data = data.filter(p =>
          p.category === categoryParam ||
          p.category?.toLowerCase().replace(/\s+/g, '-') === categoryParam
        );
      }

      setProducts(data);
    } catch (err) {
      toast.error('Failed to load products');
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
        <section className="bg-gray-50 py-24 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-12">
              <FadeIn direction="right" className="max-w-2xl">
                <span className="text-primary font-black tracking-[0.3em] uppercase text-[10px] mb-4 block">
                  Industrial Catalog
                </span>
                <h1 className="text-4xl md:text-7xl font-black text-secondary uppercase tracking-tighter leading-none mb-6">
                  Precision <span className="text-primary">Testing</span> Mastery
                </h1>
                <p className="text-xl text-gray-700 leading-relaxed font-medium mb-8">
                  Explore our range of ISO certified, technologically advanced laboratory instruments
                  designed for reliability, reproducibility, and precision.
                </p>
              </FadeIn>
              <FadeIn direction="left" className="hidden md:block w-full max-w-sm">
                <div className="aspect-[4/5] bg-gray-100 border-2 border-primary/20 p-4 relative shadow-2xl">
                  <Image
                    src="https://images.unsplash.com/photo-1579313101805-39180766150e?auto=format&fit=crop&q=80&w=800"
                    alt="Industrial Instrument"
                    fill
                    className="object-cover grayscale brightness-90 hover:grayscale-0 transition-all duration-700"
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
        <section className="py-24 px-4">
          <div className="max-w-7xl mx-auto">
            {categories.length === 0 ? (
              <div className="text-center py-16">
                <Grid3X3 className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-400 font-medium">No categories available yet.</p>
              </div>
            ) : (
              <FadeIn stagger direction="none">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {categories.map(cat => (
                    <motion.div
                      key={cat._id}
                      variants={itemVariant}
                      className="flex flex-col border border-gray-100 bg-white group hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer"
                    >
                      <Link href={`/products?category=${encodeURIComponent(cat.name)}`} className="flex flex-col h-full">
                        <div className="p-8 pb-4">
                          <div className="w-16 h-16 bg-primary text-white flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 mb-8 shadow-lg shadow-primary/20">
                            <Grid3X3 className="w-8 h-8" />
                          </div>
                          <h2 className="text-4xl font-black text-secondary uppercase mb-4 tracking-tighter group-hover:text-primary transition-colors leading-none">
                            {cat.name}
                          </h2>
                          <p className="text-gray-500 font-medium text-sm leading-relaxed mb-8">{cat.description}</p>
                        </div>
                        <div
                          className="bg-gray-50 py-5 px-8 border-t border-gray-100 flex justify-between items-center group-hover:bg-secondary group-hover:text-white transition-all font-black uppercase text-[10px] tracking-[0.2em] text-secondary mt-auto"
                        >
                          View Full Category
                          <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
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
      />
      
      <section className="py-24 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          {/* Search */}
          <FadeIn direction="up" delay={0.1}>
            <div className="mb-16">
              <div className="flex items-center p-1 bg-white border-2 border-gray-200 shadow-sm max-w-xl group focus-within:border-primary transition-colors">
                <Search className="w-5 h-5 text-gray-400 mx-5 group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  placeholder={searchParam ? `Filtering within "${searchParam}"...` : 'Search instruments...'}
                  value={searchParam ? '' : localSearch}
                  onChange={e => setLocalSearch(e.target.value)}
                  readOnly={!!searchParam}
                  className="flex-grow px-3 py-5 outline-none text-gray-700 font-bold uppercase tracking-widest text-xs"
                />
              </div>
            </div>
          </FadeIn>

          {/* Products grid */}
          {loading ? (
            <div className="flex justify-center py-32">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-32">
              <Package className="w-16 h-16 text-gray-200 mx-auto mb-6" />
              <p className="text-xl text-gray-500 font-black uppercase tracking-widest">
                No products found{searchTerm ? ' for your search' : ' in this category'}.
              </p>
              {searchTerm && (
                <button
                  onClick={() => { setLocalSearch(''); if (searchParam) window.location.href = '/products'; }}
                  className="mt-6 text-primary font-black uppercase tracking-[0.2em] text-xs underline hover:no-underline cursor-pointer"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <FadeIn stagger direction="none" delay={0.2}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {filteredProducts.map(product => (
                  <motion.div key={product._id} variants={itemVariant}>
                    <Link href={`/products/${product.slug}`}>
                      <div className="flex flex-col border border-gray-100 bg-white group hover:shadow-2xl transition-all duration-500 overflow-hidden h-full cursor-pointer relative">
                        {/* Image */}
                        <div className="w-full h-64 bg-gray-50 overflow-hidden flex items-center justify-center relative">
                          {product.images?.[0] ? (
                            <Image
                              src={product.images[0]}
                              alt={product.title}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                          ) : (
                            <Package className="w-16 h-16 text-gray-200" />
                          )}
                          <div className="absolute top-0 right-0 p-4 z-20">
                            <span className={`inline-block px-4 py-2 text-[10px] font-black uppercase tracking-widest shadow-xl ${
                              product.usage === 'Laboratory'  ? 'bg-blue-600 text-white' :
                              product.usage === 'Production'  ? 'bg-orange-600 text-white' :
                                                               'bg-green-600 text-white'
                            }`}>
                              {product.usage}
                            </span>
                          </div>
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500 z-10" />
                        </div>

                        {/* Info */}
                        <div className="p-8 flex flex-col flex-grow">
                          {product.modelNumber && (
                            <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-3">
                              REF: {product.modelNumber}
                            </p>
                          )}
                          <h3 className="text-2xl font-black text-secondary uppercase tracking-tighter mb-4 group-hover:text-primary transition-colors line-clamp-2 leading-none">
                            {product.title}
                          </h3>
                          <p className="text-sm text-gray-500 font-medium leading-relaxed mb-8 flex-grow line-clamp-3">
                            {product.description}
                          </p>
                          <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                            <span className="text-[10px] font-black uppercase tracking-widest text-secondary group-hover:text-primary transition-colors">
                              Explore Specs
                            </span>
                            <ChevronRight className="w-6 h-6 text-primary group-hover:translate-x-2 transition-transform duration-300" />
                          </div>
                        </div>
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
