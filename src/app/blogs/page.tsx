import dbConnect from '@/lib/dbConnect';
import Blog from '@/models/Blog';
import { Calendar, User, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { getPageMetadata } from '@/lib/seo';
import FadeIn from '@/components/ui/FadeIn';
import PageBanner from '@/components/ui/PageBanner';

export async function generateMetadata() {
  return await getPageMetadata('blogs');
}

export const dynamic = 'force-dynamic';

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const searchParamsObj = await searchParams;
  const currentPage = parseInt(searchParamsObj.page || '1');
  const limit = 12;
  const skip = (currentPage - 1) * limit;

  let totalBlogs = 0;
  let totalPages = 1;
  let blogs: any[] = [];

  try {
    await dbConnect();
    totalBlogs = await Blog.countDocuments({ status: { $ne: 'draft' } });
    totalPages = Math.ceil(totalBlogs / limit);
    blogs = await Blog.find({ status: { $ne: 'draft' } })
      .populate('author', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  } catch {
    // DB unavailable — render empty state
  }

  return (
    <div className="bg-white overflow-hidden">
      <PageBanner
        title="Our Blogs"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Blogs' }
        ]}
      />
      {/* Blog Hero */}
      {/* <section className="bg-gray-50 py-24 border-b border-gray-100 flex justify-center">
        <div className="max-w-7xl auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn direction="up">
            <span className="text-primary font-black tracking-[0.3em] uppercase text-[10px] mb-4 block">
              Our Blogs
            </span>
            <h1 className="text-4xl md:text-7xl font-black text-secondary mb-6 uppercase tracking-tighter leading-none">
              Our <span className="text-primary">Blogs</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed font-medium">
              Stay updated with the latest industry standards, maintenance tips, and technological breakthroughs in laboratory testing.
            </p>
          </FadeIn>
        </div>
      </section> */}

      {/* Blog Feed */}
      <section className="py-8 sm:py-14 md:py-20 px-[5px] sm:px-4 bg-white relative">
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full -ml-32 -mt-32 blur-3xl opacity-50" />
        <div className="w-full sm:w-[90%] mx-auto px-[5px] sm:px-4 relative z-10">
          {blogs.length === 0 ? (
            <div className="text-center py-20 sm:py-32">
              <p className="text-gray-400 font-bold uppercase tracking-widest text-xs sm:text-sm">The Knowledge Center is currently being updated.</p>
            </div>
          ) : (
            <FadeIn stagger direction="none">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {blogs.map((blog: any) => (
                  <FadeIn key={blog._id} direction="up" delay={0.1}>
                    <Link href={`/blogs/${blog.slug}`} className="group block h-full" style={{ perspective: '1000px' }}>
                      <article
                        style={{
                          borderRadius: '4px',
                          transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.35s ease',
                          transformStyle: 'preserve-3d',
                          boxShadow: '0 20px 25px -5px rgba(0, 74, 173, 0.12), 0 8px 10px -6px rgba(0, 74, 173, 0.08)',
                        }}
                        className="bg-white border border-gray-100 flex flex-col overflow-hidden h-full cursor-pointer relative shadow-xl hover:shadow-2xl group-hover:[transform:translateY(-6px)_rotateX(2deg)] group-hover:[box-shadow:0_25px_50px_rgba(139,92,246,0.22),0_12px_24px_rgba(0,74,173,0.12),0_0_0_1px_rgba(139,92,246,0.16)]"
                      >
                        {/* Top gradient accent line */}
                        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary via-secondary to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
                        <div className="block overflow-hidden relative aspect-[16/9] bg-gray-50">
                          <Image
                            src={blog.image || 'https://images.unsplash.com/photo-1579154341098-e4e158cc7f55?auto=format&fit=crop&q=80&w=800'}
                            alt={blog.title}
                            fill
                            className="object-contain p-3 transition-transform duration-500 ease-out group-hover:scale-108"
                          />
                          <div className="absolute inset-0 bg-secondary/0 group-hover:bg-secondary/5 transition-colors duration-500 z-10" />
                        </div>

                        <div className="p-4 sm:p-5 flex flex-col flex-grow">
                          <div className="flex items-center space-x-3 text-[10px] text-gray-400 font-black uppercase tracking-widest mb-3 border-b border-gray-50 pb-2.5">
                            <span className="flex items-center"><Calendar className="w-3 h-3 mr-1 text-primary" /> {new Date(blog.createdAt).toLocaleDateString()}</span>
                            <span className="flex items-center"><User className="w-3 h-3 mr-1 text-primary" /> {blog.author?.name || 'Editorial Team'}</span>
                          </div>

                          <h2 className="text-sm sm:text-base md:text-lg font-bold text-secondary mb-1.5 leading-snug tracking-tight line-clamp-2 m-0 p-0">
                            {blog.title}
                          </h2>

                          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mt-1 mb-4 flex-grow line-clamp-2 m-0 p-0">
                            {blog.metaDescription || blog.content.replace(/<[^>]*>/g, '').substring(0, 130) + '...'}
                          </p>

                          <span className="inline-flex items-center text-secondary font-bold uppercase text-[10px] tracking-wider mt-auto">
                            Read Story
                            <span className="ml-1.5 text-xs transition-transform duration-300 group-hover:translate-x-1">→</span>
                          </span>
                        </div>
                      </article>
                    </Link>
                  </FadeIn>

                ))}
              </div>
            </FadeIn>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 sm:mt-16 md:mt-20 flex justify-center space-x-2 sm:space-x-3 items-center">
              <Link
                href={`/blogs?page=${Math.max(1, currentPage - 1)}`}
                className={`w-10 h-10 sm:w-12 sm:h-12 border border-gray-100 flex items-center justify-center transition-all ${currentPage === 1 ? 'opacity-20 cursor-not-allowed pointer-events-none' : 'hover:bg-secondary hover:text-white hover:border-secondary'}`}
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
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
