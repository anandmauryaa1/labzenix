import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Settings from '@/models/Settings';

export async function GET() {
  try {
    await dbConnect();
    let settings = await Settings.findOne({ configKey: 'global' }).lean();
    
    if (!settings) {
      settings = await Settings.create({ configKey: 'global' });
    }

    // Only return safe public configurations (no sensitive keys)
    return NextResponse.json({
      communication: settings.communication,
      social: settings.social,
      seo: settings.seo
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
