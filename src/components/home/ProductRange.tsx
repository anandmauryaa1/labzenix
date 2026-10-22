import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { getOptimizedImageUrl } from '@/lib/image';

export interface ProductRangeItem {
  _id: string;
  title: string;
  slug: string;
  description: string;
  image: string;
}

export default function ProductRange({ initialRanges }: { initialRanges?: ProductRangeItem[] }) {
  const ranges = initialRanges || [];

  if (ranges.length === 0) return null;

  return (
    <section aria-labelledby="complete-ranges-heading" id="productrange" className="py-8 md:py-14 bg-white overflow-hidden px-[5px] sm:px-4">
      <div className="w-full sm:w-[90%] mx-auto px-[5px] sm:px-4">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-8 sm:mb-16 md:mb-20">
          <div>
            <span className="text-primary font-black tracking-widest uppercase text-xs sm:text-[14px]">Our Expertise</span>
            <h2 id="complete-ranges-heading" className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black text-secondary mt-1.5 sm:mt-2 leading-tight uppercase tracking-tight sm:tracking-tighter">
              Complete <span className="text-primary">Product</span> Range
            </h2>
          </div>
          <Link href="/products" className="flex items-center text-primary font-black hover:underline text-xs md:text-sm group uppercase tracking-widest">
            View All Categories <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </header>

        <div className="space-y-24 md:space-y-32">
          {ranges.map((cat, index) => (
            <article 
              key={cat._id} 
              className={`flex flex-col lg:flex-row gap-12 lg:gap-20 items-center ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}
            >
              {/* Content */}
              <div className="flex-1 space-y-8">
                <div className="space-y-4">
                  <h3 className="text-2xl md:text-4xl font-black text-secondary uppercase tracking-tighter leading-none">{cat.title}</h3>
                  <div className="w-20 h-2 bg-primary" />
                </div>
                <p className="text-base md:text-xl text-gray-700 leading-relaxed font-medium">
                  {cat.description}
                </p>

                <Link href={`/products?range=${cat.slug}`} className="inline-block mt-4 translate-y-0 hover:-translate-y-1 transition-transform duration-300">
                  <span className="inline-block px-10 py-5 bg-primary text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all">
                    Discover More
                  </span>
                </Link>
              </div>

              {/* Image/Card */}
              <div className="flex-1 w-full">
                <div className="relative aspect-video group overflow-hidden border border-gray-100 shadow-2xl">
                  <div className="absolute inset-0 bg-primary/10 group-hover:bg-transparent transition-colors duration-500 z-10" />
                  {cat.image && (
                    <Image 
                      src={getOptimizedImageUrl(cat.image, { width: 1000, height: 562, crop: 'fill' })} 
                      alt={cat.title}
                      fill
                      loading="lazy"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-20">
                    <p className="text-white font-black text-xl md:text-2xl mb-4 tracking-tighter uppercase">{cat.title} Series</p>
                    <Link href={`/products?range=${cat.slug}`}>
                      <span className="inline-block px-4 py-2 border border-white text-white hover:bg-white hover:text-black font-black uppercase tracking-widest text-[10px] transition-all">
                        Project Details
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
