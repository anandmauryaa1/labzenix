import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/dbConnect';
import ApplicationCategory from '@/models/ApplicationCategory';
import slugify from 'slugify';
import { handleProductionError } from '@/lib/errorHandler';
import { getAuthUser, hasPermission } from '@/lib/auth';
import { z } from 'zod';
import { logger } from '@/lib/logger';

const applicationCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  slug: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  imagePublicId: z.string().optional(),
  order: z.number().optional(),
  active: z.boolean().optional(),
});

export async function GET() {
  try {
    await dbConnect();
    const categories = await ApplicationCategory.find({}).sort({ order: 1, name: 1 }).lean();
    return NextResponse.json(JSON.parse(JSON.stringify(categories)));
  } catch (error) {
    return handleProductionError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const canEdit = await hasPermission(req, 'products'); 
    if (!canEdit) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await dbConnect();
    const rawBody = await req.json();
    
    const result = applicationCategorySchema.safeParse(rawBody);
    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.format() }, { status: 400 });
    }

    const body = result.data;
    const currentSlug = body.slug || slugify(body.name, { lower: true, strict: true });
    
    const category = await ApplicationCategory.create({ 
      ...body,
      slug: currentSlug
    });
    
    logger.info('Application Category created', { name: category.name, user: user.username });

    revalidatePath('/admin/applications/categories');
    revalidatePath('/applications');
    
    return NextResponse.json(JSON.parse(JSON.stringify(category)), { status: 201 });
  } catch (error: any) {
    return handleProductionError(error);
  }
}
