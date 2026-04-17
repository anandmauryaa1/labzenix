'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  {
    title: "Paper & Packaging Testing",
    desc: "Guaranteed durability for your packaging materials through precision engineering.",
    href: "/products?category=paper-packaging",
    image: "https://images.pexels.com/photos/8015709/pexels-photo-8015709.jpeg"
  },
  {
    title: "PET & Preform Analysis",
    desc: "Ensure bottle quality and safety with digital accuracy and world-class standards.",
    href: "/products?category=pet-preform",
    image: "https://images.pexels.com/photos/19724422/pexels-photo-19724422.png"
  },
  {
    title: "Plastic & Polymer Innovation",
    desc: "Advanced material testing to boost industrial performance and reliability.",
    href: "/products?category=plastic-poly",
    image: "https://images.pexels.com/photos/15158323/pexels-photo-15158323.jpeg"
  }
];

export default function Hero() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <section className="relative h-[75vh] md:h-[85vh] bg-black overflow-hidden pt-[116px] md:pt-[132px]">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0 bg-black/40 z-10" />
          <img 
            src={slides[current].image} 
            alt={slides[current].title}
            className="w-full h-full object-cover scale-110 animate-slow-zoom"
          />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-20 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: "spring", damping: 25, stiffness: 120 }}
              className="max-w-3xl"
            >
              <h1 className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 uppercase tracking-tight sm:tracking-tighter leading-tight md:leading-none drop-shadow-2xl">
                {slides[current].title}
              </h1>
              <p className="text-sm sm:text-lg md:text-xl lg:text-2xl text-white/90 mb-8 md:mb-10 font-medium leading-relaxed max-w-2xl drop-shadow-md">
                {slides[current].desc}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-20 md:mb-0">
                <Link href={slides[current].href}>
                  <Button size="lg" className="w-full sm:w-auto px-10 py-5 bg-primary text-white hover:bg-white hover:text-primary transition-all duration-300 font-black uppercase tracking-widest text-sm shadow-xl">
                    Explore Now
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto px-10 py-5 border-white text-white hover:bg-white hover:text-secondary transition-all duration-300 font-black uppercase tracking-widest text-sm backdrop-blur-sm">
                    Get a Quote
                  </Button>
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-8 left-0 w-full z-30 px-4 sm:px-6 lg:px-8 flex justify-between items-end md:items-center">
        <div className="flex space-x-2 pb-2 md:pb-0">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 transition-all duration-300 ${current === i ? 'w-12 bg-primary' : 'w-6 bg-white/30 hover:bg-white/50'}`}
            />
          ))}
        </div>
        <div className="flex space-x-4">
          <button onClick={prevSlide} className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center border border-white/20 text-white hover:bg-primary transition-all rounded-full">
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <button onClick={nextSlide} className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center border border-white/20 text-white hover:bg-primary transition-all rounded-full">
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>
      </div>
    </section>
  );
}
