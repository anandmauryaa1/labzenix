'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin, Globe, ArrowRight } from 'lucide-react';

interface SocialSettings {
  facebook?: string;
  linkedin?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
  [key: string]: string | undefined;
}

interface SiteSettings {
  social?: SocialSettings;
  communication?: {
    address?: string;
    supportPhone?: string;
    salesPhone?: string;
    supportEmail?: string;
    [key: string]: string | undefined;
  };
}

// 1:1 match with Header Navigation Links (Navbar.tsx)
const QUICK_NAVIGATION = [
  { name: 'Home', href: '/' },
  { name: 'Our Products', href: '/products' },
  { name: 'Applications', href: '/applications' },
  { name: 'About Us', href: '/about' },
  { name: 'Blog', href: '/blogs' },
  { name: 'Contact', href: '/contact' },
];

// 1:1 match with Header Product Categories (Navbar.tsx)
const DEFAULT_PRODUCT_CATEGORIES = [
  {
    name: 'Paper & Packaging',
    slug: 'paper-packaging',
    href: '/category/paper-packaging',
  },
  {
    name: 'Plastic & Polymer',
    slug: 'plastic-polymer',
    href: '/category/plastic-polymer',
  },
  {
    name: 'PET Bottle & Preform',
    slug: 'pet-bottle-preform',
    href: '/category/pet-bottle-preform',
  },
  {
    name: 'Poly Films & Laminates',
    slug: 'poly-films-laminates',
    href: '/category/poly-films-laminates',
  },
  {
    name: 'Paint, Coating & Plating',
    slug: 'paint-coating-plating',
    href: '/category/paint-coating-plating',
  },
  {
    name: 'Defence',
    slug: 'defence',
    href: '/category/defence',
  },
];

