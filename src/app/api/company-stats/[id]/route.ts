import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import CompanyStat from '@/models/CompanyStat';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await dbConnect();
    const stat = await CompanyStat.findById(id);
    if (!stat) return NextResponse.json({ error: 'Company stat not found' }, { status: 404 });
    return NextResponse.json(stat);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch company stat' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await dbConnect();
    const body = await req.json();
    
    const updated = await CompanyStat.findByIdAndUpdate(id, body, { new: true });
    if (!updated) return NextResponse.json({ error: 'Company stat not found' }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update company stat' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await dbConnect();
    const deleted = await CompanyStat.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ error: 'Company stat not found' }, { status: 404 });
    return NextResponse.json({ message: 'Company stat deleted successfully' });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete company stat' }, { status: 500 });
  }
}
