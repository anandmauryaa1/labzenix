import React from 'react';
import FadeIn from '@/components/ui/FadeIn';
import { Play } from 'lucide-react';

export default function VideoSection({ data }: { data: any }) {
  return (
    <section className="py-24 bg-dark text-light">
      <div className="container mx-auto px-4 max-w-6xl text-center">
        <FadeIn>
          <div className="mb-12">
             <div className="text-primary font-semibold tracking-[0.2em] uppercase text-sm mb-4">WATCH HOW IT WORKS</div>
             <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-6 text-light">
               {data?.title || "WATCH VIDEO"}
             </h2>
             {data?.description && <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">{data.description}</p>}
          </div>
          
          <div className="aspect-video w-full bg-slate-800 border border-slate-700 flex items-center justify-center rounded-none shadow-2xl relative">
            {data?.videoUrl ? (
              <iframe 
                src={data.videoUrl} 
                className="absolute inset-0 w-full h-full" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            ) : (
              <div className="text-center text-slate-500">
                <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Video Placeholder (Add videoUrl in admin)</p>
              </div>
            )}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