const DEFAULT_SOCIAL_LINKS = [
  {
    key: 'linkedin',
    label: 'LinkedIn',
    defaultUrl: 'https://www.linkedin.com/company/labzenix',
    icon: (props: React.SVGProps<SVGSVGElement>) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect width="4" height="12" x="2" y="9" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
  {
    key: 'facebook',
    label: 'Facebook',
    defaultUrl: 'https://www.facebook.com/labzenix',
    icon: (props: React.SVGProps<SVGSVGElement>) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    key: 'twitter',
    label: 'Twitter / X',
    defaultUrl: 'https://twitter.com/labzenix',
    icon: (props: React.SVGProps<SVGSVGElement>) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
      </svg>
    ),
  },
  {
    key: 'instagram',
    label: 'Instagram',
    defaultUrl: 'https://www.instagram.com/labzenix',
    icon: (props: React.SVGProps<SVGSVGElement>) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
      </svg>
    ),
  },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setSettings(data))
      .catch(console.error);

    fetch('/api/categories')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  // Compute category URLs identically to Header (Navbar.tsx)
  const productCategoriesToDisplay = useMemo(() => {
    if (categories && categories.length > 0) {
      return categories.slice(0, 6).map((cat: any) => {
        const matchedDefault = DEFAULT_PRODUCT_CATEGORIES.find(
          (d) =>
            d.slug === cat.slug ||
            d.name.toLowerCase() === cat.name?.toLowerCase() ||
            cat.name?.toLowerCase().includes(d.name.toLowerCase().split(' ')[0])
        );
        const slug = cat.slug || matchedDefault?.slug || '';
        return {
          name: cat.name,
          slug,
          href: slug ? `/category/${slug}` : `/products?category=${encodeURIComponent(cat.name)}`,
        };
      });
    }
    return DEFAULT_PRODUCT_CATEGORIES;
  }, [categories]);

  const supportPhone = settings?.communication?.supportPhone || '+91-9565453120';
  const salesPhone = settings?.communication?.salesPhone || '+91-93545-72961';
  const supportEmail = settings?.communication?.supportEmail || 'info@labzenix.com';
  const companyAddress =
    settings?.communication?.address ||
    '316, Nawada Rd, near 17 Number Chungi, Dabua Colony, Sector 49, Faridabad, Haryana 121001';

  return (
    <footer className="w-full relative">
      {/* ── Pre-Footer Floating CTA Card (Overlapping Footer Container) ── */}
      <div className="relative z-20 w-full sm:w-[90%] max-w-[1450px] mx-auto px-4 sm:px-6 -mb-10 sm:-mb-12">
        <div className="bg-primary text-white rounded sm:rounded-md px-6 sm:px-10 py-6 sm:py-7 shadow-xl shadow-blue-950/25 flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-6 border border-blue-400/25 relative overflow-hidden">
          {/* Engineering Dot Matrix Pattern (Right-to-Left Fade) */}
          <div
            className="absolute inset-y-0 right-0 w-full md:w-3/5 pointer-events-none z-0 opacity-40"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255, 255, 255, 0.6) 1.5px, transparent 1.5px)',
              backgroundSize: '18px 18px',
              maskImage: 'linear-gradient(to left, black 5%, rgba(0,0,0,0.5) 45%, transparent 95%)',
              WebkitMaskImage: 'linear-gradient(to left, black 5%, rgba(0,0,0,0.5) 45%, transparent 95%)',
            }}
            aria-hidden="true"
          />

          <div className="text-center md:text-left max-w-3xl relative z-10">
            <h2 className="text-xl sm:text-2xl md:text-[25px] font-bold text-white tracking-tight">
              Looking for the Right Testing Equipment?
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm md:text-[15px] text-blue-100 font-normal leading-relaxed">
              Tell us what you need to test, your material, and the applicable testing standard. Our team will help you find the right testing solution for your application.
            </p>
          </div>

          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 bg-white hover:bg-slate-100 text-primary font-bold text-sm sm:text-[15px] rounded-sm shadow-md hover:shadow-lg transition-all duration-200 shrink-0 cursor-pointer active:scale-95 whitespace-nowrap group relative z-10"
          >
            <span>Get Expert Guidance</span>
            <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* ── Main Four-Column White Footer ── */}
      <div className="bg-white border-t border-slate-200/80 pt-16 sm:pt-20 pb-12 sm:pb-16 relative z-10">
        <div className="w-full sm:w-[90%] max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
            
            {/* Column 1 – Company Introduction */}
            <div className="space-y-5">
              <Link href="/" className="inline-block group focus:outline-none" aria-label="LabZenix - Home">
                <Image
                  src="/logo.webp"
                  alt="LabZenix Testing Instruments Manufacturer"
                  width={180}
                  height={56}
                  className="w-[145px] sm:w-[160px] h-auto object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                  unoptimized
                />
              </Link>

              <p className="text-slate-600 leading-relaxed font-normal text-sm sm:text-[15px]">
                LabZenix is a leading manufacturer of high-precision laboratory testing instruments, delivering reliable testing solutions for industries worldwide.
              </p>

              {/* Consistent Circular Social Media Icons (Matched to Header) */}
              <div className="flex items-center gap-2.5 pt-1">
                {DEFAULT_SOCIAL_LINKS.map((item) => {
                  const url = settings?.social?.[item.key] || item.defaultUrl;
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.key}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 hover:bg-primary hover:text-white border border-slate-200/70 flex items-center justify-center transition-all duration-300 shadow-xs hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
                      aria-label={`Follow LabZenix on ${item.label}`}
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Column 2 – Quick Navigation (1:1 with Header Nav Links) */}
            <div className="lg:pl-6">
              <h3 className="text-sm font-black text-secondary mb-6 uppercase tracking-[0.18em] relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-8 after:h-0.5 after:bg-primary">
                Quick Navigation
              </h3>
              <ul className="space-y-3">
                {QUICK_NAVIGATION.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-slate-600 hover:text-primary transition-all flex items-center group font-medium text-sm leading-normal"
                    >
                      <span className="w-0 group-hover:w-2 h-0.5 bg-primary mr-0 group-hover:mr-2 transition-all rounded-full" />
                      <span>{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3 – Product Categories (1:1 with Header Product Dropdown) */}
            <div>
              <h3 className="text-sm font-black text-secondary mb-6 uppercase tracking-[0.18em] relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-8 after:h-0.5 after:bg-primary">
                Our Products
              </h3>
              <ul className="space-y-3">
                {productCategoriesToDisplay.map((cat) => (
                  <li key={cat.slug || cat.name}>
                    <Link
                      href={cat.href}
                      className="text-slate-600 hover:text-primary transition-all flex items-center group font-medium text-sm leading-normal"
                    >
                      <span className="w-0 group-hover:w-2 h-0.5 bg-primary mr-0 group-hover:mr-2 transition-all rounded-full" />
                      <span>{cat.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4 – Get in Touch (1:1 with Header Communication Info) */}
            <div>
              <h3 className="text-sm font-black text-secondary mb-6 uppercase tracking-[0.18em] relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-8 after:h-0.5 after:bg-primary">
                Get in Touch
              </h3>
              
              <p className="text-sm font-bold text-slate-800 mb-4 tracking-tight">
                Labzenix Industries Pvt. Ltd.
              </p>

              <ul className="space-y-3.5 text-sm">
                <li className="flex items-start">
                  <MapPin className="w-4 h-4 text-primary mr-3 flex-shrink-0 mt-1" />
                  <span className="text-slate-600 leading-relaxed font-normal">
                    {companyAddress}
                  </span>
                </li>

                <li className="flex items-center">
                  <Phone className="w-4 h-4 text-primary mr-3 flex-shrink-0" />
                  <div className="flex flex-col gap-0.5">
                    <a
                      href={`tel:${supportPhone.replace(/[^+\d]/g, '')}`}
                      className="text-slate-600 hover:text-primary transition-colors font-medium"
                      title="Support Hotline"
                    >
                      <span className="text-slate-400 font-normal mr-1">Support:</span>
                      {supportPhone}
                    </a>
                    {salesPhone && (
                      <a
                        href={`tel:${salesPhone.replace(/[^+\d]/g, '')}`}
                        className="text-slate-600 hover:text-primary transition-colors font-medium text-xs sm:text-sm"
                        title="Sales Hotline"
                      >
                        <span className="text-slate-400 font-normal mr-1">Sales:</span>
                        {salesPhone}
                      </a>
                    )}
                  </div>
                </li>

                <li className="flex items-center">
                  <Mail className="w-4 h-4 text-primary mr-3 flex-shrink-0" />
                  <a
                    href={`mailto:${supportEmail}`}
                    className="text-slate-600 hover:text-primary transition-colors font-medium"
                  >
                    {supportEmail}
                  </a>
                </li>

                <li className="flex items-center">
                  <Globe className="w-4 h-4 text-primary mr-3 flex-shrink-0" />
                  <Link
                    href="/"
                    className="text-slate-600 hover:text-primary transition-colors font-medium"
                  >
                    www.labzenix.com
                  </Link>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </div>

      {/* ── Dark Navy Copyright Bar (1:1 Legal and Sitemap Links) ── */}
      <div className="bg-[#071326] text-slate-300 py-6 border-t border-white/5">
        <div className="w-full sm:w-[90%] max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-normal">
          <p className="text-slate-400 text-center md:text-left">
            © {currentYear} LabZenix Instruments Private Limited. All Rights Reserved.
          </p>

          <div className="flex items-center space-x-6 sm:space-x-8 text-slate-400">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <span className="text-slate-700 select-none">|</span>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms &amp; Conditions
            </Link>
            <span className="text-slate-700 select-none">|</span>
            <Link href="/sitemap.xml" className="hover:text-white transition-colors">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
