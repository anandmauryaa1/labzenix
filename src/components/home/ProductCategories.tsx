'use client';

import { Package, Droplets, FlaskConical, Layers } from 'lucide-react';
import FadeIn from '../ui/FadeIn';
import { motion } from 'framer-motion';

export default function ProductCategories() {
  const categories = [
    { name: 'Paper & Packaging', icon: Package, desc: 'Bursting, Compression, Scuff Testing' },
    { name: 'PET & Preform', icon: Droplets, desc: 'Strength, Durability, Performance' },
    { name: 'Plastic & Polymer', icon: FlaskConical, desc: 'Material Quality Analysis' },
    { name: 'Films & Laminates', icon: Layers, desc: 'High-precision Analysis' },
  ];

  const item = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <section className="py-10 sm:py-14 md:py-18 px-[5px] sm:px-4 bg-white border-y border-gray-100 overflow-hidden">
      <div className="w-full sm:w-[90%] mx-auto px-[5px] sm:px-4">
        <FadeIn direction="up">
          <span className="block text-primary font-bold tracking-[0.3em] uppercase text-[10px] sm:text-xs text-center mb-2 sm:mb-4">Our Expertise</span>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-black mb-6 sm:mb-12 text-center text-secondary uppercase tracking-tight">Product Categories</h2>
        </FadeIn>
        
        <FadeIn stagger direction="none">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {categories.map((cat) => (
              <motion.div 
                key={cat.name} 
                variants={item}
                className="text-center p-6 sm:p-8 rounded-none bg-gray-50 border border-transparent hover:border-primary hover:bg-white shadow-xl hover:shadow-2xl transition-all duration-300 group cursor-pointer relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
                <div className="relative z-10">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white shadow-lg mx-auto flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                    <cat.icon className="w-6 h-6 sm:w-8 sm:h-8" />
                  </div>
                  <h3 className="text-base sm:text-lg font-black mb-1.5 sm:mb-2 text-secondary uppercase tracking-tight m-0 p-0">{cat.name}</h3>
                  <p className="text-xs sm:text-sm text-gray-500 font-medium leading-relaxed m-0 p-0 mt-1">{cat.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
