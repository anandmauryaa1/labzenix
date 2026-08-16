import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import ServiceTicket from '@/models/ServiceTicket';
import { getAuthUser } from '@/lib/auth';
import { handleProductionError } from '@/lib/errorHandler';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const ticketSchema = z.object({
  company: z.string().min(1, 'Company ID is required'),
  machineSerialNumber: z.string().min(1, 'Machine Serial Number is required').trim(),
  productInterest: z.string().optional(),
  problemDescription: z.string().min(1, 'Description is required').trim(),
  priority: z.enum(['Low', 'Medium', 'High']).default('Medium'),
  assignedEngineer: z.string().optional(),
  status: z.enum(['Open', 'In Progress', 'Resolved', 'Closed']).default('Open'),
});

// GET: Fetch service tickets
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || '';
    const engineerId = searchParams.get('engineerId') || '';

    const query: any = {};
    if (status) query.status = status;
    
    // Non-admin service engineers only see their assigned tickets
    if ((user.role as string) === 'service-engineer') {
      query.assignedEngineer = user.id;
    } else if (engineerId) {
      query.assignedEngineer = engineerId;
    }

    const tickets = await ServiceTicket.find(query)
      .populate('company', 'name website address')
      .populate('assignedEngineer', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json(tickets);
  } catch (err) {
    return handleProductionError(err);
  }
}

// POST: Create Service Ticket
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const body = await req.json();

    const result = ticketSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.format() }, { status: 400 });
    }

    const newTicket = await ServiceTicket.create(result.data);
    logger.info('B2B Service Ticket created', { ticketId: newTicket._id, createdBy: user.id });

    return NextResponse.json(newTicket, { status: 201 });
  } catch (err) {
    return handleProductionError(err);
  }
}

// PUT: Update Ticket Status/Engineer assignment
export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) return NextResponse.json({ error: 'Ticket ID is required' }, { status: 400 });

    const validated = ticketSchema.partial().safeParse(updateData);
    if (!validated.success) {
      return NextResponse.json({ error: 'Validation failed', details: validated.error.format() }, { status: 400 });
    }

    const updated = await ServiceTicket.findByIdAndUpdate(id, validated.data, { new: true })
      .populate('company', 'name')
      .populate('assignedEngineer', 'name');

    if (!updated) return NextResponse.json({ error: 'Service ticket not found' }, { status: 404 });

    logger.info('B2B Service Ticket updated', { ticketId: id, updatedBy: user.id });
    return NextResponse.json(updated);
  } catch (err) {
    return handleProductionError(err);
  }
}
