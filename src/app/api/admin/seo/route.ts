import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import dbConnect from '@/lib/dbConnect';
import PageMeta from '@/models/PageMeta';
import { getAuthUser } from '@/lib/auth';
import { handleProductionError } from '@/lib/errorHandler';
import { z } from 'zod';
import { logger } from '@/lib/logger';

const seoSchema = z.object({
  pageKey: z.string().min(1, 'Page key is required'),
  metaTitle: z.string().min(1, 'Title is required').trim(),
  metaDescription: z.string().min(1, 'Description is required').trim(),
  h1: z.string().optional(),
  keywords: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const seoData = await PageMeta.find({}).sort({ pageKey: 1 }).lean();
    return NextResponse.json(seoData);
  } catch (error: any) {
    return handleProductionError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });

    if (user.role !== 'admin' && user.role !== 'seo') {
       return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();
    const rawBody = await req.json();
    
    const result = seoSchema.safeParse(rawBody);
    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.format() }, { status: 400 });
    }

    const { pageKey, metaTitle, metaDescription, h1, keywords } = result.data;

    const seo = await PageMeta.findOneAndUpdate(
      { pageKey },
      { metaTitle, metaDescription, h1, keywords, updatedAt: new Date() },
      { returnDocument: 'after', upsert: true, runValidators: true }
    );

    logger.info('SEO metadata updated', { pageKey, user: user.username });

    // Revalidate cached pages based on pageKey
    revalidatePath('/admin/seo');
    revalidatePath(`/${pageKey === 'home' ? '' : pageKey}`);
    revalidateTag('seo');
    revalidateTag(pageKey);

    return NextResponse.json(seo);
  } catch (error: any) {
    return handleProductionError(error);
  }
}
