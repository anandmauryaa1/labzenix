'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HeroSlide {
  _id?: string;
  title: string;
  description: string;
  image: string;
  link: string;
  order: number;
}

const fallbackSlides = [
  {
    link: "/products?category=paper-packaging",
    image: "https://images.pexels.com/photos/8015709/pexels-photo-8015709.jpeg",
    order: 1
  },
  {
    link: "/products?category=pet-preform",
    image: "https://images.pexels.com/photos/19724422/pexels-photo-19724422.png",
    order: 2
  },
  {
    link: "/products?category=plastic-poly",
    image: "https://images.pexels.com/photos/15158323/pexels-photo-15158323.jpeg",
    order: 3
  }
];

export default function Hero() {
  const [current, setCurrent] = useState(0);
  const [slides, setSlides] = useState<HeroSlide[]>(fallbackSlides);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSlides() {
      try {
        const res = await fetch('/api/hero-slides');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setSlides(data);
          }
        }
      } catch (err) {
        console.error('Failed to fetch hero slides:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSlides();
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides]);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

  if (loading && slides === fallbackSlides) {
    // Optionally show a skeleton or just wait for fallback
  }

  return (
    <section className="relative bg-white overflow-hidden">
      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full"
          >
            <Link href={slides[current].link || '/'}>
              <img 
                src={slides[current].image} 
                alt="Hero Banner"
                className="w-full h-auto cursor-pointer block"
              />
            </Link>
          </motion.div>
        </AnimatePresence>

        {/* Controls - Positioned relative to the image container */}
        <div className="absolute bottom-4 md:bottom-8 left-0 w-full z-30 px-4 sm:px-6 lg:px-8 flex justify-between items-center pointer-events-none">
          <div className="flex space-x-2 pointer-events-auto">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-1 transition-all duration-300 ${current === i ? 'w-8 md:w-12 bg-primary' : 'w-4 md:w-6 bg-black/20 hover:bg-black/40'}`}
              />
            ))}
          </div>
          <div className="flex space-x-2 md:space-x-4 pointer-events-auto">
            <button 
              onClick={prevSlide} 
              aria-label="Previous slide"
              className="w-8 h-8 md:w-12 md:h-12 flex items-center justify-center border border-black/10 text-black/40 hover:bg-primary hover:text-white transition-all"
            >
              <ChevronLeft className="w-4 h-4 md:w-6 md:h-6" />
            </button>
            <button 
              onClick={nextSlide} 
              aria-label="Next slide"
              className="w-8 h-8 md:w-12 md:h-12 flex items-center justify-center border border-black/10 text-black/40 hover:bg-primary hover:text-white transition-all"
            >
              <ChevronRight className="w-4 h-4 md:w-6 md:h-6" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

