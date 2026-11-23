'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone,
  Mail,
  Search,
  Menu,
  X,
  ChevronDown,
  ArrowRight,
  Clock,
  ImageIcon,
} from 'lucide-react';

interface NavLink {
  name: string;
  href: string;
  submenu?: { name: string; href: string; image?: string; description?: string }[];
}

export interface ProductCategoryItem {
  name: string;
  slug: string;
  image?: string;
  href: string;
  description?: string;
}

export const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  'paper-packaging': 'Bursting, drop & box compression testing',
  'plastic-polymer': 'Tensile, melt flow & polymer impact analysis',
  'pet-bottle-preform': 'Top load, torque & bottle thickness gauges',
  'poly-films-laminates': 'Dart impact, tear & seal strength testers',
  'paint-coating-plating': 'Adhesion, gloss, salt spray & scratch testing',
  'defence': 'High-precision ballistics & ruggedized stress testing',
};

const DEFAULT_PRODUCT_CATEGORIES: ProductCategoryItem[] = [
  {
    name: 'Paper & Packaging',
    slug: 'paper-packaging',
    href: '/products?category=Paper+%26+Packaging',
    description: CATEGORY_DESCRIPTIONS['paper-packaging'],
  },
  {
    name: 'Plastic & Polymer',
    slug: 'plastic-polymer',
    href: '/products?category=Plastic+%26+Polymer',
    description: CATEGORY_DESCRIPTIONS['plastic-polymer'],
  },
  {
    name: 'PET Bottle & Preform',
    slug: 'pet-bottle-preform',
    href: '/products?category=PET+Bottle+%26+Preform',
    description: CATEGORY_DESCRIPTIONS['pet-bottle-preform'],
  },
  {
    name: 'Poly Films & Laminates',
    slug: 'poly-films-laminates',
    href: '/products?category=Poly+Films+%26+Laminates',
    description: CATEGORY_DESCRIPTIONS['poly-films-laminates'],
  },
  {
    name: 'Paint, Coating & Plating',
    slug: 'paint-coating-plating',
    href: '/products?category=Paint%2C+Coating+%26+Plating',
    description: CATEGORY_DESCRIPTIONS['paint-coating-plating'],
  },
  {
    name: 'Defence',
    slug: 'defence',
    href: '/products?category=Defence',
    description: CATEGORY_DESCRIPTIONS['defence'],
  },
];

const socialIcons = [
  {
    key: 'linkedin',
    label: 'LinkedIn',
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
    icon: (props: React.SVGProps<SVGSVGElement>) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    key: 'twitter',
    label: 'Twitter / X',
    icon: (props: React.SVGProps<SVGSVGElement>) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
      </svg>
    ),
  },
  {
    key: 'instagram',
    label: 'Instagram',
    icon: (props: React.SVGProps<SVGSVGElement>) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
      </svg>
    ),
  },
];

function CategoryThumbnail({
  image,
  alt,
  iconSize = 'w-6 h-6',
}: {
  image?: string;
  alt: string;
  iconSize?: string;
}) {
  const [error, setError] = useState(false);

  if (!image || error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-blue-50/70 text-primary/70 rounded">
        <ImageIcon className={`${iconSize} opacity-70`} />
      </div>
    );
  }

  return (
    <Image
      src={image}
      alt={alt}
      fill
      sizes="(max-width: 768px) 64px, 140px"
      className="object-cover rounded transition-transform duration-300 group-hover/card:scale-105 group-hover/mcard:scale-105"
      onError={() => setError(true)}
    />
  );
}

