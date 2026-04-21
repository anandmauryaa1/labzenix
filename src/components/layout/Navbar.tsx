'use client';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Mail, Search, Menu, X, ChevronDown, ArrowRight } from 'lucide-react';
import Button from '../ui/Button';

const navLinks = [
  { name: 'Home', href: '/' },
  { 
    name: 'Products', 
    href: '/products',
    // submenu: [
    //   { name: 'Paper & Packaging', href: '/products?category=paper-packaging' },
    //   { name: 'PET & Preform', href: '/products?category=pet-preform' },
    //   { name: 'Plastic & Poly', href: '/products?category=plastic-poly' },
    //   { name: 'Paint & Coating', href: '/products?category=paint-coating' },
    // ]
  },
  { name: 'About Us', href: '/about' },
  { name: 'Blog', href: '/blogs' },
  { name: 'Contact', href: '/contact' },
];

export default function Navbar() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [settings, setSettings] = useState<any>(null);

  // Search state
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/settings').then(res => res.json()).then(data => setSettings(data)).catch(console.error);
  }, []);

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

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    setSearchOpen(false);
    router.push(`/products?search=${encodeURIComponent(q)}`);
  };

  return (
    <header className="fixed top-0 w-full z-50 transition-all duration-300">
      {/* Top Bar */}
      <div className="bg-primary text-white py-2 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-sm font-medium">
          <div className="flex items-center space-x-6">
            <a href={`tel:${settings?.communication?.supportPhone || '+919565453120'}`} className="flex items-center hover:text-gray-200 transition-colors">
              <Phone className="w-3.5 h-3.5 mr-2" />
              <span>{settings?.communication?.supportPhone || '+91-9565453120'}</span>
            </a>
            <a href={`mailto:${settings?.communication?.supportEmail || 'info@labzenix.com'}`} className="hidden lg:flex items-center hover:text-gray-200 transition-colors">
              <Mail className="w-3.5 h-3.5 mr-2" />
              <span>{settings?.communication?.supportEmail || 'info@labzenix.com'}</span>
            </a>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/contact" className="hover:underline">Get a Quote</Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className={`transition-all duration-500 ${
        scrolled 
          ? 'bg-white/80 backdrop-blur-md shadow-lg py-2 border-b border-gray-100' 
          : 'bg-white/95 py-5'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
              <img src="/logo.webp" alt="LabZenix" className="h-10 md:h-12 w-auto" />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden xl:flex items-center space-x-8">
              {navLinks.map((link) => (
                <div 
                  key={link.name} 
                  className="relative group py-4"
                  onMouseEnter={() => link.submenu && setActiveSubmenu(link.name)}
                  onMouseLeave={() => setActiveSubmenu(null)}
                >
                  <Link 
                    href={link.href}
                    className="text-sm font-normal text-secondary hover:text-primary transition-colors flex items-center"
                  >
                    {link.name}
                    {link.submenu && <ChevronDown className="w-4 h-4 ml-1 group-hover:rotate-180 transition-transform" />}
                  </Link>

                  {link.submenu && (
                    <AnimatePresence>
                      {activeSubmenu === link.name && (
                        <motion.div
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 15 }}
                          className="absolute top-full left-0 w-64 bg-white shadow-xl border border-gray-100 py-4 mt-1"
                        >
                          {link.submenu.map((sub) => (
                            <Link
                              key={sub.name}
                              href={sub.href}
                              className="block px-6 py-3 text-sm font-normal text-gray-700 hover:bg-gray-50 hover:text-primary border-l-4 border-transparent hover:border-primary transition-all"
                            >
                              {sub.name}
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
            <div className="flex items-center space-x-3">
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
                        className="flex-1 py-2 pr-2 text-sm font-medium text-secondary outline-none bg-transparent placeholder-gray-400 min-w-0"
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
                        title="Close"
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
                      className="p-2 text-gray-600 hover:text-primary transition-colors rounded-sm hover:bg-gray-100"
                      title="Search products"
                    >
                      <Search className="w-5 h-5" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              <Link href="/contact" className="hidden md:block">
                <Button variant="primary" size="sm" className="font-normal">Contact Now</Button>
              </Link>
              
              {/* Mobile Menu Button */}
              <button 
                className="xl:hidden p-2 text-secondary"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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
            className="xl:hidden bg-white border-b border-gray-100 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              {/* Mobile Search Bar */}
              <form
                onSubmit={handleSearch}
                className="flex items-center border border-gray-200 bg-gray-50 mb-3 px-4 py-3 gap-2"
              >
                <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="flex-1 text-sm font-medium text-secondary outline-none bg-transparent placeholder-gray-400"
                />
                {searchQuery && (
                  <button type="submit" className="flex-shrink-0 p-1 text-primary">
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </form>

              {navLinks.map((link) => (
                <div key={link.name}>
                  <div className="flex justify-between items-center border-b border-gray-50">
                    <Link
                      href={link.href}
                      className="block px-3 py-4 text-base font-normal text-gray-700 hover:text-primary"
                      onClick={() => !link.submenu && setMobileMenuOpen(false)}
                    >
                      {link.name}
                    </Link>
                    {link.submenu && (
                      <button 
                        onClick={() => setActiveSubmenu(activeSubmenu === link.name ? null : link.name)}
                        className="px-4 py-4 text-secondary"
                      >
                        <ChevronDown className={`w-5 h-5 transition-transform ${activeSubmenu === link.name ? 'rotate-180' : ''}`} />
                      </button>
                    )}
                  </div>
                  
                  {link.submenu && activeSubmenu === link.name && (
                    <motion.div 
                      initial={{ height: 0 }} 
                      animate={{ height: 'auto' }} 
                      className="bg-gray-50 pl-4"
                    >
                      {link.submenu.map((sub) => (
                        <Link
                          key={sub.name}
                          href={sub.href}
                          className="block px-4 py-3 text-sm font-normal text-gray-600 border-b border-white hover:text-primary"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </div>
              ))}
              <div className="pt-4 px-3 flex flex-col space-y-4">
                <a href={`tel:${settings?.communication?.supportPhone || '+919565453120'}`} className="flex items-center text-gray-600">
                  <Phone className="w-4 h-4 mr-3" />
                  <span>{settings?.communication?.supportPhone || '+91-9565453120'}</span>
                </a>
                <a href={`mailto:${settings?.communication?.supportEmail || 'info@labzenix.com'}`} className="flex items-center text-gray-600">
                  <Mail className="w-4 h-4 mr-3" />
                  <span>{settings?.communication?.supportEmail || 'info@labzenix.com'}</span>
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
