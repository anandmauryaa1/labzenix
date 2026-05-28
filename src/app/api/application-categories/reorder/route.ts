import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/dbConnect';
import ApplicationCategory from '@/models/ApplicationCategory';
import { handleProductionError } from '@/lib/errorHandler';
import { getAuthUser, hasPermission } from '@/lib/auth';
import { z } from 'zod';

const reorderSchema = z.array(
  z.object({
    id: z.string().min(1),
    order: z.number().int().min(0),
  })
);

export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const canEdit = await hasPermission(req, 'products');
    if (!canEdit) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await dbConnect();
    const rawBody = await req.json();

    const result = reorderSchema.safeParse(rawBody);
    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.format() }, { status: 400 });
    }

    // Bulk-write the order values
    const ops = result.data.map(({ id, order }) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { order } },
      },
    }));

    await ApplicationCategory.bulkWrite(ops);

    revalidatePath('/admin/applications/categories');
    revalidatePath('/applications');

    return NextResponse.json({ message: 'Order updated' });
  } catch (error) {
    return handleProductionError(error);
  }
}
