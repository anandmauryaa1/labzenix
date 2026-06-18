import dbConnect from '@/lib/dbConnect';
import Blog from '@/models/Blog';
import { logger } from '@/lib/logger';
import { notFound } from 'next/navigation';
import { Calendar, User, ArrowRight, Share2, Globe, MessageSquare, Link as LinkIcon, Mail } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import SidebarContactForm from '@/components/blogs/SidebarContactForm';
import PageBanner from '@/components/ui/PageBanner';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await dbConnect();
  const blog = await Blog.findOne({ 
    $or: [
      { slug: slug },
      { slug: `/${slug}` }
    ]
  });
  if (!blog) return { title: 'Not Found' };

  const title = blog.metaTitle || blog.title;
  const description = blog.metaDescription || blog.content?.substring(0, 160).replace(/<[^>]*>/g, '');

  return {
    title: `${title} | LabZenix Knowledge Center`,
    description: description,
    keywords: blog.focusKeyword ? [blog.focusKeyword, blog.category, blog.tags?.join(', ')].filter(Boolean) : [blog.category, blog.tags?.join(', ')].filter(Boolean),
    openGraph: {
      title: blog.ogTitle ? `${blog.ogTitle} | LabZenix Knowledge Center` : `${title} | LabZenix Knowledge Center`,
      description: blog.ogDescription || description,
      images: [blog.image],
    },
  };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await dbConnect();

  logger.info('Fetching blog details', { slug });
  // Try matching slug exactly as passed or with a leading slash if stored that way
  const blog = await Blog.findOneAndUpdate(
    { 
      $or: [
        { slug: slug },
        { slug: `/${slug}` }
      ]
    },
    { $inc: { views: 1 } },
    { returnDocument: 'after' }
  ).populate('author', 'name');

  if (!blog || (blog.status === 'draft')) {
    notFound();
  }

  // Fetch Sidebar Data
  const recentBlogs = await Blog.find({ 
    status: { $ne: 'draft' }, 
    _id: { $ne: blog._id } 
  })
  .sort({ createdAt: -1 })
  .limit(3)
  .lean();

  const popularBlogs = await Blog.find({ 
    status: { $ne: 'draft' }, 
    _id: { $ne: blog._id } 
  })
  .sort({ views: -1 })
  .limit(3)
  .lean();

  const relatedBlogs = await Blog.find({ 
    status: 'published', 
    category: blog.category,
    _id: { $ne: blog._id } 
  })
  .sort({ createdAt: -1 })
  .limit(3)
  .lean();

  const categories = await Blog.distinct('category', { status: 'published' });

  return (
    <div className="bg-white min-h-screen">
      <PageBanner 
        title={blog.title} 
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Blogs', href: '/blogs' },
          { label: blog.title }
        ]} 
        showBackButton={true}
        backUrl="/blogs"
      />

      {/* Main Content Area */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
            
            {/* Article Body */}
            <div className="lg:col-span-8">
              <article className="bg-white border border-gray-100 shadow-md rounded-sm p-8 lg:p-12 space-y-8 text-gray-700 leading-relaxed">
                {/* Article Header & Image */}
                <div>
                  <div className="flex flex-wrap items-center gap-6 text-[12px] font-bold uppercase tracking-[0.1em] text-gray-500 mb-8">
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-primary" />
                      {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="flex items-center">
                      <User className="w-4 h-4 mr-2 text-primary" />
                      By {blog.author?.name || 'Editorial Team'}
                    </span>
                  </div>

                  <div className="relative w-full aspect-video overflow-hidden rounded-lg bg-gray-50">
                    <Image 
                      src={blog.image} 
                      fill
                      className="object-contain p-4"
                      alt={blog.title} 
                      priority
                    />
                  </div>
                </div>

                <div 
                  className="blog-content"
                  dangerouslySetInnerHTML={{ __html: blog.content }}
                />

                <div className="mt-12 pt-12 border-t border-gray-200 space-y-8">
                  {/* Share Section */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 mb-4">Share this Article</h4>
                      <div className="flex items-center space-x-3">
                        <button className="w-10 h-10 flex items-center justify-center bg-gray-100 text-secondary hover:bg-primary hover:text-white transition-all duration-300 rounded">
                          <Globe className="w-4 h-4" />
                        </button>
                        <button className="w-10 h-10 flex items-center justify-center bg-gray-100 text-secondary hover:bg-primary hover:text-white transition-all duration-300 rounded">
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        <button className="w-10 h-10 flex items-center justify-center bg-gray-100 text-secondary hover:bg-primary hover:text-white transition-all duration-300 rounded">
                          <LinkIcon className="w-4 h-4" />
                        </button>
                        <button className="w-10 h-10 flex items-center justify-center bg-gray-100 text-secondary hover:bg-primary hover:text-white transition-all duration-300 rounded">
                          <Mail className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                  </div>
                </div>
              </article>
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-4 space-y-8">

              {/* Recent Posts Section */}
              <div className="bg-white border border-gray-100 shadow-md rounded-sm p-8">
                <h3 className="text-xl font-bold text-secondary uppercase tracking-[0.5px] mb-8 pb-4 border-b border-gray-200">
                    Latest Insights
                </h3>
                <div className="space-y-6">
                  {recentBlogs.map((post: any) => (
                    <Link key={post._id} href={`/blogs/${post.slug}`} className="group block">
                      <div className="flex gap-4 items-start">
                        <div className="w-16 h-16 shrink-0 bg-white border border-gray-100 overflow-hidden relative">
                          <Image src={post.image} fill className="object-cover transition-transform duration-500 group-hover:scale-110" alt="" />
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">{post.category}</p>
                          <h4 className="text-xs font-bold text-secondary group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                            {post.title}
                          </h4>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Popular Posts Section */}
              <div className="bg-white border border-gray-100 shadow-md rounded-sm p-8">
                <h3 className="text-xl font-bold text-secondary uppercase tracking-[0.5px] mb-8 pb-4 border-b border-gray-200">
                    Popular Articles
                </h3>
                <div className="space-y-6">
                  {popularBlogs.map((post: any) => (
                    <Link key={post._id} href={`/blogs/${post.slug}`} className="group block">
                      <div className="flex gap-4 items-start">
                        <div className="w-16 h-16 shrink-0 bg-white border border-gray-100 overflow-hidden relative">
                          <Image src={post.image} fill className="object-cover transition-transform duration-500 group-hover:scale-110" alt="" />
                          <div className="absolute top-0 right-0 bg-secondary text-white text-[8px] font-black px-1 py-0.5">
                            {post.views || 0}
                          </div>
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">{post.category}</p>
                          <h4 className="text-xs font-bold text-secondary group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                            {post.title}
                          </h4>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* CTA Section */}
              <div className="bg-secondary p-10 relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="text-xl font-bold text-white uppercase tracking-[0.5px] leading-tight mb-6">
                        Need Custom <span className="text-primary italic">Lab Calibration?</span>
                    </h3>
                    <p className="text-gray-400 text-xs leading-relaxed mb-10">
                        Our technical experts are standing by to assist with your specific laboratory equipment requirements.
                    </p>
                    <Link href="/contact">
                        <button className="w-full py-4 bg-primary text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white hover:text-secondary transition-all">
                            Initiate Inquiry
                        </button>
                    </Link>
                </div>
                {/* Visual Accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 -mr-16 -mt-16 rotate-45" />
              </div>

              <SidebarContactForm source={`Blog: ${blog.title}`} />
            </aside>
          </div>
        </div>
      </section>

      {/* Related Content Grid */}
      {relatedBlogs.length > 0 && (
        <section className="py-24 bg-gray-50 border-y border-gray-100 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-16 px-4">
                    <div>
                        <h3 className="text-2xl font-bold text-secondary uppercase tracking-[0.5px] mb-2">Related Scientific Insights</h3>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Similar Categories</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
                    {relatedBlogs.map((post: any) => (
                        <Link key={post._id} href={`/blogs/${post.slug}`} className="group bg-white border border-gray-100 overflow-hidden flex flex-col">
                            <div className="aspect-video relative overflow-hidden">
                                <Image src={post.image} fill className="object-cover transition-all duration-700 group-hover:scale-105" alt="" />
                            </div>
                            <div className="p-8 flex flex-col flex-grow">
                                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4 inline-block">{post.category}</span>
                                <h4 className="text-lg font-bold text-secondary mb-6 group-hover:text-primary transition-colors leading-tight">{post.title}</h4>
                                <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center">
                                        <Calendar className="w-3 h-3 mr-2" />
                                        {new Date(post.createdAt).toLocaleDateString()}
                                    </span>
                                    <ArrowRight className="w-4 h-4 text-primary transition-transform group-hover:translate-x-2" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
      )}

      {/* Newsletter Placeholder or Padding */}
      <div className="h-24"></div>
    </div>
  );
}
