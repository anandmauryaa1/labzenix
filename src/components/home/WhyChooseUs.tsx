'use client';

import { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import FadeIn from '../ui/FadeIn';
import { motion } from 'framer-motion';

interface CoreValueItem {
  _id: string;
  title: string;
  description: string;
  icon: string;
  order: number;
}

export default function WhyChooseUs() {
  const [reasons, setReasons] = useState<CoreValueItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/core-values')
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        setReasons(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error('Fetch error:', err))
      .finally(() => setLoading(false));
  }, []);

  const itemVariant = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading || reasons.length === 0) return null;

  return (
    <section className="py-14 px-4 bg-gray-50 border-y border-gray-100 relative overflow-hidden">
      <div className="absolute inset-0 bg-primary/5 pattern-grid opacity-10" />
      <div className="max-w-7xl mx-auto relative z-10">
        <FadeIn direction="up">
          <span className="block text-primary font-medium tracking-[0.3em] uppercase text-sm text-center mb-4">Core Values</span>
          <h2 className="text-4xl md:text-5xl font-black mb-16 text-center text-secondary uppercase tracking-tighter">Why <span className="text-primary">LabZenix?</span></h2>
        </FadeIn>
        
        <FadeIn stagger direction="none">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {reasons.map((reason) => {
              // Dynamically get the icon component from lucide-react
              const IconComponent = (Icons as any)[reason.icon] || Icons.ShieldCheck;

              return (
                <motion.div 
                  key={reason._id} 
                  variants={itemVariant}
                  className="p-10 rounded-none bg-white border border-gray-100 hover:border-primary transition-all duration-300 hover:shadow-xl group"
                >
                  <div className="w-14 h-14 bg-primary/10 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
                    <IconComponent className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-black mb-4 text-secondary uppercase tracking-tight">{reason.title}</h3>
                  <p className="text-gray-700 leading-relaxed font-medium text-sm">{reason.description}</p>
                </motion.div>
              );
            })}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
