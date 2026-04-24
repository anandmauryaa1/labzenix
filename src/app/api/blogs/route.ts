import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Blog from '@/models/Blog';
import User from '@/models/User';
import { handleProductionError } from '@/lib/errorHandler';
import { getAuthUser, hasPermission } from '@/lib/auth';
import { invalidateBlogCaches } from '@/lib/cacheRevalidation';
import { z } from 'zod';
import { logger } from '@/lib/logger';

const blogSchema = z.object({
  title: z.string().min(1, 'Title is required').trim(),
  slug: z.string().min(1, 'Slug is required').trim(),
  content: z.string().min(1, 'Content is required').trim(),
  image: z.string().min(1, 'Image is required').trim(),
  category: z.string().min(1, 'Category is required').trim(),
  status: z.enum(['draft', 'published']).default('draft'),
  tags: z.array(z.string()).optional(),
  metaTitle: z.string().min(1, 'Meta title is required').trim(),
  metaDescription: z.string().min(1, 'Meta description is required').trim(),
});

export async function GET() {
  try {
    await dbConnect();
    const blogs = await Blog.find({})
      .populate({ path: 'author', model: User, select: 'name' })
      .sort({ createdAt: -1 })
      .lean()
      .select('-__v');
    return NextResponse.json(blogs);
  } catch (error: any) {
    return handleProductionError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });

    const canEditBlogs = await hasPermission(req, 'blogs');
    if (!canEditBlogs) return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });

    await dbConnect();
    const rawBody = await req.json();
    
    const result = blogSchema.safeParse(rawBody);
    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.format() }, { status: 400 });
    }

    const body = result.data;
    let authorId = user.id;
    
    // Handle legacy dummy sessions
    if (authorId === 'dummy-id') {
      const firstAdmin = await User.findOne({ role: 'admin' });
      if (firstAdmin) {
        authorId = firstAdmin._id;
      } else {
        return NextResponse.json({ error: 'System configuration error: No admin found.' }, { status: 500 });
      }
    }
    
    const blog = await Blog.create({
      ...body,
      author: authorId
    });

    // Revalidate cached pages
    await invalidateBlogCaches(blog.slug);
    
    logger.info('Blog post created successfully', { blogId: blog._id, slug: blog.slug, user: user.username });
    return NextResponse.json(blog, { status: 201 });
  } catch (error: any) {
    return handleProductionError(error);
  }
}
