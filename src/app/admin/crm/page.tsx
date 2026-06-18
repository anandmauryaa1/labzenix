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
  TrendingDown,
  ArrowRight,
  Play
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function CrmDashboard() {
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
        toast.error('Failed to load CRM dashboard metrics');
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

  const { metrics, dailyUpdates, funnel, activities, recentActivities } = data || {};

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-secondary tracking-tighter uppercase mb-2">CRM Command Center</h1>
          <p className="text-gray-500 font-medium text-sm">Real-time laboratory equipment pipelines, lead nurturing, and active call logs.</p>
        </div>
        <div className="bg-primary/5 border border-primary/20 px-4 py-2 flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-primary">Daily Status: Active</span>
        </div>
      </div>

      {/* Zoho-Style Daily Update Dashboard Widget */}
      <div className="bg-gradient-to-r from-secondary to-gray-900 border border-gray-800 text-white p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
          <TrendingUp className="w-80 h-80" />
        </div>
        <h2 className="text-xs font-black uppercase tracking-widest text-primary mb-6 flex items-center">
          <Clock className="w-4 h-4 mr-2" />
          Leads & Activities Daily Update (Today)
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
          <div className="border-l-2 border-primary/40 pl-4">
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">New Leads Today</p>
            <p className="text-2xl font-black mt-1 text-white">{dailyUpdates?.newLeadsToday || 0}</p>
          </div>
          <div className="border-l-2 border-primary/40 pl-4">
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Deals Status Updated</p>
            <p className="text-2xl font-black mt-1 text-white">{dailyUpdates?.dealsUpdatedToday || 0}</p>
          </div>
          <div className="border-l-2 border-primary/40 pl-4">
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Pending Tasks Due</p>
            <p className="text-2xl font-black mt-1 text-primary">{dailyUpdates?.tasksDueToday || 0}</p>
          </div>
          <div className="border-l-2 border-primary/40 pl-4">
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Activities Logged Today</p>
            <p className="text-2xl font-black mt-1 text-white">{dailyUpdates?.activitiesLoggedToday || 0}</p>
          </div>
        </div>
      </div>

      {/* Core KPI metrics grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-gray-200 p-6 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Contacts</span>
            <h3 className="text-2xl font-black text-secondary tracking-tight mt-1">{metrics?.totalContacts?.toLocaleString()}</h3>
            <span className="text-[10px] text-green-600 font-bold flex items-center mt-1">
              {metrics?.leadsCount} Active Leads
            </span>
          </div>
          <div className="w-12 h-12 bg-gray-50 flex items-center justify-center text-secondary border border-gray-100">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-6 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Open Deals Value</span>
            <h3 className="text-2xl font-black text-secondary tracking-tight mt-1">
              ${metrics?.openDealsValue?.toLocaleString()}
            </h3>
            <span className="text-[10px] text-primary font-bold mt-1 block">Active Pipeline</span>
          </div>
          <div className="w-12 h-12 bg-primary/5 flex items-center justify-center text-primary border border-primary/10">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-6 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Deals Closed Won</span>
            <h3 className="text-2xl font-black text-secondary tracking-tight mt-1">
              ${metrics?.wonDealsValue?.toLocaleString()}
            </h3>
            <span className="text-[10px] text-green-600 font-bold mt-1 block">Conversion: {metrics?.conversionRate}%</span>
          </div>
          <div className="w-12 h-12 bg-green-50 flex items-center justify-center text-green-600 border border-green-100">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-6 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">CRM Followup Tasks</span>
            <h3 className="text-2xl font-black text-secondary tracking-tight mt-1">
              {metrics?.pendingTasks} Pending
            </h3>
            <span className="text-[10px] text-red-600 font-bold flex items-center mt-1">
              <AlertCircle className="w-3 h-3 mr-1" />
              {metrics?.overdueTasks} Overdue Tasks
            </span>
          </div>
          <div className="w-12 h-12 bg-red-50 flex items-center justify-center text-red-600 border border-red-100">
            <Calendar className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Deal Funnel Visualization */}
        <div className="bg-white border border-gray-200 p-6 shadow-sm col-span-2 space-y-6">
          <div className="flex justify-between items-center border-b border-gray-100 pb-4">
            <h3 className="text-sm font-black text-secondary uppercase tracking-wider">Pipeline Stage Distribution</h3>
            <Link href="/admin/crm/deals" className="text-xs font-bold text-primary hover:underline flex items-center">
              View Kanban
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="space-y-4">
            {Object.entries(funnel || {}).map(([stage, details]: any) => {
              const percentages: Record<string, number> = {
                Lead: 90,
                Qualification: 75,
                Proposal: 60,
                Negotiation: 45,
                Won: 30,
                Lost: 15
              };
              const width = percentages[stage] || 50;
              return (
                <div key={stage} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-gray-500 uppercase tracking-wider">{stage}</span>
                    <span className="text-secondary">{details.count} Deals (${details.value?.toLocaleString()})</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2.5 rounded-none overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        stage === 'Won' 
                          ? 'bg-green-600' 
                          : stage === 'Lost' 
                          ? 'bg-red-500' 
                          : 'bg-primary'
                      }`}
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Activity Summary / Call Logs */}
        <div className="bg-white border border-gray-200 p-6 shadow-sm space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h3 className="text-sm font-black text-secondary uppercase tracking-wider">Communication Metrics</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 border border-gray-100 rounded-none">
              <div className="flex items-center text-primary mb-2">
                <PhoneCall className="w-4 h-4 mr-2" />
                <span className="text-[10px] font-black uppercase tracking-wider">Call Logs</span>
              </div>
              <p className="text-2xl font-black text-secondary">{activities?.Call?.count || 0}</p>
              <p className="text-[10px] text-gray-500 font-bold mt-1">
                Avg Duration: {activities?.Call?.count > 0 ? Math.round((activities?.Call?.duration || 0) / (activities?.Call?.count || 1)) : 0}s
              </p>
            </div>

            <div className="p-4 bg-gray-50 border border-gray-100 rounded-none">
              <div className="flex items-center text-primary mb-2">
                <Mail className="w-4 h-4 mr-2" />
                <span className="text-[10px] font-black uppercase tracking-wider">Emails Logged</span>
              </div>
              <p className="text-2xl font-black text-secondary">{activities?.Email?.count || 0}</p>
              <p className="text-[10px] text-gray-500 font-bold mt-1">Total communications</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center text-xs border-b border-dashed border-gray-200 pb-2">
              <span className="text-gray-400 font-bold">Meetings Scheduled</span>
              <span className="font-black text-secondary">{activities?.Meeting?.count || 0}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400 font-bold">Notes Appended</span>
              <span className="font-black text-secondary">{activities?.Note?.count || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="bg-white border border-gray-200 p-6 shadow-sm">
        <h3 className="text-sm font-black text-secondary uppercase tracking-wider mb-6 border-b border-gray-100 pb-4">
          Recent Timeline Logs
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
                    : act.type === 'Meeting'
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'bg-gray-100 border-gray-200 text-gray-700'
                }`}>
                  {act.type === 'Call' ? <PhoneCall className="w-4 h-4" /> : act.type === 'Email' ? <Mail className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-black text-secondary uppercase tracking-tight">
                      {act.subject} — <span className="text-primary">{act.contact?.name || 'Unknown Contact'}</span>
                    </p>
                    <span className="text-[10px] text-gray-400 font-bold">
                      {new Date(act.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">{act.description}</p>
                  <p className="text-[9px] text-gray-400 font-bold uppercase mt-1">Logged by: {act.createdBy?.name || 'System'}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-gray-400">No recent activities found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
