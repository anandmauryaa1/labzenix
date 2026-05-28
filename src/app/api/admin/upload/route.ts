import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { logger } from '@/lib/logger';
import { getAuthUser } from '@/lib/auth';
import { handleProductionError } from '@/lib/errorHandler';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];

export async function POST(req: NextRequest) {
  try {
    // Check Cloudinary configuration first
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      logger.error('CRITICAL: CLOUDINARY_CLOUD_NAME not configured');
      return NextResponse.json({ error: 'Server configuration error: Cloudinary Cloud Name missing' }, { status: 500 });
    }
    if (!process.env.CLOUDINARY_API_KEY) {
      logger.error('CRITICAL: CLOUDINARY_API_KEY not configured');
      return NextResponse.json({ error: 'Server configuration error: Cloudinary API Key missing' }, { status: 500 });
    }
    if (!process.env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_API_SECRET === 'your_cloudinary_api_secret_here') {
      logger.error('CRITICAL: CLOUDINARY_API_SECRET not configured or is placeholder', {
        hasSecret: !!process.env.CLOUDINARY_API_SECRET,
      });
      return NextResponse.json(
        { error: 'Server configuration error: Cloudinary API Secret not configured. Please update .env.local with your actual Cloudinary API Secret.' },
        { status: 500 }
      );
    }

    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size too large (max 5MB)' }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only images and PDFs are allowed.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { 
          resource_type: 'auto', 
          folder: 'labzenix/uploads',
          access_mode: 'public',
          type: 'upload'
        },
        (error, result) => {
          if (error) {
            logger.error('Cloudinary upload error', {
              message: error.message,
              status: error.http_code,
              fileName: file.name
            });
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
      uploadStream.end(buffer);
    });

    logger.info('File uploaded successfully', { 
      fileName: file.name, 
      fileType: file.type, 
      user: user.username,
      publicId: (result as any).public_id 
    });

    return NextResponse.json({ 
      url: (result as any).secure_url,
      public_id: (result as any).public_id 
    });
  } catch (error: any) {
    logger.error('Upload endpoint error', {
      message: error?.message || 'Unknown error',
      code: error?.code,
    });
    return handleProductionError(error);
  }
}
