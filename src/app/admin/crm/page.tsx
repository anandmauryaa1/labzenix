'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingUp, 
  Briefcase, 
  Calendar, 
  PhoneCall, 
  Mail, 
  AlertCircle,
  Clock, 
  CheckCircle2, 
  Bell, 
  ChevronRight,
  Handshake,
  IndianRupee,
  ShieldCheck,
  Wrench,
  Activity
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function B2bCrmDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      const res = await fetch('/api/admin/crm/dashboard');
      if (res.ok) {
        const payload = await res.json();
        setData(payload);
      } else {
        toast.error('Failed to load CRM B2B dashboard metrics');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error loading metrics');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-gray-200" />
            <div className="h-4 w-72 bg-gray-200" />
          </div>
          <div className="h-10 w-32 bg-gray-200" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-white border border-gray-100 p-6" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-96 bg-white border border-gray-100 col-span-2" />
          <div className="h-96 bg-white border border-gray-100" />
        </div>
      </div>
    );
  }

  const { kpis, salesPipeline, recentActivities } = data || {};

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-secondary tracking-tighter uppercase mb-2">LabZenix CRM Dashboard</h1>
          <p className="text-gray-500 font-medium text-sm">Industrial Testing Equipment pipelines, calibration alerts, and field service dispatch.</p>
        </div>
        <div className="bg-primary/5 border border-primary/20 px-4 py-2 flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-primary">GST: Active</span>
        </div>
      </div>

      {/* Industrial B2B KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-gray-200 p-6 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pipeline Value</span>
            <h3 className="text-2xl font-black text-secondary tracking-tight mt-1">
              ₹{kpis?.monthlyRevenue?.toLocaleString()}
            </h3>
            <span className="text-[10px] text-green-600 font-bold block mt-1">Orders Won (Sales)</span>
          </div>
          <div className="w-12 h-12 bg-green-50 flex items-center justify-center text-green-600 border border-green-100">
            <IndianRupee className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-6 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Deals</span>
            <h3 className="text-2xl font-black text-secondary tracking-tight mt-1">{kpis?.totalLeads} Leads</h3>
            <span className="text-[10px] text-primary font-bold mt-1 block">{kpis?.newLeads} New Inquiries</span>
          </div>
          <div className="w-12 h-12 bg-primary/5 flex items-center justify-center text-primary border border-primary/10">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-6 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Followups &amp; Tickets</span>
            <h3 className="text-2xl font-black text-secondary tracking-tight mt-1">
              {kpis?.pendingFollowups} Actions
            </h3>
            <span className="text-[10px] text-amber-600 font-bold block mt-1">{kpis?.openServiceTickets} Active Service Logs</span>
          </div>
          <div className="w-12 h-12 bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
            <Wrench className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-6 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Warranties &amp; AMC</span>
            <h3 className="text-2xl font-black text-secondary tracking-tight mt-1">
              {kpis?.amcExpiringSoon} Dues
            </h3>
            <span className="text-[10px] text-red-600 font-bold block mt-1">Calibration Expiries</span>
          </div>
          <div className="w-12 h-12 bg-red-50 flex items-center justify-center text-red-600 border border-red-100">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Aggregations & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline stage values */}
        <div className="bg-white border border-gray-200 p-6 shadow-sm col-span-2 space-y-6">
          <div className="flex justify-between items-center border-b border-gray-100 pb-4">
            <h3 className="text-sm font-black text-secondary uppercase tracking-wider">Industrial Funnel Aggregates</h3>
            <Link href="/admin/crm/deals" className="text-xs font-bold text-primary hover:underline flex items-center">
              View Sales Pipeline
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="space-y-4">
            {Object.entries(salesPipeline || {}).map(([stage, value]: any) => (
              <div key={stage} className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-gray-500 uppercase tracking-wider">{stage}</span>
                  <span className="text-secondary">₹{value?.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-100 h-2.5">
                  <div 
                    className="h-full bg-primary"
                    style={{ width: `${Math.min((value / 1000000) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Service panel */}
        <div className="bg-white border border-gray-200 p-6 shadow-sm space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h3 className="text-sm font-black text-secondary uppercase tracking-wider">QC &amp; Service Management</h3>
          </div>

          <div className="space-y-4">
            <Link href="/admin/crm/service-tickets" className="block p-4 bg-gray-50 hover:bg-gray-100 border border-gray-150 transition-colors">
              <div className="flex items-center text-secondary mb-1">
                <Wrench className="w-4 h-4 mr-2 text-primary" />
                <span className="text-xs font-black uppercase tracking-wider">Machine service dashboard</span>
              </div>
              <p className="text-[10px] text-gray-500 font-bold mt-1">Assign technicians to problem tickets, troubleshoot calibrations, and track issues.</p>
            </Link>

            <Link href="/admin/crm/amc" className="block p-4 bg-gray-50 hover:bg-gray-100 border border-gray-150 transition-colors">
              <div className="flex items-center text-secondary mb-1">
                <ShieldCheck className="w-4 h-4 mr-2 text-primary" />
                <span className="text-xs font-black uppercase tracking-wider">AMC &amp; Calibration tracker</span>
              </div>
              <p className="text-[10px] text-gray-500 font-bold mt-1">Manage equipment warranty expirations and schedule mandatory calibration intervals.</p>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity Timeline Feed */}
      <div className="bg-white border border-gray-200 p-6 shadow-sm">
        <h3 className="text-sm font-black text-secondary uppercase tracking-wider mb-6 border-b border-gray-100 pb-4">
          B2B Nurturing Activity Timeline (Timeline Logs)
        </h3>
        <div className="space-y-6">
          {recentActivities && recentActivities.length > 0 ? (
            recentActivities.map((act: any) => (
              <div key={act._id} className="flex items-start space-x-4">
                <div className={`p-2 shadow-inner border rounded-none ${
                  act.type === 'Call' 
                    ? 'bg-blue-50 border-blue-200 text-blue-700' 
                    : act.type === 'Email' 
                    ? 'bg-amber-50 border-amber-200 text-amber-700' 
                    : act.type === 'Service Visit'
                    ? 'bg-purple-50 border-purple-200 text-purple-700'
                    : 'bg-green-50 border-green-200 text-green-700'
                }`}>
                  {act.type === 'Call' ? (
                    <PhoneCall className="w-4 h-4" />
                  ) : act.type === 'Email' ? (
                    <Mail className="w-4 h-4" />
                  ) : act.type === 'Service Visit' ? (
                    <Wrench className="w-4 h-4" />
                  ) : (
                    <Activity className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-black text-secondary uppercase tracking-tight">
                      {act.subject} — <span className="text-primary">{act.company?.name || 'Private Buyer'}</span>
                    </p>
                    <span className="text-[10px] text-gray-400 font-bold">
                      {new Date(act.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">{act.description}</p>
                  <p className="text-[9px] text-gray-400 font-bold uppercase mt-1">Operator: {act.createdBy?.name || 'System'}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-gray-400">No B2B activity logged.</p>
          )}
        </div>
      </div>
    </div>
  );
}
