import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import HeroSlide from '@/models/HeroSlide';
import { handleProductionError } from '@/lib/errorHandler';
import { getAuthUser, hasPermission } from '@/lib/auth';
import { z } from 'zod';
import { logger } from '@/lib/logger';

const heroSlideUpdateSchema = z.object({
  title: z.string().trim().optional(),
  description: z.string().trim().optional(),
  image: z.string().min(1).trim().optional(),
  imagePublicId: z.string().optional(),
  link: z.string().optional(),
  order: z.number().optional(),
  active: z.boolean().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });

    const canEdit = await hasPermission(req, 'settings');
    if (!canEdit) return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });

    const { id } = await params;
    await dbConnect();
    
    const rawBody = await req.json();
    const result = heroSlideUpdateSchema.safeParse(rawBody);
    
    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.format() }, { status: 400 });
    }

    const slide = await HeroSlide.findByIdAndUpdate(id, result.data, { new: true });
    if (!slide) return NextResponse.json({ error: 'Slide not found' }, { status: 404 });

    logger.info('Hero slide updated successfully', { slideId: slide._id, user: user.username });
    return NextResponse.json(JSON.parse(JSON.stringify(slide)));
  } catch (error) {
    return handleProductionError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });

    const canEdit = await hasPermission(req, 'settings');
    if (!canEdit) return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });

    const { id } = await params;
    await dbConnect();
    
    const slide = await HeroSlide.findByIdAndDelete(id);
    if (!slide) return NextResponse.json({ error: 'Slide not found' }, { status: 404 });

    logger.info('Hero slide deleted successfully', { slideId: id, user: user.username });
    return NextResponse.json({ message: 'Slide deleted successfully' });
  } catch (error) {
    return handleProductionError(error);
  }
}
