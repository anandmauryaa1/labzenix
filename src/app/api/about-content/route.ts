import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import AboutContent from '@/models/AboutContent';

export async function GET() {
  try {
    await dbConnect();
    let content = await AboutContent.findOne({ singletonKey: 'global' });
    if (!content) {
      content = await AboutContent.create({ singletonKey: 'global' });
    }
    return NextResponse.json(content);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch about content' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    let content = await AboutContent.findOne({ singletonKey: 'global' });
    
    if (!content) {
      content = await AboutContent.create({ ...body, singletonKey: 'global' });
    } else {
      content = await AboutContent.findOneAndUpdate({ singletonKey: 'global' }, body, { new: true });
    }
    
    return NextResponse.json(content);
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to update about content' }, { status: 500 });
  }
}
