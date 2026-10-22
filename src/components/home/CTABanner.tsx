import Link from 'next/link';
import Image from 'next/image';

export default function CTABanner() {
  return (
    <section className="py-10 sm:py-14 px-[5px] sm:px-4">
      <div className="w-full sm:w-[90%] mx-auto bg-black border border-white/10 p-5 sm:p-12 md:p-16 text-center relative overflow-hidden group">
        {/* Background Image with subtle zoom effect */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="https://images.pexels.com/photos/3825527/pexels-photo-3825527.jpeg" 
            alt="Laboratory background" 
            fill
            loading="lazy"
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-black/80 z-10" />
        </div>
        
        <div className="relative z-20">
          <div className="inline-block px-3 sm:px-4 py-1 bg-primary text-white text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] mb-4 sm:mb-6">
            Get in Touch
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-black mb-3 sm:mb-6 text-white uppercase tracking-tight sm:tracking-tighter drop-shadow-xl">
            Ready to Get Started?
          </h2>
          <p className="text-sm sm:text-base md:text-xl text-gray-300 mb-6 sm:mb-12 max-w-2xl mx-auto font-medium leading-relaxed drop-shadow-lg">
            Our technical experts are standing by to provide you with the most advanced testing solutions for your specific industry requirements.
          </p>
          <Link href="/contact" className="inline-block">
            <span className="inline-block px-12 py-5 bg-white text-black hover:bg-primary hover:text-white transition-all duration-300 font-black uppercase tracking-widest text-sm shadow-2xl hover:scale-105 active:scale-95">
              Request a Custom Quote
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
