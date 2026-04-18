import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import { handleProductionError } from '@/lib/errorHandler';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const { id } = await params;
  const product = await Product.findById(id);
  if (!product) return NextResponse.json({ error: 'Instrument not found' }, { status: 404 });
  return NextResponse.json(product);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();
    
    console.log('[API] Processing product update for ID:', id);
    const product = await Product.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    
    if (!product) {
      console.warn('[API] Update failed: Product not found for ID:', id);
      return NextResponse.json({ error: 'Instrument not found' }, { status: 404 });
    }
    
    console.log('[API] Update successful for ID:', id);
    return NextResponse.json(product);
  } catch (error) {
    console.error('[API] Update FATAL error for ID:', id);
    console.error(error);
    return handleProductionError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    
    console.log('[API] Decommissioning product ID:', id);
    const product = await Product.findByIdAndDelete(id);
    
    if (!product) {
       console.warn('[API] Decommission failed: Product not found for ID:', id);
       return NextResponse.json({ error: 'Instrument not found' }, { status: 404 });
    }
    
    console.log('[API] Decommission successful for ID:', id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] Decommission FATAL error for ID:', id);
    console.error(error);
    return handleProductionError(error);
  }
}