const navLinks: NavLink[] = [
  { name: 'Home', href: '/' },
  { name: 'Our Products', href: '/products' },
  { name: 'Applications', href: '/applications' },
  { name: 'About Us', href: '/about' },
  { name: 'Blog', href: '/blogs' },
  { name: 'Contact', href: '/contact' },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [settings, setSettings] = useState<any>(null);

  // Auto-close mobile menu and submenu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveSubmenu(null);
  }, [pathname]);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [appCategories, setAppCategories] = useState<any[]>([]);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (name: string) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setActiveSubmenu(name);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setActiveSubmenu(null);
    }, 150);
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    fetch('/api/settings').then(res => res.json()).then(data => setSettings(data)).catch(console.error);
    fetch('/api/categories').then(res => res.json()).then(data => setCategories(Array.isArray(data) ? data : [])).catch(console.error);
    fetch('/api/application-categories').then(res => res.json()).then(data => setAppCategories(Array.isArray(data) ? data : [])).catch(console.error);
  }, []);

  const productCategoriesToDisplay = useMemo(() => {
    if (categories && categories.length > 0) {
      return categories.map((cat: any) => {
        const matchedDefault = DEFAULT_PRODUCT_CATEGORIES.find(
          d => d.slug === cat.slug || 
               d.name.toLowerCase() === cat.name?.toLowerCase() ||
               cat.name?.toLowerCase().includes(d.name.toLowerCase().split(' ')[0])
        );
        const slug = cat.slug || matchedDefault?.slug || '';
        return {
          name: cat.name,
          slug,
          image: cat.image || '',
          href: cat.slug ? `/category/${cat.slug}` : (matchedDefault?.href || `/products?category=${encodeURIComponent(cat.name)}`),
          description: cat.description || CATEGORY_DESCRIPTIONS[slug] || 'Precision testing & laboratory instruments',
        };
      });
    }
    return DEFAULT_PRODUCT_CATEGORIES;
  }, [categories]);

  const dynamicNavLinks = navLinks.map(link => {
    if (link.name === 'Our Products') {
      return {
        ...link,
        submenu: productCategoriesToDisplay.map(cat => ({
          name: cat.name,
          href: cat.href,
          image: cat.image,
          description: cat.description,
        }))
      };
    }
    if (link.name === 'Applications') {
      return {
        ...link,
        submenu: appCategories.map(cat => ({
          name: cat.name,
          href: `/applications?category=${encodeURIComponent(cat.name)}`
        }))
      };
    }
    return link;
  });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Focus input when search opens
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    } else {
      setSearchQuery('');
    }
  }, [searchOpen]);

  // Close search on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Lock background scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const navContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      const el = navContainerRef.current;
      if (el) {
        const height = el.getBoundingClientRect().height;
        if (height > 0) {
          document.documentElement.style.setProperty('--header-height', `${Math.round(height)}px`);
        }
      }
    };
    update();

    let observer: ResizeObserver | null = null;
    if (navContainerRef.current && typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => {
        update();
      });
      observer.observe(navContainerRef.current);
    }
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, { passive: true });
    return () => {
      if (observer) observer.disconnect();
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update);
    };
  }, []);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    setSearchOpen(false);
    router.push(`/products?search=${encodeURIComponent(q)}`);
  };

  const isLinkActive = (href: string) => {
    if (!pathname) return false;
    if (href === '/') return pathname === '/';
    if (href === '/products') {
      return pathname.startsWith('/products') || pathname.startsWith('/category');
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="fixed top-0 w-full z-50 transition-all duration-300">
      {/* ── Fixed Navbar Bars (Measured for --header-height so mobile drawer does not affect page flow) ── */}
      <div ref={navContainerRef} className="w-full">
        {/* ── LAYER 1: Professional Top Information Bar (38–42px) ── */}
        <div className="bg-[#0B1E38] text-white/90 border-b border-white/10 text-xs font-medium">
          <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 h-[36px] sm:h-[40px] flex items-center justify-between">
            {/* Left: Phone numbers and Email (Clickable) */}
            <div className="flex items-center gap-2.5 sm:gap-4 lg:gap-6 min-w-0">
              <a
                href={`tel:${settings?.communication?.supportPhone || '+919565453120'}`}
                className="flex items-center gap-1.5 text-white/90 hover:text-white transition-colors group shrink-0"
                title="Support Hotline"
              >
                <Phone className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform shrink-0" />
                <span className="font-semibold text-[11px] sm:text-xs tracking-tight">
                  {settings?.communication?.supportPhone || '+91-9565453120'}
                </span>
              </a>

              <span className="text-white/25 hidden sm:inline select-none">|</span>

              <a
                href={`tel:${settings?.communication?.salesPhone || '+919354572961'}`}
                className="hidden sm:flex items-center gap-1.5 text-white/90 hover:text-white transition-colors group shrink-0"
                title="Sales Inquiries"
              >
                <Phone className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform shrink-0" />
                <span className="font-semibold text-[11px] sm:text-xs tracking-tight">
                  {settings?.communication?.salesPhone || '+91-93545-72961'}
                </span>
              </a>

              <span className="text-white/25 hidden md:inline select-none">|</span>

              <a
                href={`mailto:${settings?.communication?.supportEmail || 'info@labzenix.com'}`}
                className="hidden md:flex items-center gap-1.5 text-white/80 hover:text-white transition-colors group shrink-0"
                title="Technical Inquiries"
              >
                <Mail className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform shrink-0" />
                <span className="text-[11px] sm:text-xs">
                  {settings?.communication?.supportEmail || 'info@labzenix.com'}
                </span>
              </a>
            </div>

            {/* Right: Business Hours, Social Icons & Compact Quote CTA */}
            <div className="flex items-center gap-3 sm:gap-4 shrink-0">
              {/* Business Hours */}
              <div className="hidden lg:flex items-center gap-1.5 text-white/70 text-[11px] tracking-tight">
                <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>Mon - Sat: 9:30 AM - 6:30 PM (IST)</span>
              </div>

              {/* Social Icons (if configured in settings) */}
              {settings?.social && (
                <div className="hidden xl:flex items-center gap-2 border-l border-white/15 pl-3">
                  {socialIcons.map((s) => {
                    const url = settings.social?.[s.key];
                    if (!url || typeof url !== 'string' || !url.startsWith('http')) return null;
                    const Icon = s.icon;
                    return (
                      <a
                        key={s.key}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/70 hover:text-white hover:scale-110 transition-all p-0.5"
                        aria-label={`Follow LabZenix on ${s.label}`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </a>
                    );
                  })}
                </div>
              )}

              {/* Smaller, Less Prominent Quote Link */}
              <Link
                href="/contact"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm bg-white/10 hover:bg-white/20 border border-white/15 text-white text-[11px] font-semibold transition-all group whitespace-nowrap"
              >
                <span>Quick Inquiry</span>
                <ArrowRight className="w-3 h-3 text-blue-300 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </Link>
            </div>
          </div>
        </div>

        {/* ── LAYER 2: Premium Navigation (Compact padding + Large desktop logo) ── */}
        <div
          className={`transition-all duration-300 relative border-b ${
            scrolled
              ? 'bg-white/98 backdrop-blur-md shadow-md border-slate-200/80 py-1'
              : 'bg-white border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.06)] py-1 sm:py-1.5 md:py-2'
          }`}
          onMouseLeave={handleMouseLeave}
        >
          <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="h-[58px] sm:h-[66px] md:h-[72px] lg:h-[78px] flex items-center justify-between">
              {/* Logo on the left - enlarged on laptop and desktop */}
              <Link
                href="/"
                className="flex items-center shrink-0 group focus:outline-none"
                aria-label="LabZenix Quality Testing Instruments - Home"
              >
                <Image
                  src="/logo.webp"
                  alt="LabZenix Testing Instruments"
                  width={240}
                  height={80}
                  className="w-[125px] sm:w-[145px] md:w-[185px] lg:w-[205px] xl:w-[220px] h-auto max-h-[42px] sm:max-h-[50px] md:max-h-[62px] lg:max-h-[68px] xl:max-h-[72px] object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                  priority
                  unoptimized
                />
              </Link>

            {/* Navigation in the Center */}
            <nav
              className="hidden xl:flex items-center space-x-6 2xl:space-x-8"
              aria-label="Main Navigation"
            >
              {dynamicNavLinks.map((link) => {
                const active = isLinkActive(link.href);
                return (
                  <div
                    key={link.name}
                    className="relative group py-3.5"
                    onMouseEnter={() => link.submenu && handleMouseEnter(link.name)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <Link
                      href={link.href}
                      className={`relative text-[15px] xl:text-[16px] font-semibold tracking-tight transition-colors flex items-center py-1 uppercase ${
                        active
                          ? 'text-primary font-bold'
                          : 'text-slate-700 hover:text-primary'
                      }`}
                      aria-haspopup={link.submenu ? 'true' : 'false'}
                      aria-expanded={activeSubmenu === link.name}
                    >
                      <span>{link.name}</span>
                      {link.submenu && (
                        <ChevronDown
                          className={`w-4 h-4 ml-1 transition-transform duration-200 shrink-0 ${
                            activeSubmenu === link.name
                              ? 'rotate-180 text-primary'
                              : 'text-slate-400 group-hover:text-primary'
                          }`}
                          aria-hidden="true"
                        />
                      )}

                      {/* Blue underline: Active indicator or hover slide */}
                      {active ? (
                        <span className="absolute -bottom-1 left-0 right-0 h-[2.5px] bg-primary rounded-full" />
                      ) : (
                        <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-center rounded-full" />
                      )}
                    </Link>

                    {/* Products Dropdown: Engineering categories with descriptions */}
                    {link.name === 'Our Products' && (
                      <AnimatePresence>
                        {activeSubmenu === link.name && (
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 8 }}
                            transition={{ duration: 0.18, ease: 'easeOut' }}
                            onMouseEnter={() => handleMouseEnter(link.name)}
                            onMouseLeave={handleMouseLeave}
                            className="absolute top-full -left-20 w-[580px] bg-white rounded-md shadow-2xl border border-slate-100 border-t-[3px] border-t-primary p-4 mt-0.5 z-50"
                          >
                            {/* Header Tab */}
                            <div className="mb-3 pb-2 border-b border-slate-100 flex items-center justify-between">
                              <div className="inline-block relative pb-1">
                                <span className="text-primary font-bold text-xs sm:text-sm tracking-wide">
                                  Testing Equipment Categories
                                </span>
                                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-full" />
                              </div>
                              <Link
                                href="/products"
                                onClick={() => setActiveSubmenu(null)}
                                className="inline-flex items-center gap-1 font-bold text-xs text-primary hover:text-secondary transition-colors group/view"
                              >
                                <span>View all products</span>
                                <ArrowRight className="w-3.5 h-3.5 group-hover/view:translate-x-0.5 transition-transform" />
                              </Link>
                            </div>

                            {/* Sub-Items Grid with small descriptions */}
                            <div className="grid grid-cols-2 gap-2.5">
                              {productCategoriesToDisplay.map((cat) => (
                                <Link
                                  key={cat.name}
                                  href={cat.href}
                                  onClick={() => setActiveSubmenu(null)}
                                  className="group/card flex items-start gap-3 p-2.5 rounded border border-slate-100 bg-white hover:border-primary/50 hover:bg-blue-50/20 hover:shadow-sm transition-all text-left"
                                >
                                  {/* Thumbnail */}
                                  <div className="relative w-12 h-11 rounded-sm overflow-hidden bg-slate-50 border border-slate-100 shrink-0 flex items-center justify-center mt-0.5">
                                    <CategoryThumbnail
                                      image={cat.image}
                                      alt={cat.name}
                                      iconSize="w-5 h-5"
                                    />
                                  </div>

                                  {/* Category Title + Small Engineering Description */}
                                  <div className="flex-1 min-w-0">
                                    <span className="text-xs font-bold text-slate-800 group-hover/card:text-primary transition-colors leading-tight line-clamp-1 block">
                                      {cat.name}
                                    </span>
                                    <p className="text-[11px] text-slate-500 font-normal leading-tight mt-1 line-clamp-1 group-hover/card:text-slate-600">
                                      {cat.description}
                                    </p>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    )}

                    {/* Standard Dropdown for other links */}
                    {link.submenu && link.name !== 'Our Products' && (
                      <AnimatePresence>
                        {activeSubmenu === link.name && (
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 8 }}
                            className="absolute top-full left-0 w-64 bg-white shadow-xl rounded-md border border-slate-100 border-t-[3px] border-t-primary py-2 mt-1 z-50 overflow-hidden"
                          >
                            {link.submenu.map((sub) => (
                              <Link
                                key={sub.name}
                                href={sub.href}
                                onClick={() => setActiveSubmenu(null)}
                                className="block px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-blue-50/60 hover:text-primary border-l-3 border-transparent hover:border-primary transition-all uppercase"
                              >
                                <span>{sub.name}</span>
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Search and Get a Quote CTA on the Right */}
            <div className="flex items-center space-x-2 sm:space-x-3.5">
              {/* Expandable Search Input */}
              <div className="hidden lg:flex items-center">
                <AnimatePresence mode="wait">
                  {searchOpen ? (
                    <motion.form
                      key="search-form"
                      onSubmit={handleSearch}
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 260, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                      className="flex items-center overflow-hidden border-b-2 border-primary bg-slate-50/60 px-1 rounded-t-sm"
                    >
                      <Search className="w-4 h-4 text-primary mx-2 shrink-0" />
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search equipment..."
                        className="flex-1 py-1.5 pr-2 text-sm font-medium text-slate-800 outline-none bg-transparent placeholder-slate-400 min-w-0"
                      />
                      {searchQuery && (
                        <button
                          type="submit"
                          className="shrink-0 p-1 mr-1 text-primary hover:text-secondary transition-colors"
                          title="Search"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setSearchOpen(false)}
                        className="shrink-0 p-1 text-slate-400 hover:text-slate-700 transition-colors"
                        aria-label="Close search"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </motion.form>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSearchOpen(true)}
                      className="p-2 text-slate-600 hover:text-primary hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                      aria-label="Open search"
                      title="Search products"
                    >
                      <Search className="w-5 h-5" />
                    </button>
                  )}
                </AnimatePresence>
              </div>

              {/* Primary CTA Button: "Get a Quote" (44–48px height) */}
              <Link href="/contact" className="hidden sm:inline-flex">
                <button
                  type="button"
                  className="h-[44px] px-5 sm:px-6 bg-primary hover:bg-[#003d8f] text-white font-semibold text-[14px] sm:text-[15px] rounded shadow-[0_4px_14px_0_rgba(0,74,173,0.25)] hover:shadow-[0_6px_20px_0_rgba(0,74,173,0.35)] transition-all duration-300 flex items-center justify-center group cursor-pointer tracking-wide"
                >
                  <span>Get a Quote</span>
                  <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform shrink-0" />
                </button>
              </Link>

              {/* Mobile Hamburger Menu Button */}
              <button
                className="xl:hidden p-2 text-slate-700 hover:text-primary transition-colors cursor-pointer rounded-md hover:bg-slate-100"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* ── Mobile Menu Drawer ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="xl:hidden bg-white border-b border-slate-200 overflow-hidden shadow-2xl max-h-[85vh] overflow-y-auto"
          >
            <div className="px-4 pt-3 pb-6 space-y-1">
              {/* Mobile Search Bar */}
              <form
                onSubmit={handleSearch}
                className="flex items-center border border-slate-200 rounded bg-slate-50 mb-3 px-3 py-2 sm:py-2.5 gap-2"
              >
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search testing equipment..."
                  className="flex-1 text-sm font-medium text-slate-800 outline-none bg-transparent placeholder-slate-400"
                />
                {searchQuery && (
                  <button type="submit" className="shrink-0 p-1 text-primary">
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </form>

              {/* Navigation Links */}
              {dynamicNavLinks.map((link) => {
                const active = isLinkActive(link.href);
                return (
                  <div key={link.name} className="border-b border-slate-100 last:border-b-0 py-1">
                    {link.name === 'Our Products' ? (
                      <div>
                        {/* Products Accordion Toggle */}
                        <button
                          type="button"
                          onClick={() => setActiveSubmenu(activeSubmenu === link.name ? null : link.name)}
                          className={`w-full flex justify-between items-center rounded p-3 text-left transition-colors cursor-pointer ${
                            activeSubmenu === link.name ? 'bg-blue-50/70 text-primary' : 'text-slate-800 hover:bg-slate-50'
                          }`}
                          aria-expanded={activeSubmenu === link.name}
                        >
                          <span className={`text-base font-semibold uppercase tracking-tight ${active ? 'text-primary font-bold' : 'text-slate-800'}`}>
                            Products
                          </span>
                          <ChevronDown
                            className={`w-5 h-5 transition-transform duration-300 ${
                              activeSubmenu === link.name ? 'rotate-180 text-primary' : 'text-slate-500'
                            }`}
                          />
                        </button>

                        {/* Products Category Grid */}
                        {activeSubmenu === link.name && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-l-[3px] border-t-[3px] border-primary pl-3 sm:pl-4 pt-3 pb-2 mt-2"
                          >
                            <div className="mb-3">
                              <div className="inline-block relative pb-1.5">
                                <span className="text-primary font-bold text-sm tracking-wide">
                                  Product Categories
                                </span>
                                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-full" />
                              </div>
                            </div>

                            {/* 2-Column Grid */}
                            <div className="grid grid-cols-2 gap-2">
                              {productCategoriesToDisplay.map((cat) => (
                                <Link
                                  key={cat.name}
                                  href={cat.href}
                                  onClick={() => setMobileMenuOpen(false)}
                                  className="group/mcard flex items-start gap-2 p-2 rounded border border-slate-100 bg-white hover:border-primary/60 hover:shadow-sm transition-all text-left"
                                >
                                  <div className="relative w-11 h-10 rounded-sm overflow-hidden bg-slate-50 border border-slate-100 shrink-0 flex items-center justify-center mt-0.5">
                                    <CategoryThumbnail
                                      image={cat.image}
                                      alt={cat.name}
                                      iconSize="w-4 h-4"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <span className="text-[11px] font-bold text-slate-800 group-hover/mcard:text-primary leading-tight line-clamp-1 block">
                                      {cat.name}
                                    </span>
                                    <p className="text-[10px] text-slate-400 font-normal leading-tight mt-0.5 line-clamp-1">
                                      {cat.description}
                                    </p>
                                  </div>
                                </Link>
                              ))}
                            </div>

                            {/* View All Products Link */}
                            <div className="mt-3.5 pt-2.5 border-t border-slate-100">
                              <Link
                                href="/products"
                                onClick={() => setMobileMenuOpen(false)}
                                className="inline-flex items-center gap-1.5 font-bold text-xs text-primary hover:underline"
                              >
                                <span>View all products</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </Link>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <div className="flex justify-between items-center">
                          <Link
                            href={link.href}
                            className={`flex-1 py-2.5 px-2 text-base font-semibold tracking-tight uppercase transition-colors ${
                              active ? 'text-primary font-bold' : 'text-slate-800 hover:text-primary'
                            }`}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <span>{link.name}</span>
                          </Link>
                          {link.submenu && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveSubmenu(activeSubmenu === link.name ? null : link.name);
                              }}
                              className="p-2.5 text-slate-500 hover:text-primary transition-colors flex items-center justify-center cursor-pointer"
                              aria-label={`Toggle ${link.name} submenu`}
                            >
                              <ChevronDown
                                className={`w-5 h-5 transition-transform duration-300 ${
                                  activeSubmenu === link.name ? 'rotate-180 text-primary' : ''
                                }`}
                              />
                            </button>
                          )}
                        </div>

                        {link.submenu && activeSubmenu === link.name && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-slate-50 pl-3 pr-2 py-2 mb-2 border-l-2 border-primary rounded-r-sm"
                          >
                            {link.submenu.map((sub) => (
                              <Link
                                key={sub.name}
                                href={sub.href}
                                className="block px-3 py-2 text-sm font-semibold text-slate-700 hover:text-primary border-b border-slate-100 last:border-b-0 uppercase transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                <span>{sub.name}</span>
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Mobile Drawer Bottom Actions: Get a Quote CTA & Contact details */}
              <div className="pt-4 px-1 flex flex-col space-y-3">
                <Link
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full"
                >
                  <button
                    type="button"
                    className="w-full h-12 bg-primary hover:bg-[#003d8f] text-white font-bold text-sm rounded shadow-md flex items-center justify-center gap-2 group transition-all duration-300 cursor-pointer uppercase tracking-wider"
                  >
                    <span>Get a Quote</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>

                <div className="pt-3 space-y-2.5 border-t border-slate-100">
                  <a
                    href={`tel:${settings?.communication?.supportPhone || '+919565453120'}`}
                    className="flex items-center text-slate-800 text-xs font-semibold hover:text-primary transition-colors"
                  >
                    <Phone className="w-4 h-4 mr-2.5 text-primary shrink-0" />
                    <span className="font-bold mr-1 text-slate-500">Support:</span>
                    <span className="font-bold">{settings?.communication?.supportPhone || '+91-9565453120'}</span>
                  </a>
                  <a
                    href={`tel:${settings?.communication?.salesPhone || '+919354572961'}`}
                    className="flex items-center text-slate-800 text-xs font-semibold hover:text-primary transition-colors"
                  >
                    <Phone className="w-4 h-4 mr-2.5 text-primary shrink-0" />
                    <span className="font-bold mr-1 text-slate-500">Sales:</span>
                    <span className="font-bold">{settings?.communication?.salesPhone || '+91-93545-72961'}</span>
                  </a>
                  <a
                    href={`mailto:${settings?.communication?.supportEmail || 'info@labzenix.com'}`}
                    className="flex items-center text-slate-600 text-xs font-medium hover:text-primary transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 mr-2.5 text-primary shrink-0" />
                    <span>{settings?.communication?.supportEmail || 'info@labzenix.com'}</span>
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
