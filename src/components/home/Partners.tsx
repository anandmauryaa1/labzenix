'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getOptimizedImageUrl } from '@/lib/image';

export interface Partner {
  _id: string;
  name: string;
  logo: string;
  website?: string;
}

export default function Partners({ initialPartners }: { initialPartners?: Partner[] }) {
  const partners = initialPartners || [];
  const [currentPage, setCurrentPage] = useState(0);

  if (partners.length === 0) return null;

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
    <section className="py-10 sm:py-14 bg-white border-t border-gray-100 overflow-hidden px-[5px] sm:px-4">
      <div className="w-full sm:w-[90%] mx-auto px-[5px] sm:px-4">
        <div className="flex flex-col md:flex-row justify-center items-center mb-6 sm:mb-12 gap-4 sm:gap-6">
          <div className="max-w-2xl text-center">
            <span className="text-primary font-medium tracking-widest uppercase text-xs sm:text-sm">Trusted By</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-secondary mt-1 sm:mt-2 mb-2 sm:mb-4 uppercase tracking-tight sm:tracking-tighter">
              Our <span className="text-primary">Partners</span>
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-500 font-medium leading-relaxed">
              A countless string of happy and satisfied customers vouch for our 
              excellence and complete quality control support.
            </p>
          </div>

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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-10 transition-opacity duration-300">
            {currentPartners.map((partner) => (
              <a
                key={partner._id}
                href={partner.website || '#'}
                target={partner.website ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="relative aspect-[5/2] flex flex-col mb-6 items-center justify-center transition-all duration-300 group bg-gray-50/50 hover:bg-white border border-transparent hover:border-gray-100 p-4"
              >
                <Image
                  src={getOptimizedImageUrl(partner.logo, { width: 300, height: 120, crop: 'fit' })}
                  alt={partner.name}
                  fill
                  loading="lazy"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  className="object-contain p-2 transform group-hover:scale-105 transition-transform duration-300"
                />
                <p className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-sm sm:text-base font-semibold text-secondary uppercase tracking-tight">
                  {partner.name}
                </p>
              </a>
            ))}
            
            {/* Fillers to maintain grid if fewer than 10 partners on last page */}
            {currentPartners.length < partnersPerPage && totalPages > 1 && 
              Array.from({ length: partnersPerPage - currentPartners.length }).map((_, i) => (
                <div key={`filler-${i}`} className="aspect-[5/2] hidden lg:block" />
              ))
            }
          </div>
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
