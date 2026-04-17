import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Inquiry from '@/models/Inquiry';

export async function POST(req: NextRequest) {
  await dbConnect();
  const body = await req.json();
  const inquiry = await Inquiry.create(body);
  return NextResponse.json(inquiry, { status: 201 });
}

export async function GET() {
  await dbConnect();
  const inquiries = await Inquiry.find({}).populate('productId').sort({ createdAt: -1 });
  return NextResponse.json(inquiries);
}