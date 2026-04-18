'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUIStore } from '@/store/useUIStore';
import { 
  LayoutDashboard, 
  Package, 
  FileText, 
  MessageSquare, 
  Settings, 
  LogOut,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Layers,
  Globe,
  Menu,
  X
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Use the store for sidebar collapse state
  const { isAdminSidebarCollapsed: isCollapsed, toggleAdminSidebar, setAdminSidebarCollapsed } = useUIStore();

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
          setPermissions(data.permissions || []);
        }
      } catch (err) {
        console.error('Auth check error:', err);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();

    // Handle responsive behavior
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setAdminSidebarCollapsed(true);
        setIsSidebarOpen(false);
      } else {
        setAdminSidebarCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [router, pathname, setAdminSidebarCollapsed]);

  const closeSidebarOnMobile = () => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  const menuItems = [
    { 
      title: 'Dashboard', 
      href: '/admin', 
      icon: LayoutDashboard,
      roles: ['admin', 'seo', 'marketing'],
      permission: '' // Always visible
    },
    { 
      title: 'Products', 
      href: '/admin/products', 
      icon: Package,
      roles: ['admin', 'marketing'],
      permission: 'products'
    },
    { 
      title: 'Categories', 
      href: '/admin/products/categories', 
      icon: Layers,
      roles: ['admin', 'marketing'],
      permission: 'categories'
    },
    { 
      title: 'Blogs', 
      href: '/admin/blogs', 
      icon: FileText,
      roles: ['admin', 'seo', 'marketing'],
      permission: 'blogs'
    },
    { 
      title: 'Inquiries', 
      href: '/admin/inquiries', 
      icon: MessageSquare,
      roles: ['admin', 'marketing'],
      permission: 'inquiries'
    },
    { 
      title: 'Global SEO', 
      href: '/admin/seo', 
      icon: Globe,
      roles: ['admin', 'seo'],
      permission: 'seo'
    },
    { 
      title: 'Identity Assets', 
      href: '/admin/users', 
      icon: ShieldCheck,
      roles: ['admin'],
      permission: 'users'
    },
    { 
      title: 'Settings', 
      href: '/admin/settings', 
      icon: Settings,
      roles: ['admin'],
      permission: 'settings'
    },
  ];

  if (loading) return <div className={`${isMobile ? 'hidden' : `w-64`} bg-secondary min-h-screen`} />;

  return (
    <>
      {/* Mobile menu button - only visible on mobile */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg bg-secondary text-white hover:bg-secondary/90 transition-colors"
      >
        {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay for mobile */}
      {isSidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-white text-secondary border-r border-gray-100 z-40 transition-all duration-300 ${
          isMobile
            ? `w-64 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`
            : `${isCollapsed ? 'w-20' : 'w-64'}`
        }`}
      >
        {/* Toggle Button - Desktop Only */}
        {!isMobile && (
          <button
            onClick={toggleAdminSidebar}
            className={`absolute -right-4 top-10 z-50 w-8 h-8 bg-white border border-gray-100 rounded-none flex items-center justify-center text-secondary hover:text-primary shadow-sm hover:shadow-md transition-all duration-300 group`}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            ) : (
              <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            )}
          </button>
        )}

        <div className={`h-full flex flex-col ${isCollapsed && !isMobile ? 'p-4' : 'p-8'}`}>
          {/* Logo section */}
          <div className={`flex items-center mb-10 ${isCollapsed && !isMobile ? 'flex-col space-y-2' : 'space-x-3'}`}>
            <div className="w-10 h-10 bg-secondary text-white flex items-center justify-center rounded-none font-black text-xl shadow-lg shadow-secondary/10 flex-shrink-0">
              L
            </div>
            {(!isCollapsed || isMobile) && (
              <div>
                <h2 className="font-black text-lg leading-none tracking-tight text-secondary">LABZENIX</h2>
                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Admin Panel</span>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              // Admin bypasses all checks
              if (role === 'admin') {
                // Keep the original map (Admin sees everything)
              } else {
                // Check permissions for non-admins
                if (item.permission && !permissions.includes(item.permission)) return null;
              }

              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeSidebarOnMobile}
                  className={`flex items-center justify-between group px-4 py-3 transition-all duration-200 border-l-4 ${
                    isActive
                      ? 'border-primary bg-primary/5 text-primary font-bold'
                      : 'border-transparent text-gray-400 hover:text-secondary hover:bg-gray-50'
                  } ${isCollapsed && !isMobile ? 'px-2' : ''}`}
                  title={isCollapsed && !isMobile ? item.title : ''}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon
                      className={`w-5 h-5 flex-shrink-0 ${
                        isActive ? 'text-primary' : 'text-gray-300 group-hover:text-secondary'
                      }`}
                    />
                    {(!isCollapsed || isMobile) && (
                      <span className="text-sm uppercase tracking-wider">{item.title}</span>
                    )}
                  </div>
                  {isActive && (!isCollapsed || isMobile) && (
                    <ChevronRight className="w-4 h-4 flex-shrink-0" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom section - User info and logout */}
        <div className={`absolute bottom-0 left-0 w-full border-t border-gray-100 bg-gray-50/50 transition-all duration-300 ${
          isCollapsed && !isMobile ? 'p-4' : 'p-6'
        }`}>
          <div className={`flex items-center mb-6 ${isCollapsed && !isMobile ? 'flex-col space-y-3' : 'space-x-3 px-2'}`}>
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-xs font-bold text-secondary border border-gray-200 shadow-sm flex-shrink-0">
              {role?.[0]?.toUpperCase()}
            </div>
            {(!isCollapsed || isMobile) && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black truncate uppercase text-secondary">{role || 'User'}</p>
                <div className="flex items-center text-[10px] text-primary space-x-1">
                  <ShieldCheck className="w-3 h-3 flex-shrink-0" />
                  <span className="uppercase tracking-tighter font-bold">Verified Session</span>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-600/5 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-300 text-xs font-black uppercase tracking-widest border border-red-600/10 ${
              isCollapsed && !isMobile ? 'px-2 py-2' : ''
            }`}
            title={isCollapsed && !isMobile ? 'Sign Out' : ''}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {(!isCollapsed || isMobile) && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

    </>
  );
}
