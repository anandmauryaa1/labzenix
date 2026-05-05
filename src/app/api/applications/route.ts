import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Application from '@/models/Application';
import { handleProductionError } from '@/lib/errorHandler';
import { getAuthUser, hasPermission } from '@/lib/auth';
import { z } from 'zod';
import { logger } from '@/lib/logger';
import slugify from 'slugify';

const applicationSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  description: z.string().optional(),
  image: z.string().min(1, 'Image is required').trim(),
  imagePublicId: z.string().optional(),
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
        query = {} as any;
      }
    }

    const applications = await Application.find(query)
      .sort({ order: 1, createdAt: -1 })
      .lean()
      .select('-__v');
    
    return NextResponse.json(JSON.parse(JSON.stringify(applications)));
  } catch (error) {
    return handleProductionError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });

    const canEdit = await hasPermission(req, 'products');
    if (!canEdit) return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });

    await dbConnect();
    const rawBody = await req.json();
    
    const result = applicationSchema.safeParse(rawBody);
    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.format() }, { status: 400 });
    }

    const slug = slugify(result.data.name, { lower: true, strict: true });
    const application = await Application.create({
      ...result.data,
      slug
    });

    logger.info('Application created successfully', { applicationId: application._id, user: user.username });
    return NextResponse.json(JSON.parse(JSON.stringify(application)), { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Application with this name already exists' }, { status: 400 });
    }
    return handleProductionError(error);
  }
}
