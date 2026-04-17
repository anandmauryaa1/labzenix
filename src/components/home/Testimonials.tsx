'use client';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  { 
    name: 'Dr. Rajesh Sharma', 
    role: 'Quality Assurance Manager', 
    text: 'The precision of LabZenix instruments has significantly improved our material testing accuracy. Their technical support is outstanding.',
    rating: 5
  },
  { 
    name: 'Sarah Thompson', 
    role: 'R&D Lead, PackTech Solutions', 
    text: 'We have been using LabZenix for our PET bottle testing for 2 years. The reliability of their equipment is unmatched in the industry.',
    rating: 5
  },
  { 
    name: 'Anil Mehta', 
    role: 'Production Supervisor', 
    text: 'Affordable, robust, and highly accurate. LabZenix is now our primary partner for all laboratory testing requirements.',
    rating: 5
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 px-4 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-primary font-bold tracking-widest uppercase text-sm">Customer Stories</span>
          <h2 className="text-4xl md:text-5xl font-black text-secondary mt-2 uppercase tracking-tighter italic">Trusted Globally</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, idx) => (
            <div key={idx} className="bg-gray-50 p-8 md:p-10 border border-gray-100 flex flex-col relative group hover:bg-primary transition-all duration-500">
              <Quote className="w-10 h-10 text-primary/20 absolute top-8 right-8 group-hover:text-white/20 transition-colors" />
              
              <div className="flex mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-primary fill-primary mr-1 group-hover:text-white group-hover:fill-white transition-colors" />
                ))}
              </div>

              <blockquote className="text-lg md:text-xl font-medium text-secondary mb-8 leading-relaxed italic group-hover:text-white transition-colors">
                "{testimonial.text}"
              </blockquote>

              <div className="mt-auto flex items-center">
                <div className="w-12 h-12 bg-primary group-hover:bg-white transition-colors flex items-center justify-center text-white group-hover:text-primary font-bold text-xl uppercase tracking-tighter">
                  {testimonial.name[0]}
                </div>
                <div className="ml-4">
                  <p className="font-black text-secondary uppercase tracking-widest text-xs group-hover:text-white transition-colors">{testimonial.name}</p>
                  <p className="text-xs font-bold text-primary group-hover:text-white/80 transition-colors mt-1">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

