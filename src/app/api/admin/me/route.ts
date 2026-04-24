import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { getAuthUser } from '@/lib/auth';
import { handleProductionError } from '@/lib/errorHandler';

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    await dbConnect();
    const user = await User.findById(authUser.id, '-password').lean();
    
    if (!user) {
      // Fallback for system admin if no DB record yet
      if (authUser.username === 'admin') {
        return NextResponse.json({ 
          username: 'admin', 
          role: 'admin', 
          name: authUser.name || 'System Admin', 
          email: authUser.email || 'admin@labzenix.com',
          permissions: authUser.permissions || ['blogs', 'products', 'categories', 'seo', 'inquiries', 'users', 'settings']
        });
      }
      return NextResponse.json({ error: 'User session invalid' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    return handleProductionError(error);
  }
}
