import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import CrmActivity from '@/models/CrmActivity';
import CrmContact from '@/models/CrmContact';
import { getAuthUser } from '@/lib/auth';
import { handleProductionError } from '@/lib/errorHandler';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const activitySchema = z.object({
  contact: z.string().min(1, 'Contact ID is required'),
  deal: z.string().optional().nullable(),
  type: z.enum(['Call', 'Email', 'Meeting', 'Note']),
  subject: z.string().min(1, 'Subject is required').trim(),
  description: z.string().min(1, 'Description is required').trim(),
  date: z.string().optional(),
  duration: z.number().optional(), // duration in seconds
  status: z.string().optional(), // e.g. Sent, Received, Completed
});

// GET: Retrieve activities for a contact
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const contactId = searchParams.get('contactId');

    if (!contactId) {
      return NextResponse.json({ error: 'Contact ID is required' }, { status: 400 });
    }

    const activities = await CrmActivity.find({ contact: contactId })
      .populate('createdBy', 'name')
      .sort({ date: -1 });

    logger.info('CRM Activities loaded', { contactId, count: activities.length });
    return NextResponse.json(activities);
  } catch (err) {
    return handleProductionError(err);
  }
}

// POST: Log a new CRM activity
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const body = await req.json();

    const result = activitySchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.format() }, { status: 400 });
    }

    // Verify contact
    const contact = await CrmContact.findById(result.data.contact);
    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    const activityData = {
      ...result.data,
      date: result.data.date ? new Date(result.data.date) : new Date(),
      createdBy: user.id,
      contact: result.data.contact,
      deal: result.data.deal || undefined,
    };

    const newActivity = await CrmActivity.create(activityData);
    logger.info('CRM Activity logged', { activityId: newActivity._id, type: newActivity.type, user: user.id });

    // Optional: Auto-update contact status or last contacted metadata if necessary
    return NextResponse.json(newActivity, { status: 201 });
  } catch (err) {
    return handleProductionError(err);
  }
}
