import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Campaign from '@/models/Campaign';
import { isAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authorized = await isAdmin(req);
    if (!authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const campaigns = await Campaign.find({}).sort({ createdAt: -1 });
    return NextResponse.json(campaigns, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authorized = await isAdmin(req);
    if (!authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const body = await req.json();
    const newCampaign = await Campaign.create(body);
    return NextResponse.json(newCampaign, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
