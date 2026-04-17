import { Package, Droplets, FlaskConical, Layers, ShieldCheck, Zap, Repeat, Globe } from 'lucide-react';

export default function ProductCategories() {
  const categories = [
    { name: 'Paper & Packaging', icon: Package, desc: 'Bursting, Compression, Scuff Testing' },
    { name: 'PET & Preform', icon: Droplets, desc: 'Strength, Durability, Performance' },
    { name: 'Plastic & Polymer', icon: FlaskConical, desc: 'Material Quality Analysis' },
    { name: 'Films & Laminates', icon: Layers, desc: 'High-precision Analysis' },
  ];

  return (
    <section className="py-24 px-4 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto">
        <span className="block text-primary font-bold tracking-[0.3em] uppercase text-xs text-center mb-4">Our Expertise</span>
        <h2 className="text-4xl md:text-5xl font-black mb-16 text-center text-secondary uppercase tracking-tighter">Product Categories</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((cat) => (
            <div key={cat.name} className="text-center p-10 rounded-none bg-gray-50 border border-transparent hover:border-primary hover:bg-white hover:shadow-2xl transition-all duration-300 group cursor-pointer relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white shadow-lg mx-auto flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                  <cat.icon className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black mb-3 text-secondary uppercase tracking-tight">{cat.name}</h3>
                <p className="text-sm text-gray-500 font-medium leading-relaxed">{cat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
