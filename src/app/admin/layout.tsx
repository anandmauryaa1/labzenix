'use client';
import Sidebar from '@/components/admin/Sidebar';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useUIStore } from '@/store/useUIStore';
import { Toaster } from 'react-hot-toast';

// Auth protection is handled entirely by middleware.ts (JWT verify + redirect).
// No client-side auth fetch needed here — removing it eliminates the layout flash
// caused by the old "if (!mounted) return null" pattern.

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const { isAdminSidebarCollapsed: isCollapsed } = useUIStore();
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50/50" suppressHydrationWarning>
      {!isLoginPage && <Sidebar />}
      <main
        className={`flex-1 p-8 transition-all duration-300 ${
          isLoginPage ? 'ml-0' : isMobile ? 'ml-0 pt-16' : isCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        {children}
      </main>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
    </div>
  );
}