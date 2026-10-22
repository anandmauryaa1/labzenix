'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getOptimizedImageUrl } from '@/lib/image';

interface ImageCarouselProps {
  images: string[];
  alt: string;
}

export default function ImageCarousel({ images, alt }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="relative h-96 bg-gray-50 border border-gray-200 flex items-center justify-center">
        <Image
          src="/placeholder.jpg"
          alt={alt}
          fill
          className="object-contain p-8"
        />
      </div>
    );
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Main Image Display */}
      <div className="relative h-64 sm:h-80 md:h-96 bg-gray-50 border border-gray-200 flex items-center justify-center overflow-hidden group">
        <Image
          src={getOptimizedImageUrl(images[currentIndex], { width: 1600, quality: 'auto:best', crop: 'limit', dpr: 'auto' })}
          alt={`${alt} - Image ${currentIndex + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
          className="object-contain p-2 sm:p-6 transition-transform duration-300"
          priority
          unoptimized={true}
        />

        {/* Navigation Arrows - Show only if multiple images */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-1.5 sm:p-2 rounded-full shadow-md transition-all opacity-90 md:opacity-0 md:group-hover:opacity-100 z-10"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-secondary" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-1.5 sm:p-2 rounded-full shadow-md transition-all opacity-90 md:opacity-0 md:group-hover:opacity-100 z-10"
              aria-label="Next image"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-secondary" />
            </button>
          </>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-2.5 right-2.5 sm:bottom-4 sm:right-4 bg-secondary/90 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded text-[11px] sm:text-xs font-bold opacity-90 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnail Navigation - Show only if multiple images */}
      {images.length > 1 && (
        <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-1 sm:pb-2">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => handleThumbnailClick(index)}
              className={`relative w-14 h-14 sm:w-20 sm:h-20 flex-shrink-0 border-2 transition-all ${currentIndex === index
                  ? 'border-primary shadow-md'
                  : 'border-gray-200 hover:border-primary/50'
                }`}
            >
              <Image
                src={getOptimizedImageUrl(img, { width: 240, height: 240, crop: 'fit', quality: 'auto:good' })}
                alt={`${alt} thumbnail ${index + 1}`}
                fill
                loading="lazy"
                sizes="80px"
                className="object-contain p-1"
                unoptimized={true}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
