import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Settings from '@/models/Settings';
import { handleProductionError } from '@/lib/errorHandler';

export async function GET() {
  try {
    await dbConnect();
    let settings = await Settings.findOne({ configKey: 'global' }).lean();
    
    if (!settings) {
      // Return defaults if none in DB yet
      return NextResponse.json({
        communication: {
          supportEmail: 'info@labzenix.com',
          supportPhone: '+91-9565453120',
          address: ' Mohali, Punjab, India'
        },
        social: {},
        seo: {}
      });
    }

    // Only return safe public configurations (no sensitive keys)
    return NextResponse.json({
      communication: settings.communication,
      social: settings.social,
      seo: settings.seo
    });
  } catch (error: any) {
    return handleProductionError(error);
  }
}
