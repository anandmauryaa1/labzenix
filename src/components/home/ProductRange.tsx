'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Button from '../ui/Button';
import FadeIn from '../ui/FadeIn';
import { motion } from 'framer-motion';

interface ProductRangeItem {
  _id: string;
  title: string;
  slug: string;
  description: string;
  image: string;
}

export default function ProductRange() {
  const [ranges, setRanges] = useState<ProductRangeItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/complete-product-ranges')
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        setRanges(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error('Fetch error:', err))
      .finally(() => setLoading(false));
  }, []);

  const itemVariant = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };

  if (loading || ranges.length === 0) return null;

  return (
    <section aria-labelledby="complete-ranges-heading" id="productrange" className="py-8 md:py-14 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn direction="up">
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 md:mb-20">
            <div>
              <span className="text-primary font-black tracking-widest uppercase text-[14px]">Our Expertise</span>
              <h2 id="complete-ranges-heading" className="text-3xl md:text-6xl font-black text-secondary mt-2 leading-tight uppercase tracking-tighter">
                Complete <span className="text-primary">Product</span> Range
              </h2>
            </div>
            <Link href="/products" className="flex items-center text-primary font-black hover:underline text-xs md:text-sm group uppercase tracking-widest">
              View All Categories <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </header>
        </FadeIn>

        <div className="space-y-24 md:space-y-32">
          {ranges.map((cat, index) => (
            <article 
              key={cat._id} 
              className={`flex flex-col lg:flex-row gap-12 lg:gap-20 items-center ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}
            >
              {/* Content */}
              <FadeIn 
                direction={index % 2 === 0 ? 'right' : 'left'} 
                className="flex-1 space-y-8"
              >
                <div className="space-y-4">
                  <h3 className="text-2xl md:text-4xl font-black text-secondary uppercase tracking-tighter leading-none">{cat.title}</h3>
                  <div className="w-20 h-2 bg-primary" />
                </div>
                <p className="text-base md:text-xl text-gray-700 leading-relaxed font-medium">
                  {cat.description}
                </p>

                <Link href={`/products?range=${cat.slug}`} className="inline-block mt-4 translate-y-0 hover:-translate-y-1 transition-transform duration-300">
                  <Button variant="primary" className="px-10 py-5 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20">Discover More</Button>
                </Link>
              </FadeIn>

              {/* Image/Card */}
              <FadeIn 
                direction={index % 2 === 0 ? 'left' : 'right'} 
                className="flex-1 w-full"
              >
                <div className="relative aspect-video group overflow-hidden border border-gray-100 shadow-2xl">
                  <div className="absolute inset-0 bg-primary/10 group-hover:bg-transparent transition-colors duration-500 z-10" />
                  {cat.image && (
                    <Image 
                      src={cat.image} 
                      alt={cat.title}
                      fill
                      className="object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-20">
                    <p className="text-white font-black text-xl md:text-2xl mb-4 tracking-tighter uppercase">{cat.title} Series</p>
                    <Link href={`/products?range=${cat.slug}`}>
                      <Button variant="outline" size="sm" className="border-white text-white hover:bg-white hover:text-black font-black uppercase tracking-widest text-[10px]">
                        Project Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </FadeIn>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
