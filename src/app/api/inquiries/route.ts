import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Inquiry from '@/models/Inquiry';
import jwt from 'jsonwebtoken';

// POST: Public lead capture
export async function POST(req: NextRequest) {
  await dbConnect();
  try {
    const body = await req.json();
    console.log('📬 NEW INQUIRY PAYLOAD:', body);
    const inquiry = await Inquiry.create(body);
    return NextResponse.json(inquiry, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
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
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();
    const inquiries = await Inquiry.find({}).populate('productId').sort({ createdAt: -1 });
    return NextResponse.json(inquiries);
  } catch (error) {
    return NextResponse.json({ error: 'Session Invalid' }, { status: 401 });
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
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();
    const { id } = await req.json();
    await Inquiry.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Deleted' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
