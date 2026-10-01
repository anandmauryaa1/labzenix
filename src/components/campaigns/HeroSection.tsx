'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import FadeIn from '@/components/ui/FadeIn';
import { 
  Maximize, CheckCircle2, ShieldCheck, Download, Phone, 
  ArrowRight, Sparkles, Award, Gauge, Cpu, Wrench, X, Play
} from 'lucide-react';
import { formatTitle } from './Typography';
import { getOptimizedImageUrl } from '@/lib/image';

interface HeroSectionProps {
  data: any;
  campaignTitle: string;
}

export default function HeroSection({ data, campaignTitle }: HeroSectionProps) {
  const images: string[] = Array.isArray(data?.images) && data.images.length > 0
    ? data.images
    : ['/api/placeholder/600/450', '/api/placeholder/600/450', '/api/placeholder/600/450'];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const title = data?.title || campaignTitle || 'High-Precision Testing Equipment';
  const description = data?.description || `
    <p>LabZenix state-of-the-art testing equipment provides accurate, repeatable, and ISO/ASTM compliant measurement for quality control laboratories and manufacturing facilities worldwide.</p>
  `;

  // Specs chips / highlights
  const keyHighlights = data?.highlights || [
    'Servo-Hydraulic Drive',
    'ISO 13938 / ASTM D3786 Compliant',
    'Auto Burst Detection',
    'Integrated Touchscreen HMI',
  ];

  return (
    <section id="overview" className="pt-12 pb-16 bg-gradient-to-b from-slate-100 via-slate-50 to-white relative overflow-hidden font-display border-b border-slate-200">
      
      {/* Background Decorative Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#004aad_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03] pointer-events-none"></div>

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        
        {/* Top Breadcrumb & Trust Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8 pb-4 border-b border-slate-200/60 text-xs">
          <div className="flex items-center space-x-2 text-slate-500 font-semibold uppercase tracking-wider">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <span className="text-slate-400">Campaigns</span>
            <span>/</span>
            <span className="text-primary font-bold truncate max-w-[140px] sm:max-w-xs">{title}</span>
          </div>

          <div className="flex items-center space-x-4 text-slate-600 font-bold">
            <span className="flex items-center text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-none text-[11px] uppercase tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Direct Manufacturer
            </span>
            <span className="hidden md:flex items-center text-primary bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-none text-[11px] uppercase tracking-wider">
              <Award className="w-3.5 h-3.5 mr-1" /> ISO & ASTM Certified
            </span>
          </div>
        </div>

        {/* Hero Grid */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          
          {/* Left Column: Gallery & Visual Showcase (7 cols on large) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="flex gap-4">
              
              {/* Thumbnails Sidebar */}
              <div className="flex flex-col gap-3 w-20 shrink-0">
                {images.slice(0, 5).map((imgUrl: string, i: number) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveImageIndex(i)}
                    className={`aspect-square bg-white border-2 p-1 transition-all rounded-none overflow-hidden relative group cursor-pointer ${
                      activeImageIndex === i
                        ? 'border-primary shadow-md ring-2 ring-primary/20 scale-[1.02]'
                        : 'border-slate-200 opacity-70 hover:opacity-100 hover:border-slate-400'
                    }`}
                  >
                    <Image
                      src={getOptimizedImageUrl(imgUrl, { width: 160, height: 160 })}
                      alt={`Thumbnail ${i + 1}`}
                      width={80}
                      height={80}
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>

              {/* Main Image Card */}
              <div className="flex-1 bg-white border border-slate-200 shadow-xl aspect-[4/3] relative group overflow-hidden rounded-none p-6 flex items-center justify-center">
                
                {/* Badges on main image */}
                <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                  <span className="bg-slate-900/90 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 border border-slate-700 shadow-md">
                    LABZENIX PRECISION
                  </span>
                </div>

                {/* Lightbox Trigger */}
                <button
                  type="button"
                  onClick={() => setIsLightboxOpen(true)}
                  className="absolute bottom-4 right-4 z-10 p-2.5 bg-slate-900/80 hover:bg-primary text-white border border-slate-700 shadow-lg transition-all transform group-hover:scale-110 cursor-pointer"
                  title="Expand image"
                >
                  <Maximize className="w-4 h-4" />
                </button>

                <Image
                  src={getOptimizedImageUrl(images[activeImageIndex] || images[0], { width: 800, height: 600 })}
                  alt={title}
                  width={700}
                  height={525}
                  priority
                  className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </div>

            {/* Sub-gallery specs bar */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="bg-white border border-slate-200 p-3 flex items-center space-x-3 shadow-sm">
                <Gauge className="w-6 h-6 text-primary shrink-0" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Precision</p>
                  <p className="text-xs font-black text-slate-800">±0.5% Full Scale</p>
                </div>
              </div>
              <div className="bg-white border border-slate-200 p-3 flex items-center space-x-3 shadow-sm">
                <Cpu className="w-6 h-6 text-primary shrink-0" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Control</p>
                  <p className="text-xs font-black text-slate-800">Servo Hydraulic</p>
                </div>
              </div>
              <div className="bg-white border border-slate-200 p-3 flex items-center space-x-3 shadow-sm">
                <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Standards</p>
                  <p className="text-xs font-black text-slate-800">ISO / ASTM / GB</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Title, Content & Quick Quotation CTA (5 cols on large) */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <FadeIn direction="up">
              
              {/* Category Eyebrow */}
              <div className="inline-flex items-center space-x-2 text-primary font-bold tracking-[0.2em] uppercase text-xs mb-3 bg-primary/10 border border-primary/20 px-3 py-1 rounded-none">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span>INDUSTRIAL QUALITY CONTROL SOLUTION</span>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-slate-900 mb-6 leading-tight">
                {formatTitle(title)}
              </h1>

              {/* Highlights Pill Badges */}
              <div className="flex flex-wrap gap-2 mb-6">
                {keyHighlights.map((hl: string, i: number) => (
                  <span key={i} className="inline-flex items-center text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1 rounded-none">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                    {hl}
                  </span>
                ))}
              </div>

              {/* Description Content */}
              <div 
                className="prose prose-slate max-w-none text-slate-600 text-sm leading-relaxed mb-8 space-y-3 font-normal"
                dangerouslySetInnerHTML={{ __html: description }}
              />

              {/* Action Buttons Box */}
              <div className="bg-slate-900 text-white p-6 border-2 border-slate-800 shadow-2xl rounded-none space-y-4 mb-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary">INSTANT RESPONSE</span>
                    <h3 className="text-base font-black uppercase text-white">Need Pricing & Specifications?</h3>
                  </div>
                  <span className="text-xs text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-800 px-2 py-0.5">In Stock</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href="#enquiry"
                    className="flex-1 bg-primary hover:bg-blue-600 text-white font-black uppercase text-xs tracking-widest py-3.5 px-6 transition-all shadow-lg hover:shadow-primary/40 flex items-center justify-center space-x-2 text-center rounded-none border border-primary"
                  >
                    <span>Get Instant Quotation</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>

                  <a
                    href="#enquiry"
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold uppercase text-xs tracking-wider py-3.5 px-5 transition-colors flex items-center justify-center space-x-1.5 rounded-none border border-slate-700"
                  >
                    <Download className="w-3.5 h-3.5 text-primary" />
                    <span>Spec Sheet</span>
                  </a>
                </div>

                <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                  <span className="flex items-center"><Phone className="w-3 h-3 mr-1 text-primary" /> Direct Hotline: +91 9565453120</span>
                  <span className="text-slate-500">NABL Traceable</span>
                </div>
              </div>

            </FadeIn>
          </div>
        </div>

        {/* Bottom Trust Grid */}
        <div className="mt-10 pt-8 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 text-slate-700 font-display">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-blue-50 border border-blue-200 flex items-center justify-center text-primary shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Standard Compliant</h4>
              <p className="text-[11px] text-slate-500">ISO, ASTM, TAPPI & GB/T standards</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-blue-50 border border-blue-200 flex items-center justify-center text-primary shrink-0">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">1-Year Warranty</h4>
              <p className="text-[11px] text-slate-500">Comprehensive manufacturer warranty</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-blue-50 border border-blue-200 flex items-center justify-center text-primary shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">NABL Calibration</h4>
              <p className="text-[11px] text-slate-500">Factory calibrated with certificate</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-blue-50 border border-blue-200 flex items-center justify-center text-primary shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">24/7 Tech Support</h4>
              <p className="text-[11px] text-slate-500">Expert laboratory technical assistance</p>
            </div>
          </div>
        </div>

      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-6 right-6 p-3 bg-slate-800 text-white hover:bg-red-600 transition-colors cursor-pointer rounded-none border border-slate-700"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-4xl max-h-[85vh] relative w-full h-full flex items-center justify-center">
            <Image
              src={images[activeImageIndex] || images[0]}
              alt={title}
              width={1000}
              height={750}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      )}
    </section>
  );
}
