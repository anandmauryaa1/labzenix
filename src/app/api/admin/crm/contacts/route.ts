import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import CrmContact from '@/models/CrmContact';
import { getAuthUser } from '@/lib/auth';
import { handleProductionError } from '@/lib/errorHandler';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  email: z.string().email('Invalid email address').trim().toLowerCase(),
  phone: z.string().optional(),
  company: z.string().optional(),
  jobTitle: z.string().optional(),
  status: z.enum(['Lead', 'Opportunity', 'Customer', 'Inactive']).default('Lead'),
  source: z.string().default('Manual Entry'),
  notes: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

// GET: Paginated, searchable, filterable contacts (High performance)
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build query conditions
    const query: any = {};

    if (status) {
      query.status = status;
    }

    // Apply text search if search term is provided
    if (search) {
      query.$text = { $search: search };
    }

    const skip = (page - 1) * limit;
    
    // Sort logic
    const sort: any = {};
    if (search) {
      // If full text searching, sort by text score relevance unless a specific sort is requested
      if (sortBy === 'createdAt') {
        sort.score = { $meta: 'textScore' };
      } else {
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
      }
    } else {
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    }

    // Run query & count in parallel
    const [contacts, total] = await Promise.all([
      CrmContact.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('owner', 'name email'),
      CrmContact.countDocuments(query),
    ]);

    logger.info('CRM contacts queried', { 
      userId: user.id, 
      count: contacts.length, 
      total, 
      page 
    });

    return NextResponse.json({
      contacts,
      total,
      page,
      pages: Math.ceil(total / limit),
      limit,
    });
  } catch (err) {
    return handleProductionError(err);
  }
}

// POST: Create a new CRM contact
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();

    const result = contactSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: result.error.format() 
      }, { status: 400 });
    }

    // Check if email already exists in CRM
    const existing = await CrmContact.findOne({ email: result.data.email });
    if (existing) {
      return NextResponse.json({ error: 'A contact with this email already exists' }, { status: 409 });
    }

    const contactData = {
      ...result.data,
      owner: user.id,
    };

    const newContact = await CrmContact.create(contactData);
    logger.info('CRM Contact created', { contactId: newContact._id, createdBy: user.id });

    return NextResponse.json(newContact, { status: 201 });
  } catch (err) {
    return handleProductionError(err);
  }
}

// PUT/DELETE operations
export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) return NextResponse.json({ error: 'Contact ID is required' }, { status: 400 });

    const validated = contactSchema.partial().safeParse(updateData);
    if (!validated.success) {
      return NextResponse.json({ error: 'Invalid update payload', details: validated.error.format() }, { status: 400 });
    }

    const updatedContact = await CrmContact.findByIdAndUpdate(id, validated.data, { new: true });
    if (!updatedContact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    logger.info('CRM Contact updated', { contactId: id, updatedBy: user.id });
    return NextResponse.json(updatedContact);
  } catch (err) {
    return handleProductionError(err);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can delete contacts' }, { status: 403 });
    }

    await dbConnect();
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'Contact ID is required' }, { status: 400 });

    const contact = await CrmContact.findByIdAndDelete(id);
    if (!contact) return NextResponse.json({ error: 'Contact not found' }, { status: 404 });

    logger.info('CRM Contact deleted', { contactId: id, deletedBy: user.id });
    return NextResponse.json({ message: 'Contact deleted successfully' });
  } catch (err) {
    return handleProductionError(err);
  }
}
