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
  status: z.enum(['Active', 'Deactive', 'Lead', 'Opportunity', 'Customer', 'Inactive']).default('Active'),
  source: z.string().default('Manual Entry'),
  notes: z.string().optional(),
  tags: z.array(z.string()).default([]),
  rating: z.number().optional(),
  convertedDate: z.any().optional(),
  convertedBy: z.string().optional(),
  address: z.string().optional(),
  gstNo: z.string().optional(),
  dob: z.string().optional(),
  anniversaryDate: z.string().optional(),
  isFavorite: z.boolean().optional(),
  isDuplicate: z.boolean().optional(),
});

// GET: Paginated, searchable, tab-filterable contacts
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const search = searchParams.get('search') || '';
    const tab = searchParams.get('tab') || 'active'; // active, deactive, favorite, duplicate
    const status = searchParams.get('status') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build tab condition
    const query: any = {};

    if (tab === 'active') {
      query.status = { $in: ['Active', 'Customer', 'Lead', 'Opportunity'] };
    } else if (tab === 'deactive') {
      query.status = { $in: ['Deactive', 'Inactive'] };
    } else if (tab === 'favorite') {
      query.isFavorite = true;
    } else if (tab === 'duplicate') {
      query.isDuplicate = true;
    } else if (status) {
      query.status = status;
    }

    // Apply text search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Run query & tab counts in parallel
    const [
      contacts, 
      total,
      activeCount,
      deactiveCount,
      favoriteCount,
      duplicateCount
    ] = await Promise.all([
      CrmContact.find(query)
        .populate('owner', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      CrmContact.countDocuments(query),
      CrmContact.countDocuments({ status: { $in: ['Active', 'Customer', 'Lead', 'Opportunity'] } }),
      CrmContact.countDocuments({ status: { $in: ['Deactive', 'Inactive'] } }),
      CrmContact.countDocuments({ isFavorite: true }),
      CrmContact.countDocuments({ isDuplicate: true })
    ]);

    return NextResponse.json({
      contacts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1
      },
      tabCounts: {
        active: activeCount,
        deactive: deactiveCount,
        favorite: favoriteCount,
        duplicate: duplicateCount
      }
    });
  } catch (err) {
    return handleProductionError(err);
  }
}

// POST: Create Contact / Active Customer
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const body = await req.json();

    const result = contactSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: result.error.format() 
      }, { status: 400 });
    }

    // Check if email already exists
    const existing = await CrmContact.findOne({ email: result.data.email });
    if (existing) {
      return NextResponse.json({ error: 'A customer with this email already exists' }, { status: 409 });
    }

    const contactData = {
      ...result.data,
      convertedDate: result.data.convertedDate ? new Date(result.data.convertedDate) : new Date(),
      convertedBy: result.data.convertedBy || user.name || 'LabZenix Industries',
      owner: user.id,
    };

    const newContact = await CrmContact.create(contactData);
    logger.info('CRM Customer created', { contactId: newContact._id, createdBy: user.id });

    return NextResponse.json(newContact, { status: 201 });
  } catch (err) {
    return handleProductionError(err);
  }
}

// PUT: Update Contact (Single or Bulk)
export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const body = await req.json();
    const { id, ids, ...updateData } = body;

    // Bulk update support
    if (Array.isArray(ids) && ids.length > 0) {
      await CrmContact.updateMany({ _id: { $in: ids } }, { $set: updateData });
      logger.info('CRM Contacts bulk updated', { count: ids.length, updatedBy: user.id });
      return NextResponse.json({ message: `${ids.length} contacts updated successfully` });
    }

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

// DELETE: Delete Contact (Single or Bulk)
export async function DELETE(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();
    const { id, ids } = body;

    // Bulk delete support
    if (Array.isArray(ids) && ids.length > 0) {
      const res = await CrmContact.deleteMany({ _id: { $in: ids } });
      logger.info('CRM Contacts bulk deleted', { count: res.deletedCount, deletedBy: user.id });
      return NextResponse.json({ message: `${res.deletedCount} contacts deleted successfully` });
    }

    if (!id) return NextResponse.json({ error: 'Contact ID is required' }, { status: 400 });

    const contact = await CrmContact.findByIdAndDelete(id);
    if (!contact) return NextResponse.json({ error: 'Contact not found' }, { status: 404 });

    logger.info('CRM Contact deleted', { contactId: id, deletedBy: user.id });
    return NextResponse.json({ message: 'Customer deleted successfully' });
  } catch (err) {
    return handleProductionError(err);
  }
}
