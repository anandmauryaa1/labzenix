'use client';

import { useState, useEffect } from 'react';

export interface AboutContent {
  subtitle?: string;
  title?: string;
  titleHighlight?: string;
  description?: string;
}

export default function AboutSummary({ initialContent }: { initialContent?: AboutContent | null }) {
  const content = initialContent;

  if (!content) return null;

  return (
    <section className="py-14 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <span className="block text-primary font-medium tracking-[0.3em] uppercase text-sm text-center mb-4">{content.subtitle || 'Precision & Quality'}</span>
        <h2 className="text-4xl md:text-5xl font-black mb-10 text-center text-secondary uppercase tracking-tight">{content.title || 'About'} <span className="text-primary"> {content.titleHighlight || 'LabZenix'} </span></h2>
        <div className="w-24 h-2 bg-primary mx-auto mb-10" />
        <div 
          className="text-lg md:text-xl shadow-md p-4 text-gray text-center mx-auto leading-relaxed font-normal [&>p]:mb-6"
          dangerouslySetInnerHTML={{ __html: content.description || '' }}
        />
      </div>
    </section>
  );
}
