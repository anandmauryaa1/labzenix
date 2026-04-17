import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import slugify from 'slugify';

export async function GET() {
  await dbConnect();
  const products = await Product.find({}).sort({ createdAt: -1 });
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const body = await req.json();
  const slug = slugify(body.title);
  const product = await Product.create({ ...body, slug });
  return NextResponse.json(product, { status: 201 });
}