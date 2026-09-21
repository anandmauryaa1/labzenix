import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import FadeIn from '@/components/ui/FadeIn';
import { Maximize } from 'lucide-react';
import { formatTitle } from './Typography';

export default function HeroSection({ data, campaignTitle }: { data: any, campaignTitle: string }) {
  return (
    <section className="pt-24 pb-16 bg-slate-50">
      <div className="container mx-auto px-4 max-w-7xl font-display">
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          <div className="w-full lg:w-[55%] flex gap-4">
            {/* Thumbnails */}
            <div className="flex flex-col gap-3 w-20 shrink-0">
              {(data?.images || [1,2,3,4]).slice(0,4).map((img: any, i: number) => (
                <div key={i} className="aspect-square bg-light border border-border flex items-center justify-center p-1 cursor-pointer hover:border-primary transition-colors rounded-none">
                  <div className="w-full h-full bg-slate-50 flex items-center justify-center rounded-none">
                      <Image src={typeof img === 'string' ? img : `/api/placeholder/80/80`} alt={`Thumbnail ${i}`} width={80} height={80} className="object-contain opacity-50" />
                  </div>
                </div>
              ))}
            </div>
            {/* Main Image */}
            <div className="flex-1 bg-light border border-border aspect-[4/3] flex items-center justify-center relative group cursor-pointer p-4 rounded-none">
              <div className="absolute bottom-4 left-4 p-2 bg-slate-100 border border-border text-slate-400 hover:bg-slate-200 hover:text-dark transition-colors cursor-pointer rounded-none">
                <Maximize className="w-4 h-4" />
              </div>
              <div className="w-full h-full flex items-center justify-center">
                <Image src={data?.images?.[0] || `/api/placeholder/600/450`} alt={data?.title || "Product"} width={600} height={450} className="object-contain opacity-50" />
              </div>
            </div>
          </div>

          <div className="w-full lg:w-[45%] mt-4">
            <FadeIn direction="up">
              <div className="text-primary font-semibold tracking-[0.2em] uppercase text-sm mb-4">
                PREMIUM QUALITY
              </div>
              <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-6 leading-tight">
                {formatTitle(data?.title || campaignTitle)}
              </h1>
              
              {data?.description && (
                <div className="space-y-4 text-slate-600 leading-relaxed mb-8 text-base" dangerouslySetInnerHTML={{ __html: data.description }}></div>
              )}

              <Link href="#enquiry" className="inline-block px-8 py-3 text-sm font-bold tracking-wide uppercase text-primary border-2 border-primary hover:bg-primary hover:text-light transition-colors rounded-none">
                Get A Quote Now
              </Link>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
}
