import Button from '@/components/ui/Button';
import { Package, Droplets, FlaskConical, Beaker, FileText, Search } from 'lucide-react';
import Link from 'next/link';

export default function ProductsPage() {
  const categories = [
    {
      title: 'Paper & Packaging',
      icon: <Package className="w-8 h-8" />,
      desc: 'High-precision instruments for bursting, compression, and scuff testing of paper and corrugated boxes.',
      products: ['Bursting Strength Tester', 'Box Compression Tester', 'Cobb Sizing Tester', 'Grammage Checker'],
      color: 'bg-primary'
    },
    {
      title: 'PET & Preform',
      icon: <Droplets className="w-8 h-8" />,
      desc: 'Evaluating transparency, thickness, and strength of bottles and preforms with digital accuracy.',
      products: ['Base Clearance Tester', 'Preform Neck Concentricity', 'Digital Bottle Cap Torque Tester'],
      color: 'bg-secondary'
    },
    {
      title: 'Plastic & Polymer',
      icon: <FlaskConical className="w-8 h-8" />,
      desc: 'Assessing melt flow, friction, and impact resistance of plastic materials and polymer structures.',
      products: ['Melt Flow Index Tester', 'Coefficient of Friction Tester', 'Dart Impact Tester'],
      color: 'bg-primary'
    },
    {
      title: 'Paint & Coating',
      icon: <Beaker className="w-8 h-8" />,
      desc: 'Measuring adhesion, gloss, and viscosity to ensure durable and high-quality coatings.',
      products: ['Gloss Meter', 'Adhesion Tester', 'Viscosity Cup', 'Thickness Gauge'],
      color: 'bg-secondary'
    },
    {
      title: 'Material Testing',
      icon: <FileText className="w-8 h-8" />,
      desc: 'Universal machines for checking tensile and compression properties of diverse industrial materials.',
      products: ['Universal Testing Machine', 'Hot Air Oven', 'Digital Weighing Scales'],
      color: 'bg-primary'
    }
  ];

  return (
    <div className="bg-white">
      {/* Product Hero */}
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
            {categories.map((cat, idx) => (
              <div key={idx} className="flex flex-col border border-gray-100 bg-white group hover:shadow-2xl transition-all duration-500 overflow-hidden">
                <div className="p-8 pb-4">
                  <div className={`w-16 h-16 ${cat.color} text-white flex items-center justify-center transition-transform duration-500 group-hover:scale-110 mb-8`}>
                    {cat.icon}
                  </div>
                  <h2 className="text-2xl font-bold text-secondary uppercase mb-4 tracking-tighter group-hover:text-primary transition-colors">{cat.title}</h2>
                  <p className="text-gray-600 text-sm leading-relaxed mb-8">{cat.desc}</p>
                </div>
                
                <div className="flex-grow px-8 pb-8">
                   <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-6 flex items-center">
                    Featured Products
                    <span className="flex-grow h-px bg-gray-100 ml-4"></span>
                  </h3>
                  <ul className="space-y-3">
                    {cat.products.map(prod => (
                      <li key={prod} className="flex items-center text-sm text-gray-700 group/item">
                        <span className="w-1.5 h-1.5 bg-primary/30 mr-3 group-hover/item:bg-primary transition-colors"></span>
                        <span className="group-hover/item:translate-x-1 transition-transform">{prod}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link href={`/products?category=${cat.title.toLowerCase().replace(' & ', '-')}`} className="bg-gray-50 py-4 px-8 border-t border-gray-100 flex justify-between items-center group-hover:bg-primary group-hover:text-white transition-all font-bold uppercase text-xs tracking-widest text-secondary">
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
        <div className="max-w-5xl mx-auto px-4 text-center text-white">
          <h2 className="text-3xl font-bold mb-8 uppercase tracking-widest">Need a Detailed Product Guide?</h2>
          <p className="mb-10 text-gray-400">Download our latest 2024 Product Catalog to explore technical specifications and application guides for all our instruments.</p>
          <Button size="lg" className="bg-white text-secondary font-black hover:bg-gray-100">Download Catalog (PDF)</Button>
        </div>
      </section>
    </div>
  );
}
