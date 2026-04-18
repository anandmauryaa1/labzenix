import dbConnect from '@/lib/dbConnect';
import Blog from '@/models/Blog';
import Button from '@/components/ui/Button';
import { Calendar, User, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { getPageMetadata } from '@/lib/seo';

export async function generateMetadata() {
  return await getPageMetadata('blogs');
}

export default async function BlogPage() {
  await dbConnect();
  // Include legacy blogs (no status) and published ones
  const blogs = await Blog.find({ status: { $ne: 'draft' } }).populate('author', 'name').sort({ createdAt: -1 });

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
          {blogs.length === 0 ? (
            <div className="text-center py-20">
               <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">The Knowledge Center is currently being updated.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {blogs.map((blog: any) => (
                <article key={blog._id} className="bg-white border border-gray-100 flex flex-col group overflow-hidden">
                  <div className="aspect-video relative overflow-hidden">
                    <img 
                      src={blog.image || 'https://images.unsplash.com/photo-1579154341098-e4e158cc7f55?auto=format&fit=crop&q=80&w=800'} 
                      alt={blog.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale hover:grayscale-0"
                    />
                    <div className="absolute top-4 left-4 bg-primary text-white text-[10px] font-black uppercase tracking-widest px-3 py-1">
                      {blog.category}
                    </div>
                  </div>
                  
                  <div className="p-8 flex flex-col flex-grow">
                    <div className="flex items-center space-x-6 text-xs text-gray-400 font-bold uppercase tracking-widest mb-6">
                      <span className="flex items-center"><Calendar className="w-3 h-3 mr-2" /> {new Date(blog.createdAt).toLocaleDateString()}</span>
                      <span className="flex items-center"><User className="w-3 h-3 mr-2" /> {blog.author?.name || 'Technical Team'}</span>
                    </div>
                    
                    <h2 className="text-2xl font-bold text-secondary mb-4 leading-tight group-hover:text-primary transition-colors">
                      {blog.title}
                    </h2>
                    
                    <p className="text-gray-600 leading-relaxed mb-8 flex-grow line-clamp-3">
                      {blog.metaDescription || blog.content.replace(/<[^>]*>/g, '').substring(0, 160) + '...'}
                    </p>
                    
                    <Link href={`/blogs/${blog.slug}`} className="inline-flex items-center text-secondary font-black uppercase text-xs tracking-[0.2em] group-hover:text-primary transition-all">
                      Read Full Story
                      <ArrowRight className="w-4 h-4 ml-4 transition-transform group-hover:translate-x-2" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}

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
