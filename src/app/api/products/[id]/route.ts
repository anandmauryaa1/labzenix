import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import Review from '@/models/Review';
import Faq from '@/models/Faq';
import { handleProductionError } from '@/lib/errorHandler';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let productId: string | undefined;
  try {
    await dbConnect();
    const { id } = await params;
    productId = id;
    const product = await Product.findById(id).lean() as any;
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    
    // Fetch associated collections and embed them
    product.reviews = await Review.find({ product: id }).lean();
    product.faqs = await Faq.find({ product: id }).lean();
    
    // Serialize MongoDB ObjectIds in subdocuments to plain JSON
    return NextResponse.json(JSON.parse(JSON.stringify(product)));
  } catch (error) {
    logger.error('[API] GET product error', { error, id: productId });
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let productId: string | undefined;
  try {
    await dbConnect();
    const { id } = await params;
    productId = id;
    const body = await req.json();

    // Strip fields that should not be overwritten, and extract reviews/faqs
    const { author: _author, createdAt: _createdAt, _id: __id, reviews, faqs, ...updateData } = body;

    const product = await Product.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    ).lean() as any;

    if (!product) {
      logger.warn('[API] Update failed: Product not found', { id });
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Synchronize the external collections
    if (Array.isArray(reviews)) {
      await Review.deleteMany({ product: id });
      if (reviews.length > 0) {
        const toInsert = reviews.map(({ _id, ...r }: any) => ({ ...r, product: id }));
        await Review.insertMany(toInsert);
      }
    }

    if (Array.isArray(faqs)) {
      await Faq.deleteMany({ product: id });
      if (faqs.length > 0) {
        const toInsert = faqs.map(({ _id, ...f }: any) => ({ ...f, product: id }));
        await Faq.insertMany(toInsert);
      }
    }

    // Attach for return
    product.reviews = await Review.find({ product: id }).lean();
    product.faqs = await Faq.find({ product: id }).lean();

    logger.info('[API] Saved successfully', { 
      productId: id, 
      reviewsInDb: product.reviews.length, 
      faqsInDb: product.faqs.length 
    });
    
    // Revalidate cached pages
    revalidatePath('/admin/products');
    revalidatePath('/products');
    revalidatePath(`/products/${product.slug}`);
    revalidateTag('products', "default");
    revalidateTag('categories', "default");
    
    return NextResponse.json(JSON.parse(JSON.stringify(product)));
  } catch (error) {
    logger.error('[API] Update FATAL error', { error, id: productId });
    return handleProductionError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let productId: string | undefined;
  try {
    await dbConnect();
    const { id } = await params;
    productId = id;
    
    logger.info('[API] Deleting product', { id });
    const product = await Product.findByIdAndDelete(id);
    
    if (!product) {
       logger.warn('[API] Delete failed: Product not found', { id });
       return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    logger.info('[API] Delete successful', { id });
    
    // Revalidate cached pages
    revalidatePath('/admin/products');
    revalidatePath('/products');
    revalidatePath(`/products/${product.slug}`);
    revalidateTag('products', "default");
    revalidateTag('categories', "default");
    
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('[API] Delete error', { error, id: productId });
    return handleProductionError(error);
  }
}