import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import Review from '@/models/Review';
import Faq from '@/models/Faq';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { handleProductionError } from '@/lib/errorHandler';

export async function GET() {
  try {
    await dbConnect();
    const products = await Product.find({})
      .populate({ path: 'author', model: User, select: 'name' })
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json(JSON.parse(JSON.stringify(products)));
  } catch (error) {
    console.error('[API] GET products error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}


export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('admin_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    await dbConnect();
    const { reviews, faqs, ...body } = await req.json();
    
    console.log('[API] Processing Authenticated Product Insertion...');
    
    if (!body.title || !body.title.trim()) {
      return NextResponse.json({ error: 'Product title is required' }, { status: 400 });
    }
    if (!body.slug || !body.slug.trim()) {
      return NextResponse.json({ error: 'Product URL slug must be provided' }, { status: 400 });
    }
    if (!body.modelNumber || !body.modelNumber.trim()) {
      return NextResponse.json({ error: 'Model number is required' }, { status: 400 });
    }
    if (!body.category || !body.category.trim()) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 });
    }
    if (!body.description || !body.description.trim()) {
      return NextResponse.json({ error: 'Product description is required' }, { status: 400 });
    }
    if (!body.metaTitle || !body.metaTitle.trim()) {
      return NextResponse.json({ error: 'SEO title is required' }, { status: 400 });
    }
    if (!body.metaDescription || !body.metaDescription.trim()) {
      return NextResponse.json({ error: 'SEO description is required' }, { status: 400 });
    }
    
    let authorId = decoded.id;
    
    // Handle dummy dev sessions
    if (authorId === 'dummy-id') {
      const firstAdmin = await User.findOne({ role: 'admin' });
      if (firstAdmin) {
        authorId = firstAdmin._id;
      } else {
        return NextResponse.json({ error: 'No administrative user found for system assignment.' }, { status: 400 });
      }
    }
    
    const product = await Product.create({
      ...body,
      author: authorId
    });

    console.log('[API] Product created successfully - ID:', product._id);

    // Save reviews and FAQs referencing the newly created product
    if (Array.isArray(reviews) && reviews.length > 0) {
      const reviewsToInsert = reviews.map(({ _id, ...r }: any) => ({ ...r, product: product._id }));
      await Review.insertMany(reviewsToInsert);
    }
    
    if (Array.isArray(faqs) && faqs.length > 0) {
      const faqsToInsert = faqs.map(({ _id, ...f }: any) => ({ ...f, product: product._id }));
      await Faq.insertMany(faqsToInsert);
    }

    // Attach them back for the JSON response
    const productJson = product.toJSON();
    productJson.reviews = Array.isArray(reviews) ? reviews : [];
    productJson.faqs = Array.isArray(faqs) ? faqs : [];
    
    // Revalidate cached pages
    revalidatePath('/admin/products');
    revalidatePath('/products');
    revalidatePath(`/products/${product.slug}`);
    revalidateTag('products', "default");
    revalidateTag('categories', "default");
    
    return NextResponse.json(JSON.parse(JSON.stringify(productJson)), { status: 201 });
  } catch (error: any) {
    console.error('[API] FATAL: Product Creation Interrupted');
    console.error(error);
    return handleProductionError(error);
  }
}