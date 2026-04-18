'use client';
import Sidebar from '@/components/admin/Sidebar';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useUIStore } from '@/store/useUIStore';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { isAdminSidebarCollapsed: isCollapsed } = useUIStore();
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    setMounted(true);
    // additional client-side check
    // Verify authentication and status
    fetch('/api/admin/me').then(res => {
      if (!res.ok && !isLoginPage) router.push('/admin/login');
    });

    // Handle responsive behavior
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      {!isLoginPage && <Sidebar />}
      <main
        className={`flex-1 p-8 transition-all duration-300 ${
          isLoginPage ? 'ml-0' : isMobile ? 'ml-0 pt-16' : isCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        {children}
      </main>
    </div>
  );
}