'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ArrowRight, ImageIcon, Flame } from 'lucide-react';
import { getOptimizedImageUrl } from '@/lib/image';

export interface Product {
  _id: string;
  title: string;
  slug: string;
  modelNumber: string;
  images: string[];
  category: string;
  description: string;
  views?: number;
  createdAt?: string | Date;
}

export default function ProductCarousel({ initialProducts }: { initialProducts?: Product[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts || []);

  const trackRef = useRef<HTMLDivElement>(null);
  const cardMeasureRef = useRef<HTMLDivElement>(null);
  const isPausedRef = useRef(false);
  const currentXRef = useRef(0);
  const targetXRef = useRef(0);
  const isInitializedRef = useRef(false);
  const isDraggingRef = useRef(false);
  const startTouchXRef = useRef(0);
  const startTargetXRef = useRef(0);
  const cardStepRef = useRef(364);

  // Fallback fetch if initialProducts is empty
  useEffect(() => {
    if (!initialProducts || initialProducts.length === 0) {
      fetch('/api/products?fields=card&limit=10')
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setProducts(data);
          }
        })
        .catch(console.error);
    }
  }, [initialProducts]);

  // Measure card width + gap dynamically
  const updateCardStep = useCallback(() => {
    if (cardMeasureRef.current) {
      // 24px gap on sm/md, 20px on mobile
      const gap = window.innerWidth < 640 ? 20 : 24;
      const width = cardMeasureRef.current.offsetWidth;
      if (width > 0) {
        cardStepRef.current = width + gap;
      }
    }
  }, []);

  useEffect(() => {
    updateCardStep();
    window.addEventListener('resize', updateCardStep);
    return () => window.removeEventListener('resize', updateCardStep);
  }, [updateCardStep]);

  // Main Animation Loop: Continuous Smooth Auto-Scroll with Infinite Wrapping & Step Controls
  useEffect(() => {
    if (products.length === 0) return;

    updateCardStep();
    const setWidth = products.length * cardStepRef.current;

    // Start in the middle set (Set B) for instant bi-directional scrolling
    if (!isInitializedRef.current && setWidth > 0) {
      currentXRef.current = -setWidth;
      targetXRef.current = -setWidth;
      isInitializedRef.current = true;
    }

    let animId: number;
    let lastTime: number | null = null;

    const animate = (time: number) => {
      if (lastTime === null) {
        lastTime = time;
      }
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      // Auto-advance only when not hovered or being dragged
      if (!isPausedRef.current && !isDraggingRef.current) {
        // Continuous smooth scrolling at ~42 pixels per second
        targetXRef.current -= 42 * delta;
      }

      // Smooth interpolation for silky motion and smooth button transitions
      const lerpFactor = isDraggingRef.current ? 0.35 : 0.12;
      currentXRef.current += (targetXRef.current - currentXRef.current) * lerpFactor;

      // Infinite wrap-around math
      const currentSetWidth = products.length * cardStepRef.current;
      if (currentSetWidth > 0) {
        // If scrolled past the 2nd set, seamlessly wrap back to 1st set
        if (currentXRef.current <= -2 * currentSetWidth) {
          currentXRef.current += currentSetWidth;
          targetXRef.current += currentSetWidth;
          if (isDraggingRef.current) {
            startTargetXRef.current += currentSetWidth;
          }
        }
        // If scrolled before the 1st set (via Prev button), seamlessly wrap forward
        else if (currentXRef.current >= 0) {
          currentXRef.current -= currentSetWidth;
          targetXRef.current -= currentSetWidth;
          if (isDraggingRef.current) {
            startTargetXRef.current -= currentSetWidth;
          }
        }
      }

      // Direct GPU transform update
      if (trackRef.current) {
        trackRef.current.style.transform = `translate3d(${currentXRef.current}px, 0, 0)`;
      }

      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [products.length, updateCardStep]);

  // Button Handlers: smoothly jump by 1 card
  const handlePrev = () => {
    updateCardStep();
    targetXRef.current += cardStepRef.current;
  };

  const handleNext = () => {
    updateCardStep();
    targetXRef.current -= cardStepRef.current;
  };

  // Touch Handlers for mobile swipe/drag
  const handleTouchStart = (e: React.TouchEvent) => {
    isPausedRef.current = true;
    isDraggingRef.current = true;
    startTouchXRef.current = e.touches[0].clientX;
    startTargetXRef.current = targetXRef.current;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current) return;
    const delta = e.touches[0].clientX - startTouchXRef.current;
    targetXRef.current = startTargetXRef.current + delta;
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
    isPausedRef.current = false;
  };

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-10 sm:py-16 md:py-20 px-[5px] sm:px-4 bg-gradient-to-b from-gray-50 via-white to-gray-50 border-b border-gray-100 overflow-hidden">
      <div className="w-full sm:w-[92%] mx-auto px-[5px] sm:px-4">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-4">
          <div className="max-w-2xl">
            <span className="text-primary font-bold tracking-[0.3em] uppercase text-xs sm:text-sm mb-2 sm:mb-3 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" />
              Hot Selling Products
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-secondary uppercase tracking-tight sm:tracking-tighter">
              Hot <span className="text-primary">Selling</span> Equipment
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-2 sm:mt-3 font-medium leading-relaxed">
              Explore our latest precision testing instruments engineered for industrial and laboratory quality control excellence.
            </p>
          </div>

          {/* Navigation Controls: Previous / Next Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={handlePrev}
              className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center border border-gray-200 bg-white text-secondary hover:bg-primary hover:text-white hover:border-primary transition-all duration-200 shadow-xs group cursor-pointer"
              aria-label="Previous product"
              title="Previous product"
            >
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={handleNext}
              className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center border border-gray-200 bg-white text-secondary hover:bg-primary hover:text-white hover:border-primary transition-all duration-200 shadow-xs group cursor-pointer"
              aria-label="Next product"
              title="Next product"
            >
              <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* Carousel Container */}
        <div
          className="relative w-full overflow-hidden py-4 select-none"
          onMouseEnter={() => {
            isPausedRef.current = true;
          }}
          onMouseLeave={() => {
            isPausedRef.current = false;
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Animated Track with 3 Sets of Products for 100% Continuous Infinite Loop */}
          <div
            ref={trackRef}
            className="flex w-max will-change-transform"
            style={{ transform: 'translate3d(0, 0, 0)' }}
          >
            {/* Set A (Preceding buffer for smooth backwards Prev scrolling) */}
            <div className="flex gap-5 sm:gap-6 pr-5 sm:pr-6 shrink-0" aria-hidden="true">
              {products.map((product) => (
                <ProductCardItem key={`set-a-${product._id}`} product={product} />
              ))}
            </div>

            {/* Set B (Active primary set) */}
            <div className="flex gap-5 sm:gap-6 pr-5 sm:pr-6 shrink-0">
              {products.map((product, idx) => (
                <ProductCardItem
                  key={`set-b-${product._id}`}
                  product={product}
                  measureRef={idx === 0 ? cardMeasureRef : undefined}
                />
              ))}
            </div>

            {/* Set C (Succeeding buffer for seamless forward Next scrolling) */}
            <div className="flex gap-5 sm:gap-6 pr-5 sm:pr-6 shrink-0" aria-hidden="true">
              {products.map((product) => (
                <ProductCardItem key={`set-c-${product._id}`} product={product} />
              ))}
            </div>
          </div>

          {/* Left/Right Subtle Gradient Edge Overlays */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-8 sm:w-16 bg-gradient-to-r from-gray-50 via-gray-50/70 to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-8 sm:w-16 bg-gradient-to-l from-gray-50 via-gray-50/70 to-transparent z-10" />
        </div>

        {/* Bottom Call To Action */}
        <div className="mt-10 sm:mt-12 text-center">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-white hover:bg-primary transition-colors duration-300 text-xs sm:text-sm font-black uppercase tracking-widest shadow-md hover:shadow-xl group"
          >
            <span>View All Testing Instruments</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function ProductCardItem({
  product,
  measureRef,
}: {
  product: Product;
  measureRef?: React.Ref<HTMLDivElement>;
}) {
  const [imgError, setImgError] = useState(false);
  const hasImage = product.images && product.images.length > 0 && !imgError;

  return (
    <div
      ref={measureRef}
      className="w-[280px] sm:w-[320px] md:w-[340px] shrink-0 h-[460px] transition-all duration-300 hover:-translate-y-2"
    >
      <Link href={`/products/${product.slug}`} className="block h-full">
        <div className="h-full bg-white border border-gray-200 shadow-md hover:border-primary hover:shadow-2xl transition-all duration-300 group/card cursor-pointer overflow-hidden flex flex-col relative rounded-none">
          {/* Top Badges */}
          <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5">
            <span className="bg-primary text-white text-[10px] font-black uppercase px-2.5 py-1 tracking-wider shadow-sm flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              Hot Selling
            </span>
          </div>

          {product.category && (
            <div className="absolute top-3 right-3 z-20 max-w-[150px]">
              <span className="bg-white/95 backdrop-blur-xs text-secondary text-[10px] font-bold uppercase px-2 py-0.5 border border-gray-200 shadow-xs truncate block">
                {product.category}
              </span>
            </div>
          )}

          {/* Image Container */}
          <div className="relative w-full h-56 bg-gray-50/80 overflow-hidden flex items-center justify-center p-4 border-b border-gray-100">
            {hasImage ? (
              <Image
                src={getOptimizedImageUrl(product.images[0], { width: 400, height: 400, crop: 'fit' })}
                alt={product.title}
                fill
                loading="lazy"
                sizes="(max-width: 768px) 280px, 340px"
                className="object-contain p-4 group-hover/card:scale-105 transition-transform duration-500"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400">
                <ImageIcon className="w-10 h-10 mb-1 opacity-40" />
                <span className="font-bold uppercase tracking-widest text-[10px]">No Product Image</span>
              </div>
            )}
            <div className="absolute inset-0 bg-primary/0 group-hover/card:bg-primary/5 transition-colors duration-300 z-10" />
          </div>

          {/* Card Body */}
          <div className="p-5 sm:p-6 flex flex-col flex-grow justify-between bg-white">
            <div>
              <p className="text-[11px] text-primary font-black uppercase tracking-[0.2em] mb-1.5">
                {product.modelNumber || 'LZ-SERIES'}
              </p>
              <h3 className="text-base sm:text-lg font-bold text-secondary mb-2 group-hover/card:text-primary transition-colors leading-snug uppercase tracking-tight line-clamp-2">
                {product.title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 font-medium line-clamp-2 leading-relaxed">
                {product.description ? product.description.replace(/<[^>]*>?/gm, '').trim() : ''}
              </p>
            </div>

            <div className="pt-4 mt-auto border-t border-gray-100 flex items-center justify-between">
              <span className="inline-flex items-center text-primary font-black text-[11px] uppercase tracking-widest group-hover/card:translate-x-1.5 transition-transform duration-300">
                Explore Details <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                ISO / ASTM
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
