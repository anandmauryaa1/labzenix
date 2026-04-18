import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Category from '@/models/Category';
import slugify from 'slugify';
import { handleProductionError } from '@/lib/errorHandler';

export async function GET() {
  await dbConnect();
  const categories = await Category.find({}).sort({ name: 1 });
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    
    const currentSlug = body.slug || slugify(body.name, { lower: true, strict: true });
    
    const category = await Category.create({ 
      ...body,
      slug: currentSlug
    });
    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    return handleProductionError(error);
  }
}
