import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import PageMeta from '@/models/PageMeta';
import jwt from 'jsonwebtoken';
import { handleProductionError } from '@/lib/errorHandler';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const seoData = await PageMeta.find({}).sort({ pageKey: 1 });
    return NextResponse.json(seoData);
  } catch (error: any) {
    return handleProductionError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('admin_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    if (decoded.role !== 'admin' && decoded.role !== 'seo') {
       return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();
    const body = await req.json();
    const { pageKey, metaTitle, metaDescription, h1, keywords } = body;

    const seo = await PageMeta.findOneAndUpdate(
      { pageKey },
      { metaTitle, metaDescription, h1, keywords, updatedAt: new Date() },
      { new: true, upsert: true, runValidators: true }
    );

    return NextResponse.json(seo);
  } catch (error: any) {
    return handleProductionError(error);
  }
}
