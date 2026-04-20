import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import dbConnect from '@/lib/dbConnect';
import Blog from '@/models/Blog';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { handleProductionError } from '@/lib/errorHandler';

export async function GET(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ id: string }> }
) {
  const params = await paramsPromise;
  try {
    await dbConnect();
    const blog = await Blog.findById(params.id).populate('author', 'name');
    if (!blog) return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    return NextResponse.json(blog);
  } catch (error: any) {
    return handleProductionError(error);
  }
}

export async function PUT(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ id: string }> }
) {
  const params = await paramsPromise;
  try {
    const token = req.cookies.get('admin_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const body = await req.json();
    
    const blog = await Blog.findByIdAndUpdate(params.id, body, { returnDocument: 'after', runValidators: true });
    if (!blog) return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });

    // Revalidate cached pages
    revalidatePath('/admin/blogs');
    revalidatePath('/blogs');
    revalidatePath(`/blogs/${blog.slug}`);
    revalidateTag('blogs', "default");

    return NextResponse.json(blog);
  } catch (error: any) {
    return handleProductionError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ id: string }> }
) {
  const params = await paramsPromise;
  try {
    const token = req.cookies.get('admin_token')?.value;
    if (!token) {
      console.warn('Delete Attempt Failed: No admin_token provided for ID:', params.id);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    console.log('Deleting blog post:', params.id);
    const blog = await Blog.findByIdAndDelete(params.id);
    
    if (!blog) {
      console.warn('Delete Attempt Failed: Blog not found in database:', params.id);
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    console.log('Blog post deleted successfully:', params.id);
    
    // Revalidate cached pages
    revalidatePath('/admin/blogs');
    revalidatePath('/blogs');
    revalidatePath(`/blogs/${blog.slug}`);
    revalidateTag('blogs', "default");
    
    return NextResponse.json({ message: 'Blog post deleted successfully' });
  } catch (error: any) {
    console.error('Delete Protocol Failure:', error);
    return handleProductionError(error);
  }
}
