import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import CoreValue from '@/models/CoreValue';

export async function GET() {
  try {
    await dbConnect();
    const values = await CoreValue.find({}).sort({ order: 1 });
    return NextResponse.json(values);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch core values' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    
    if (!body.title) return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    
    const newValue = await CoreValue.create(body);
    return NextResponse.json(newValue);
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to create core value' }, { status: 500 });
  }
}
