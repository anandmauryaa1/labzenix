'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Mail, Search, Menu, X, ChevronDown, ArrowRight, PhoneCall } from 'lucide-react';
import Button from '../ui/Button';

interface NavLink {
  name: string;
  href: string;
  submenu?: { name: string; href: string; }[];
}

const navLinks: NavLink[] = [
  { name: 'Home', href: '/' },
  {
    name: 'Our Products',
    href: '/products',
  },
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

  useEffect(() => {
    fetch('/api/settings').then(res => res.json()).then(data => setSettings(data)).catch(console.error);
    fetch('/api/categories').then(res => res.json()).then(data => setCategories(Array.isArray(data) ? data : [])).catch(console.error);
    fetch('/api/application-categories').then(res => res.json()).then(data => setAppCategories(Array.isArray(data) ? data : [])).catch(console.error);
  }, []);

  const dynamicNavLinks = navLinks.map(link => {
    if (link.name === 'Our Products') {
      return {
        ...link,
        submenu: categories.map(cat => ({
          name: cat.name,
          href: cat.slug ? `/category/${cat.slug}` : `/products?category=${encodeURIComponent(cat.name)}`
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
    const handleScroll = () => setScrolled(window.scrollY > 40);
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

  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!headerRef.current) return;
    const update = () => {
      if (headerRef.current) {
        const height = headerRef.current.getBoundingClientRect().height;
        document.documentElement.style.setProperty('--header-height', `${height}px`);
      }
    };
    update();

    const observer = new ResizeObserver(() => {
      update();
    });
    observer.observe(headerRef.current);
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update);
    return () => {
      observer.disconnect();
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

  return (
    <header ref={headerRef} className="fixed top-0 w-full z-50 transition-all duration-300">
      {/* Top Bar */}
      <div className="bg-primary text-white py-1.5 sm:py-2">
        <div className="w-full sm:w-[90%] mx-auto px-[5px] sm:px-4 flex justify-between items-center text-xs sm:text-sm font-semibold">
          <div className="flex items-center gap-2.5 sm:gap-4 lg:gap-6 min-w-0">
            <a
              href={`tel:${settings?.communication?.supportPhone || '+919565453120'}`}
              className="flex items-center hover:text-white/80 transition-colors group shrink-0"
            >
              <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5 flex-shrink-0 text-white group-hover:scale-110 transition-transform" />
              <span className="font-extrabold text-[11px] sm:text-xs md:text-sm tracking-tight">{settings?.communication?.supportPhone || '+91-9565453120'}</span>
            </a>
            <span className="text-white/30 hidden sm:inline select-none">|</span>
            <a
              href={`tel:${settings?.communication?.salesPhone || '+919354572961'}`}
              className="hidden sm:flex items-center hover:text-white/80 transition-colors group shrink-0"
            >
              <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5 flex-shrink-0 text-white group-hover:scale-110 transition-transform" />
              <span className="font-extrabold text-[11px] sm:text-xs md:text-sm tracking-tight">{settings?.communication?.salesPhone || '+91-93545-72961'}</span>
            </a>
            <span className="text-white/30 hidden lg:inline select-none">|</span>
            <a
              href={`mailto:${settings?.communication?.supportEmail || 'info@labzenix.com'}`}
              className="hidden lg:flex items-center hover:text-white/80 transition-colors group shrink-0"
            >
              <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 flex-shrink-0 text-white group-hover:scale-110 transition-transform" />
              <span className="font-bold text-xs sm:text-sm">{settings?.communication?.supportEmail || 'info@labzenix.com'}</span>
            </a>
          </div>
          <div className="flex items-center space-x-3 shrink-0">
            <Link
              href="/contact"
              className="bg-white/15 hover:bg-white/25 text-white px-2.5 sm:px-3.5 py-1 text-[11px] sm:text-xs font-extrabold uppercase tracking-wider transition-all flex items-center gap-1 whitespace-nowrap group"
            >
              <span>Get a Quote</span>
              <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className={`transition-all duration-300 ${scrolled
        ? 'bg-white/90 backdrop-blur-md shadow-md py-1.5 sm:py-2 border-b border-gray-100'
        : 'bg-white/95 py-2 sm:py-2.5 md:py-3'
        }`}>
        <div className="w-full sm:w-[90%] mx-auto px-[5px] sm:px-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 flex-shrink-0" aria-label="LabZenix - Home">
              <Image
                src="/logo.webp"
                alt="LabZenix Logo"
                width={240}
                height={90}
                className={`${scrolled ? 'h-10 sm:h-12 md:h-14 lg:h-16' : 'h-12 sm:h-16 md:h-18 lg:h-20 xl:h-22'} w-auto object-contain transition-all duration-300`}
                priority
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden xl:flex items-center space-x-4 2xl:space-x-7" aria-label="Main Navigation">
              {dynamicNavLinks.map((link) => (
                <div
                  key={link.name}
                  className="relative group py-2.5"
                  onMouseEnter={() => link.submenu && setActiveSubmenu(link.name)}
                  onMouseLeave={() => setActiveSubmenu(null)}
                >
                  <Link
                    href={link.href}
                    className="text-[15px] xl:text-[16px] 2xl:text-[17px] font-bold text-secondary hover:text-primary transition-colors flex items-center tracking-tight uppercase py-1"
                    aria-haspopup={link.submenu ? 'true' : 'false'}
                    aria-expanded={activeSubmenu === link.name}
                  >
                    <span className="uppercase">{link.name}</span>
                    {link.submenu && <ChevronDown className="w-4 h-4 ml-1 group-hover:rotate-180 transition-transform flex-shrink-0" aria-hidden="true" />}
                  </Link>

                  {link.submenu && (
                    <AnimatePresence>
                      {activeSubmenu === link.name && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute top-full left-0 w-64 bg-white shadow-xl border border-gray-100 py-2 mt-1"
                        >
                          {link.submenu.map((sub) => (
                            <Link
                              key={sub.name}
                              href={sub.href}
                              className="block px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-primary border-l-4 border-transparent hover:border-primary transition-all uppercase"
                            >
                              <span className="uppercase">{sub.name}</span>
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* ── Expandable Search ────────────────────────── */}
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
                      className="flex items-center overflow-hidden border-b-2 border-primary bg-transparent"
                    >
                      <Search className="w-4 h-4 text-primary mx-2 flex-shrink-0" />
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search products..."
                        className="flex-1 py-1.5 pr-2 text-sm sm:text-base font-medium text-secondary outline-none bg-transparent placeholder-gray-400 min-w-0"
                      />
                      {searchQuery && (
                        <button
                          type="submit"
                          className="flex-shrink-0 p-1 mr-1 text-primary hover:text-secondary transition-colors"
                          title="Search"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setSearchOpen(false)}
                        className="flex-shrink-0 p-1 text-gray-400 hover:text-secondary transition-colors"
                        aria-label="Close search"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </motion.form>
                  ) : (
                    <motion.button
                      key="search-icon"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setSearchOpen(true)}
                      className="p-1.5 sm:p-2 text-gray-700 hover:text-primary transition-colors rounded-sm hover:bg-gray-100"
                      aria-label="Open search"
                    >
                      <Search className="w-5 h-5 sm:w-6 sm:h-6" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              <Link href="/contact" className="hidden md:block">
                <Button variant="primary" size="md" className="font-bold text-xs sm:text-sm lg:text-[15px] tracking-wide px-4 sm:px-6 py-2 sm:py-2.5 shadow-md flex items-center group uppercase">
                  <PhoneCall className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform flex-shrink-0" />
                  <span>Contact Now</span>
                </Button>
              </Link>

              {/* Mobile Menu Button */}
              <button
                className="xl:hidden p-1.5 sm:p-2 text-secondary hover:text-primary transition-colors cursor-pointer"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-6 h-6 sm:w-7 sm:h-7" /> : <Menu className="w-6 h-6 sm:w-7 sm:h-7" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="xl:hidden bg-white border-b border-gray-100 overflow-hidden shadow-2xl max-h-[80vh] overflow-y-auto"
          >
            <div className="px-4 pt-3 pb-6 space-y-1">
              {/* Mobile Search Bar */}
              <form
                onSubmit={handleSearch}
                className="flex items-center border border-gray-200 bg-gray-50 mb-3 px-3 py-2 sm:py-2.5 gap-2"
              >
                <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="flex-1 text-sm sm:text-base font-medium text-secondary outline-none bg-transparent placeholder-gray-400"
                />
                {searchQuery && (
                  <button type="submit" className="flex-shrink-0 p-1 text-primary">
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </form>

              {dynamicNavLinks.map((link) => (
                <div key={link.name} className="border-b border-gray-100 last:border-b-0">
                  <div className="flex justify-between items-center">
                    <Link
                      href={link.href}
                      className="flex-1 py-2.5 sm:py-3 px-2 text-base sm:text-lg font-bold text-gray-800 hover:text-primary transition-colors uppercase"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="uppercase">{link.name}</span>
                    </Link>
                    {link.submenu && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveSubmenu(activeSubmenu === link.name ? null : link.name);
                        }}
                        className="p-2.5 text-secondary hover:text-primary transition-colors flex items-center justify-center cursor-pointer"
                        aria-label={`Toggle ${link.name} submenu`}
                      >
                        <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${activeSubmenu === link.name ? 'rotate-180 text-primary' : ''}`} />
                      </button>
                    )}
                  </div>

                  {link.submenu && activeSubmenu === link.name && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="bg-gray-50 pl-3 pr-2 py-1 mb-2 border-l-2 border-primary"
                    >
                      {link.submenu.map((sub) => (
                        <Link
                          key={sub.name}
                          href={sub.href}
                          className="block px-3 py-2 text-sm sm:text-base font-semibold text-gray-700 hover:text-primary border-b border-gray-100/70 last:border-b-0 uppercase transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <span className="uppercase">{sub.name}</span>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </div>
              ))}

              <div className="pt-3 px-2 flex flex-col space-y-3">
                <Link
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full"
                >
                  <Button variant="primary" size="md" className="w-full text-center font-bold text-sm sm:text-base py-3 shadow-md flex items-center justify-center gap-2 group uppercase">
                    <PhoneCall className="w-4 h-4 group-hover:scale-110 transition-transform flex-shrink-0" />
                    <span>Contact Now</span>
                  </Button>
                </Link>
                <div className="pt-2 space-y-2 border-t border-gray-100">
                  <a href={`tel:${settings?.communication?.supportPhone || '+919565453120'}`} className="flex items-center text-gray-800 text-xs sm:text-sm font-semibold hover:text-primary transition-colors">
                    <Phone className="w-4 h-4 mr-2.5 text-primary flex-shrink-0" />
                    <span className="font-bold mr-1.5 text-secondary">Support:</span>
                    <span className="font-bold">{settings?.communication?.supportPhone || '+91-9565453120'}</span>
                  </a>
                  <a href={`tel:${settings?.communication?.salesPhone || '+919354572961'}`} className="flex items-center text-gray-800 text-xs sm:text-sm font-semibold hover:text-primary transition-colors">
                    <Phone className="w-4 h-4 mr-2.5 text-primary flex-shrink-0" />
                    <span className="font-bold mr-1.5 text-secondary">Sales:</span>
                    <span className="font-bold">{settings?.communication?.salesPhone || '+91-93545-72961'}</span>
                  </a>
                  <a href={`mailto:${settings?.communication?.supportEmail || 'info@labzenix.com'}`} className="flex items-center text-gray-600 text-xs sm:text-sm font-medium hover:text-primary transition-colors">
                    <Mail className="w-3.5 h-3.5 mr-2.5 text-primary flex-shrink-0" />
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
