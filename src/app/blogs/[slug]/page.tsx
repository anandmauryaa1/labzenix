import dbConnect from '@/lib/dbConnect';
import Blog from '@/models/Blog';
import { notFound } from 'next/navigation';
import { Calendar, User, ArrowRight, Share2, Globe, MessageSquare, Link as LinkIcon, Mail } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await dbConnect();
  const blog = await Blog.findOne({ 
    $or: [
      { slug: slug },
      { slug: `/${slug}` }
    ]
  });
  if (!blog) return {};

  return {
    title: `${blog.metaTitle} | LabZenix Knowledge Center`,
    description: blog.metaDescription,
    openGraph: {
      title: blog.metaTitle,
      description: blog.metaDescription,
      images: [blog.image],
    },
  };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await dbConnect();

  console.log('Fetching blog with slug:', slug);
  // Try matching slug exactly as passed or with a leading slash if stored that way
  const blog = await Blog.findOneAndUpdate(
    { 
      $or: [
        { slug: slug },
        { slug: `/${slug}` }
      ]
    },
    { $inc: { views: 1 } },
    { new: true }
  ).populate('author', 'name');

  if (!blog || (blog.status === 'draft')) {
    notFound();
  }

  // Fetch Sidebar Data
  const recentBlogs = await Blog.find({ 
    status: 'published', 
    _id: { $ne: blog._id } 
  })
  .sort({ createdAt: -1 })
  .limit(3)
  .lean();

  const popularBlogs = await Blog.find({ 
    status: 'published', 
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
      {/* Blog Hero/Header */}
      <section className="relative h-[50vh] min-h-[400px] overflow-hidden bg-secondary">
        <img 
          src={blog.image} 
          className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale hover:grayscale-0 transition-all duration-1000"
          alt={blog.title} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/40 to-transparent" />
        
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-16">
            <div className="max-w-3xl">
              <span className="inline-block px-4 py-1 bg-primary text-white text-[10px] font-black uppercase tracking-[0.3em] mb-6">
                {blog.category}
              </span>
              <h1 className="text-4xl md:text-6xl font-black text-white leading-tight uppercase tracking-tighter mb-8">
                {blog.title}
              </h1>
              <div className="flex flex-wrap items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-3 text-primary" />
                  {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
                <span className="flex items-center">
                  <User className="w-4 h-4 mr-3 text-primary" />
                  By {blog.author?.name || 'Technical Division'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
            
            {/* Article Body */}
            <div className="lg:col-span-8">
              <div 
                className="prose prose-lg max-w-none prose-headings:text-secondary prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tighter prose-p:text-gray-600 prose-p:leading-relaxed prose-img:rounded-none prose-a:text-primary prose-strong:text-secondary"
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />

              <div className="mt-20 pt-12 border-t border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-4">Share this Protocol</h4>
                    <div className="flex items-center space-x-4">
                        <button className="w-10 h-10 flex items-center justify-center bg-gray-50 text-secondary hover:bg-primary hover:text-white transition-all">
                            <Globe className="w-4 h-4" />
                        </button>
                        <button className="w-10 h-10 flex items-center justify-center bg-gray-50 text-secondary hover:bg-primary hover:text-white transition-all">
                            <MessageSquare className="w-4 h-4" />
                        </button>
                        <button className="w-10 h-10 flex items-center justify-center bg-gray-50 text-secondary hover:bg-primary hover:text-white transition-all">
                            <LinkIcon className="w-4 h-4" />
                        </button>
                        <button className="w-10 h-10 flex items-center justify-center bg-gray-50 text-secondary hover:bg-primary hover:text-white transition-all">
                            <Mail className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                
                <div className="px-8 py-6 bg-gray-50 border-l-4 border-primary max-w-md">
                    <p className="text-xs font-bold text-secondary italic leading-relaxed">
                        "Technical integrity is the foundation of scientific advancement. Our knowledge center is dedicated to preserving laboratory standards globally."
                    </p>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-4 space-y-16">
              
              {/* Recent Posts Section */}
              <div>
                <h3 className="text-sm font-black text-secondary uppercase tracking-[0.3em] mb-10 pb-4 border-b-2 border-primary inline-block">
                    Latest Insights
                </h3>
                <div className="space-y-10">
                  {recentBlogs.map((post: any) => (
                    <Link key={post._id} href={`/blogs/${post.slug}`} className="group block">
                      <div className="flex gap-6 items-start">
                        <div className="w-20 h-20 shrink-0 bg-gray-100 overflow-hidden">
                          <img src={post.image} className="w-full h-full object-cover grayscale transition-transform duration-500 group-hover:scale-110 group-hover:grayscale-0" alt="" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-2">{post.category}</p>
                          <h4 className="text-sm font-bold text-secondary group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                            {post.title}
                          </h4>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Popular Posts Section */}
              <div>
                <h3 className="text-sm font-black text-secondary uppercase tracking-[0.3em] mb-10 pb-4 border-b-2 border-primary inline-block">
                    Popular Protocols
                </h3>
                <div className="space-y-10">
                  {popularBlogs.map((post: any) => (
                    <Link key={post._id} href={`/blogs/${post.slug}`} className="group block">
                      <div className="flex gap-6 items-start">
                        <div className="w-20 h-20 shrink-0 bg-gray-100 overflow-hidden relative">
                          <img src={post.image} className="w-full h-full object-cover grayscale transition-transform duration-500 group-hover:scale-110 group-hover:grayscale-0" alt="" />
                          <div className="absolute top-0 right-0 bg-secondary text-white text-[8px] font-black px-1 py-0.5">
                            {post.views || 0}
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-2">{post.category}</p>
                          <h4 className="text-sm font-bold text-secondary group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                            {post.title}
                          </h4>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Categories Section */}
              <div>
                <h3 className="text-sm font-black text-secondary uppercase tracking-[0.3em] mb-10 pb-4 border-b-2 border-primary inline-block">
                    Classifications
                </h3>
                <div className="flex flex-wrap gap-3">
                  {categories.map((cat: string) => (
                    <Link key={cat} href={`/blogs?category=${cat}`}>
                        <span className="px-4 py-2 border border-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:border-primary hover:text-primary transition-all cursor-pointer">
                            {cat}
                        </span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* CTA Section */}
              <div className="bg-secondary p-10 relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="text-xl font-black text-white uppercase tracking-tight leading-tight mb-6">
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
                        <h3 className="text-2xl font-black text-secondary uppercase tracking-tight mb-2">Related Scientific Insights</h3>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Similar Protocol Classifications</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
                    {relatedBlogs.map((post: any) => (
                        <Link key={post._id} href={`/blogs/${post.slug}`} className="group bg-white border border-gray-100 overflow-hidden flex flex-col">
                            <div className="aspect-video relative overflow-hidden">
                                <img src={post.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" alt="" />
                            </div>
                            <div className="p-8 flex flex-col flex-grow">
                                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4 inline-block">{post.category}</span>
                                <h4 className="text-lg font-black text-secondary mb-6 group-hover:text-primary transition-colors leading-tight">{post.title}</h4>
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
