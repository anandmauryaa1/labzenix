'use client';

import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Button from '../ui/Button';
import FadeIn from '../ui/FadeIn';
import { motion } from 'framer-motion';

const staticRanges = [
  {
    _id: '1',
    title: 'Paper & Packaging Testing',
    slug: 'paper-packaging-testing',
    description: 'LabZenix offers premium Paper & Packaging Testing Instruments designed to ensure the durability, strength, and quality of your products. With advanced technology and precision engineering, our instruments deliver accurate results for leading materials like paper, corrugated boxes, and packaging. Trust LabZenix for reliable, efficient, and high-performance testing solutions.',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1200',
    coreComponents: ['Box Compression Tester', 'Bursting Strength Tester', 'Edge Crush Tester']
  },
  {
    _id: '2',
    title: 'PET & Preform Testing',
    slug: 'pet-preform-testing',
    description: 'Our PET & Preform testing solutions provide critical analysis for the beverage and packaging industry. From bottle bursting strength to preform transparency and wall thickness, our instruments ensure your PET products meet international safety and quality standards.',
    image: 'https://images.unsplash.com/photo-1614859324967-bdf471b4024e?auto=format&fit=crop&q=80&w=1200',
    coreComponents: ['Bottle Burst Tester', 'Preform Thickness Gauge', 'Polariscope']
  }
];

export default function ProductRange() {
  const itemVariant = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <section id="productrange" className="py-16 md:py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn direction="up">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 md:mb-20">
            <div>
              <span className="text-primary font-black tracking-widest uppercase text-[14px]">Our Expertise</span>
              <h2 className="text-3xl md:text-6xl font-black text-secondary mt-2 leading-tight uppercase tracking-tighter">
                Complete <span className="text-primary">Product</span> Range
              </h2>
            </div>
            <Link href="/products" className="flex items-center text-primary font-black hover:underline text-xs md:text-sm group uppercase tracking-widest">
              View All Categories <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </FadeIn>

        <div className="space-y-24 md:space-y-32">
          {staticRanges.map((cat, index) => (
            <div 
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
                <div className="space-y-5">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Core Components</h4>
                  <FadeIn stagger direction="none">
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {cat.coreComponents.map(item => (
                        <motion.li 
                          key={item} 
                          variants={itemVariant}
                          className="flex items-center text-secondary font-black text-sm md:text-base uppercase tracking-tight"
                        >
                          <div className="w-2 h-2 bg-primary mr-3 flex-shrink-0" />
                          {item}
                        </motion.li>
                      ))}
                    </ul>
                  </FadeIn>
                </div>
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
                  <Image 
                    src={cat.image} 
                    alt={cat.title}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
