'use client';

import React, { useState, useEffect } from 'react';
import { ArrowUpRight, Phone, Download, ShieldCheck, ChevronRight } from 'lucide-react';

interface CampaignStickyNavProps {
  title?: string;
  sections?: { id: string; label: string }[];
}

export default function CampaignStickyNav({
  title = 'Bursting Strength Tester',
  sections = [
    { id: 'overview', label: 'Overview' },
    { id: 'features', label: 'Features' },
    { id: 'specifications', label: 'Specs' },
    { id: 'comparison', label: 'Comparison' },
    { id: 'applications', label: 'Applications' },
    { id: 'faqs', label: 'FAQs' },
  ]
}: CampaignStickyNavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 300);

      // Simple active section detection
      const scrollPos = window.scrollY + 120;
      for (const sec of sections) {
        const el = document.getElementById(sec.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(sec.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  return (
    <div
      className={`sticky top-0 z-40 w-full transition-all duration-300 border-b ${
        scrolled
          ? 'bg-slate-900/95 backdrop-blur-md text-white border-slate-800 shadow-xl py-2.5'
          : 'bg-white text-slate-800 border-slate-200 py-3'
      }`}
    >
      <div className="container mx-auto px-4 max-w-7xl flex items-center justify-between font-display">
        
        {/* Title / Brand badge */}
        <div className="flex items-center space-x-3 truncate mr-4">
          <span className={`hidden sm:inline-flex text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-none ${
            scrolled ? 'bg-primary text-white' : 'bg-primary/10 text-primary border border-primary/20'
          }`}>
            LABZENIX SERIES
          </span>
          <h2 className="text-sm md:text-base font-black uppercase tracking-tight truncate max-w-[200px] md:max-w-xs">
            {title}
          </h2>
        </div>

        {/* Links */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 text-xs font-bold uppercase tracking-wider">
          {sections.map((sec) => (
            <a
              key={sec.id}
              href={`#${sec.id}`}
              className={`px-3 py-1.5 transition-colors rounded-none ${
                activeSection === sec.id
                  ? 'text-primary border-b-2 border-primary font-black'
                  : scrolled
                  ? 'text-slate-300 hover:text-white'
                  : 'text-slate-600 hover:text-primary'
              }`}
            >
              {sec.label}
            </a>
          ))}
        </nav>

        {/* CTA Actions */}
        <div className="flex items-center space-x-2 shrink-0">
          <a
            href="tel:+919565453120"
            className={`hidden xl:flex items-center text-xs font-bold tracking-wider px-3 py-1.5 transition-colors ${
              scrolled ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-primary'
            }`}
          >
            <Phone className="w-3.5 h-3.5 mr-1.5 text-primary" />
            +91 9565453120
          </a>

          <a
            href="#enquiry"
            className="flex items-center space-x-1 px-4 py-2 bg-primary text-white text-xs font-black uppercase tracking-widest hover:bg-slate-950 transition-all shadow-md hover:shadow-primary/30 rounded-none border border-primary"
          >
            <span>Request Quote</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
