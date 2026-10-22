import dbConnect from '@/lib/dbConnect';
import Blog from '@/models/Blog';
import { logger } from '@/lib/logger';
import { notFound } from 'next/navigation';
import { Calendar, User, ArrowRight, Share2, Globe, MessageSquare, Link as LinkIcon, Mail, Eye, Sparkles, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import SidebarContactForm from '@/components/blogs/SidebarContactForm';
import PageBanner from '@/components/ui/PageBanner';
import { cachedFetch } from '@/lib/cache';
import { getOptimizedImageUrl } from '@/lib/image';
import { cleanSeoHtml, stripHtml } from '@/lib/seoContent';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const blog: any = await cachedFetch(
    `blog:meta:${slug}`,
    async () => {
      await dbConnect();
      return Blog.findOne({
        $or: [
          { slug: slug },
          { slug: `/${slug}` }
        ]
      }).select('title slug content image category metaTitle metaDescription focusKeyword ogTitle ogDescription tags').lean();
    },
    600
  );

  if (!blog) return { title: 'Not Found' };

  const title = blog.metaTitle || blog.title;
  const description = blog.metaDescription || blog.content?.substring(0, 160).replace(/<[^>]*>/g, '');

  return {
    title: `${title} | LabZenix Knowledge Center`,
    description: description,
    keywords: blog.focusKeyword ? [blog.focusKeyword, blog.category, blog.tags?.join(', ')].filter(Boolean) : [blog.category, blog.tags?.join(', ')].filter(Boolean),
    alternates: {
      canonical: `/blogs/${slug}`,
    },
    openGraph: {
      title: blog.ogTitle ? `${blog.ogTitle} | LabZenix Knowledge Center` : `${title} | LabZenix Knowledge Center`,
      description: blog.ogDescription || description,
      url: `/blogs/${slug}`,
      images: [getOptimizedImageUrl(blog.image, { width: 1200, height: 630 })],
    },
  };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await dbConnect();

  logger.info('Fetching blog details', { slug });
  // Increment view counter and fetch blog document with author name
  const blog = await Blog.findOneAndUpdate(
    {
      $or: [
        { slug: slug },
        { slug: `/${slug}` }
      ]
    },
    { $inc: { views: 1 } },
    { returnDocument: 'after' }
  ).select('title slug content image category status tags author createdAt views').populate('author', 'name').lean();

  if (!blog || (blog.status === 'draft')) {
    notFound();
  }

  // Fetch Sidebar Data with projection & lean (Top 5)
  const recentBlogs = await cachedFetch(
    `blogs:recent:top5:${blog._id}`,
    async () => {
      return Blog.find({
        status: { $ne: 'draft' },
        _id: { $ne: blog._id }
      })
        .select('title slug image category createdAt')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();
    },
    300
  );

  const popularBlogs = await cachedFetch(
    `blogs:popular:top5:${blog._id}`,
    async () => {
      return Blog.find({
        status: { $ne: 'draft' },
        _id: { $ne: blog._id }
      })
        .select('title slug image category views createdAt')
        .sort({ views: -1 })
        .limit(5)
        .lean();
    },
    300
  );

  const relatedBlogs = await cachedFetch(
    `blogs:related:${blog.category}:${blog._id}`,
    async () => {
      return Blog.find({
        status: 'published',
        category: blog.category,
        _id: { $ne: blog._id }
      })
        .select('title slug image category createdAt')
        .sort({ createdAt: -1 })
        .limit(3)
        .lean();
    },
    300
  );

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://labzenix.com';
  const blogUrl = `${siteUrl}/blogs/${blog.slug}`;
  const cleanExcerpt = blog.metaDescription || stripHtml(blog.content || '').substring(0, 200);

  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: blog.title,
    description: cleanExcerpt,
    image: [blog.image ? (blog.image.startsWith('http') ? blog.image : `${siteUrl}${blog.image}`) : `${siteUrl}/og-image.png`],
    datePublished: new Date(blog.createdAt).toISOString(),
    dateModified: new Date(blog.updatedAt || blog.createdAt).toISOString(),
    author: {
      '@type': 'Person',
      name: blog.author?.name || 'LabZenix Editorial Team',
    },
    publisher: {
      '@type': 'Organization',
      name: 'LabZenix Industries Pvt. Ltd.',
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/icon.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': blogUrl,
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
        name: 'Blogs',
        item: `${siteUrl}/blogs`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: blog.title,
        item: blogUrl,
      },
    ],
  };

  return (
    <div className="bg-white min-h-screen">
      {/* ─── JSON-LD Structured Data ───────────────────────── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <PageBanner
        title={blog.title}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Blogs', href: '/blogs' },
          { label: blog.title }
        ]}
        showBackButton={true}
        backUrl="/blogs"
        as="h2"
      />

      {/* Main Content Area */}
      <section className="py-8 sm:py-16 lg:py-24 px-[5px] sm:px-4">
        <div className="w-full sm:w-[90%] mx-auto px-[5px] sm:px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">

            {/* Article Body */}
            <div className="lg:col-span-8">
              <article className="bg-white border border-gray-100 shadow-md rounded-sm p-2 sm:p-8 lg:p-12 space-y-6 sm:space-y-8 text-gray-700 leading-relaxed">
                {/* Article Header & Image */}
                <div>
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.1em] text-gray-500 mb-6 sm:mb-8">
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
                  dangerouslySetInnerHTML={{ __html: cleanSeoHtml(blog.content, `/blogs/${blog.slug}`) }}
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
            <aside className="lg:col-span-4 space-y-6">

              {/* Recent Blogs Section */}
              <div className="bg-white border border-gray-200/80 shadow-xl rounded-lg p-5 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary via-purple-600 to-primary" />
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-4.5 bg-primary rounded-full" />
                    <h3 className="text-base font-black text-secondary uppercase tracking-tight m-0 p-0 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-primary" />
                      Recent Blogs
                    </h3>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded">
                    Recent
                  </span>
                </div>
                <div className="divide-y divide-gray-100">
                  {recentBlogs.map((post: any) => (
                    <Link 
                      key={post._id} 
                      href={`/blogs/${post.slug}`} 
                      className="group block py-2.5 first:pt-0 last:pb-0 transition-colors"
                    >
                      <div className="flex gap-3 items-center">
                        <div className="w-20 h-16 sm:w-24 sm:h-18 shrink-0 bg-gray-50 rounded overflow-hidden relative border border-gray-200/70 shadow-2xs">
                          <Image 
                            src={getOptimizedImageUrl(post.image, { width: 240, height: 180, crop: 'fit' })} 
                            fill 
                            className="object-contain p-1 group-hover:scale-105 transition-transform duration-300" 
                            alt={post.title} 
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="block text-[10px] font-extrabold text-primary uppercase tracking-wider line-clamp-1 m-0 p-0 mb-0.5">
                            {post.category || 'Instruments'}
                          </span>
                          <h4 className="text-[13px] sm:text-sm font-bold text-secondary line-clamp-2 leading-snug tracking-tight m-0 p-0">
                            {post.title}
                          </h4>
                          {post.createdAt && (
                            <div className="flex items-center gap-1 mt-1 text-[11px] text-gray-400 font-medium m-0 p-0">
                              <Calendar className="w-3 h-3 text-gray-400 flex-shrink-0" />
                              <span>{new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Trending Blogs Section */}
              <div className="bg-white border border-gray-200/80 shadow-xl rounded-lg p-5 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-purple-600 via-primary to-purple-600" />
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-4.5 bg-purple-600 rounded-full" />
                    <h3 className="text-base font-black text-secondary uppercase tracking-tight m-0 p-0 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-purple-600" />
                      Trending Blogs
                    </h3>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                    Trending
                  </span>
                </div>
                <div className="divide-y divide-gray-100">
                  {popularBlogs.map((post: any, index: number) => (
                    <Link 
                      key={post._id} 
                      href={`/blogs/${post.slug}`} 
                      className="group block py-2.5 first:pt-0 last:pb-0 transition-colors"
                    >
                      <div className="flex gap-3 items-center">
                        <div className="w-20 h-16 sm:w-24 sm:h-18 shrink-0 bg-gray-50 rounded overflow-hidden relative border border-gray-200/70 shadow-2xs">
                          <Image 
                            src={getOptimizedImageUrl(post.image, { width: 240, height: 180, crop: 'fit' })} 
                            fill 
                            className="object-contain p-1 group-hover:scale-105 transition-transform duration-300" 
                            alt={post.title} 
                          />
                          <div className="absolute top-1 left-1 bg-secondary/85 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-xs z-10">
                            #{index + 1}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="block text-[10px] font-extrabold text-primary uppercase tracking-wider line-clamp-1 m-0 p-0 mb-0.5">
                            {post.category || 'Instruments'}
                          </span>
                          <h4 className="text-[13px] sm:text-sm font-bold text-secondary line-clamp-2 leading-snug tracking-tight m-0 p-0">
                            {post.title}
                          </h4>
                          <div className="flex items-center gap-1 mt-1 text-[11px] text-gray-400 font-medium m-0 p-0">
                            <Eye className="w-3 h-3 text-purple-600 flex-shrink-0" />
                            <span>{(post.views || 0).toLocaleString()} views</span>
                          </div>
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
        <section className="py-10 sm:py-16 md:py-24 bg-gray-50 border-y border-gray-100 px-[5px] sm:px-4">
          <div className="w-full sm:w-[90%] mx-auto px-[5px] sm:px-4">
            <div className="flex items-center justify-between mb-8 sm:mb-12 px-1 sm:px-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-secondary uppercase tracking-[0.5px] mb-1 sm:mb-2">Related Scientific Insights</h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Similar Categories</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 px-1 sm:px-4">
              {relatedBlogs.map((post: any) => (
                <Link key={post._id} href={`/blogs/${post.slug}`} className="group block h-full" style={{ perspective: '1000px' }}>
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
                    <div className="aspect-video relative overflow-hidden bg-gray-50">
                      <Image src={post.image} fill className="object-cover transition-all duration-700 group-hover:scale-105" alt="" />
                    </div>
                  <div className="p-5 sm:p-8 flex flex-col flex-grow">
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-3 sm:mb-4 inline-block">{post.category}</span>
                    <h4 className="text-base sm:text-lg font-bold text-secondary mb-4 sm:mb-6 group-hover:text-primary transition-colors leading-tight">{post.title}</h4>
                    <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center">
                        <Calendar className="w-3 h-3 mr-2" />
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                      <ArrowRight className="w-4 h-4 text-primary transition-transform group-hover:translate-x-2" />
                    </div>
                  </div>
                  </article>
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
