import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Lead from '@/models/Lead';
import { getAuthUser } from '@/lib/auth';
import { handleProductionError } from '@/lib/errorHandler';
import { logger } from '@/lib/logger';

// GET: Leads
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const stage = searchParams.get('stage') || '';

    const query: any = {};
    if (stage) {
      query.stage = stage;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
        { leadSource: { $regex: search, $options: 'i' } },
        { productInterest: { $regex: search, $options: 'i' } }
      ];
    }

    const leads = await Lead.find(query)
      .populate('company', 'name company email phone')
      .populate('contactPerson', 'name company email phone')
      .sort({ createdAt: -1 });

    return NextResponse.json(leads);
  } catch (err) {
    return handleProductionError(err);
  }
}

// POST: Create Lead
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const body = await req.json();

    const leadData = {
      name: body.name || 'New Lead',
      phone: body.phone || '',
      companyName: body.companyName || '',
      leadSource: body.leadSource || 'Website',
      productInterest: body.productInterest || 'General Inquiry',
      budget: Number(body.budget) || 0,
      estimatedAmount: Number(body.estimatedAmount) || Number(body.budget) || 0,
      rating: Number(body.rating) || 0,
      address: body.address || '',
      createdBy: body.createdBy || user.name || 'LabZenix Industries',
      assignedTo: body.assignedTo || 'LabZenix Industries',
      stage: body.stage || 'New',
      notes: body.notes || '',
      leadOwner: user.id
    };

    const newLead = await Lead.create(leadData);
    logger.info('CRM Lead created', { leadId: newLead._id, createdBy: user.id });

    return NextResponse.json(newLead, { status: 201 });
  } catch (err) {
    return handleProductionError(err);
  }
}

// PUT: Update Lead (Stage, Rating, Details)
export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) return NextResponse.json({ error: 'Lead ID is required' }, { status: 400 });

    const updatedLead = await Lead.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedLead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

    logger.info('CRM Lead updated', { leadId: id, updatedBy: user.id });
    return NextResponse.json(updatedLead);
  } catch (err) {
    return handleProductionError(err);
  }
}

// DELETE: Delete Lead
export async function DELETE(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'Lead ID is required' }, { status: 400 });

    const deleted = await Lead.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

    logger.info('CRM Lead deleted', { leadId: id, deletedBy: user.id });
    return NextResponse.json({ message: 'Lead deleted successfully' });
  } catch (err) {
    return handleProductionError(err);
  }
}
