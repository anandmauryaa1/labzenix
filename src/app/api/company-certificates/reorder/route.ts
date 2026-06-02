import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/dbConnect';
import CompanyCertificate from '@/models/CompanyCertificate';
import { handleProductionError } from '@/lib/errorHandler';
import { getAuthUser, hasPermission } from '@/lib/auth';
import { z } from 'zod';
import { logger } from '@/lib/logger';

const reorderSchema = z.array(
  z.object({
    id: z.string().min(1),
    order: z.number().int().min(0)
  })
);

export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const canEdit = await hasPermission(req, 'settings');
    if (!canEdit) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await dbConnect();
    const body = await req.json();

    const result = reorderSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.format() }, { status: 400 });
    }

    const updates = result.data.map(item => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { order: item.order } }
      }
    }));

    if (updates.length > 0) {
      await CompanyCertificate.bulkWrite(updates);
    }

    logger.info('Company Certificates reordered', { user: user.username });
    
    revalidatePath('/admin/company-certificates');
    revalidatePath('/about');

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleProductionError(error);
  }
}
