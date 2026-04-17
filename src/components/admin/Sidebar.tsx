'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  FileText, 
  MessageSquare, 
  Settings, 
  LogOut,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/admin/stats'); // We'll update stats to also return user info or use a dedicated route
        if (res.status === 401) {
          router.push('/admin/login');
          return;
        }
        // For now, we'll get role from a simpler check or just mock until we have a dedicated /api/me
        // Let's assume the session cookie exists and the middleware is doing the heavy lifting.
        // We'll create a dedicated user info route next.
        const resUser = await fetch('/api/admin/me');
        if (resUser.ok) {
          const data = await resUser.json();
          setRole(data.role);
        }
      } catch (err) {
        console.error('Auth check error:', err);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  const menuItems = [
    { 
      title: 'Dashboard', 
      href: '/admin', 
      icon: LayoutDashboard,
      roles: ['admin', 'seo', 'marketing'] 
    },
    { 
      title: 'Products', 
      href: '/admin/products', 
      icon: Package,
      roles: ['admin', 'marketing'] 
    },
    { 
      title: 'Blogs', 
      href: '/admin/blogs', 
      icon: FileText,
      roles: ['admin', 'seo', 'marketing'] 
    },
    { 
      title: 'Inquiries', 
      href: '/admin/inquiries', 
      icon: MessageSquare,
      roles: ['admin', 'marketing'] 
    },
    { 
      title: 'Settings', 
      href: '/admin/settings', 
      icon: Settings,
      roles: ['admin'] 
    },
  ];

  if (loading) return <div className="w-64 bg-secondary min-h-screen" />;

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white text-secondary border-r border-gray-100 z-50 transition-all duration-300">
      <div className="p-8">
        <div className="flex items-center space-x-3 mb-10">
          <div className="w-10 h-10 bg-secondary text-white flex items-center justify-center rounded-none font-black text-xl shadow-lg shadow-secondary/10">
            L
          </div>
          <div>
            <h2 className="font-black text-lg leading-none tracking-tight text-secondary">LABZENIX</h2>
            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Admin Panel</span>
          </div>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => {
            if (role && !item.roles.includes(role)) return null;
            
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center justify-between group px-4 py-3 transition-all duration-200 border-l-4 ${
                  isActive 
                    ? 'border-primary bg-primary/5 text-primary font-bold' 
                    : 'border-transparent text-gray-400 hover:text-secondary hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-gray-300 group-hover:text-secondary'}`} />
                  <span className="text-sm uppercase tracking-wider">{item.title}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4" />}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="absolute bottom-0 left-0 w-full p-6 border-t border-gray-100 bg-gray-50/50">
        <div className="flex items-center space-x-3 mb-6 px-2">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-xs font-bold text-secondary border border-gray-200 shadow-sm">
            {role?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black truncate uppercase text-secondary">{role || 'User'}</p>
            <div className="flex items-center text-[10px] text-primary space-x-1">
              <ShieldCheck className="w-3 h-3" />
              <span className="uppercase tracking-tighter font-bold">Verified Session</span>
            </div>
          </div>
        </div>
        <button 
          onClick={handleLogout} 
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-600/5 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-300 text-xs font-black uppercase tracking-widest border border-red-600/10"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
