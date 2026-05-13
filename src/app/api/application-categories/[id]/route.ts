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

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const category = await ApplicationCategory.findById(params.id).lean();
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    return NextResponse.json(JSON.parse(JSON.stringify(category)));
  } catch (error) {
    return handleProductionError(error);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
    if (body.name) {
      body.slug = body.slug || slugify(body.name, { lower: true, strict: true });
    }
    
    const category = await ApplicationCategory.findByIdAndUpdate(
      params.id,
      { $set: body },
      { new: true, runValidators: true }
    );
    
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    logger.info('Application Category updated', { id: params.id, name: category.name, user: user.username });

    revalidatePath('/admin/applications/categories');
    revalidatePath('/applications');
    
    return NextResponse.json(JSON.parse(JSON.stringify(category)));
  } catch (error: any) {
    return handleProductionError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const canEdit = await hasPermission(req, 'products'); 
    if (!canEdit) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await dbConnect();
    const category = await ApplicationCategory.findByIdAndDelete(params.id);
    
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    logger.info('Application Category deleted', { id: params.id, name: category.name, user: user.username });

    revalidatePath('/admin/applications/categories');
    revalidatePath('/applications');
    
    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error: any) {
    return handleProductionError(error);
  }
}
