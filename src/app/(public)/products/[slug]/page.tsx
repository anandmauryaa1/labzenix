import { notFound } from 'next/navigation';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import InquiryForm from '@/components/products/InquiryForm';
import Image from 'next/image';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  await dbConnect();
  const product = await Product.findOne({ slug: params.slug });
  if (!product) return { title: 'Not Found' };
  return { title: product.title, description: product.description.substring(0, 160) };
}

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  await dbConnect();
  const product = await Product.findOne({ slug: params.slug }).lean();
  if (!product) notFound();

  return (
    <div className="pt-28 pb-16 max-w-7xl mx-auto px-4">
      <div className="grid lg:grid-cols-2 gap-12">
        <div className="space-y-4">
          <div className="relative h-96 rounded-2xl overflow-hidden bg-gray-100">
            <Image src={product.images[0] || '/placeholder.jpg'} alt={product.title} fill className="object-contain" />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {product.images.map((img: string, i: number) => (
              <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-primary">
                <Image src={img} alt="" fill className="object-cover" />
              </div>
            ))}
          </div>
        </div>
        <div>
          <h1 className="text-4xl font-bold mb-4">{product.title}</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{product.description}</p>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 mb-8">
            <h3 className="text-xl font-semibold mb-4">Technical Specifications</h3>
            <dl className="grid grid-cols-2 gap-3">
              {Object.entries(product.specs || {}).map(([key, val]) => (
                <div key={key} className="flex justify-between"><dt className="font-medium">{key}</dt><dd>{String(val)}</dd></div>
              ))}
            </dl>
          </div>
          <InquiryForm productId={product._id.toString()} productName={product.title} />
        </div>
      </div>
    </div>
  );
}