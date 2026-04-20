import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Settings from '@/models/Settings';
import jwt from 'jsonwebtoken';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('admin_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    let settings = await Settings.findOne({ configKey: 'global' });
    
    if (!settings) {
      settings = await Settings.create({ configKey: 'global' });
    }

    return NextResponse.json(settings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('admin_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    // Optional: Only allow pure 'admin' role to change settings
    // if (decoded.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await dbConnect();
    const body = await req.json();
    
    // Flatten the body to properly update nested Mongoose paths using dot notation
    const flattenedBody: Record<string, any> = {};
    for (const [key, value] of Object.entries(body)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        for (const [subKey, subValue] of Object.entries(value)) {
          flattenedBody[`${key}.${subKey}`] = subValue;
        }
      } else {
        flattenedBody[key] = value;
      }
    }
    
    const settings = await Settings.findOneAndUpdate(
      { configKey: 'global' },
      { $set: flattenedBody },
      { new: true, upsert: true, strict: false }
    );

    return NextResponse.json(settings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
