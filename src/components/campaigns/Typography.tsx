import React from 'react';

// Helper to format titles with alternating black/primary colors, uppercase and very bold
export const formatTitle = (title: string) => {
  if (!title) return null;
  const words = title.split(' ');
  return (
    <>
      {words.map((word, index) => (
        <span key={index} className={index % 2 === 1 ? 'text-primary' : 'text-black'}>
          {word}{' '}
        </span>
      ))}
    </>
  );
};

// Section Header component to standardize the typography
export const SectionHeader = ({ title, subtitle, topText }: { title: string, subtitle?: string, topText?: string }) => (
  <div className="text-center mb-16">
    {(topText || subtitle) && (
      <div className="text-primary font-semibold tracking-[0.2em] uppercase text-sm mb-4">
        {topText || "OUR SERIES"}
      </div>
    )}
    <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-6">
      {formatTitle(title)}
    </h2>
    {subtitle && (
      <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
        {subtitle}
      </p>
    )}
  </div>
);
