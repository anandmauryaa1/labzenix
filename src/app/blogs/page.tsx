import dbConnect from '@/lib/dbConnect';
import Blog from '@/models/Blog';
import { Calendar, User, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { getPageMetadata } from '@/lib/seo';
import FadeIn from '@/components/ui/FadeIn';

export async function generateMetadata() {
  return await getPageMetadata('blogs');
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await dbConnect();
  const searchParamsObj = await searchParams;
  const currentPage = parseInt(searchParamsObj.page || '1');
  const limit = 6;
  const skip = (currentPage - 1) * limit;

  // Include legacy blogs (no status) and published ones
  const totalBlogs = await Blog.countDocuments({ status: { $ne: 'draft' } });
  const totalPages = Math.ceil(totalBlogs / limit);

  const blogs = await Blog.find({ status: { $ne: 'draft' } })
    .populate('author', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return (
    <div className="bg-white overflow-hidden">
      {/* Blog Hero */}
      <section className="bg-gray-50 py-24 border-b border-gray-100">
        <div className="max-w-7xl auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn direction="up">
            <span className="text-primary font-black tracking-[0.3em] uppercase text-[10px] mb-4 block">
              Knowledge Center
            </span>
            <h1 className="text-4xl md:text-7xl font-black text-secondary mb-6 uppercase tracking-tighter leading-none">
              Knowledge <span className="text-primary">& Insights</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed font-medium">
              Stay updated with the latest industry standards, maintenance tips, and technological breakthroughs in laboratory testing.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Blog Feed */}
      <section className="py-24 px-4 bg-white relative">
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full -ml-32 -mt-32 blur-3xl opacity-50" />
        <div className="max-w-7xl mx-auto relative z-10">
          {blogs.length === 0 ? (
            <div className="text-center py-32">
               <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">The Knowledge Center is currently being updated.</p>
            </div>
          ) : (
            <FadeIn stagger direction="none">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {blogs.map((blog: any) => (
                  <FadeIn key={blog._id} direction="up" delay={0.1}>
                    <article className="bg-white border border-gray-100 flex flex-col group overflow-hidden hover:shadow-2xl transition-all duration-500 h-full">
                      <Link href={`/blogs/${blog.slug}`} className="block overflow-hidden relative aspect-[16/10]">
                        <Image 
                          src={blog.image || 'https://images.unsplash.com/photo-1579154341098-e4e158cc7f55?auto=format&fit=crop&q=80&w=800'} 
                          alt={blog.title} 
                          fill
                          className="object-cover transition-transform duration-1000 group-hover:scale-110 grayscale group-hover:grayscale-0"
                        />
                        <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 z-20">
                          {blog.category}
                        </div>
                        <div className="absolute inset-0 bg-secondary/0 group-hover:bg-secondary/10 transition-colors duration-500 z-10" />
                      </Link>
                      
                      <div className="p-8 flex flex-col flex-grow">
                        <div className="flex items-center space-x-6 text-[10px] text-gray-400 font-black uppercase tracking-widest mb-6 border-b border-gray-50 pb-4">
                          <span className="flex items-center"><Calendar className="w-3 h-3 mr-2 text-primary" /> {new Date(blog.createdAt).toLocaleDateString()}</span>
                          <span className="flex items-center"><User className="w-3 h-3 mr-2 text-primary" /> {blog.author?.name || 'Editorial Team'}</span>
                        </div>
                        
                        <h2 className="text-2xl font-black text-secondary mb-4 leading-tight group-hover:text-primary transition-colors uppercase tracking-tight line-clamp-2">
                          {blog.title}
                        </h2>
                        
                        <p className="text-sm text-gray-500 font-medium leading-relaxed mb-8 flex-grow line-clamp-3">
                          {blog.metaDescription || blog.content.replace(/<[^>]*>/g, '').substring(0, 160) + '...'}
                        </p>
                        
                        <Link href={`/blogs/${blog.slug}`} className="inline-flex items-center text-secondary font-black uppercase text-[10px] tracking-[0.3em] group-hover:text-primary transition-all">
                          Read Story <span className="ml-3 text-sm">→</span>
                        </Link>
                      </div>
                    </article>
                  </FadeIn>
                ))}
              </div>
            </FadeIn>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-24 flex justify-center space-x-4 items-center">
              <Link
                href={`/blogs?page=${Math.max(1, currentPage - 1)}`}
                className={`w-14 h-14 border border-gray-100 flex items-center justify-center transition-all ${currentPage === 1 ? 'opacity-20 cursor-not-allowed pointer-events-none' : 'hover:bg-secondary hover:text-white hover:border-secondary'}`}
              >
                <ChevronLeft className="w-5 h-5" />
              </Link>

              <div className="flex space-x-3">
                {Array.from({ length: totalPages }).map((_, i) => {
                  const pageNum = i + 1;
                  const isActive = pageNum === currentPage;
                  return (
                    <Link
                      key={pageNum}
                      href={`/blogs?page=${pageNum}`}
                      className={`w-14 h-14 flex items-center justify-center font-black text-[14px] border transition-all duration-300 ${isActive ? 'bg-primary border-primary text-white shadow-xl shadow-primary/20 scale-110' : 'bg-white border-gray-100 text-secondary hover:border-primary'}`}
                    >
                      {pageNum}
                    </Link>
                  );
                })}
              </div>

              <Link
                href={`/blogs?page=${Math.min(totalPages, currentPage + 1)}`}
                className={`w-14 h-14 border border-gray-100 flex items-center justify-center transition-all ${currentPage === totalPages ? 'opacity-20 cursor-not-allowed pointer-events-none' : 'hover:bg-secondary hover:text-white hover:border-secondary'}`}
              >
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-secondary py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 pattern-grid opacity-10" />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <span className="text-primary font-black tracking-[0.3em] uppercase text-[10px] mb-4 block">Newsletter</span>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6 uppercase tracking-tighter leading-none">Subscribe to Scientific Insights</h2>
          <p className="text-lg text-gray-400 mb-12 font-medium">Get the latest technical articles and standards delivered to your inbox.</p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto bg-white/5 p-2 backdrop-blur-sm border border-white/10">
            <input 
              type="email" 
              placeholder="Enter your business email" 
              className="flex-grow px-8 py-5 bg-transparent text-white outline-none font-bold uppercase tracking-widest text-xs placeholder:text-gray-600"
            />
            <button className="px-10 py-5 bg-primary text-white font-black uppercase tracking-[0.2em] text-[10px] hover:bg-white hover:text-secondary transition-all">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
