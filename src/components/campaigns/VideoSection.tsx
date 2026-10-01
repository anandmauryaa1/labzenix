'use client';

import React from 'react';
import FadeIn from '@/components/ui/FadeIn';
import { SectionHeader } from './Typography';

export default function VideoSection({ data }: { data: any }) {
  const videoUrl = data?.videoUrl || '';
  const isShort = data?.isShort || false;
  const title = data?.title || 'Demonstration & Testing Operation';
  const description = data?.description || 'Watch our precision servo-hydraulic testing system in action. See how automated clamping, constant pressure rate expansion, and automatic burst recording ensure accurate laboratory quality control.';

  // Extract video ID from YouTube embed URL for loop param
  const videoId = videoUrl ? videoUrl.split('/embed/')[1]?.split('?')[0] : '';

  // Build autoplay + muted + loop embed URL
  const autoplayUrl = videoId
    ? `${videoUrl}${videoUrl.includes('?') ? '&' : '?'}autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=1&rel=0`
    : '';

  return (
    <section id="video" className="py-24 bg-white font-display border-y border-slate-200 relative overflow-hidden">

      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="container mx-auto px-4 max-w-5xl relative z-10">
        <FadeIn>
          <SectionHeader
            title={title}
            subtitle={description}
            topText="SEE IT IN ACTION"
          />

          {/* Video Player */}
          <div className="mt-12 flex justify-center">
            <div className={`${isShort ? 'w-full max-w-sm' : 'w-full'}`}>
              <div className={`${isShort ? 'aspect-[9/16]' : 'aspect-video'} w-full bg-slate-100 border-2 border-slate-200 shadow-2xl relative rounded-none overflow-hidden`}>
                {autoplayUrl ? (
                  <iframe
                    src={autoplayUrl}
                    className="absolute inset-0 w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <div className="absolute inset-0 bg-slate-50 flex flex-col items-center justify-center p-8 text-center">
                    <span className="text-xs font-black uppercase tracking-[0.25em] text-primary mb-2">LABZENIX DEMO VIDEO</span>
                    <h3 className="text-xl font-black uppercase text-slate-900 tracking-tight mb-2">Video Coming Soon</h3>
                    <p className="text-xs text-slate-500">Contact technical sales for a live personalized video demo.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CTA below video */}
          <div className="mt-6 text-center">
            <a
              href="#enquiry"
              className="inline-block bg-primary hover:bg-slate-900 text-white text-xs font-bold uppercase tracking-widest py-3 px-8 transition-all border border-primary rounded-none"
            >
              Request Live Video Demo
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
