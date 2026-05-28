import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import CompleteProductRange from '@/models/CompleteProductRange';

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const admin = searchParams.get('admin') === 'true';
    
    const query = admin ? {} : { active: true };
    const ranges = await CompleteProductRange.find(query).sort({ order: 1 });
    return NextResponse.json(ranges);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch complete product ranges' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    
    if (!body.title) return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    
    const slug = body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newRange = await CompleteProductRange.create({ ...body, slug });
    return NextResponse.json(newRange);
  } catch (err: any) {
    if (err.code === 11000) return NextResponse.json({ error: 'Title or Slug already exists' }, { status: 400 });
    return NextResponse.json({ error: 'Failed to create complete product range' }, { status: 500 });
  }
}
