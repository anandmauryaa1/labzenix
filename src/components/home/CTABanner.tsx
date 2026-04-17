'use client';
import Link from 'next/link';
import Button from '../ui/Button';

export default function CTABanner() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto bg-black border border-white/10 p-16 text-center relative overflow-hidden group">
        {/* Background Image with Parallax-like effect */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.pexels.com/photos/3825527/pexels-photo-3825527.jpeg" 
            alt="Laboratory" 
            className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-black/80 z-10" />
        </div>
        
        <div className="relative z-20">
          <div className="inline-block px-4 py-1 bg-primary text-white text-xs font-black uppercase tracking-[0.3em] mb-6">
            Get in Touch
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-6 text-white uppercase tracking-tighter drop-shadow-xl">
            Ready to Get Started?
          </h2>
          <p className="text-lg md:text-xl text-gray-300 mb-12 max-w-2xl mx-auto font-medium leading-relaxed drop-shadow-lg">
            Our technical experts are standing by to provide you with the most advanced testing solutions for your specific industry requirements.
          </p>
          <Link href="/contact">
            <Button size="lg" className="px-12 py-5 !bg-white !text-black hover:!bg-primary hover:!text-white transition-all duration-300 font-black uppercase tracking-widest text-sm shadow-2xl">
              Request a Custom Quote
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
