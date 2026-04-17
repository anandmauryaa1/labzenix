'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import { Trash2, Edit, Plus } from 'lucide-react';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    const res = await fetch('/api/products');
    const data = await res.json();
    setProducts(data);
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const deleteProduct = async (id: string) => {
    if (confirm('Delete product?')) {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      toast.success('Deleted');
      fetchProducts();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link href="/admin/products/new"><Button><Plus size={16} /> Add Product</Button></Link>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr><th className="p-4">Title</th><th>Category</th><th>Price</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {products.map((p: any) => (
              <tr key={p._id} className="border-b border-gray-200 dark:border-gray-700">
                <td className="p-4">{p.title}</td>
                <td>{p.category}</td>
                <td>${p.price}</td>
                <td className="space-x-2">
                  <Link href={`/admin/products/${p._id}`}><Button size="sm" variant="ghost"><Edit size={16} /></Button></Link>
                  <Button size="sm" variant="ghost" onClick={() => deleteProduct(p._id)}><Trash2 size={16} className="text-red-500" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}