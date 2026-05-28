import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    // Validate file size (max 5MB)
    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size exceeds 5MB limit' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Check if Cloudinary API secret is configured
    if (!process.env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_API_SECRET === 'your_cloudinary_api_secret_here') {
      logger.error('CRITICAL: CLOUDINARY_API_SECRET is not set or is still a placeholder', {
        hasSecret: !!process.env.CLOUDINARY_API_SECRET,
      });
      return NextResponse.json(
        { error: 'Server configuration error: Cloudinary API Secret not configured. Contact admin.' },
        { status: 500 }
      );
    }

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { 
          folder: 'labzenix',
          resource_type: 'auto',
        },
        (err, res) => {
          if (err) {
            logger.error('Cloudinary upload error', { 
              message: err.message,
              status: err.http_code 
            });
            reject(err);
          } else {
            resolve(res);
          }
        }
      ).end(buffer);
    });

    logger.info('Image uploaded successfully', { url: (result as any).secure_url });
    return NextResponse.json({ url: (result as any).secure_url });
  } catch (error: any) {
    logger.error('Upload failed', { 
      message: error?.message || 'Unknown error',
      errorCode: error?.http_code,
    });
    return NextResponse.json(
      { error: `Upload failed: ${error?.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}