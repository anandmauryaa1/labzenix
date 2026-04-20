'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Mail, Search, Menu, X, ChevronDown } from 'lucide-react';
import Button from '../ui/Button';

const navLinks = [
  { name: 'Home', href: '/' },
  { 
    name: 'Products', 
    href: '/products',
    submenu: [
      { name: 'Paper & Packaging', href: '/products?category=paper-packaging' },
      { name: 'PET & Preform', href: '/products?category=pet-preform' },
      { name: 'Plastic & Poly', href: '/products?category=plastic-poly' },
      { name: 'Paint & Coating', href: '/products?category=paint-coating' },
    ]
  },
  { name: 'About Us', href: '/about' },
  { name: 'Blog', href: '/blogs' },
  { name: 'Contact', href: '/contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    fetch('/api/settings').then(res => res.json()).then(data => setSettings(data)).catch(console.error);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      <div className={`transition-all duration-300 ${scrolled ? 'bg-white shadow-md py-2' : 'bg-white/95 py-4'}`}>
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
            <div className="flex items-center space-x-4">
              <button className="hidden lg:flex p-2 text-gray-600 hover:text-primary transition-colors">
                <Search className="w-5 h-5" />
              </button>
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

