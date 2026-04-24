import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Settings from '@/models/Settings';
import { handleProductionError } from '@/lib/errorHandler';
import { getAuthUser } from '@/lib/auth';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    let settings = await Settings.findOne({ configKey: 'global' });
    
    if (!settings) {
      settings = await Settings.create({ configKey: 'global' });
    }

    return NextResponse.json(settings);
  } catch (error: any) {
    return handleProductionError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Ensure only admins can change global settings
    if (user.role !== 'admin' && !user.permissions.includes('settings')) {
       return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

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

    logger.info('Global settings updated', { user: user.username });
    return NextResponse.json(settings);
  } catch (error: any) {
    return handleProductionError(error);
  }
}
