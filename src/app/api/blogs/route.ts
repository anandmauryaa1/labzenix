import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Blog from '@/models/Blog';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { handleProductionError } from '@/lib/errorHandler';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    // Ensure User model is registered before populate
    const blogs = await Blog.find({})
      .populate({ path: 'author', model: User, select: 'name' })
      .sort({ createdAt: -1 });
    return NextResponse.json(blogs);
  } catch (error: any) {
    return handleProductionError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('admin_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    await dbConnect();
    const body = await req.json();
    
    let authorId = decoded.id;
    
    // Handle dummy dev sessions by using the first real admin as author
    if (authorId === 'dummy-id') {
      const firstAdmin = await User.findOne({ role: 'admin' });
      if (firstAdmin) {
        authorId = firstAdmin._id;
      } else {
        return NextResponse.json({ error: 'No administrative user found to assign as author.' }, { status: 400 });
      }
    }
    
    const blog = await Blog.create({
      ...body,
      author: authorId
    });

    return NextResponse.json(blog, { status: 201 });
  } catch (error: any) {
    return handleProductionError(error);
  }
}
