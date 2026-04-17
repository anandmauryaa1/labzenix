import Button from '@/components/ui/Button';
import { Calendar, User, ArrowRight, Tag } from 'lucide-react';
import Link from 'next/link';

export default function BlogPage() {
  const blogs = [
    {
      title: 'Importance of Proper Calibration in Laboratory Instruments',
      excerpt: 'Calibration is a vital part of instrument maintenance. Learn why regular calibration is essential for maintaining accuracy and compliance.',
      date: 'March 15, 2024',
      author: 'Technical Team',
      category: 'Maintenance',
      image: 'https://images.unsplash.com/photo-1579154341098-e4e158cc7f55?auto=format&fit=crop&q=80&w=800'
    },
    {
      title: 'How to Choose the Right Bursting Strength Tester',
      excerpt: 'Not all testers are created equal. Discover the key factors to consider when selecting a bursting strength tester for your packaging line.',
      date: 'March 10, 2024',
      author: 'Industry Expert',
      category: 'Product Guide',
      image: 'https://images.unsplash.com/photo-1582719201990-25bc5eacc7fe?auto=format&fit=crop&q=80&w=800'
    },
    {
      title: 'Advancements in PET Bottle Testing Technology',
      excerpt: 'The PET industry is evolving rapidly. Explore the latest technological trends in bottle testing and quality control.',
      date: 'March 05, 2024',
      author: 'Innovation Lead',
      category: 'Trends',
      image: 'https://images.unsplash.com/photo-1599423300746-b62533397394?auto=format&fit=crop&q=80&w=800'
    },
    {
      title: 'Quality Standards for Paint and Coating Industry',
      excerpt: 'A deep dive into international quality standards for coatings and the instruments required to verify them.',
      date: 'February 28, 2024',
      author: 'Compliance Officer',
      category: 'Standards',
      image: 'https://images.unsplash.com/photo-1589939705384-5185138a04b9?auto=format&fit=crop&q=80&w=800'
    }
  ];

  return (
    <div className="bg-white">
      {/* Blog Hero */}
      <section className="bg-gray-50 py-20 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-6 uppercase tracking-widest leading-tight">
            Knowledge <span className="text-primary">& Insights</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Stay updated with the latest industry standards, maintenance tips, and technological breakthroughs in laboratory testing.
          </p>
        </div>
      </section>

      {/* Blog Feed */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {blogs.map((blog, idx) => (
              <article key={idx} className="bg-white border border-gray-100 flex flex-col group overflow-hidden">
                <div className="aspect-video relative overflow-hidden">
                  <img 
                    src={blog.image} 
                    alt={blog.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale hover:grayscale-0"
                  />
                  <div className="absolute top-4 left-4 bg-primary text-white text-[10px] font-black uppercase tracking-widest px-3 py-1">
                    {blog.category}
                  </div>
                </div>
                
                <div className="p-8 flex flex-col flex-grow">
                  <div className="flex items-center space-x-6 text-xs text-gray-400 font-bold uppercase tracking-widest mb-6">
                    <span className="flex items-center"><Calendar className="w-3 h-3 mr-2" /> {blog.date}</span>
                    <span className="flex items-center"><User className="w-3 h-3 mr-2" /> {blog.author}</span>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-secondary mb-4 leading-tight group-hover:text-primary transition-colors">
                    {blog.title}
                  </h2>
                  
                  <p className="text-gray-600 leading-relaxed mb-8 flex-grow">
                    {blog.excerpt}
                  </p>
                  
                  <Link href="/blogs" className="inline-flex items-center text-secondary font-black uppercase text-xs tracking-[0.2em] group-hover:text-primary transition-all">
                    Read Full Story
                    <ArrowRight className="w-4 h-4 ml-4 transition-transform group-hover:translate-x-2" />
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {/* Pagination Placeholder */}
          <div className="mt-20 flex justify-center space-x-2">
            {[1, 2, 3].map(page => (
              <button 
                key={page} 
                className={`w-12 h-12 flex items-center justify-center font-bold border ${page === 1 ? 'bg-primary border-primary text-white' : 'bg-white border-gray-100 text-secondary hover:border-primary transition-colors'}`}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-secondary py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-[0.2em]">Subscribe to Technical Insights</h2>
          <p className="text-gray-400 mb-10">Get the latest technical articles and product updates delivered directly to your inbox.</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <input 
              type="email" 
              placeholder="Enter your business email" 
              className="flex-grow px-6 py-4 bg-[#1a1a1a] border border-gray-800 text-white outline-none focus:border-primary transition-all"
            />
            <Button size="lg" className="px-10">Subscribe Now</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
