import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/dbConnect';
import CompanyCertificate from '@/models/CompanyCertificate';
import { handleProductionError } from '@/lib/errorHandler';
import { getAuthUser, hasPermission } from '@/lib/auth';
import { z } from 'zod';
import { logger } from '@/lib/logger';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const certificateSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  fileUrl: z.string().min(1, 'File URL is required'),
  filePublicId: z.string().min(1, 'File Public ID is required'),
});

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
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

    const cert = await CompanyCertificate.findByIdAndUpdate(
      params.id,
      { $set: result.data },
      { new: true, runValidators: true }
    );

    if (!cert) return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
    
    logger.info('Company Certificate updated', { title: cert.title, user: user.username });

    revalidatePath('/admin/company-certificates');
    revalidatePath('/about');

    return NextResponse.json(JSON.parse(JSON.stringify(cert)));
  } catch (error: any) {
    return handleProductionError(error);
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const canDelete = await hasPermission(req, 'settings');
    if (!canDelete) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await dbConnect();
    
    const cert = await CompanyCertificate.findById(params.id);
    if (!cert) return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });

    // Optional: Delete from Cloudinary if needed, handled in admin/upload/delete endpoint separately or here
    if (cert.filePublicId) {
       try {
         await cloudinary.uploader.destroy(cert.filePublicId);
       } catch (cloudErr) {
         logger.warn('Failed to delete certificate file from Cloudinary', { error: cloudErr, publicId: cert.filePublicId });
       }
    }

    await CompanyCertificate.findByIdAndDelete(params.id);

    logger.info('Company Certificate deleted', { title: cert.title, user: user.username });

    revalidatePath('/admin/company-certificates');
    revalidatePath('/about');

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return handleProductionError(error);
  }
}
