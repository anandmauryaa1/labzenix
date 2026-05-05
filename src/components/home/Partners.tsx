'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [currentPage, setCurrentPage] = useState(0);

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

  // 5 columns, 2 rows = 10 partners per page
  const partnersPerPage = 10;
  const totalPages = Math.ceil(partners.length / partnersPerPage);
  
  const nextPage = () => setCurrentPage((prev) => (prev + 1) % totalPages);
  const prevPage = () => setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);

  const currentPartners = partners.slice(
    currentPage * partnersPerPage,
    (currentPage + 1) * partnersPerPage
  );

  return (
    <section className="py-24 bg-white border-t border-gray-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-center items-center mb-12 gap-6">
          <FadeIn direction="up">
            <div className="max-w-2xl text-center">
              <span className="text-primary font-medium tracking-widest uppercase text-sm">Trusted By</span>
              <h2 className="text-3xl md:text-4xl font-black text-secondary mt-2 mb-4 uppercase tracking-tighter">Our Partners</h2>
              <p className="text-gray-500 font-medium leading-relaxed">
                A countless string of happy and satisfied customers vouch for our 
                excellence and complete quality control support.
              </p>
            </div>
          </FadeIn>

          {totalPages > 1 && (
            <div className="flex space-x-3">
              <button 
                onClick={prevPage}
                className="w-12 h-12 flex items-center justify-center border border-gray-100 text-gray-400 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 shadow-sm"
                aria-label="Previous partners"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button 
                onClick={nextPage}
                className="w-12 h-12 flex items-center justify-center border border-gray-100 text-gray-400 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 shadow-sm"
                aria-label="Next partners"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          )}
        </div>

        <div className="relative min-h-[300px] md:min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-10"
            >
              {currentPartners.map((partner) => (
                <a
                  key={partner._id}
                  href={partner.website || '#'}
                  target={partner.website ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="relative aspect-[5/2] flex flex-col mb-6 items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100 group bg-gray-50/50 hover:bg-white border border-transparent hover:border-gray-100 p-4"
                >
                  <Image
                    src={partner.logo}
                    alt={partner.name}
                    fill
                    className="object-contain p-2 transform group-hover:scale-105 transition-transform duration-300"
                  />
                  <h1 className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-sm sm:text-base font-semibold text-secondary uppercase tracking-tight">
                    {partner.name}
                  </h1>
                </a>
              ))}
              
              {/* Fillers to maintain grid if fewer than 10 partners on last page */}
              {currentPartners.length < partnersPerPage && totalPages > 1 && 
                Array.from({ length: partnersPerPage - currentPartners.length }).map((_, i) => (
                  <div key={`filler-${i}`} className="aspect-[5/2] hidden lg:block" />
                ))
              }
            </motion.div>
          </AnimatePresence>
        </div>
        
        {totalPages > 1 && (
          <div className="flex justify-center mt-12 space-x-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i)}
                className={`h-1.5 transition-all duration-300 ${currentPage === i ? 'w-10 bg-primary' : 'w-4 bg-gray-200 hover:bg-gray-300'}`}
                aria-label={`Go to partners page ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
