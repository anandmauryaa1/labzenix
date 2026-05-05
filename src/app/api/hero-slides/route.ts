import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import HeroSlide from '@/models/HeroSlide';
import { handleProductionError } from '@/lib/errorHandler';
import { getAuthUser, hasPermission } from '@/lib/auth';
import { z } from 'zod';
import { logger } from '@/lib/logger';

const heroSlideSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  image: z.string().min(1, 'Image is required').trim(),
  imagePublicId: z.string().optional(),
  link: z.string().optional(),
  order: z.number().default(0),
  active: z.boolean().default(true),
});

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const isAdminView = searchParams.get('admin') === 'true';

    let query = { active: true };
    
    if (isAdminView) {
      const user = await getAuthUser(req);
      if (user) {
        query = {} as any; // Show all if authenticated admin
      }
    }

    const slides = await HeroSlide.find(query)
      .sort({ order: 1, createdAt: -1 })
      .lean()
      .select('-__v');
    
    return NextResponse.json(JSON.parse(JSON.stringify(slides)));
  } catch (error) {
    return handleProductionError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });

    const canEdit = await hasPermission(req, 'settings'); // Using settings permission for hero slides
    if (!canEdit) return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });

    await dbConnect();
    const rawBody = await req.json();
    
    const result = heroSlideSchema.safeParse(rawBody);
    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.format() }, { status: 400 });
    }

    const slide = await HeroSlide.create(result.data);

    logger.info('Hero slide created successfully', { slideId: slide._id, user: user.username });
    return NextResponse.json(JSON.parse(JSON.stringify(slide)), { status: 201 });
  } catch (error: any) {
    return handleProductionError(error);
  }
}
