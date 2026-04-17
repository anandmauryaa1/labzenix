import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Inquiry from '@/models/Inquiry';

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

export async function GET() {
  await dbConnect();
  const inquiries = await Inquiry.find({}).populate('productId').sort({ createdAt: -1 });
  return NextResponse.json(inquiries);
}

export async function DELETE(req: NextRequest) {
  await dbConnect();
  try {
    const { id } = await req.json();
    await Inquiry.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Deleted' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}