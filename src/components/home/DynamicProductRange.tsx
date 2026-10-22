import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { getOptimizedImageUrl } from '@/lib/image';

export interface ProductRange {
  _id: string;
  title: string;
  slug: string;
  description: string;
  image: string;
}

export default function DynamicProductRange({ initialRanges }: { initialRanges?: ProductRange[] }) {
  const ranges = initialRanges || [];

  if (ranges.length === 0) return null;

  return (
    <section aria-labelledby="dynamic-ranges-heading" className="py-10 sm:py-14 px-[5px] sm:px-4 bg-gray-50 overflow-hidden">
      <div className="w-full sm:w-[90%] mx-auto px-[5px] sm:px-4">
        <header className="text-center mb-8 sm:mb-16">
          <span className="text-primary font-medium tracking-[0.3em] uppercase text-xs sm:text-sm mb-2 sm:mb-4 block">Our Series</span>
          <h2 id="dynamic-ranges-heading" className="text-2xl sm:text-3xl md:text-5xl font-black text-secondary uppercase tracking-tight sm:tracking-tighter leading-tight sm:leading-none mb-3 sm:mb-6">
            Our <span className="text-primary">Product</span> Ranges
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-gray-500 font-medium max-w-2xl mx-auto leading-relaxed">
            Explore our specialized instrument series tailored for diverse industrial testing requirements.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12" role="list">
          {ranges.map((range) => (
            <article key={range._id} role="listitem" className="h-full">
              <Link href={`/products?range=${range.slug}`} className="block h-full">
                <div className="group bg-white border border-gray-100 shadow-xl hover:border-primary hover:shadow-2xl transition-all duration-300 overflow-hidden h-full flex flex-col cursor-pointer">
                  <div className="relative aspect-video overflow-hidden">
                    <Image 
                      src={getOptimizedImageUrl(range.image, { width: 640, height: 360, crop: 'fill' })} 
                      alt={range.title} 
                      fill 
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-secondary/0 group-hover:bg-secondary/10 transition-colors duration-300" />
                  </div>
                  <div className="p-8 flex flex-col flex-1">
                    <h3 className="text-xl font-black text-secondary group-hover:text-primary transition-colors leading-tight mb-4 uppercase tracking-tight">
                      {range.title}
                    </h3>
                    <p className="text-sm text-gray-500 font-medium mb-8 line-clamp-3 flex-grow">
                      {range.description}
                    </p>
                    <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary">View Series</span>
                      <ArrowRight className="w-5 h-5 text-primary group-hover:translate-x-2 transition-transform duration-300" />
                    </div>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
