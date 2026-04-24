import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    if (!category) {
      return NextResponse.json({ error: 'Category parameter is required' }, { status: 400 });
    }

    // Fetch all products in the category
    const products = await Product.find({ category })
      .sort({ title: 1 });

    if (products.length === 0) {
      return NextResponse.json({ error: 'No products found in this category' }, { status: 404 });
    }

    // Generate CSV content
    const csvContent = generateCatalogCSV(products, category);

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv;charset=utf-8',
        'Content-Disposition': `attachment; filename="catalog-${category.toLowerCase().replace(/\s+/g, '-')}.csv"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error: any) {
    logger.error('Catalog generation error', { error: error.message });
    return NextResponse.json({ error: 'Failed to generate catalog' }, { status: 500 });
  }
}

function generateCatalogCSV(products: any[], category: string): string {
  const headers = [
    'Product Title',
    'Model Number',
    'Category',
    'Usage Type',
    'Description',
    'Features',
    'Specifications',
    'SEO Title',
    'SEO Description'
  ];

  const rows = products.map(product => [
    `"${product.title}"`,
    `"${product.modelNumber}"`,
    `"${product.category}"`,
    `"${product.usage}"`,
    `"${product.description.replace(/"/g, '""')}"`,
    `"${(product.features || []).join('; ')}"`,
    `"${Object.entries(product.specs || {})
      .map(([key, val]) => `${key}: ${val}`)
      .join('; ')}"`,
    `"${product.metaTitle}"`,
    `"${product.metaDescription}"`
  ]);

  const csvContent = [
    `Catalog: ${category}`,
    `Generated: ${new Date().toLocaleDateString()}`,
    `Total Products: ${products.length}`,
    '',
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  return csvContent;
}
