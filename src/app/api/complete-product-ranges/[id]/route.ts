import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import CompleteProductRange from '@/models/CompleteProductRange';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await dbConnect();
    const range = await CompleteProductRange.findById(id);
    if (!range) return NextResponse.json({ error: 'Complete product range not found' }, { status: 404 });
    return NextResponse.json(range);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch complete product range' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await dbConnect();
    const body = await req.json();
    
    if (body.title) {
      body.slug = body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    const updated = await CompleteProductRange.findByIdAndUpdate(id, body, { new: true });
    if (!updated) return NextResponse.json({ error: 'Complete product range not found' }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err: any) {
    if (err.code === 11000) return NextResponse.json({ error: 'Title or Slug already exists' }, { status: 400 });
    return NextResponse.json({ error: 'Failed to update complete product range' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await dbConnect();
    const deleted = await CompleteProductRange.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ error: 'Complete product range not found' }, { status: 404 });
    return NextResponse.json({ message: 'Complete product range deleted successfully' });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete complete product range' }, { status: 500 });
  }
}
