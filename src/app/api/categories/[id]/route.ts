import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import dbConnect from '@/lib/dbConnect';
import Category from '@/models/Category';
import slugify from 'slugify';
import { handleProductionError } from '@/lib/errorHandler';
import { getAuthUser, hasPermission } from '@/lib/auth';
import { z } from 'zod';
import { logger } from '@/lib/logger';

const categoryUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  slug: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const category = await Category.findById(id);
    if (!category) return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    return NextResponse.json(category);
  } catch (error) {
    return handleProductionError(error);
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const canEdit = await hasPermission(req, 'products');
    if (!canEdit) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await dbConnect();
    const { id } = await params;
    const rawBody = await req.json();
    
    const result = categoryUpdateSchema.safeParse(rawBody);
    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.format() }, { status: 400 });
    }

    const body = result.data;
    const currentSlug = body.slug || slugify(body.name, { lower: true, strict: true });
    
    const category = await Category.findByIdAndUpdate(id, { 
      ...body,
      slug: currentSlug
    }, { returnDocument: 'after', runValidators: true });
    
    if (!category) return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    
    logger.info('Category updated', { id, name: category.name, user: user.username });

    // Revalidate cached pages
    revalidatePath('/admin/products/categories');
    revalidatePath('/products');
    revalidateTag('categories');
    
    return NextResponse.json(category);
  } catch (error: any) {
    return handleProductionError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const canEdit = await hasPermission(req, 'products');
    if (!canEdit) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await dbConnect();
    const { id } = await params;
    const category = await Category.findByIdAndDelete(id);
    if (!category) return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    
    logger.info('Category deleted', { id, name: category.name, user: user.username });

    // Revalidate cached pages
    revalidatePath('/admin/products/categories');
    revalidatePath('/products');
    revalidateTag('categories');
    
    return NextResponse.json({ message: 'Category deleted' });
  } catch (error: any) {
    return handleProductionError(error);
  }
}
