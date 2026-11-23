import Button from '@/components/ui/Button';
import { Target, Users, Award, Shield, Globe, Clock, Sparkles } from 'lucide-react';
import { getPageMetadata } from '@/lib/seo';
import FadeIn from '@/components/ui/FadeIn';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import Link from 'next/link';
import Image from 'next/image';

import dbConnect from '@/lib/dbConnect';
import CompanyStat from '@/models/CompanyStat';

export async function generateMetadata() {
  return await getPageMetadata('about');
}

export const dynamic = 'force-dynamic';

export default async function AboutPage() {
  let stats: { label: string; value: string }[] = [];
  try {
    await dbConnect();
    const rawStats = await CompanyStat.find({ active: true }).sort({ order: 1 });
    // Convert to simple objects so they can be passed to client components if needed, or mapped cleanly
    stats = rawStats.map(s => ({
      label: s.label,
      value: s.value
    }));
  } catch (error) {
    console.error('Failed to fetch stats:', error);
  }

  // Fallback to defaults if none exist
  if (stats.length === 0) {
    stats = [
      { label: 'Countries Served', value: '45+' },
      { label: 'Instruments Built', value: '1500+' },
      { label: 'Happy Clients', value: '800+' },
      { label: 'Years Experience', value: '12+' },
    ];
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://labzenix.com';

  const aboutSchema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About LabZenix',
    url: `${siteUrl}/about`,
    description: 'Learn about LabZenix - A pioneer in manufacturing high-precision laboratory testing instruments for paper, packaging, plastic, and coating industries.',
    mainEntity: {
      '@type': 'Organization',
      name: 'LabZenix Industries Pvt. Ltd.',
      url: siteUrl,
      logo: `${siteUrl}/icon.png`,
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'About Us',
        item: `${siteUrl}/about`,
      },
    ],
  };

  return (
    <div className="bg-white scroll-smooth">
      {/* ─── Structured Data (JSON-LD) ─────────────────────────── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* ─── Hero Banner with Royal Blue Gradient & Tech Dot Matrix Pattern ── */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#031b4e] via-[#004aad] to-[#005cd6] text-white pt-12 sm:pt-16 md:pt-20 pb-16 sm:pb-20 md:pb-24">
        {/* Modern Dot Matrix Texture Overlay */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-25"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255, 255, 255, 0.4) 1.5px, transparent 1.5px)',
            backgroundSize: '24px 24px',
            maskImage: 'radial-gradient(ellipse at 50% 50%, black 70%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse at 50% 50%, black 70%, transparent 100%)'
          }}
        />

        {/* Precision Geometric Concentric Rings */}
        <div className="absolute -top-32 -right-32 w-[520px] h-[520px] rounded-full border border-white/10 pointer-events-none" />
        <div className="absolute -top-16 -right-16 w-[380px] h-[380px] rounded-full border border-white/15 pointer-events-none" />
        <div className="absolute top-0 right-0 w-[240px] h-[240px] rounded-full border border-white/10 pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-[360px] h-[360px] rounded-full border border-white/10 pointer-events-none" />
        <div className="absolute -bottom-44 -left-44 w-[520px] h-[520px] rounded-full border border-white/5 pointer-events-none" />

        {/* Ambient Glows */}
        <div className="absolute -top-24 right-1/4 w-96 h-96 bg-sky-300/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 left-1/3 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full sm:w-[90%] max-w-7xl mx-auto px-4 text-center relative z-10">
          <FadeIn direction="up">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="inline-flex items-center space-x-2 text-xs font-semibold text-blue-200/90 mb-4 bg-white/10 px-3.5 py-1 rounded-full border border-white/15 backdrop-blur-xs">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span className="text-blue-300/60">/</span>
              <span className="text-white">About Us</span>
            </nav>

            <span className="block text-blue-200 font-black tracking-[0.3em] uppercase text-xs mb-3">Our Legacy & Philosophy</span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 sm:mb-6 uppercase tracking-tight leading-tight sm:leading-none">
              Precision In <span className="text-blue-200">Quality Testing</span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-blue-100/90 max-w-3xl mx-auto font-normal leading-relaxed">
              LabZenix is a pioneer in manufacturing high-precision laboratory testing instruments. With a commitment to excellence and engineering innovation, we help industries achieve zero-defect production.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-12 sm:py-20 md:py-28 px-[5px] sm:px-4 bg-white overflow-hidden">
        <div className="w-full sm:w-[90%] mx-auto px-[5px] sm:px-4 grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-14 lg:gap-20 items-center">
          <FadeIn direction="right">
            <div className="space-y-8 sm:space-y-12">
              <div className="flex items-start space-x-4 sm:space-x-8 group">
                <div className="w-14 h-14 sm:w-20 sm:h-20 bg-primary/5 flex items-center justify-center flex-shrink-0 text-primary border border-primary/10 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                  <Target className="w-7 h-7 sm:w-10 sm:h-10" />
                </div>
                <div className="space-y-2 sm:space-y-4">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-black text-secondary uppercase tracking-tight">Our Mission</h3>
                  <p className="text-gray-600 leading-relaxed font-medium text-sm sm:text-base md:text-lg">
                    To provide technologically advanced, reliable, and cost-effective testing solutions that empower manufacturers to deliver superior products to the global market.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4 sm:space-x-8 group">
                <div className="w-14 h-14 sm:w-20 sm:h-20 bg-secondary/5 flex items-center justify-center flex-shrink-0 text-secondary border border-secondary/10 group-hover:bg-secondary group-hover:text-white transition-all duration-500">
                  <Users className="w-7 h-7 sm:w-10 sm:h-10" />
                </div>
                <div className="space-y-2 sm:space-y-4">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-black text-secondary uppercase tracking-tight">Customer First</h3>
                  <p className="text-gray-600 leading-relaxed font-medium text-sm sm:text-base md:text-lg">
                    We believe in building long-term partnerships through exceptional pre-sales guidance and post-installation support, ensuring our clients stay ahead in quality.
                  </p>
                </div>
              </div>
            </div>
          </FadeIn>
          
          <FadeIn direction="left">
            <div className="relative">
              <div className="aspect-square bg-gray-100 border border-gray-100 relative overflow-hidden group shadow-2xl">
                <Image 
                  src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1000" 
                  alt="Laboratory Research" 
                  fill
                  className="object-cover transition-all duration-1000 scale-110 group-hover:scale-100"
                  priority
                />
                <div className="absolute inset-0 bg-primary/10 group-hover:bg-transparent transition-all duration-500" />
              </div>
              <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-primary/5 rounded-full -z-10 blur-3xl animate-pulse" />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ─── Premium Stats Section ─────────────────────────────────────── */}
      <section className="relative py-16 sm:py-20 md:py-24 overflow-hidden bg-gradient-to-r from-[#031b4e] via-[#004aad] to-[#005cd6] text-white">
        {/* Modern Dot Matrix Texture Overlay */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255, 255, 255, 0.4) 1.5px, transparent 1.5px)',
            backgroundSize: '24px 24px',
            maskImage: 'radial-gradient(ellipse at 50% 50%, black 70%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse at 50% 50%, black 70%, transparent 100%)'
          }}
        />

        {/* Precision Concentric Rings */}
        <div className="absolute -top-32 -right-32 w-[520px] h-[520px] rounded-full border border-white/10 pointer-events-none" />
        <div className="absolute -top-16 -right-16 w-[380px] h-[380px] rounded-full border border-white/15 pointer-events-none" />
        <div className="absolute top-0 right-0 w-[240px] h-[240px] rounded-full border border-white/10 pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-[360px] h-[360px] rounded-full border border-white/10 pointer-events-none" />

        {/* Ambient Glows */}
        <div className="absolute -top-24 right-1/4 w-96 h-96 bg-sky-300/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 left-1/3 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full sm:w-[90%] max-w-7xl mx-auto px-4">
          <FadeIn direction="up">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-6 lg:gap-8">
              {stats.map((stat) => {
                const iconMap: Record<string, any> = {
                  'countries served': Globe,
                  'instruments built': Award,
                  'happy clients': Users,
                  'years experience': Clock,
                };
                const IconComponent = iconMap[stat.label.toLowerCase().trim()] || Sparkles;

                return (
                  <div key={stat.label} className="relative group/card">
                    <div className="h-full p-6 sm:p-7 md:p-8 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 border-t-[3px] border-t-white/80 shadow-[0_8px_32px_0_rgba(0,0,0,0.2)] hover:bg-white/15 hover:border-white/35 hover:shadow-[0_12px_40px_0_rgba(0,0,0,0.3)] hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden flex flex-col justify-between">
                      <div>
                        <div className="w-12 h-12 rounded-xl bg-white/15 text-white border border-white/20 flex items-center justify-center mb-5 group-hover/card:bg-white group-hover/card:text-primary transition-all duration-300 shadow-inner">
                          <IconComponent className="w-6 h-6 stroke-[1.8]" />
                        </div>
                        
                        <div className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-2 flex items-baseline drop-shadow-sm">
                          <AnimatedCounter 
                            value={parseInt(stat.value.replace(/[^0-9]/g, '')) || 0} 
                            suffix={stat.value.includes('+') ? '+' : ''}
                          />
                        </div>

                        <div className="w-10 h-1 bg-white/30 rounded-full mb-3 group-hover/card:w-16 group-hover/card:bg-white transition-all duration-300" />
                      </div>

                      <p className="text-xs md:text-sm text-blue-100 uppercase tracking-wider font-bold leading-relaxed">
                        {stat.label}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-12 sm:py-20 md:py-28 px-[5px] sm:px-4 bg-gray-50 border-y border-gray-100 overflow-hidden">
        <div className="w-full sm:w-[90%] mx-auto px-[5px] sm:px-4 text-center">
          <FadeIn direction="up">
            <span className="text-primary font-black tracking-[0.3em] uppercase text-[10px] mb-3 sm:mb-4 block">Capabilities</span>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-secondary mb-8 sm:mb-12 uppercase tracking-tighter">Our Core Strengths</h2>
          </FadeIn>
          
          <FadeIn stagger direction="none">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 text-left">
              {[
                { icon: <Award className="w-7 h-7 sm:w-8 sm:h-8" />, title: 'Certified Precision', desc: 'ISO 9001:2015 and CE certified manufacturing process for guaranteed accuracy across all metrics.' },
                { icon: <Shield className="w-7 h-7 sm:w-8 sm:h-8" />, title: 'Built to Last', desc: 'Robust construction using high-grade industrial materials for reliable, long-term operational use.' },
                { icon: <Users className="w-7 h-7 sm:w-8 sm:h-8" />, title: 'Expert Guidance', desc: 'Technical consulting for bespoke instrument selection tailored to your specific lab requirements.' }
              ].map((item, idx) => (
                <div key={idx} className="p-6 sm:p-8 bg-white border border-gray-100 hover:border-primary transition-all duration-500 group shadow-sm hover:shadow-2xl h-full">
                  <div className="inline-block p-3.5 sm:p-4 bg-gray-50 text-secondary mb-4 sm:mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-500 border border-gray-100 group-hover:scale-110">
                    {item.icon}
                  </div>
                  <h3 className="text-lg sm:text-xl font-black mb-2 sm:mb-3 text-secondary uppercase tracking-tight">{item.title}</h3>
                  <p className="text-gray-500 text-xs sm:text-sm leading-relaxed font-medium">{item.desc}</p>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-12 sm:py-20 md:py-28 text-center bg-white relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <FadeIn direction="up">
            <span className="text-primary font-black tracking-[0.3em] uppercase text-[10px] mb-4 sm:mb-6 block">Ready for the Next Step?</span>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-secondary mb-6 sm:mb-8 uppercase tracking-tighter leading-none">Interested in <br /> <span className="text-primary italic">Working With Us?</span></h2>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6">
              <Link href="/products" className="w-full sm:w-auto">
                <Button size="lg" className="w-full px-8 sm:px-12 py-3.5 sm:py-5 shadow-2xl">Our Products</Button>
              </Link>
              <Link href="/contact" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full px-8 sm:px-12 py-3.5 sm:py-5">Contact Us</Button>
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
