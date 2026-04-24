import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import dbConnect from '@/lib/dbConnect';
import Category from '@/models/Category';
import slugify from 'slugify';
import { handleProductionError } from '@/lib/errorHandler';
import { getAuthUser, hasPermission } from '@/lib/auth';
import { z } from 'zod';
import { logger } from '@/lib/logger';

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  slug: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
});

export async function GET() {
  try {
    await dbConnect();
    const categories = await Category.find({}).sort({ name: 1 }).lean();
    return NextResponse.json(JSON.parse(JSON.stringify(categories)));
  } catch (error) {
    return handleProductionError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const canEdit = await hasPermission(req, 'products'); // categories fall under products permission
    if (!canEdit) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await dbConnect();
    const rawBody = await req.json();
    
    const result = categorySchema.safeParse(rawBody);
    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.format() }, { status: 400 });
    }

    const body = result.data;
    const currentSlug = body.slug || slugify(body.name, { lower: true, strict: true });
    
    const category = await Category.create({ 
      ...body,
      slug: currentSlug
    });
    
    logger.info('Category created', { name: category.name, user: user.username });

    // Revalidate cached pages
    revalidatePath('/admin/products/categories');
    revalidatePath('/products');
    revalidateTag('categories');
    
    return NextResponse.json(JSON.parse(JSON.stringify(category)), { status: 201 });
  } catch (error: any) {
    return handleProductionError(error);
  }
}
