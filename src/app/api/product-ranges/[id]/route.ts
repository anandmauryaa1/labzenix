import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import ProductRange from '@/models/ProductRange';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await dbConnect();
    const range = await ProductRange.findById(id);
    if (!range) return NextResponse.json({ error: 'Product range not found' }, { status: 404 });
    return NextResponse.json(range);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch product range' }, { status: 500 });
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

    const updated = await ProductRange.findByIdAndUpdate(id, body, { new: true });
    if (!updated) return NextResponse.json({ error: 'Product range not found' }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err: any) {
    if (err.code === 11000) return NextResponse.json({ error: 'Title or Slug already exists' }, { status: 400 });
    return NextResponse.json({ error: 'Failed to update product range' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await dbConnect();
    const deleted = await ProductRange.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ error: 'Product range not found' }, { status: 404 });
    return NextResponse.json({ message: 'Product range deleted successfully' });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete product range' }, { status: 500 });
  }
}
