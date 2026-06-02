import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/dbConnect';
import CompanyCertificate from '@/models/CompanyCertificate';
import { handleProductionError } from '@/lib/errorHandler';
import { getAuthUser, hasPermission } from '@/lib/auth';
import { z } from 'zod';
import { logger } from '@/lib/logger';

const certificateSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  fileUrl: z.string().min(1, 'File URL is required'),
  filePublicId: z.string().min(1, 'File Public ID is required'),
});

export async function GET() {
  try {
    await dbConnect();
    const certs = await CompanyCertificate.find({}).sort({ order: 1, title: 1 }).lean();
    return NextResponse.json(JSON.parse(JSON.stringify(certs)));
  } catch (error) {
    return handleProductionError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const canEdit = await hasPermission(req, 'settings');
    if (!canEdit) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await dbConnect();
    const rawBody = await req.json();
    
    const result = certificateSchema.safeParse(rawBody);
    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.format() }, { status: 400 });
    }

    const cert = await CompanyCertificate.create(result.data);
    
    logger.info('Company Certificate created', { title: cert.title, user: user.username });

    revalidatePath('/admin/company-certificates');
    revalidatePath('/about');
    
    return NextResponse.json(JSON.parse(JSON.stringify(cert)), { status: 201 });
  } catch (error: any) {
    return handleProductionError(error);
  }
}
