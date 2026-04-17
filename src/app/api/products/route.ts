import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import slugify from 'slugify';

export async function GET() {
  await dbConnect();
  const products = await Product.find({}).sort({ createdAt: -1 });
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    
    // Explicit validation to prevent generic 500 errors
    if (!body.title || !body.category) {
      return NextResponse.json({ error: 'Title and Category are mandatory' }, { status: 400 });
    }

    const slug = slugify(body.title, { lower: true, strict: true });
    // Check if slug already exists to provide a better error message
    const existing = await Product.findOne({ slug });
    if (existing) {
      return NextResponse.json({ error: 'An instrument with this model title already exists' }, { status: 400 });
    }

    const product = await Product.create({ ...body, slug });
    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Catalog synchronization failed' }, { status: 500 });
  }
}