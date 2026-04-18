'use client';

import { useEffect, useState } from 'react';

interface SEOMetricsProps {
  text: string;
  min: number;
  max: number;
  label: string;
}

export default function SEOMetrics({ text, min, max, label }: SEOMetricsProps) {
  const [strength, setStrength] = useState(0);
  const [color, setColor] = useState('bg-gray-200');
  const length = text?.length || 0;

  useEffect(() => {
    // Calculate percentage based on max
    const percentage = Math.min((length / max) * 100, 100);
    setStrength(percentage);

    if (length === 0) {
      setColor('bg-gray-200');
    } else if (length < min) {
      setColor('bg-orange-500');
    } else if (length <= max) {
      setColor('bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]');
    } else {
      setColor('bg-red-500');
    }
  }, [length, min, max]);

  return (
    <div className="space-y-1.5 w-full">
      <div className="flex justify-between items-end">
        <span className="text-[9px] font-black uppercase tracking-[0.15em] text-gray-400">{label}</span>
        <span className={`text-[10px] font-black transition-colors ${
          length > max ? 'text-red-500' : length >= min ? 'text-green-600' : 'text-gray-400'
        }`}>
          {length} / {max}
        </span>
      </div>
      <div className="h-1 w-full bg-gray-100 overflow-hidden">
        <div 
          className={`h-full transition-all duration-500 ease-out ${color}`}
          style={{ width: `${strength}%` }}
        />
      </div>
    </div>
  );
}
