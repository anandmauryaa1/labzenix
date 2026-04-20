'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Package, Search, ChevronRight, ArrowLeft, Grid3X3 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

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

function ProductsContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category'); // this is the category NAME or slug

  const [products, setProducts]     = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading]       = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Derive the selected category object from the URL param
  const selectedCategory = categories.find(
    c => c.slug === categoryParam || c.name === categoryParam
  );

  // Fetch categories from the DB
  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.ok ? res.json() : [])
      .then(data => setCategories(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  // Fetch products whenever category filter changes
  useEffect(() => {
    fetchProducts();
  }, [categoryParam]);

  async function fetchProducts() {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Failed to fetch');
      let data: Product[] = await res.json();

      // Safety: if API returns an error object instead of array
      if (!Array.isArray(data)) {
        setProducts([]);
        return;
      }

      // Filter by category if a category param is present
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

  const filteredProducts = products.filter(p =>
    p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.modelNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ── Category grid view (no filter selected) ──────────────
  if (!categoryParam) {
    return (
      <div className="bg-white">
        {/* Hero */}
        <section className="bg-gray-50 py-24 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-12">
              <div className="max-w-2xl">
                <span className="text-primary font-bold tracking-[0.2em] uppercase text-xs mb-4 block">
                  Our Catalog
                </span>
                <h1 className="text-4xl md:text-6xl font-black text-secondary uppercase tracking-tighter leading-none mb-6">
                  Precision <span className="text-primary">Testing</span> Solutions
                </h1>
                <p className="text-xl text-gray-700 leading-relaxed font-medium mb-8">
                  Explore our range of ISO certified, technologically advanced laboratory instruments
                  designed for reliability, reproducibility, and precision.
                </p>
              </div>
              <div className="hidden md:block w-full max-w-sm">
                <div className="aspect-[4/5] bg-gray-100 border-2 border-primary/20 p-4 relative">
                  <img
                    src="https://images.unsplash.com/photo-1579313101805-39180766150e?auto=format&fit=crop&q=80&w=800"
                    alt="Instrument"
                    className="w-full h-full object-cover grayscale brightness-90 hover:grayscale-0 transition-all duration-700"
                  />
                  <div className="absolute top-8 -right-8 bg-primary text-white p-6 font-bold uppercase tracking-widest -rotate-90 origin-bottom-right">
                    LabZenix Certified
                  </div>
                </div>
              </div>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {categories.map(cat => (
                  <div
                    key={cat._id}
                    className="flex flex-col border border-gray-100 bg-white group hover:shadow-2xl transition-all duration-500 overflow-hidden"
                  >
                    <div className="p-8 pb-4">
                      <div className="w-16 h-16 bg-primary text-white flex items-center justify-center transition-transform duration-500 group-hover:scale-110 mb-8">
                        <Grid3X3 className="w-8 h-8" />
                      </div>
                      <h2 className="text-2xl font-bold text-secondary uppercase mb-4 tracking-tighter group-hover:text-primary transition-colors">
                        {cat.name}
                      </h2>
                      <p className="text-gray-600 text-sm leading-relaxed mb-8">{cat.description}</p>
                    </div>
                    <Link
                      href={`/products?category=${encodeURIComponent(cat.name)}`}
                      className="bg-gray-50 py-4 px-8 border-t border-gray-100 flex justify-between items-center group-hover:bg-primary group-hover:text-white transition-all font-bold uppercase text-xs tracking-widest text-secondary mt-auto"
                    >
                      View Full Category
                      <span className="text-lg">→</span>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    );
  }

  // ── Category products view (filter selected) ─────────────
  return (
    <div className="bg-white">
      <section className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center mb-12 space-x-4">
            <Link href="/products">
              <button className="p-2 hover:bg-gray-100 transition-colors rounded">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
            </Link>
            <div>
              <h1 className="text-4xl font-black text-secondary uppercase tracking-tighter">
                {selectedCategory?.name ?? categoryParam}
              </h1>
              {selectedCategory?.description && (
                <p className="text-gray-500 font-medium mt-2">{selectedCategory.description}</p>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="mb-12">
            <div className="flex items-center p-1 bg-white border-2 border-gray-200 shadow-sm max-w-md">
              <Search className="w-5 h-5 text-gray-400 mx-3" />
              <input
                type="text"
                placeholder="Search products in this category..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="flex-grow px-3 py-3 outline-none text-gray-700 font-medium"
              />
            </div>
          </div>

          {/* Products grid */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-lg text-gray-500 font-medium">
                No products found{searchTerm ? ' for your search' : ' in this category'}.
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-4 text-primary font-bold text-sm underline hover:no-underline"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map(product => (
                <Link key={product._id} href={`/products/${product.slug}`}>
                  <div className="flex flex-col border border-gray-100 bg-white group hover:shadow-2xl transition-all duration-500 overflow-hidden h-full cursor-pointer">
                    {/* Image */}
                    <div className="w-full h-56 bg-gray-100 overflow-hidden flex items-center justify-center relative">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <Package className="w-12 h-12 text-gray-300" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className="text-xl font-black text-secondary uppercase tracking-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {product.title}
                      </h3>
                      {product.modelNumber && (
                        <p className="text-xs font-black text-primary uppercase tracking-widest mb-3">
                          Model: {product.modelNumber}
                        </p>
                      )}
                      <p className="text-sm text-gray-600 leading-relaxed mb-6 flex-grow line-clamp-3">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <span className={`inline-block px-3 py-1 text-[10px] font-black uppercase tracking-tighter ${
                          product.usage === 'Laboratory'  ? 'bg-blue-50 text-blue-600' :
                          product.usage === 'Production'  ? 'bg-orange-50 text-orange-600' :
                                                           'bg-green-50 text-green-600'
                        }`}>
                          {product.usage}
                        </span>
                        <ChevronRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default function ProductsPage() {
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
