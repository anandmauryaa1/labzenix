import { ShieldCheck, Zap, Repeat, Globe } from 'lucide-react';

export default function WhyChooseUs() {
  const reasons = [
    { 
      title: 'Trusted for Excellence', 
      desc: 'Certified with ISO 9001:2015 and CE standards, ensuring unmatched reliability and world-class standards.',
      icon: ShieldCheck
    },
    { 
      title: 'Affordable Innovation', 
      desc: 'Utilizing cutting-edge tools and an expert workforce to manufacture top-tier products that fit your budget.',
      icon: Zap
    },
    { 
      title: 'Repeatable Precision', 
      desc: 'Technologically advanced instruments deliver fully precise and consistent results, ensuring guaranteed reliability.',
      icon: Repeat
    },
    { 
      title: 'Global Delivery', 
      desc: 'Serving laboratory testing needs worldwide with exceptional craftsmanship and customer support.',
      icon: Globe
    },
  ];

  return (
    <section className="py-24 px-4 bg-gray-50 border-y border-gray-100 relative overflow-hidden">
      <div className="absolute inset-0 bg-primary/5 pattern-grid opacity-10" />
      <div className="max-w-7xl mx-auto relative z-10">
        <span className="block text-primary font-bold tracking-[0.3em] uppercase text-xs text-center mb-4">Core Values</span>
        <h2 className="text-4xl md:text-5xl font-black mb-16 text-center text-secondary uppercase tracking-tighter">Why LabZenix?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {reasons.map((reason) => (
            <div key={reason.title} className="p-10 rounded-none bg-white border border-gray-100 hover:border-primary transition-all duration-300 hover:shadow-xl group">
              <div className="w-14 h-14 bg-primary/10 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
                <reason.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black mb-4 text-secondary uppercase tracking-tight">{reason.title}</h3>
              <p className="text-gray-700 leading-relaxed font-medium text-sm">{reason.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
