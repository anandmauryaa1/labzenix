'use client';

import { useState, useEffect } from 'react';
import { 
  Package, 
  FileText, 
  MessageSquare, 
  TrendingUp, 
  ArrowUpRight,
  Clock,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/admin/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const statCards = [
    { 
      label: 'Total Products', 
      value: stats?.products || 0, 
      icon: Package, 
      color: 'bg-blue-500', 
      link: '/admin/products' 
    },
    { 
      label: 'Blog Posts', 
      value: stats?.blogs || 0, 
      icon: FileText, 
      color: 'bg-green-500', 
      link: '/admin/blogs' 
    },
    { 
      label: 'New Inquiries', 
      value: stats?.inquiries || 0, 
      icon: MessageSquare, 
      color: 'bg-purple-500', 
      link: '/admin/inquiries' 
    },
    { 
      label: 'Pending Reviews', 
      value: '12', // Placeholder for now
      icon: TrendingUp, 
      color: 'bg-orange-500', 
      link: '#' 
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black text-secondary tracking-tighter uppercase mb-2">Command Center</h1>
        <p className="text-gray-500 font-medium">Overview of LabZenix industrial operations and platform metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white border border-gray-100 p-6 hover:shadow-xl transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 ${card.color} text-white group-hover:scale-110 transition-transform`}>
                <card.icon className="w-6 h-6" />
              </div>
              <Link href={card.link}>
                <ArrowUpRight className="w-5 h-5 text-gray-300 hover:text-primary transition-colors cursor-pointer" />
              </Link>
            </div>
            <p className="text-gray-500 text-xs font-black uppercase tracking-widest mb-1">{card.label}</p>
            <h3 className="text-3xl font-black text-secondary tracking-tight">{card.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Inquiries List */}
        <div className="lg:col-span-2 bg-white border border-gray-100 p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black text-secondary uppercase tracking-tight">Recent Inquiries</h3>
            <Link href="/admin/inquiries" className="text-primary text-xs font-black uppercase tracking-widest hover:underline flex items-center">
              View All <ChevronRight className="w-3 h-3 ml-1" />
            </Link>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-50 border border-transparent hover:border-primary/20 transition-all">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-secondary">Client Inquiry #{i}042</h4>
                    <p className="text-xs text-gray-500">2 hours ago • Machine Quote</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-white border border-gray-200 text-[10px] font-black uppercase tracking-widest hover:border-primary transition-colors">
                  Review
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links / Status */}
        <div className="space-y-6">
          <div className="bg-secondary text-white p-8">
            <h3 className="text-xl font-black uppercase tracking-tight mb-4">System Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400 font-medium">Database</span>
                <span className="flex items-center text-green-400 text-xs font-bold uppercase">
                  <span className="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse" /> Connected
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400 font-medium">Memory Usage</span>
                <span className="text-white text-xs font-bold">42%</span>
              </div>
              <div className="w-full bg-white/10 h-1 mt-2">
                <div className="bg-primary h-full w-[42%]" />
              </div>
            </div>
          </div>

          <div className="bg-primary p-8 text-white relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="text-xl font-black uppercase tracking-tight mb-2">Industrial SEO</h3>
              <p className="text-sm text-white/80 mb-6 font-medium">Optimize your blog posts for better industrial visibility.</p>
              <Link href="/admin/blogs">
                <button className="w-auto px-6 py-3 bg-white text-primary text-xs font-black uppercase tracking-widest hover:scale-105 transition-all">
                  Optimize Now
                </button>
              </Link>
            </div>
            <Clock className="absolute -bottom-10 -right-10 w-40 h-40 text-white/10 group-hover:rotate-12 transition-transform duration-700" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}
