import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import Review from '@/models/Review';
import Faq from '@/models/Faq';
import { logger } from '@/lib/logger';

export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();
    const { ids } = await req.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No IDs provided for deletion' }, { status: 400 });
    }

    // Delete associated data first
    await Promise.all([
      Review.deleteMany({ product: { $in: ids } }),
      Faq.deleteMany({ product: { $in: ids } })
    ]);

    const result = await Product.deleteMany({ _id: { $in: ids } });
    
    logger.info('Bulk products deleted', { count: result.deletedCount, ids });

    return NextResponse.json({ 
      success: true, 
      message: `${result.deletedCount} products deleted successfully`,
      count: result.deletedCount 
    });
  } catch (error: any) {
    logger.error('Bulk delete error', { error: error.message });
    return NextResponse.json({ error: 'Failed to process bulk deletion' }, { status: 500 });
  }
}
