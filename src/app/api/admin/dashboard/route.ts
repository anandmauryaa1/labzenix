import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import Blog from '@/models/Blog';
import Inquiry from '@/models/Inquiry';
import Category from '@/models/Category';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    // 1. Fetch counts
    const [productCount, blogCount, inquiryCount, categoryCount] = await Promise.all([
      Product.countDocuments(),
      Blog.countDocuments(),
      Inquiry.countDocuments(),
      Category.countDocuments(),
    ]);

    // 2. Fetch Recent Items
    const [recentInquiries, recentBlogs, recentProducts] = await Promise.all([
      Inquiry.find().sort({ createdAt: -1 }).limit(3).lean(),
      Blog.find()
        .sort({ createdAt: -1 })
        .limit(3)
        .populate('author', 'name')
        .lean(),
      Product.find().sort({ createdAt: -1 }).limit(3).lean(),
    ]);

    return NextResponse.json({
      stats: {
        products: productCount,
        blogs: blogCount,
        inquiries: inquiryCount,
        categories: categoryCount,
      },
      recentInquiries,
      recentBlogs,
      recentProducts
    });
  } catch (error: any) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
