import Button from '@/components/ui/Button';
import { Target, Users, Award, Shield } from 'lucide-react';
import { getPageMetadata } from '@/lib/seo';

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
    <div className="bg-white">
      {/* Hero Section */}
      <section className="bg-gray-50 py-24 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-primary font-bold tracking-[0.2em] uppercase text-xs mb-4 block">Our Legacy</span>
            <h1 className="text-4xl md:text-6xl font-black text-secondary mb-8 uppercase tracking-tighter leading-none">
              Precision in <br />
              <span className="text-primary">Quality Testing</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-700 leading-relaxed font-medium">
              LabZenix is a pioneer in manufacturing high-quality laboratory testing instruments. With a commitment to excellence and innovation, we help industries achieve zero-defect production.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-10">
            <div className="flex items-start space-x-6">
              <div className="w-16 h-16 bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                <Target className="w-8 h-8" />
              </div>
              <div className="space-y-4">
                <h3 className="text-xl md:text-2xl font-black text-secondary uppercase tracking-tight">Our Mission</h3>
                <p className="text-gray-700 leading-relaxed font-medium text-sm md:text-base">
                  To provide technologically advanced, reliable, and cost-effective testing solutions that empower manufacturers to deliver superior products to the global market.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-6">
              <div className="w-16 h-16 bg-secondary/10 flex items-center justify-center flex-shrink-0 text-secondary">
                <Users className="w-8 h-8" />
              </div>
              <div className="space-y-4">
                <h3 className="text-xl md:text-2xl font-black text-secondary uppercase tracking-tight">Customer First</h3>
                <p className="text-gray-700 leading-relaxed font-medium text-sm md:text-base">
                  We believe in building long-term partnerships through exceptional pre-sales guidance and post-installation support, ensuring our clients stay ahead in quality.
                </p>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square bg-gray-100 border border-gray-100 relative overflow-hidden group">
              {/* Image Placeholder */}
              <div className="absolute inset-0 flex items-center justify-center text-gray-300 font-bold text-xl uppercase tracking-widest group-hover:scale-110 transition-transform duration-500">
                LAB INTERIOR
              </div>
              <img 
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1000" 
                alt="Laboratory" 
                className="w-full h-full object-cover opacity-80"
              />
            </div>
            <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-primary z-[-1] animate-pulse" />
          </div>
        </div>
      </section>

      {/* Stats Section with Parallax */}
      <section className="relative py-32 text-white overflow-hidden bg-secondary">
        <div 
          className="absolute inset-0 z-0 bg-fixed bg-center bg-cover scale-110"
          style={{ backgroundImage: 'url("https://images.pexels.com/photos/3825586/pexels-photo-3825586.jpeg")' }}
        />
        <div className="absolute inset-0 bg-secondary/70 z-10" />
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            {stats.map((stat) => (
              <div key={stat.label} className="group">
                <p className="text-4xl md:text-6xl font-black mb-3 text-primary tracking-tighter group-hover:scale-110 transition-transform duration-300 drop-shadow-lg">{stat.value}</p>
                <div className="h-1 w-10 bg-primary/50 mx-auto mb-4 group-hover:w-20 transition-all duration-300" />
                <p className="text-xs md:text-sm text-gray-300 uppercase tracking-[0.3em] font-black">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-24 px-4 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-secondary mb-16 uppercase tracking-widest border-b-2 border-primary inline-block pb-2">Our Core Strengths</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {[
              { icon: <Award className="w-10 h-10" />, title: 'Certified Precision', desc: 'ISO 9001:2015 and CE certified manufacturing process for guaranteed accuracy.' },
              { icon: <Shield className="w-10 h-10" />, title: 'Built to Last', desc: 'Robust construction using high-grade materials for long-term industrial use.' },
              { icon: <Users className="w-10 h-10" />, title: 'Expert Guidance', desc: 'Technical consulting for instrument selection based on your specific industry needs.' }
            ].map((item, idx) => (
              <div key={idx} className="p-8 bg-white border border-gray-100 hover:border-primary transition-all group">
                <div className="inline-block p-4 bg-gray-50 text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold mb-4 text-secondary uppercase tracking-tighter">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-20 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-secondary mb-8 uppercase tracking-widest">Interested in working with us?</h2>
          <div className="flex justify-center space-x-6">
            <Button size="lg">Our Products</Button>
            <Button variant="outline" size="lg">Contact Us</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
