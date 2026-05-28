import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import CompanyStat from '@/models/CompanyStat';

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const admin = searchParams.get('admin') === 'true';
    
    const query = admin ? {} : { active: true };
    const stats = await CompanyStat.find(query).sort({ order: 1 });
    return NextResponse.json(stats);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch company stats' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    
    if (!body.label || !body.value) return NextResponse.json({ error: 'Label and value are required' }, { status: 400 });
    
    const newStat = await CompanyStat.create(body);
    return NextResponse.json(newStat);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create company stat' }, { status: 500 });
  }
}
