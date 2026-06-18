import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import CrmDeal from '@/models/CrmDeal';
import CrmContact from '@/models/CrmContact';
import CrmNotification from '@/models/CrmNotification';
import { getAuthUser } from '@/lib/auth';
import { handleProductionError } from '@/lib/errorHandler';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const dealSchema = z.object({
  title: z.string().min(1, 'Title is required').trim(),
  contact: z.string().min(1, 'Contact is required'),
  value: z.number().min(0, 'Value must be non-negative'),
  stage: z.enum(['Lead', 'Qualification', 'Proposal', 'Negotiation', 'Won', 'Lost']).default('Lead'),
  expectedCloseDate: z.string().optional(),
});

// GET: Fetch deals grouped by stage or filterable list
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const contactId = searchParams.get('contactId') || '';

    const query: any = {};
    if (contactId) {
      query.contact = contactId;
    }

    // Populate contact detail
    const deals = await CrmDeal.find(query)
      .populate({
        path: 'contact',
        select: 'name company email phone status'
      })
      .populate('owner', 'name')
      .sort({ updatedAt: -1 });

    logger.info('CRM Deals retrieved', { count: deals.length });
    return NextResponse.json(deals);
  } catch (err) {
    return handleProductionError(err);
  }
}

// POST: Create deal
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const body = await req.json();

    const result = dealSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.format() }, { status: 400 });
    }

    // Verify contact exists
    const contact = await CrmContact.findById(result.data.contact);
    if (!contact) {
      return NextResponse.json({ error: 'Associated contact not found' }, { status: 404 });
    }

    const dealData = {
      ...result.data,
      expectedCloseDate: result.data.expectedCloseDate ? new Date(result.data.expectedCloseDate) : undefined,
      owner: user.id,
    };

    const newDeal = await CrmDeal.create(dealData);
    logger.info('CRM Deal created', { dealId: newDeal._id, owner: user.id });

    // Send notification for new major deals
    if (newDeal.value >= 25000) {
      await CrmNotification.create({
        userId: user.id,
        title: 'Significant Deal Registered 💼',
        message: `Deal "${newDeal.title}" of value $${newDeal.value.toLocaleString()} registered for contact ${contact.name}.`,
        type: 'LeadUpdate',
      });
    }

    return NextResponse.json(newDeal, { status: 201 });
  } catch (err) {
    return handleProductionError(err);
  }
}

// PUT: Update deal (e.g. stage transitions)
export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) return NextResponse.json({ error: 'Deal ID is required' }, { status: 400 });

    const validated = dealSchema.partial().safeParse(updateData);
    if (!validated.success) {
      return NextResponse.json({ error: 'Validation failed', details: validated.error.format() }, { status: 400 });
    }

    const currentDeal = await CrmDeal.findById(id).populate('contact');
    if (!currentDeal) return NextResponse.json({ error: 'Deal not found' }, { status: 404 });

    const wasStage = currentDeal.stage;
    
    // Update close date string if passed
    const parsedUpdate: any = { ...validated.data };
    if (validated.data.expectedCloseDate) {
      parsedUpdate.expectedCloseDate = new Date(validated.data.expectedCloseDate);
    }

    const updatedDeal = await CrmDeal.findByIdAndUpdate(id, parsedUpdate, { new: true }).populate('contact');

    // Audit stage change and push notification for closures
    if (validated.data.stage && wasStage !== validated.data.stage) {
      logger.info('CRM Deal stage transitioned', { dealId: id, from: wasStage, to: validated.data.stage });
      
      if (validated.data.stage === 'Won') {
        await CrmNotification.create({
          userId: user.id,
          title: 'Deal Closed Won! 🎉',
          message: `Deal "${updatedDeal!.title}" worth $${updatedDeal!.value.toLocaleString()} has been CLOSED WON!`,
          type: 'DealWon',
        });
      } else if (validated.data.stage === 'Lost') {
        await CrmNotification.create({
          userId: user.id,
          title: 'Deal Closed Lost ❌',
          message: `Deal "${updatedDeal!.title}" was closed as Lost.`,
          type: 'LeadUpdate',
        });
      }
    }

    return NextResponse.json(updatedDeal);
  } catch (err) {
    return handleProductionError(err);
  }
}

// DELETE: Delete deal
export async function DELETE(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'Deal ID is required' }, { status: 400 });

    const deal = await CrmDeal.findByIdAndDelete(id);
    if (!deal) return NextResponse.json({ error: 'Deal not found' }, { status: 404 });

    logger.info('CRM Deal deleted', { dealId: id, deletedBy: user.id });
    return NextResponse.json({ message: 'Deal deleted successfully' });
  } catch (err) {
    return handleProductionError(err);
  }
}
