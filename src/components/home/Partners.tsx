'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import FadeIn from '../ui/FadeIn';

interface Partner {
  _id: string;
  name: string;
  logo: string;
  website?: string;
}

export default function Partners() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const res = await fetch('/api/partners?active=true');
        if (res.ok) {
          const data = await res.json();
          setPartners(data);
        }
      } catch (error) {
        console.error('Failed to fetch partners:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPartners();
  }, []);

  if (loading || partners.length === 0) return null;

  return (
    <section className="py-20 px-4 bg-white overflow-hidden border-t border-gray-100">
      <div className="max-w-7xl mx-auto">
        <FadeIn direction="up">
          <div className="text-center mb-12">
            <span className="text-primary font-bold tracking-widest uppercase text-sm">Trusted By</span>
            <h2 className="text-3xl md:text-4xl font-black text-secondary mt-2 uppercase tracking-tighter">Our Partners</h2>
          </div>
        </FadeIn>

        <FadeIn direction="up" delay={0.2}>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            {partners.map((partner) => (
              <a
                key={partner._id}
                href={partner.website || '#'}
                target={partner.website ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="relative group w-32 h-20 md:w-48 md:h-24 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100"
              >
                <Image
                  src={partner.logo}
                  alt={partner.name}
                  fill
                  className="object-contain transform group-hover:scale-110 transition-transform duration-300"
                />
              </a>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
