import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Inquiry from '@/models/Inquiry';
import jwt from 'jsonwebtoken';
import { logger } from '@/lib/logger';
import { z } from 'zod';
import { handleProductionError } from '@/lib/errorHandler';

const inquirySchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  email: z.string().email('Invalid email address').trim().toLowerCase(),
  phone: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(1, 'Message is required').trim(),
  productId: z.string().optional(),
  source: z.enum(['contact form', 'product page', 'download catalog']).default('contact form'),
});

// POST: Public lead capture
export async function POST(req: NextRequest) {
  await dbConnect();
  try {
    const body = await req.json();
    
    const result = inquirySchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid inquiry data', details: result.error.format() }, { status: 400 });
    }

    const validatedData = result.data;
    logger.info('NEW INQUIRY RECEIVED', { email: validatedData.email, source: validatedData.source });
    
    const inquiry = await Inquiry.create(validatedData);
    return NextResponse.json(inquiry, { status: 201 });
  } catch (err: any) {
    return handleProductionError(err);
  }
}

// GET: Authenticated management
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('admin_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const permissions = decoded.permissions || [];
    
    // Admins bypass granular checks, others must have 'inquiries' vector
    if (decoded.role !== 'admin' && !permissions.includes('inquiries')) {
      logger.warn('Forbidden access to inquiries', { userId: decoded.id, role: decoded.role });
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();
    const inquiries = await Inquiry.find({}).populate('productId').sort({ createdAt: -1 });
    logger.info('Inquiries retrieved', { count: inquiries.length });
    return NextResponse.json(inquiries);
  } catch (error: any) {
    return handleProductionError(error);
  }
}

// DELETE: Authenticated management
export async function DELETE(req: NextRequest) {
  try {
    const token = req.cookies.get('admin_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const permissions = decoded.permissions || [];
    
    if (decoded.role !== 'admin' && !permissions.includes('inquiries')) {
      logger.warn('Forbidden deletion attempt', { userId: decoded.id, role: decoded.role });
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();
    const { id } = await req.json();
    const inquiry = await Inquiry.findByIdAndDelete(id);
    
    if (!inquiry) {
      logger.warn('Inquiry delete failed: Not found', { id });
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
    }

    logger.info('Inquiry deleted successfully', { id });
    return NextResponse.json({ message: 'Deleted' });
  } catch (err: any) {
    return handleProductionError(err);
  }
}
