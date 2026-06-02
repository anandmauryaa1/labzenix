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
  X,
  BarChart3,
  UserCircle,
  HelpCircle,
  Handshake,
  Grid3X3,
  Quote
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({});
  
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

  // Open sub-menu if an item inside is active
  useEffect(() => {
    menuGroups.forEach(group => {
      group.items.forEach(item => {
        if (item.subItems) {
          const isChildActive = item.subItems.some(subItem => pathname === subItem.href);
          if (isChildActive) {
            setOpenSubMenus(prev => ({ ...prev, [item.title]: true }));
          }
        }
      });
    });
  }, [pathname]);

  const closeSidebarOnMobile = () => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  const toggleSubMenu = (title: string) => {
    setOpenSubMenus(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const menuGroups = [
    {
      group: 'Overview',
      items: [
        { 
          title: 'Dashboard', 
          href: '/admin', 
          icon: LayoutDashboard,
          roles: ['admin', 'seo', 'marketing'],
          permission: '' // Always visible
        }
      ]
    },
    {
      group: 'Product Catalog',
      items: [
        { 
          title: 'Products', 
          href: '/admin/products', 
          icon: Package,
          roles: ['admin', 'marketing'],
          permission: 'products'
        },
        { 
          title: 'Product Categories', 
          href: '/admin/products/categories', 
          icon: Layers,
          roles: ['admin', 'marketing'],
          permission: 'categories'
        },
        { 
          title: 'Product Range', 
          href: '/admin/product-ranges', 
          icon: Grid3X3,
          roles: ['admin', 'marketing'],
          permission: 'products'
        },
        { 
          title: 'Complete Range', 
          href: '/admin/complete-product-ranges', 
          icon: Layers,
          roles: ['admin', 'marketing'],
          permission: 'products'
        },
        { 
          title: 'Applications', 
          href: '#', 
          icon: Grid3X3,
          roles: ['admin', 'marketing'],
          permission: 'products',
          subItems: [
            { title: 'All Applications', href: '/admin/applications' },
            { title: 'Application Category', href: '/admin/applications/categories' },
          ]
        }
      ]
    },
    {
      group: 'Content & Marketing',
      items: [
        { 
          title: 'Blogs', 
          href: '/admin/blogs', 
          icon: FileText,
          roles: ['admin', 'seo', 'marketing'],
          permission: 'blogs'
        },
        { 
          title: 'About Content', 
          href: '/admin/about-content', 
          icon: Layers,
          roles: ['admin', 'marketing'],
          permission: 'settings'
        },
        { 
          title: 'Company Certificates', 
          href: '/admin/company-certificates', 
          icon: ShieldCheck,
          roles: ['admin', 'marketing'],
          permission: 'settings'
        },
        { 
          title: 'Company Stats', 
          href: '/admin/company-stats', 
          icon: BarChart3,
          roles: ['admin', 'marketing'],
          permission: 'settings'
        },
        { 
          title: 'Core Values', 
          href: '/admin/core-values', 
          icon: ShieldCheck,
          roles: ['admin', 'marketing'],
          permission: 'settings'
        },
        { 
          title: 'Hero Slides', 
          href: '/admin/hero-slides', 
          icon: Layers,
          roles: ['admin', 'marketing'],
          permission: 'settings'
        },
        { 
          title: 'Landing Reviews', 
          href: '/admin/testimonials', 
          icon: Quote,
          roles: ['admin', 'marketing'],
          permission: 'settings'
        },
        { 
          title: 'Partners', 
          href: '/admin/partners', 
          icon: Handshake,
          roles: ['admin', 'marketing'],
          permission: 'settings'
        },
        { 
          title: 'FAQs', 
          href: '/admin/faqs', 
          icon: HelpCircle,
          roles: ['admin', 'marketing', 'seo'],
          permission: 'settings'
        }
      ]
    },
    {
      group: 'CRM & Leads',
      items: [
        { 
          title: 'Inquiries', 
          href: '/admin/inquiries', 
          icon: MessageSquare,
          roles: ['admin', 'marketing'],
          permission: 'inquiries'
        }
      ]
    },
    {
      group: 'System & Configuration',
      items: [
        { 
          title: 'Page SEO', 
          href: '/admin/seo', 
          icon: Globe,
          roles: ['admin', 'seo'],
          permission: 'seo'
        },
        { 
          title: 'G-Analytics', 
          href: '/admin/analytics', 
          icon: BarChart3,
          roles: ['admin', 'marketing', 'seo'],
          permission: 'analytics'
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
        }
      ]
    }
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

        <div className={`h-full flex flex-col ${isCollapsed && !isMobile ? 'p-0' : 'p-0'}`}>
          {/* Logo section with professional accent */}
          <div className={`flex items-center mb-0 pb-8 border-b-2 border-primary/10 ${isCollapsed && !isMobile ? 'flex-col space-y-2 p-4' : 'space-x-3 p-8'}`}>
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center font-black text-lg shadow-lg shadow-primary/20 flex-shrink-0 border-2 border-primary/30">
              L
            </div>
            {(!isCollapsed || isMobile) && (
              <div>
                <h2 className="font-black text-lg leading-none tracking-tighter text-secondary">LABZENIX</h2>
                <span className="text-[10px] text-primary font-black uppercase tracking-widest">Admin Control</span>
              </div>
            )}
          </div>

          {/* Navigation - Scrollable Area */}
          <nav className={`flex-grow overflow-y-auto custom-scrollbar ${isCollapsed && !isMobile ? 'px-2' : 'px-8'} space-y-1 py-4`}>
            {menuGroups.map((group, groupIdx) => (
              <div key={groupIdx} className="mb-6">
                {(!isCollapsed || isMobile) && (
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-4">
                    {group.group}
                  </h3>
                )}
                <div className="space-y-1">
                  {group.items.map((item) => {
                    // Admin bypasses all checks
                    if (role === 'admin') {
                      // Keep the original map (Admin sees everything)
                    } else {
                      // Check permissions for non-admins
                      if (item.permission && !permissions.includes(item.permission)) return null;
                    }

                    const hasSubItems = item.subItems && item.subItems.length > 0;
                    const isSubMenuOpen = openSubMenus[item.title];
                    const isActive = hasSubItems 
                      ? item.subItems?.some(sub => pathname === sub.href)
                      : pathname === item.href;

                    return (
                      <div key={item.title} className="flex flex-col">
                        {hasSubItems ? (
                          <button
                            onClick={() => toggleSubMenu(item.title)}
                            className={`flex items-center justify-between group px-4 py-3 transition-all duration-200 border-l-4 relative overflow-hidden w-full text-left ${
                              isActive
                                ? 'border-primary bg-primary/8 text-primary font-bold'
                                : 'border-transparent text-gray-400 hover:text-secondary hover:bg-gray-50 hover:border-gray-300'
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
                            {(!isCollapsed || isMobile) && (
                              <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${isSubMenuOpen ? 'rotate-90' : ''}`} />
                            )}
                          </button>
                        ) : (
                          <Link
                            href={item.href}
                            onClick={closeSidebarOnMobile}
                            className={`flex items-center justify-between group px-4 py-3 transition-all duration-200 border-l-4 relative overflow-hidden ${
                              isActive
                                ? 'border-primary bg-primary/8 text-primary font-bold'
                                : 'border-transparent text-gray-400 hover:text-secondary hover:bg-gray-50 hover:border-gray-300'
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
                        )}

                        {/* Sub Menu Rendering */}
                        {hasSubItems && isSubMenuOpen && (!isCollapsed || isMobile) && (
                          <div className="flex flex-col ml-8 mt-1 space-y-1 border-l border-gray-100">
                            {item.subItems?.map((sub) => {
                              const isSubActive = pathname === sub.href;
                              return (
                                <Link
                                  key={sub.href}
                                  href={sub.href}
                                  onClick={closeSidebarOnMobile}
                                  className={`px-4 py-2 text-xs font-black uppercase tracking-widest transition-all ${
                                    isSubActive
                                      ? 'text-primary'
                                      : 'text-gray-400 hover:text-secondary hover:translate-x-1'
                                  }`}
                                >
                                  {sub.title}
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Bottom section - User info and logout */}
          <div className={`mt-auto border-t border-gray-100 bg-gray-50/50 transition-all duration-300 ${
            isCollapsed && !isMobile ? 'p-4' : 'p-6'
          }`}>
            <Link 
              href="/admin/profile"
              className={`flex items-center mb-6 hover:bg-white transition-all cursor-pointer group/user ${isCollapsed && !isMobile ? 'flex-col space-y-3' : 'space-x-3 px-2 py-2 border border-transparent hover:border-gray-100 hover:shadow-sm'}`}
            >
              <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center text-xs font-bold border border-gray-200 shadow-sm flex-shrink-0 group-hover/user:bg-primary transition-colors">
                {role?.[0]?.toUpperCase() || 'A'}
              </div>
              {(!isCollapsed || isMobile) && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black truncate uppercase text-secondary group-hover/user:text-primary transition-colors">{role || 'Admin'}</p>
                  <div className="flex items-center text-[10px] text-primary space-x-1">
                    <ShieldCheck className="w-3 h-3 flex-shrink-0" />
                    <span className="uppercase tracking-tighter font-bold">Verified Session</span>
                  </div>
                </div>
              )}
            </Link>
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
        </div>
      </aside>
    </>
  );
}

// Add these custom scrollbar styles to your global CSS or keep it here for simplicity if allowed
const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #e5e7eb;
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #d1d5db;
  }
`;

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = scrollbarStyles;
  document.head.appendChild(style);
}
