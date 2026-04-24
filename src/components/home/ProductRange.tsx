'use client';

import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Button from '../ui/Button';
import FadeIn from '../ui/FadeIn';
import { motion } from 'framer-motion';

const categories = [
  {
    id: "paper-packaging",
    title: "Paper & Packaging Testing",
    desc: "LabZenix offers premium Paper & Packaging Testing Instruments designed to ensure the durability, strength, and quality of your products. With advanced technology and precision engineering, our instruments deliver accurate results for leading materials like paper, corrugated boxes, and packaging. Trust LabZenix for reliable, efficient, and high-performance testing solutions.",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1000",
    items: ["Box Compression Tester", "Bursting Strength Tester", "Edge Crush Tester"]
  },
  {
    id: "pet-preform",
    title: "PET & Preform Bottles Testing",
    desc: "LabZenix provides advanced PET & Preform Bottles Testing Instruments that ensure precise testing of your PET bottles and preform samples. Our equipment offers accurate results for strength, durability, and performance. Designed for reliability, LabZenix instruments help businesses maintain quality standards and improve the overall efficiency of their bottle production processes.",
    image: "https://images.pexels.com/photos/19724422/pexels-photo-19724422.png",
    items: ["Torque Tester", "Bottle Neck Cutter", "Preform Polariscope"]
  },
  {
    id: "plastic-poly",
    title: "Plastic & Polymer Testing",
    desc: "LabZenix offers cutting edge Plastic & Polymer Testing Instruments designed for accurate analysis of various plastic and polymer materials. Our instruments ensure precise measurements of properties like tensile strength, elasticity, and durability. Trusted by industries worldwide, LabZenix provides reliable solutions to enhance product quality and optimize material performance in testing processes.",
    image: "https://images.pexels.com/photos/15158323/pexels-photo-15158323.jpeg",
    items: ["Melt Flow Index Tester", "Tensile Tester", "Density Gradient Column"]
  }
];

export default function ProductRange() {
  const itemVariant = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <section className="py-16 md:py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn direction="up">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 md:mb-20">
            <div>
              <span className="text-primary font-bold tracking-widest uppercase text-xs md:text-sm">Our Expertise</span>
              <h2 className="text-3xl md:text-5xl font-black text-secondary mt-2 leading-tight">
                Complete <span className="text-primary">Product</span> Range
              </h2>
            </div>
            <Link href="/products" className="flex items-center text-primary font-bold hover:underline text-sm md:text-base group">
              View All Categories <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </FadeIn>

        <div className="space-y-24 md:space-y-32">
          {categories.map((cat, index) => (
            <div 
              key={cat.id} 
              className={`flex flex-col lg:flex-row gap-12 lg:gap-20 items-center ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}
            >
              {/* Content */}
              <FadeIn 
                direction={index % 2 === 0 ? 'right' : 'left'} 
                className="flex-1 space-y-8"
              >
                <div className="space-y-4">
                  <h3 className="text-2xl md:text-4xl font-black text-secondary uppercase tracking-tight leading-none">{cat.title}</h3>
                  <div className="w-20 h-2 bg-primary" />
                </div>
                <p className="text-base md:text-xl text-gray-700 leading-relaxed font-medium">
                  {cat.desc}
                </p>
                <div className="space-y-5">
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-primary">Core Components</h4>
                  <FadeIn stagger direction="none">
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {cat.items.map(item => (
                        <motion.li 
                          key={item} 
                          variants={itemVariant}
                          className="flex items-center text-secondary font-bold text-sm md:text-base"
                        >
                          <div className="w-2 h-2 bg-primary mr-3 flex-shrink-0" />
                          {item}
                        </motion.li>
                      ))}
                    </ul>
                  </FadeIn>
                </div>
                <Link href={`/products?category=${cat.id}`} className="inline-block mt-4 translate-y-0 hover:-translate-y-1 transition-transform duration-300">
                  <Button variant="primary" className="px-10 py-5 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20">Discover More</Button>
                </Link>
              </FadeIn>

              {/* Image/Card */}
              <FadeIn 
                direction={index % 2 === 0 ? 'left' : 'right'} 
                className="flex-1 w-full"
              >
                <div className="relative aspect-video group overflow-hidden border-2 border-gray-100 shadow-2xl">
                  <div className="absolute inset-0 bg-primary/10 group-hover:bg-transparent transition-colors duration-500 z-10" />
                  <Image 
                    src={cat.image} 
                    alt={cat.title}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-8 bg-linear-to-t from-black/90 via-black/40 to-transparent z-20">
                    <p className="text-white font-black text-xl md:text-2xl mb-4 tracking-tight">{cat.title} Series</p>
                    <Link href={`/products?category=${cat.id}`}>
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

