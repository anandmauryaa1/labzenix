'use client';

import { useState, useEffect } from 'react';

export default function AboutSummary() {
  const [content, setContent] = useState<{
    subtitle?: string;
    title?: string;
    titleHighlight?: string;
    description?: string;
  } | null>(null);

  useEffect(() => {
    fetch('/api/about-content')
      .then(res => res.ok ? res.json() : null)
      .then(data => setContent(data))
      .catch(err => console.error('Fetch error:', err));
  }, []);

  if (!content) return null;

  return (
    <section className="py-14 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <span className="block text-primary font-medium tracking-[0.3em] uppercase text-sm text-center mb-4">{content.subtitle || 'Precision & Quality'}</span>
        <h2 className="text-4xl md:text-5xl font-black mb-10 text-center text-secondary uppercase tracking-tight">{content.title || 'About'} <span className="text-primary"> {content.titleHighlight || 'LabZenix'} </span></h2>
        <div className="w-24 h-2 bg-primary mx-auto mb-10" />
        <div 
          className="text-xl md:text-2xl text-gray-700 text-center max-w-4xl mx-auto leading-relaxed font-medium [&>p]:mb-6"
          dangerouslySetInnerHTML={{ __html: content.description || '' }}
        />
      </div>
    </section>
  );
}
