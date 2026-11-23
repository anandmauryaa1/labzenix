import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageBannerProps {
  title: string;
  breadcrumbs: BreadcrumbItem[];
  description?: string;
  showBackButton?: boolean;
  backUrl?: string;
  as?: 'h1' | 'h2' | 'p' | 'span';
}

export default function PageBanner({ 
  title, 
  breadcrumbs, 
  description, 
  showBackButton, 
  backUrl = '/products',
  as = 'p'
}: PageBannerProps) {
  const HeadingTag = as;
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-[#031b4e] via-[#004aad] to-[#005cd6] text-white py-3 sm:py-4 md:py-6">
      {/* Modern Dot Matrix Texture Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255, 255, 255, 0.4) 1.5px, transparent 1.5px)',
          backgroundSize: '24px 24px',
          maskImage: 'radial-gradient(ellipse at 50% 50%, black 70%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 50%, black 70%, transparent 100%)'
        }}
      />

      {/* Subtle Precision Rings & Glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full border border-white/10 pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full border border-white/10 pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-72 h-full bg-sky-300/10 blur-2xl pointer-events-none" />

      <div className="w-full sm:w-[90%] mx-auto px-[5px] sm:px-4 flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-4 md:gap-6 relative z-10">
        {/* Title & Back Button */}
        <div className="flex-1 flex items-center gap-2.5 sm:gap-3.5 md:gap-4 min-w-0">
          {showBackButton && (
            <Link href={backUrl} className="shrink-0" aria-label="Go back">
              <button className="p-2 sm:p-2.5 bg-white/10 hover:bg-white/20 text-white transition-all rounded-none border border-white/20 flex items-center justify-center cursor-pointer">
                <ArrowLeft className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 shrink-0" />
              </button>
            </Link>
          )}
          <div className="min-w-0">
            <HeadingTag className="text-base sm:text-lg md:text-2xl font-black text-white uppercase tracking-tight leading-snug sm:leading-tight m-0 p-0 break-words">
              {title}
            </HeadingTag>
          </div>
        </div>

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="text-white/80 font-medium text-[11px] sm:text-xs md:text-sm">
          <ol className="flex flex-wrap items-center gap-x-1.5 sm:gap-x-2 gap-y-0.5">
            {breadcrumbs.map((item, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return (
                <li key={index} className="inline-flex items-center gap-x-1.5 sm:gap-x-2">
                  {item.href ? (
                    <Link href={item.href} className="hover:text-white transition-colors capitalize shrink-0">
                      {item.label}
                    </Link>
                  ) : (
                    <span className={`${isLast ? 'text-white font-bold' : ''} capitalize line-clamp-1`}>
                      {item.label}
                    </span>
                  )}
                  {!isLast && <span className="text-white/40 select-none">/</span>}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </section>
  );
}
