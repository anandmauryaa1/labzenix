import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import dbConnect from '@/lib/dbConnect';
import Category from '@/models/Category';
import slugify from 'slugify';
import { handleProductionError } from '@/lib/errorHandler';

export async function GET() {
  try {
    await dbConnect();
    const categories = await Category.find({}).sort({ name: 1 }).lean();
    return NextResponse.json(JSON.parse(JSON.stringify(categories)));
  } catch (error) {
    console.error('[API] GET categories error:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
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
    
    // Revalidate cached pages
    revalidatePath('/admin/products/categories');
    revalidatePath('/products');
    revalidateTag('categories', "default");
    
    return NextResponse.json(JSON.parse(JSON.stringify(category)), { status: 201 });
  } catch (error: any) {
    return handleProductionError(error);
  }
}
