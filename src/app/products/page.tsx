import { getPageMetadata } from '@/lib/seo';
import ProductsClient from './ProductsClient';
import ProductRange from '@/components/home/ProductRange';

export async function generateMetadata() {
  return await getPageMetadata('products');
}

export default function ProductsPage() {
  return (
    <div className="bg-white min-h-screen">
      <ProductsClient />
      
      {/* Product Range Section */}
      <div className="border-t border-gray-100">
        <ProductRange />
      </div>
    </div>
  );
}
