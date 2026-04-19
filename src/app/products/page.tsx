'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Button from '@/components/ui/Button';
import { Package, Droplets, FlaskConical, Beaker, FileText, Search, ChevronRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const CATEGORIES = [
  {
    id: 'paper-packaging',
    title: 'Paper & Packaging',
    icon: <Package className="w-8 h-8" />,
    desc: 'High-precision instruments for bursting, compression, and scuff testing of paper and corrugated boxes.',
    color: 'bg-primary'
  },
  {
    id: 'pet-preform',
    title: 'PET & Preform',
    icon: <Droplets className="w-8 h-8" />,
    desc: 'Evaluating transparency, thickness, and strength of bottles and preforms with digital accuracy.',
    color: 'bg-secondary'
  },
  {
    id: 'plastic-polymer',
    title: 'Plastic & Polymer',
    icon: <FlaskConical className="w-8 h-8" />,
    desc: 'Assessing melt flow, friction, and impact resistance of plastic materials and polymer structures.',
    color: 'bg-primary'
  },
  {
    id: 'paint-coating',
    title: 'Paint & Coating',
    icon: <Beaker className="w-8 h-8" />,
    desc: 'Measuring adhesion, gloss, and viscosity to ensure durable and high-quality coatings.',
    color: 'bg-secondary'
  },
  {
    id: 'material-testing',
    title: 'Material Testing',
    icon: <FileText className="w-8 h-8" />,
    desc: 'Universal machines for checking tensile and compression properties of diverse industrial materials.',
    color: 'bg-primary'
  }
];

function ProductsContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const selectedCategory = CATEGORIES.find(c => c.id === categoryParam);

  useEffect(() => {
    fetchProducts();
  }, [categoryParam]);

  async function fetchProducts() {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        let data = await res.json();
        
        // Filter by category if selected
        if (categoryParam) {
          // Map category ID to category name from database
          const categoryMap: Record<string, string> = {
            'paper-packaging': 'Paper & Packaging',
            'pet-preform': 'PET & Preform',
            'plastic-polymer': 'Plastic & Polymer',
            'paint-coating': 'Paint & Coating',
            'material-testing': 'Material Testing'
          };
          
          const categoryName = categoryMap[categoryParam];
          data = data.filter((p: any) => p.category === categoryName);
        }
        
        setProducts(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }

  const filteredProducts = products.filter(p => 
    p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white">
      {/* Hero Section */}
      {!selectedCategory ? (
        <>
          <section className="bg-gray-50 py-24 border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row justify-between items-center gap-12">
                <div className="max-w-2xl">
                  <span className="text-primary font-bold tracking-[0.2em] uppercase text-xs mb-4 block">Our Catalog</span>
                  <h1 className="text-4xl md:text-6xl font-black text-secondary uppercase tracking-tighter leading-none mb-6">
                    Precision <span className="text-primary">Testing</span> Solutions
                  </h1>
                  <p className="text-xl text-gray-700 leading-relaxed font-medium mb-8">
                    Explore our range of ISO certified, technologically advanced laboratory instruments designed for reliability, reproducibility, and precision.
                  </p>
                  <div className="flex items-center p-1 bg-white border border-gray-200 shadow-sm max-w-md">
                    <input 
                      type="text" 
                      placeholder="Search for an instrument..." 
                      className="flex-grow px-4 py-3 outline-none text-gray-700 font-medium"
                    />
                    <button className="p-3 bg-secondary text-white hover:bg-primary transition-colors">
                      <Search className="w-5 h-5" />
                    </button>
                  </div>
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

          {/* Category Grid */}
          <section className="py-24 px-4">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {CATEGORIES.map((cat) => (
                  <div key={cat.id} className="flex flex-col border border-gray-100 bg-white group hover:shadow-2xl transition-all duration-500 overflow-hidden">
                    <div className="p-8 pb-4">
                      <div className={`w-16 h-16 ${cat.color} text-white flex items-center justify-center transition-transform duration-500 group-hover:scale-110 mb-8`}>
                        {cat.icon}
                      </div>
                      <h2 className="text-2xl font-bold text-secondary uppercase mb-4 tracking-tighter group-hover:text-primary transition-colors">{cat.title}</h2>
                      <p className="text-gray-600 text-sm leading-relaxed mb-8">{cat.desc}</p>
                    </div>

                    <Link href={`/products?category=${cat.id}`} className="bg-gray-50 py-4 px-8 border-t border-gray-100 flex justify-between items-center group-hover:bg-primary group-hover:text-white transition-all font-bold uppercase text-xs tracking-widest text-secondary mt-auto">
                      View Full Category
                      <span className="text-lg">→</span>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Full Catalog Banner */}
          <section className="bg-secondary mb-24 py-16">
            <div className="max-w-5xl mx-auto px-4 text-center">
              <h2 className="text-3xl text-white font-bold mb-8 uppercase tracking-widest">Need a Detailed Product Guide?</h2>
              <p className="mb-10 text-gray-400">Download our latest 2024 Product Catalog to explore technical specifications and application guides for all our instruments.</p>
              <Button size="lg" className="bg-white hover:bg-gray-100 cursor-pointer">Download Catalog (PDF)</Button>
            </div>
          </section>
        </>
      ) : (
        <>
          {/* Category Products Section */}
          <section className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center mb-12 space-x-4">
                <Link href="/products">
                  <button className="p-2 hover:bg-gray-100 transition-colors rounded">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                  </button>
                </Link>
                <div>
                  <h1 className="text-4xl font-black text-secondary uppercase tracking-tighter">{selectedCategory.title}</h1>
                  <p className="text-gray-500 font-medium mt-2">{selectedCategory.desc}</p>
                </div>
              </div>

              {/* Search Bar */}
              <div className="mb-12">
                <div className="flex items-center p-1 bg-white border-2 border-gray-200 shadow-sm max-w-md">
                  <Search className="w-5 h-5 text-gray-400 mx-3" />
                  <input 
                    type="text" 
                    placeholder="Search products in this category..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-grow px-3 py-3 outline-none text-gray-700 font-medium"
                  />
                </div>
              </div>

              {/* Products Grid */}
              {loading ? (
                <div className="flex justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-20">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-lg text-gray-500 font-medium">No products found in this category</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredProducts.map((product) => (
                    <Link key={product._id} href={`/products/${product.slug}`}>
                      <div className="flex flex-col border border-gray-100 bg-white group hover:shadow-2xl transition-all duration-500 overflow-hidden h-full cursor-pointer">
                        {/* Product Image */}
                        <div className="w-full h-56 bg-gray-100 overflow-hidden flex items-center justify-center relative group-hover:bg-gray-200 transition-colors">
                          {product.images && product.images[0] ? (
                            <img 
                              src={product.images[0]} 
                              alt={product.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <Package className="w-12 h-12 text-gray-300" />
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="p-6 flex flex-col flex-grow">
                          <h3 className="text-xl font-black text-secondary uppercase tracking-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
                            {product.title}
                          </h3>
                          
                          {product.modelNumber && (
                            <p className="text-xs font-black text-primary uppercase tracking-widest mb-4">
                              Model: {product.modelNumber}
                            </p>
                          )}

                          <p className="text-sm text-gray-600 leading-relaxed mb-6 flex-grow line-clamp-3">
                            {product.description}
                          </p>

                          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <div className="flex items-center space-x-2">
                              <span className={`inline-block px-3 py-1 text-[10px] font-black uppercase tracking-tighter rounded ${
                                product.usage === 'Laboratory' ? 'bg-blue-50 text-blue-600' : 
                                product.usage === 'Production' ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'
                              }`}>
                                {product.usage}
                              </span>
                            </div>
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
        </>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
