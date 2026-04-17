'use client';
import Sidebar from '@/components/admin/Sidebar';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  useEffect(() => {
    // additional client-side check
    fetch('/api/admin/check').catch(() => router.push('/admin/login'));
  }, []);
  return (
    <div className="flex min-h-screen bg-gray-50/50">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">{children}</main>
    </div>
  );
}