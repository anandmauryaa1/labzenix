import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import CrmNotification from '@/models/CrmNotification';
import { getAuthUser } from '@/lib/auth';
import { handleProductionError } from '@/lib/errorHandler';
import { logger } from '@/lib/logger';

// GET: Retrieve user alerts
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();

    const notifications = await CrmNotification.find({ userId: user.id })
      .sort({ createdAt: -1 })
      .limit(100);

    const unreadCount = await CrmNotification.countDocuments({ userId: user.id, read: false });

    return NextResponse.json({ notifications, unreadCount });
  } catch (err) {
    return handleProductionError(err);
  }
}

// PUT: Mark notification as read (or mark all as read)
export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const body = await req.json();
    const { id, readAll } = body;

    if (readAll) {
      await CrmNotification.updateMany({ userId: user.id, read: false }, { read: true });
      logger.info('All CRM Notifications marked read', { userId: user.id });
      return NextResponse.json({ message: 'All marked as read' });
    }

    if (!id) {
      return NextResponse.json({ error: 'Notification ID is required' }, { status: 400 });
    }

    const updated = await CrmNotification.findOneAndUpdate(
      { _id: id, userId: user.id },
      { read: true },
      { new: true }
    );

    if (!updated) return NextResponse.json({ error: 'Notification not found or access denied' }, { status: 404 });

    logger.info('CRM Notification marked read', { notificationId: id, userId: user.id });
    return NextResponse.json(updated);
  } catch (err) {
    return handleProductionError(err);
  }
}
