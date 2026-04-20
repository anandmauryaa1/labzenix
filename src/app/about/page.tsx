import Button from '@/components/ui/Button';
import { Target, Users, Award, Shield } from 'lucide-react';
import { getPageMetadata } from '@/lib/seo';
import FadeIn from '@/components/ui/FadeIn';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import Link from 'next/link';

export async function generateMetadata() {
  return await getPageMetadata('about');
}

export default function AboutPage() {
  const stats = [
    { label: 'Countries Served', value: '45+' },
    { label: 'Instruments Built', value: '1500+' },
    { label: 'Happy Clients', value: '800+' },
    { label: 'Years Experience', value: '12+' },
  ];

  return (
    <div className="bg-white scroll-smooth">
      {/* Hero Section */}
      <section className="bg-gray-50 py-24 border-b border-gray-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn direction="up">
            <div className="text-center max-w-3xl mx-auto">
              <span className="text-primary font-black tracking-[0.3em] uppercase text-[10px] mb-4 block">Our Legacy</span>
              <h1 className="text-4xl md:text-7xl font-black text-secondary mb-8 uppercase tracking-tighter leading-none">
                Precision in <br />
                <span className="text-primary italic">Quality Testing</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 leading-relaxed font-medium">
                LabZenix is a pioneer in manufacturing high-quality laboratory testing instruments. With a commitment to excellence and innovation, we help industries achieve zero-defect production.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-32 px-4 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <FadeIn direction="right">
            <div className="space-y-12">
              <div className="flex items-start space-x-8 group">
                <div className="w-20 h-20 bg-primary/5 flex items-center justify-center flex-shrink-0 text-primary border border-primary/10 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                  <Target className="w-10 h-10" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl md:text-2xl font-black text-secondary uppercase tracking-tight">Our Mission</h3>
                  <p className="text-gray-600 leading-relaxed font-medium text-sm md:text-base">
                    To provide technologically advanced, reliable, and cost-effective testing solutions that empower manufacturers to deliver superior products to the global market.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-8 group">
                <div className="w-20 h-20 bg-secondary/5 flex items-center justify-center flex-shrink-0 text-secondary border border-secondary/10 group-hover:bg-secondary group-hover:text-white transition-all duration-500">
                  <Users className="w-10 h-10" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl md:text-2xl font-black text-secondary uppercase tracking-tight">Customer First</h3>
                  <p className="text-gray-600 leading-relaxed font-medium text-sm md:text-base">
                    We believe in building long-term partnerships through exceptional pre-sales guidance and post-installation support, ensuring our clients stay ahead in quality.
                  </p>
                </div>
              </div>
            </div>
          </FadeIn>
          
          <FadeIn direction="left">
            <div className="relative">
              <div className="aspect-square bg-gray-100 border border-gray-100 relative overflow-hidden group shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1000" 
                  alt="Laboratory" 
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000 scale-110 group-hover:scale-100"
                />
                <div className="absolute inset-0 bg-primary/10 group-hover:bg-transparent transition-all duration-500" />
              </div>
              <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-primary/5 rounded-full -z-10 blur-3xl animate-pulse" />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Premium Stats Section */}
      <section className="relative py-40 overflow-hidden bg-secondary group">
        {/* Dynamic Background */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.pexels.com/photos/3825586/pexels-photo-3825586.jpeg" 
            className="w-full h-full object-cover opacity-30 grayscale group-hover:scale-110 transition-transform duration-[3000ms]"
            alt="Laboratory background"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-secondary via-secondary/80 to-secondary z-10" />
          <div className="absolute inset-x-0 h-[2px] bg-primary/20 top-0 animate-scan z-20" />
        </div>

        <div className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn direction="up">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
              {stats.map((stat) => (
                <div key={stat.label} className="relative group/card">
                  <div className="h-full p-10 bg-white/[0.03] backdrop-blur-md border border-white/10 hover:border-primary/50 transition-all duration-500 relative overflow-hidden group-hover/card:-translate-y-2">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full -mr-12 -mt-12 group-hover/card:scale-150 transition-transform duration-700" />
                    
                    <div className="relative z-10">
                      <div className="text-5xl md:text-6xl font-black text-primary tracking-tighter mb-4 flex items-baseline">
                        <AnimatedCounter 
                          value={parseInt(stat.value.replace(/\+/g, ''))} 
                          suffix={stat.value.includes('+') ? '+' : ''}
                        />
                      </div>
                      <div className="w-12 h-[2px] bg-primary/30 mb-6 group-hover/card:w-full transition-all duration-700" />
                      <p className="text-[10px] md:text-xs text-gray-400 uppercase tracking-[0.4em] font-black leading-relaxed">
                        {stat.label}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-32 px-4 bg-gray-50 border-y border-gray-100 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center">
          <FadeIn direction="up">
            <span className="text-primary font-black tracking-[0.3em] uppercase text-[10px] mb-4 block">Capabilities</span>
            <h2 className="text-3xl md:text-5xl font-black text-secondary mb-16 uppercase tracking-tighter">Our Core Strengths</h2>
          </FadeIn>
          
          <FadeIn stagger direction="none">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 text-left">
              {[
                { icon: <Award className="w-10 h-10" />, title: 'Certified Precision', desc: 'ISO 9001:2015 and CE certified manufacturing process for guaranteed accuracy across all metrics.' },
                { icon: <Shield className="w-10 h-10" />, title: 'Built to Last', desc: 'Robust construction using high-grade industrial materials for reliable, long-term operational use.' },
                { icon: <Users className="w-10 h-10" />, title: 'Expert Guidance', desc: 'Technical consulting for bespoke instrument selection tailored to your specific lab requirements.' }
              ].map((item, idx) => (
                <div key={idx} className="p-10 bg-white border border-gray-100 hover:border-primary transition-all duration-500 group shadow-sm hover:shadow-2xl h-full">
                  <div className="inline-block p-5 bg-gray-50 text-secondary mb-8 group-hover:bg-primary group-hover:text-white transition-all duration-500 border border-gray-100 group-hover:scale-110">
                    {item.icon}
                  </div>
                  <h3 className="text-2xl font-black mb-4 text-secondary uppercase tracking-tight">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed font-medium">{item.desc}</p>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-32 text-center bg-white relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <FadeIn direction="up">
            <span className="text-primary font-black tracking-[0.3em] uppercase text-[10px] mb-6 block">Ready for the Next Step?</span>
            <h2 className="text-3xl md:text-5xl font-black text-secondary mb-12 uppercase tracking-tighter leading-none">Interested in <br /> <span className="text-primary italic">Working With Us?</span></h2>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
              <Link href="/products" className="w-full sm:w-auto">
                <Button size="lg" className="w-full px-12 py-5 shadow-2xl">Our Products</Button>
              </Link>
              <Link href="/contact" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full px-12 py-5">Contact Us</Button>
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
