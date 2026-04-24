'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [settings, setSettings] = useState<any>(null);
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);

  useEffect(() => {
    fetch('/api/settings').then(res => res.json()).then(data => setSettings(data)).catch(console.error);
    fetch('/api/categories').then(res => res.json()).then(data => setCategories(Array.isArray(data) ? data : [])).catch(console.error);
  }, []);

  return (
    <footer className="bg-white border-t border-gray-100 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center space-x-2" aria-label="LabZenix - Home">
              <Image 
                src="/logo.webp" 
                alt="LabZenix Logo" 
                width={150}
                height={48}
                className="h-10 md:h-12 w-auto" 
              />
            </Link>
            <p className="text-gray-700 leading-relaxed font-normal text-sm md:text-base">
              LabZenix is a leading manufacturer of high-precision laboratory testing instruments, committed to quality and precision across global industries.
            </p>
          </div>

          {/* Quick Links */}
          <div className="lg:pl-8">
            <h3 className="text-sm font-black text-secondary mb-8 uppercase tracking-[0.2em] relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-8 after:h-1 after:bg-primary">
              Navigation
            </h3>
            <ul className="space-y-4">
              {[
                { name: 'Home', href: '/' },
                { name: 'Products', href: '/products' },
                { name: 'About Us', href: '/about' },
                { name: 'Latest Blogs', href: '/blogs' },
                { name: 'Contact Us', href: '/contact' }
              ].map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-gray-600 hover:text-primary transition-all flex items-center group font-normal text-sm uppercase tracking-wider">
                    <span className="w-0 group-hover:w-3 h-0.5 bg-primary mr-0 group-hover:mr-2 transition-all"></span>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Product Categories — dynamic from DB */}
          <div>
            <h3 className="text-sm font-black text-secondary mb-8 uppercase tracking-[0.2em] relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-8 after:h-1 after:bg-primary">
              Industries
            </h3>
            <ul className="space-y-4">
              {categories.length === 0
                ? /* skeleton while loading */
                  Array.from({ length: 5 }).map((_, i) => (
                    <li key={i}>
                      <span className="block h-3 w-32 bg-gray-100 animate-pulse rounded-sm" />
                    </li>
                  ))
                : categories.map((cat) => (
                    <li key={cat._id}>
                      <Link
                        href={`/products?category=${encodeURIComponent(cat.name)}`}
                        className="text-gray-600 hover:text-primary transition-all flex items-center group font-normal text-sm uppercase tracking-wider"
                      >
                        <span className="w-0 group-hover:w-3 h-0.5 bg-primary mr-0 group-hover:mr-2 transition-all" />
                        {cat.name}
                      </Link>
                    </li>
                  ))
              }
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-sm font-black text-secondary mb-8 uppercase tracking-[0.2em] relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-8 after:h-1 after:bg-primary">
              Get In Touch
            </h3>
            <ul className="space-y-5">
              <li className="flex items-start">
                <MapPin className="w-5 h-5 text-primary mr-4 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 text-sm font-normal leading-relaxed whitespace-pre-line">
                  {settings?.communication?.address || '123, Instrument Square,\nIndustrial Area Phase II, Mohali,\nPunjab - 160062'}
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="w-5 h-5 text-primary mr-4 flex-shrink-0" />
                <a href={`tel:${settings?.communication?.supportPhone || '+919565453120'}`} className="text-gray-700 text-sm md:text-base font-normal hover:text-primary transition-colors">
                  {settings?.communication?.supportPhone || '+91-9565453120'}
                </a>
              </li>
              <li className="flex items-center">
                <Mail className="w-5 h-5 text-primary mr-4 flex-shrink-0" />
                <a href={`mailto:${settings?.communication?.supportEmail || 'info@labzenix.com'}`} className="text-gray-700 text-sm md:text-base font-normal hover:text-primary transition-colors">
                  {settings?.communication?.supportEmail || 'info@labzenix.com'}
                </a>
              </li>
            </ul>
            
            {/* Social Links in Footer */}
            {settings?.social && (
              <div className="mt-8 flex items-center space-x-4">
                {[
                  { 
                    key: 'facebook', 
                    icon: (props: any) => (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                      </svg>
                    ), 
                    hover: 'hover:bg-[#1877F2]' 
                  },
                  { 
                    key: 'linkedin', 
                    icon: (props: any) => (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>
                      </svg>
                    ), 
                    hover: 'hover:bg-[#0A66C2]' 
                  },
                  { 
                    key: 'instagram', 
                    icon: (props: any) => (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
                        <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                      </svg>
                    ), 
                    hover: 'hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888]' 
                  },
                  { 
                    key: 'twitter', 
                    icon: (props: any) => (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
                        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
                      </svg>
                    ), 
                    hover: 'hover:bg-[#1DA1F2]' 
                  }
                ].map((social) => {
                  const url = settings.social[social.key];
                  if (!url) return null;
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.key}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 text-gray-400 transition-all duration-300 hover:text-white ${social.hover}`}
                      aria-label={`Follow us on ${social.key.charAt(0).toUpperCase() + social.key.slice(1)}`}
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  );
                })}
              </div>
            )}
            
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="bg-secondary py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center text-gray-400 text-xs font-normal uppercase tracking-[0.15em]">
          <p>© {currentYear} LabZenix Instruments Private Limited.</p>
          <div className="flex space-x-8 mt-6 md:mt-0">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
