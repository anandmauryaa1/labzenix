import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Testimonial from '@/models/Testimonial';

export async function GET() {
  try {
    await dbConnect();
    const testimonials = await Testimonial.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    return NextResponse.json(testimonials);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
