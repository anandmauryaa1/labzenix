import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Partner from '@/models/Partner';

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';

    const filter = activeOnly ? { isActive: true } : {};
    const partners = await Partner.find(filter).sort({ order: 1 });

    return NextResponse.json(partners);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const partner = await Partner.create(body);
    return NextResponse.json(partner, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
