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
}

export default function PageBanner({ 
  title, 
  breadcrumbs, 
  description, 
  showBackButton, 
  backUrl = '/products' 
}: PageBannerProps) {
  return (
    <section className="bg-primary py-4 md:py-8">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row md:items-center justify-between gap-8">
        {/* Title & Description */}
        <div className="flex-1 flex items-start gap-6">
          {showBackButton && (
            <Link href={backUrl}>
              <button className="mt-2 p-3 bg-white/10 hover:bg-white/20 text-white transition-all rounded-none border border-white/20">
                <ArrowLeft className="w-5 h-5" />
              </button>
            </Link>
          )}
          <div>
            <h1 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter leading-tight">
              {title}
            </h1>
            {/* {description && (
              <p className="mt-2 text-white/90 font-medium text-sm md:text-base max-w-2xl leading-relaxed">
                {description}
              </p>
            )} */}
          </div>
        </div>

        {/* Breadcrumb */}
        <nav className="text-white/80 font-medium text-sm">
          <ul className="flex items-center space-x-2">
            {breadcrumbs.map((item, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return (
                <li key={index} className="flex items-center space-x-2">
                  {item.href ? (
                    <Link href={item.href} className="hover:text-white transition-colors">
                      {item.label}
                    </Link>
                  ) : (
                    <span className={isLast ? 'text-white font-bold' : ''}>{item.label}</span>
                  )}
                  {!isLast && <span className="text-white/50">/</span>}
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </section>
  );
}
