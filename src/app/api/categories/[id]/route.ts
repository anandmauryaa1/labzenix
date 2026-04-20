import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import dbConnect from '@/lib/dbConnect';
import Category from '@/models/Category';
import slugify from 'slugify';
import { handleProductionError } from '@/lib/errorHandler';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const { id } = await params;
  const category = await Category.findById(id);
  if (!category) return NextResponse.json({ error: 'Category not found' }, { status: 404 });
  return NextResponse.json(category);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();
    
    const currentSlug = body.slug || slugify(body.name, { lower: true, strict: true });
    
    const category = await Category.findByIdAndUpdate(id, { 
      ...body,
      slug: currentSlug
    }, { returnDocument: 'after', runValidators: true });
    
    if (!category) return NextResponse.json({ error: 'Domain not found' }, { status: 404 });
    
    // Revalidate cached pages
    revalidatePath('/admin/products/categories');
    revalidatePath('/products');
    revalidateTag('categories', "default");
    
    return NextResponse.json(category);
  } catch (error: any) {
    return handleProductionError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const category = await Category.findByIdAndDelete(id);
    if (!category) return NextResponse.json({ error: 'Domain not found' }, { status: 404 });
    
    // Revalidate cached pages
    revalidatePath('/admin/products/categories');
    revalidatePath('/products');
    revalidateTag('categories', "default");
    
    return NextResponse.json({ message: 'Domain decommissioned' });
  } catch (error: any) {
    return handleProductionError(error);
  }
}
