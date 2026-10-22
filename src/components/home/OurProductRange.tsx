'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Grid3X3 } from 'lucide-react';
import FadeIn from '../ui/FadeIn';
import Button from '../ui/Button';
import { useState, useEffect } from 'react';
import { getOptimizedImageUrl } from '@/lib/image';



export default function OurProductRange() {
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/categories?t=' + Date.now())
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        setCategories(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error('Fetch error:', err));
  }, []);

  return (
    <section className="py-10 sm:py-14 px-[5px] sm:px-4 bg-gradient-to-b from-white to-gray-50 overflow-hidden border-b border-gray-100">
      <div className="w-full sm:w-[90%] mx-auto px-[5px] sm:px-4">
        <FadeIn direction="up">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-16 gap-4 sm:gap-6">
            <div className="max-w-2xl">
              <span className="block text-primary font-bold tracking-[0.3em] uppercase text-[10px] sm:text-xs mb-2 sm:mb-4">Discover Categories</span>
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-secondary uppercase tracking-tight sm:tracking-tighter leading-tight">
                Our Product Range
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-3 sm:mt-6 font-medium leading-relaxed">
                Our testing instruments help you examine constraints and are available in the following specialized ranges to ensure global quality standards.
              </p>
            </div>
            <Link href="/products" className="shrink-0">
              <Button variant="outline" className="uppercase tracking-widest text-xs border-gray-200 text-secondary hover:bg-secondary hover:text-white hover:border-secondary">
                View All Categories
              </Button>
            </Link>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12">
          {categories.slice(0, 12).map((cat, index) => (
            <FadeIn key={cat._id} direction="up" delay={index * 0.1}>
              <div className="group h-full cursor-pointer" style={{ perspective: '1000px' }}>
                <div
                  style={{
                    borderRadius: '4px',
                    transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.35s ease',
                    transformStyle: 'preserve-3d',
                    boxShadow: '0 20px 25px -5px rgba(0, 74, 173, 0.12), 0 8px 10px -6px rgba(0, 74, 173, 0.08)',
                  }}
                  className="bg-white overflow-hidden border border-gray-200 shadow-xl hover:shadow-2xl group-hover:[transform:translateY(-6px)_rotateX(2deg)] group-hover:[box-shadow:0_25px_50px_rgba(0,74,173,0.22),0_12px_24px_rgba(0,74,173,0.12),0_0_0_1px_rgba(0,74,173,0.16)] transition-all flex flex-col h-full relative"
                >
                  {/* Top gradient accent line */}
                  <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary via-secondary to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30" />
                  
                  {/* Image/Icon Container */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100 flex items-center justify-center border-b border-gray-100">
                  
                  {cat.image ? (
                    <Image 
                      src={getOptimizedImageUrl(cat.image, { width: 600, height: 450, crop: 'fill' })} 
                      alt={cat.name} 
                      fill
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-110 z-0"
                    />
                  ) : (
                    <div className="relative z-0 flex flex-col items-center justify-center p-8">
                      <div className="w-20 h-20 bg-white border border-gray-100 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-sm group-hover:scale-110 mb-4">
                        <Grid3X3 className="w-10 h-10" />
                      </div>
                    </div>
                  )}

                  {/* Overlay on top of image */}
                  <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-500 z-10" />
                </div>

                {/* Content Container */}
                <div className="p-8 flex flex-col flex-grow justify-between bg-white relative z-20">
                  <Link href={cat.slug ? `/category/${cat.slug}` : `/products?category=${encodeURIComponent(cat.name)}`} className="absolute inset-0 z-30"><span className="sr-only">View {cat.name}</span></Link>
                  <div className="mb-8">
                    <h3 className="text-xl font-black text-secondary group-hover:text-primary transition-colors leading-tight uppercase tracking-tight pr-8 line-clamp-2">
                      {cat.name}
                    </h3>
                  </div>
                  
                  <div className="mt-auto">
                    <div className="w-full flex items-center justify-between border-t border-gray-100 pt-6">
                      <span className="text-xs font-black uppercase tracking-widest text-gray-500 group-hover:text-primary transition-colors">
                        Click For Details
                      </span>
                      <div className="w-8 h-8 rounded-none border border-gray-200 flex items-center justify-center text-gray-400 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-300">
                        <ArrowRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
