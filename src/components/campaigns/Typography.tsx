import React from 'react';

// Helper to format titles with alternating black/primary colors, uppercase and very bold
export const formatTitle = (title: string, highlightClass = 'text-primary', baseClass = 'text-slate-900') => {
  if (!title) return null;
  const words = title.split(' ');
  return (
    <>
      {words.map((word, index) => (
        <span key={index} className={index % 2 === 1 ? highlightClass : baseClass}>
          {word}{' '}
        </span>
      ))}
    </>
  );
};

// Section Header component to standardize typography and visual structure across campaigns
export const SectionHeader = ({
  title,
  subtitle,
  topText,
  align = 'center',
  dark = false,
}: {
  title: string;
  subtitle?: string;
  topText?: string;
  align?: 'center' | 'left';
  dark?: boolean;
}) => (
  <div className={`mb-12 ${align === 'center' ? 'text-center max-w-3xl mx-auto' : 'max-w-3xl'}`}>
    {topText && (
      <div className="inline-flex items-center space-x-2 mb-3">
        <span className="h-2 w-2 bg-primary rounded-none animate-pulse"></span>
        <span className={`text-xs font-black tracking-[0.25em] uppercase px-3 py-1 rounded-none border ${
          dark 
            ? 'bg-primary/20 text-blue-400 border-primary/40' 
            : 'bg-primary/10 text-primary border-primary/20'
        }`}>
          {topText}
        </span>
      </div>
    )}

    <h2 className={`text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight mb-4 leading-tight ${
      dark ? 'text-white' : 'text-slate-900'
    }`}>
      {formatTitle(title, 'text-primary', dark ? 'text-white' : 'text-slate-900')}
    </h2>

    {subtitle && (
      <p className={`text-base md:text-lg leading-relaxed ${
        dark ? 'text-slate-400' : 'text-slate-600'
      }`}>
        {subtitle}
      </p>
    )}

    {align === 'center' && (
      <div className="w-16 h-1 bg-primary mx-auto mt-6 rounded-none"></div>
    )}
  </div>
);
