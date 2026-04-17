import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import Blog from '@/models/Blog';
import Inquiry from '@/models/Inquiry';

export async function GET() {
  await dbConnect();
  const [products, blogs, inquiries] = await Promise.all([
    Product.countDocuments(),
    Blog.countDocuments(),
    Inquiry.countDocuments(),
  ]);
  return NextResponse.json({ products, blogs, inquiries });
}