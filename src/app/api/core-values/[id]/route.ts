import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import CoreValue from '@/models/CoreValue';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const value = await CoreValue.findById(params.id);
    if (!value) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(value);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const body = await req.json();
    const value = await CoreValue.findByIdAndUpdate(params.id, body, { new: true });
    if (!value) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(value);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const value = await CoreValue.findByIdAndDelete(params.id);
    if (!value) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
