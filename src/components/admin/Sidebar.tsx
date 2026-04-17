'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Sidebar() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  return (
    <aside className="w-64 bg-gray-900 text-white p-6">
      <h2 className="text-2xl font-bold mb-8">Admin Panel</h2>
      <nav className="space-y-4">
        <Link href="/admin/products" className="block p-2 rounded hover:bg-gray-800">Products</Link>
        <Link href="/admin/blogs" className="block p-2 rounded hover:bg-gray-800">Blogs</Link>
      </nav>
      <button onClick={handleLogout} className="mt-8 px-4 py-2 bg-red-600 rounded hover:bg-red-700">Logout</button>
    </aside>
  );
}
