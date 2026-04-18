'use client';

import { useState, useEffect } from 'react';
import { 
  Package, 
  FileText, 
  MessageSquare, 
  TrendingUp, 
  ArrowUpRight,
  Clock,
  ChevronRight,
  ExternalLink,
  Layers,
  Zap,
  Tag,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch('/api/admin/dashboard');
        if (res.ok) {
          const result = await res.json();
          setData(result);
        } else {
          toast.error('Dashboard synchronization failed');
        }
      } catch (err) {
        toast.error('Network protocol error');
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Loading Intelligence Hub...</p>
      </div>
    );
  }

  const stats = data?.stats;
  const recentInquiries = data?.recentInquiries || [];
  const recentBlogs = data?.recentBlogs || [];
  const recentProducts = data?.recentProducts || [];

  const statCards = [
    { 
      label: 'Products', 
      value: stats?.products || 0, 
      icon: Package, 
      color: 'bg-blue-500', 
      link: '/admin/products' 
    },
    { 
      label: 'Articles', 
      value: stats?.blogs || 0, 
      icon: FileText, 
      color: 'bg-green-500', 
      link: '/admin/blogs' 
    },
    { 
      label: 'New Leads', 
      value: stats?.inquiries || 0, 
      icon: MessageSquare, 
      color: 'bg-purple-500', 
      link: '/admin/inquiries' 
    },
    { 
      label: 'Domains', 
      value: stats?.categories || 0,
      icon: Layers, 
      color: 'bg-orange-500', 
      link: '/admin/products/categories' 
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-secondary tracking-tighter uppercase mb-2">Command Center</h1>
          <p className="text-gray-500 font-medium text-sm">Real-time overview of LabZenix laboratory operations and industrial metrics.</p>
        </div>
        <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-green-500 bg-green-50 px-4 py-2 border border-green-100 italic">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          System Active
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white border border-gray-100 p-6 hover:shadow-xl transition-all group relative overflow-hidden">
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className={`p-3 ${card.color} text-white group-hover:scale-110 transition-transform`}>
                <card.icon className="w-5 h-5" />
              </div>
              <Link href={card.link}>
                <ArrowUpRight className="w-5 h-5 text-gray-300 hover:text-primary transition-colors cursor-pointer" />
              </Link>
            </div>
            <div className="relative z-10">
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">{card.label}</p>
              <h3 className="text-4xl font-black text-secondary tracking-tight">{card.value}</h3>
            </div>
            <card.icon className="absolute -bottom-4 -right-4 w-24 h-24 text-gray-50 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recent List */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Inquiries */}
          <div className="bg-white border border-gray-100 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-sm font-black text-secondary uppercase tracking-widest flex items-center">
                <MessageSquare className="w-4 h-4 mr-2 text-primary" />
                Latest Inquiries
              </h3>
              <Link href="/admin/inquiries" className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline flex items-center">
                Review Queue <ChevronRight className="w-3 h-3 ml-1" />
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {recentInquiries.length === 0 ? (
                <div className="p-12 text-center text-gray-400 text-[10px] font-black uppercase tracking-widest italic">
                  No active client queries detected
                </div>
              ) : recentInquiries.map((inquiry: any) => (
                <div key={inquiry._id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-secondary group-hover:bg-primary text-white flex items-center justify-center text-xs font-black transition-colors uppercase">
                      {inquiry.name[0]}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-secondary uppercase tracking-tight">{inquiry.name}</h4>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                        {new Date(inquiry.createdAt).toLocaleDateString()} • {inquiry.subject || 'Technical Support'}
                      </p>
                    </div>
                  </div>
                  <Link href="/admin/inquiries">
                    <button className="px-4 py-2 bg-white border border-gray-200 text-[10px] font-black uppercase tracking-widest hover:border-primary hover:text-primary transition-all active:scale-95">
                      Verify
                    </button>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Featured Blogs */}
          <div className="bg-white border border-gray-100 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-sm font-black text-secondary uppercase tracking-widest flex items-center">
                <FileText className="w-4 h-4 mr-2 text-primary" />
                Intelligence Entries
              </h3>
              <Link href="/admin/blogs" className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline flex items-center">
                Manage All <ChevronRight className="w-3 h-3 ml-1" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-50">
              {recentBlogs.length === 0 ? (
                <div className="col-span-3 p-12 text-center text-gray-400 text-[10px] font-black uppercase tracking-widest italic">
                  Journal repository empty
                </div>
              ) : recentBlogs.map((blog: any) => (
                <div key={blog._id} className="p-6 hover:bg-gray-50 transition-all group">
                  <div className="aspect-video bg-gray-100 mb-4 overflow-hidden relative">
                    {blog.image ? (
                      <img src={blog.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 shadow-inner" alt="" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 italic text-[8px] uppercase tracking-widest">Missing Asset</div>
                    )}
                    <div className="absolute top-2 left-2 px-2 py-1 bg-primary text-white text-[8px] font-black uppercase tracking-tighter">
                      {blog.category}
                    </div>
                  </div>
                  <h4 className="text-[11px] font-black text-secondary uppercase tracking-tight leading-tight mb-2 line-clamp-2">{blog.title}</h4>
                  <div className="flex items-center justify-between text-[8px] font-bold text-gray-400 uppercase tracking-widest">
                    <span>{blog.author?.name || 'Technical Team'}</span>
                    <Link href={`/admin/blogs/${blog._id}`} className="hover:text-primary transition-colors">
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Mini Cards */}
        <div className="space-y-6">
          {/* Latest Products */}
          <div className="bg-white border border-gray-100 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-sm font-black text-secondary uppercase tracking-widest flex items-center">
                <Package className="w-4 h-4 mr-2 text-primary" />
                Recent Instruments
              </h3>
            </div>
            <div className="p-2 divide-y divide-gray-50">
              {recentProducts.length === 0 ? (
                <div className="p-8 text-center text-gray-300 font-bold uppercase text-[10px] tracking-widest">
                  No catalog items found
                </div>
              ) : recentProducts.map((product: any) => (
                <div key={product._id} className="p-4 flex items-center space-x-3 hover:bg-gray-50 transition-all relative group">
                  <div className="w-12 h-12 bg-gray-50 border border-gray-100 overflow-hidden shrink-0">
                    {product.images?.[0] ? (
                      <img src={product.images[0]} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-200">
                        <Package className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-[10px] font-black text-secondary uppercase tracking-tight truncate group-hover:text-primary transition-colors">
                      {product.title}
                    </h4>
                    <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                      Model: {product.modelNumber || 'N/A'}
                    </p>
                  </div>
                  <Link href={`/admin/products/${product._id}`}>
                    <ArrowRight className="w-3 h-3 text-gray-300 group-hover:text-secondary transition-colors" />
                  </Link>
                </div>
              ))}
            </div>
            <Link href="/admin/products" className="block p-4 bg-gray-50 text-center text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-secondary hover:bg-gray-100 transition-colors border-t border-gray-100">
              Full Spectrum Catalog
            </Link>
          </div>

          {/* Quick System Status */}
          <div className="bg-secondary p-8 text-white relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-primary" />
                Industrial Health
              </h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                    <span>Database Load</span>
                    <span className="text-green-400">Stable</span>
                  </div>
                  <div className="w-full bg-white/10 h-1 overflow-hidden">
                    <div className="bg-green-400 h-full w-[12%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                    <span>Edge Processing</span>
                    <span>42ms</span>
                  </div>
                  <div className="w-full bg-white/10 h-1 overflow-hidden">
                    <div className="bg-primary h-full w-[65%]" />
                  </div>
                </div>
              </div>
            </div>
            <Zap className="absolute -bottom-6 -right-6 w-24 h-24 text-white/5 rotate-12" />
          </div>

          <Link href="/admin/blogs/new" className="block">
            <div className="bg-primary p-8 text-white group hover:bg-primary/90 transition-all shadow-xl shadow-primary/10">
              <h3 className="text-xl font-black uppercase tracking-tighter mb-2">Publish Intel</h3>
              <p className="text-sm text-white/70 font-medium mb-4">Share latest laboratory standards or technical insights.</p>
              <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest">
                <span>Start Drafting</span>
                <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

