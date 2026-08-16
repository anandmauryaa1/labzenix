import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Quotation from '@/models/Quotation';
import Order from '@/models/Order';
import { getAuthUser } from '@/lib/auth';
import { handleProductionError } from '@/lib/errorHandler';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const quoteSchema = z.object({
  company: z.string().min(1, 'Company ID is required'),
  contact: z.string().min(1, 'Contact ID is required'),
  items: z.array(z.object({
    product: z.string(),
    quantity: z.number().min(1),
    price: z.number().min(0),
    hsnCode: z.string(),
  })),
  gstRate: z.number().default(18),
  discountPercentage: z.number().default(0),
  termsAndConditions: z.string().optional(),
});

// GET: Fetch quotations
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || '';

    const query: any = {};
    if (status) query.status = status;

    const quotations = await Quotation.find(query)
      .populate('company', 'name industry website address')
      .populate('contact', 'name email phone')
      .populate('items.product', 'name modelNumber')
      .sort({ createdAt: -1 });

    return NextResponse.json(quotations);
  } catch (err) {
    return handleProductionError(err);
  }
}

// POST: Register Quotation
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const body = await req.json();

    const result = quoteSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.format() }, { status: 400 });
    }

    // Math calculations
    const items = result.data.items;
    const subTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountAmount = (subTotal * result.data.discountPercentage) / 100;
    const taxableAmount = subTotal - discountAmount;
    const gstAmount = (taxableAmount * result.data.gstRate) / 100;
    const totalAmount = taxableAmount + gstAmount;

    // Generate formatted quote number
    const count = await Quotation.countDocuments({});
    const quotationNumber = `LZ-QT-${2026}-${(count + 1).toString().padStart(4, '0')}`;

    const quotationData = {
      ...result.data,
      quotationNumber,
      subTotal,
      gstAmount,
      totalAmount,
      status: 'Draft',
      createdBy: user.id
    };

    const newQuotation = await Quotation.create(quotationData);
    logger.info('B2B Quotation registered', { id: newQuotation._id, quotationNumber });

    return NextResponse.json(newQuotation, { status: 201 });
  } catch (err) {
    return handleProductionError(err);
  }
}

// PUT: Status management & conversion to B2B Order
export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'ID and Status are required' }, { status: 400 });
    }

    const quotation = await Quotation.findById(id);
    if (!quotation) return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });

    const previousStatus = quotation.status;
    quotation.status = status;
    await quotation.save();

    logger.info('Quotation status changed', { id, from: previousStatus, to: status });

    // Convert to B2B Order if status transitioned to Approved
    if (status === 'Approved' && previousStatus !== 'Approved') {
      const orderCount = await Order.countDocuments({});
      const orderNumber = `LZ-ORD-${2026}-${(orderCount + 1).toString().padStart(4, '0')}`;
      
      const newOrder = await Order.create({
        orderNumber,
        quotation: quotation._id,
        company: quotation.company,
        totalAmount: quotation.totalAmount,
        stage: 'Pending',
      });
      logger.info('Order automatically created from won quotation', { orderNumber, orderId: newOrder._id });
    }

    return NextResponse.json(quotation);
  } catch (err) {
    return handleProductionError(err);
  }
}
