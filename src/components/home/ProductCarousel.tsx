'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import FadeIn from '../ui/FadeIn';
import { motion, AnimatePresence } from 'framer-motion';

export interface Product {
  _id: string;
  title: string;
  slug: string;
  modelNumber: string;
  images: string[];
  category: string;
  description: string;
  views?: number;
}

export default function ProductCarousel({ initialProducts }: { initialProducts?: Product[] }) {
  const products = initialProducts || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerSlide = 4;

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? Math.max(0, products.length - itemsPerSlide) : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex + itemsPerSlide >= products.length ? 0 : prevIndex + 1
    );
  };



  if (products.length === 0) {
    return null;
  }

  const visibleProducts = products.slice(currentIndex, currentIndex + itemsPerSlide);
  const canScrollNext = currentIndex + itemsPerSlide < products.length;

  const itemVariant = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <section className="py-14 px-4 bg-gradient-to-b from-gray-50 to-white border-b border-gray-100 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <FadeIn direction="up">
          <span className="block text-primary font-medium tracking-[0.3em] uppercase text-sm text-center mb-4">
            Featured Products
          </span>
          <h2 className="text-4xl md:text-5xl font-black mb-4 text-center text-secondary uppercase tracking-tighter">
            Hot <span className="text-primary"> Selling </span> Product
          </h2>
          <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto font-medium">
            Explore our collection of cutting-edge laboratory and production equipment designed for precision testing.
          </p>
        </FadeIn>

        <div className="relative">
          {/* Product Grid */}
          <FadeIn stagger direction="none" delay={0.2}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <AnimatePresence mode="popLayout">
                {visibleProducts.map((product) => (
                  <motion.div
                    layout
                    key={product._id}
                    variants={itemVariant}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Link href={`/products/${product.slug}`}>
                      <div className="h-full bg-white border border-gray-200 hover:border-primary hover:shadow-2xl transition-all duration-500 group cursor-pointer overflow-hidden flex flex-col">
                        {/* Image Container */}
                        <div className="relative w-full h-52 bg-gray-100 overflow-hidden">
                          {product.images && product.images.length > 0 ? (
                            <Image
                              src={product.images[0]}
                              alt={product.title}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                              className="object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                              No Product Image
                            </div>
                          )}
                          {/* <div className="absolute top-0 right-0 bg-primary text-white px-4 py-2 text-[10px] font-black uppercase tracking-widest z-20">
                            {product.category}
                          </div> */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500 z-10" />
                        </div>

                        {/* Content */}
                        <div className="p-6 flex flex-col flex-grow">
                          <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em] mb-2">
                            {product.modelNumber}
                          </p>
                          <h3 className="text-lg font-bold text-secondary mb-3 group-hover:text-primary transition-colors leading-tight uppercase tracking-tight">
                            {product.title}
                          </h3>
                          <p className="text-sm text-gray-500 font-medium line-clamp-3 mb-6 flex-grow">
                            {product.description ? product.description.replace(/<[^>]*>?/gm, '').trim() : ''}
                          </p>
                          <div className="inline-flex items-center text-primary font-black text-[10px] uppercase tracking-widest group-hover:translate-x-3 transition-transform duration-300">
                             Explore Details <span className="ml-2 text-sm">→</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </FadeIn>

          {/* Navigation Buttons */}
          {products.length > itemsPerSlide && (
            <FadeIn direction="up" delay={0.4}>
              <div className="flex justify-center items-center gap-6 mt-16">
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="p-4 rounded-none border border-gray-200 text-secondary hover:bg-secondary hover:text-white transition-all disabled:opacity-20 disabled:cursor-not-allowed group cursor-pointer"
                  aria-label="Previous products"
                >
                  <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                </button>

                {/* Indicator Dots */}
                <div className="flex gap-3">
                  {Array.from({ length: Math.ceil(products.length / itemsPerSlide) }).map(
                    (_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentIndex(index * itemsPerSlide)}
                        className={`h-1.5 rounded-none transition-all duration-500 ${
                          index === Math.floor(currentIndex / itemsPerSlide)
                            ? 'bg-primary w-12'
                            : 'bg-gray-200 hover:bg-gray-300 w-6'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    )
                  )}
                </div>

                <button
                  onClick={handleNext}
                  disabled={!canScrollNext}
                  className="p-4 rounded-none border border-gray-200 text-secondary hover:bg-secondary hover:text-white transition-all disabled:opacity-20 disabled:cursor-not-allowed group cursor-pointer"
                  aria-label="Next products"
                >
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </FadeIn>
          )}
        </div>
      </div>
    </section>
  );
}
