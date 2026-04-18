import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { handleProductionError } from '@/lib/errorHandler';

export async function GET() {
  await dbConnect();
  const products = await Product.find({})
    .populate({ path: 'author', model: User, select: 'name' })
    .sort({ createdAt: -1 });
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('admin_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized: Security Protocol Active' }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    await dbConnect();
    const body = await req.json();
    
    console.log('[API] Processing Authenticated Product Insertion...');
    
    // Validate required fields
    if (!body.title || !body.title.trim()) {
      return NextResponse.json({ error: 'Instrument Title is required' }, { status: 400 });
    }
    if (!body.slug || !body.slug.trim()) {
      return NextResponse.json({ error: 'URL Slug must be provided and non-empty' }, { status: 400 });
    }
    if (!body.modelNumber || !body.modelNumber.trim()) {
      return NextResponse.json({ error: 'Technical Model Number is required' }, { status: 400 });
    }
    if (!body.category || !body.category.trim()) {
      return NextResponse.json({ error: 'Category classification is required' }, { status: 400 });
    }
    if (!body.description || !body.description.trim()) {
      return NextResponse.json({ error: 'Marketing description is required' }, { status: 400 });
    }
    if (!body.metaTitle || !body.metaTitle.trim()) {
      return NextResponse.json({ error: 'SEO Title is required' }, { status: 400 });
    }
    if (!body.metaDescription || !body.metaDescription.trim()) {
      return NextResponse.json({ error: 'SEO Description is required' }, { status: 400 });
    }
    
    let authorId = decoded.id;
    
    // Handle dummy dev sessions
    if (authorId === 'dummy-id') {
      const firstAdmin = await User.findOne({ role: 'admin' });
      if (firstAdmin) {
        authorId = firstAdmin._id;
      } else {
        return NextResponse.json({ error: 'No administrative user found for system assignment.' }, { status: 400 });
      }
    }
    
    const product = await Product.create({
      ...body,
      author: authorId
    });

    console.log('[API] Product Catalog Updated Successfully - ID:', product._id);
    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error('[API] FATAL: Product Creation Interrupted');
    console.error(error);
    return handleProductionError(error);
  }
}