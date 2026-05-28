'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import FadeIn from '../ui/FadeIn';
import Button from '../ui/Button';

interface Application {
  _id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
}

export default function TestingApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/applications')
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        setApplications(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error('Fetch error:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || applications.length === 0) return null;

  return (
    <section className="py-14 px-4 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <FadeIn direction="up">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-full mb-4">
              Testing Applications
            </span>
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-1.5 h-10 bg-primary" />
              <h2 className="text-4xl md:text-5xl font-black text-secondary uppercase tracking-tighter">
                Complete Product Range
              </h2>
            </div>
            <p className="max-w-3xl mx-auto text-gray-500 font-medium leading-relaxed">
              Our Testing Instruments are in Strict Compliance to International Application that Makes Them Applicable in the International Markets As Well.
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {applications.map((app, index) => (
            <FadeIn key={app._id} direction="up" delay={index * 0.1}>
              <div className="group bg-white flex flex-col h-full border border-gray-50 hover:shadow-2xl transition-all duration-500 overflow-hidden">
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                  <Image 
                    src={app.image} 
                    alt={app.name} 
                    fill 
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-secondary/0 group-hover:bg-secondary/10 transition-colors duration-500" />
                </div>
                <div className="p-8 flex flex-col flex-1 items-center text-center">
                  <h3 className="text-xl font-black text-secondary group-hover:text-primary transition-colors leading-tight mb-6 uppercase tracking-tight">
                    {app.name}
                  </h3>
                  <Link href={`/products?application=${app.slug}`} className="mt-auto">
                    <Button variant="primary" size="sm" className="px-8 py-3 bg-secondary hover:bg-primary text-[10px] font-black uppercase tracking-widest shadow-lg">
                      Explore More
                    </Button>
                  </Link>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
