import Link from 'next/link';
import { Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-100 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center space-x-2">
              <img src="/logo.webp" alt="LabZenix" className="h-10 md:h-12 w-auto" />
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

          {/* Product Categories */}
          <div>
            <h3 className="text-sm font-black text-secondary mb-8 uppercase tracking-[0.2em] relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-8 after:h-1 after:bg-primary">
              Industries
            </h3>
            <ul className="space-y-4">
              {[
                'Paper & Packaging',
                'PET & Preform',
                'Plastic & Poly',
                'Paint & Coating',
                'Material Testing'
              ].map((item) => (
                <li key={item}>
                  <Link href="/products" className="text-gray-600 hover:text-primary transition-all flex items-center group font-normal text-sm uppercase tracking-wider">
                    <span className="w-0 group-hover:w-3 h-0.5 bg-primary mr-0 group-hover:mr-2 transition-all"></span>
                    {item}
                  </Link>
                </li>
              ))}
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
                <span className="text-gray-700 text-sm font-normal leading-relaxed">
                  123, Instrument Square,<br />
                  Industrial Area Phase II, Mohali,<br />
                  Punjab - 160062
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="w-5 h-5 text-primary mr-4 flex-shrink-0" />
                <a href="tel:+919565453120" className="text-gray-700 text-sm md:text-base font-normal hover:text-primary transition-colors">
                  +91-9565453120
                </a>
              </li>
              <li className="flex items-center">
                <Mail className="w-5 h-5 text-primary mr-4 flex-shrink-0" />
                <a href="mailto:info@labzenix.com" className="text-gray-700 text-sm md:text-base font-normal hover:text-primary transition-colors">
                  info@labzenix.com
                </a>
              </li>
            </ul>
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
