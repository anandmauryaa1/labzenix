import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Application from '@/models/Application';
import { handleProductionError } from '@/lib/errorHandler';
import { getAuthUser, hasPermission } from '@/lib/auth';
import { z } from 'zod';
import { logger } from '@/lib/logger';
import slugify from 'slugify';

const updateSchema = z.object({
  name: z.string().min(1, 'Name is required').trim().optional(),
  description: z.string().optional(),
  image: z.string().min(1, 'Image is required').trim().optional(),
  imagePublicId: z.string().optional(),
  order: z.number().optional(),
  active: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });

    const canEdit = await hasPermission(req, 'products');
    if (!canEdit) return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });

    await dbConnect();
    const rawBody = await req.json();
    
    const result = updateSchema.safeParse(rawBody);
    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.format() }, { status: 400 });
    }

    const updateData: any = { ...result.data };
    if (result.data.name) {
      updateData.slug = slugify(result.data.name, { lower: true, strict: true });
    }

    const application = await Application.findByIdAndUpdate(id, updateData, { new: true });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    logger.info('Application updated successfully', { applicationId: application._id, user: user.username });
    return NextResponse.json(JSON.parse(JSON.stringify(application)));
  } catch (error) {
    return handleProductionError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });

    const canEdit = await hasPermission(req, 'products');
    if (!canEdit) return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });

    await dbConnect();
    const application = await Application.findByIdAndDelete(id);

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    logger.info('Application deleted successfully', { applicationId: id, user: user.username });
    return NextResponse.json({ message: 'Application deleted successfully' });
  } catch (error) {
    return handleProductionError(error);
  }
}
