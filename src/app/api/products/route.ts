import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import Review from '@/models/Review';
import Faq from '@/models/Faq';
import User from '@/models/User';
import { handleProductionError } from '@/lib/errorHandler';
import { getAuthUser, hasPermission } from '@/lib/auth';
import { invalidateProductCaches } from '@/lib/cacheRevalidation';
import { z } from 'zod';
import { logger } from '@/lib/logger';

const productSchema = z.object({
  title: z.string().min(1, 'Title is required').trim(),
  modelNumber: z.string().min(1, 'Model number is required').trim(),
  slug: z.string().min(1, 'Slug is required').trim(),
  description: z.string().min(1, 'Description is required').trim(),
  category: z.string().min(1, 'Category is required').trim(),
  usage: z.string().optional(),
  images: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
  specificationText: z.string().optional(),
  specs: z.record(z.any()).optional(),
  youtubeUrl: z.string().optional(),
  metaTitle: z.string().min(1, 'Meta title is required').trim(),
  metaDescription: z.string().min(1, 'Meta description is required').trim(),
});

export async function GET() {
  try {
    await dbConnect();
    const products = await Product.find({})
      .populate({ path: 'author', model: User, select: 'name' })
      .sort({ createdAt: -1 })
      .lean()
      .select('-__v');
    
    return NextResponse.json(JSON.parse(JSON.stringify(products)));
  } catch (error) {
    return handleProductionError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });

    const canEditProducts = await hasPermission(req, 'products');
    if (!canEditProducts) return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });

    await dbConnect();
    const rawBody = await req.json();
    
    const result = productSchema.safeParse(rawBody);
    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.format() }, { status: 400 });
    }

    const body = result.data;
    const { reviews, faqs } = rawBody;
    
    let authorId = user.id;
    
    // Handle legacy dummy dev sessions
    if (authorId === 'dummy-id') {
      const firstAdmin = await User.findOne({ role: 'admin' });
      if (firstAdmin) {
        authorId = firstAdmin._id;
      } else {
        return NextResponse.json({ error: 'System configuration error: No admin found.' }, { status: 500 });
      }
    }
    
    const product = await Product.create({
      ...body,
      author: authorId
    });

    // Save reviews and FAQs referencing the newly created product
    if (Array.isArray(reviews) && reviews.length > 0) {
      const reviewsToInsert = reviews.map(({ _id, ...r }: any) => ({ ...r, product: product._id }));
      await Review.insertMany(reviewsToInsert);
    }
    
    if (Array.isArray(faqs) && faqs.length > 0) {
      const faqsToInsert = faqs.map(({ _id, ...f }: any) => ({ ...f, product: product._id }));
      await Faq.insertMany(faqsToInsert);
    }

    const productJson = product.toJSON();
    productJson.reviews = Array.isArray(reviews) ? reviews : [];
    productJson.faqs = Array.isArray(faqs) ? faqs : [];
    
    // Revalidate cached pages
    await invalidateProductCaches(product.slug);
    
    logger.info('Product created successfully', { productId: product._id, slug: product.slug, user: user.username });
    return NextResponse.json(JSON.parse(JSON.stringify(productJson)), { status: 201 });
  } catch (error: any) {
    return handleProductionError(error);
  }
}