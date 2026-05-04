import React from 'react';
import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageBannerProps {
  title: string;
  breadcrumbs: BreadcrumbItem[];
}

export default function PageBanner({ title, breadcrumbs }: PageBannerProps) {
  return (
    <section className="bg-primary py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter">
          {title}
        </h1>

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
