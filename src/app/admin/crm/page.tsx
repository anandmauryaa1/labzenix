'use client';

import { useState, useEffect } from 'react';
import { 
  Filter, 
  Send, 
  Calendar, 
  List, 
  Bell, 
  Plus, 
  RefreshCw, 
  Check, 
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function LabZenixCrmDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Active filter tab states for each module
  const [leadsTab, setLeadsTab] = useState<'new' | 'processing' | 'closeBy'>('new');
  const [schedulesTab, setSchedulesTab] = useState<'reminder' | 'meeting' | 'events'>('reminder');
  const [tasksTab, setTasksTab] = useState<'today' | 'tomorrow'>('today');
  const [todosTab, setTodosTab] = useState<'high' | 'medium' | 'low'>('high');

  // Quick action modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'lead' | 'task' | 'todo'>('task');
  const [formInput, setFormInput] = useState({
    title: '',
    name: '',
    email: '',
    phone: '',
    company: '',
    priority: 'Medium',
    dueDate: new Date().toISOString().split('T')[0],
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
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
      if (isRefresh) setRefreshing(false);
    }
  }

  // Quick Task / To-Do completion toggle
  async function toggleTaskComplete(taskId: string, currentStatus: string) {
    try {
      const newStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
      const res = await fetch('/api/admin/crm/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, status: newStatus })
      });
      if (res.ok) {
        toast.success(`Task marked as ${newStatus}`);
        fetchDashboardData(true);
      } else {
        toast.error('Failed to update task');
      }
    } catch (err) {
      toast.error('Error updating task');
    }
  }

  // Quick creation submit handler
  async function handleQuickSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (modalType === 'task' || modalType === 'todo') {
        const res = await fetch('/api/admin/crm/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formInput.title,
            description: formInput.description,
            priority: modalType === 'todo' ? (todosTab === 'high' ? 'High' : todosTab === 'low' ? 'Low' : 'Medium') : formInput.priority,
            dueDate: new Date(formInput.dueDate).toISOString(),
            status: 'Pending'
          })
        });
        if (res.ok) {
          toast.success(modalType === 'todo' ? 'To-Do created!' : 'Task created!');
          setIsModalOpen(false);
          setFormInput({ title: '', name: '', email: '', phone: '', company: '', priority: 'Medium', dueDate: new Date().toISOString().split('T')[0], description: '' });
          fetchDashboardData(true);
        } else {
          toast.error('Failed to create task');
        }
      } else if (modalType === 'lead') {
        const res = await fetch('/api/admin/crm/contacts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formInput.name,
            email: formInput.email,
            phone: formInput.phone,
            company: formInput.company,
            status: 'Lead',
            source: 'Dashboard Quick Add'
          })
        });
        if (res.ok) {
          toast.success('Lead created successfully!');
          setIsModalOpen(false);
          setFormInput({ title: '', name: '', email: '', phone: '', company: '', priority: 'Medium', dueDate: new Date().toISOString().split('T')[0], description: '' });
          fetchDashboardData(true);
        } else {
          toast.error('Failed to create lead');
        }
      }
    } catch (err) {
      toast.error('Network error submitting form');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-[1600px] mx-auto animate-pulse">
        {/* KPI Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-100 p-5 h-36" />
          ))}
        </div>
        {/* Modules Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-100 p-6 h-80" />
          ))}
        </div>
      </div>
    );
  }

  const kpis = data?.kpiCards || {
    todayLeads: { count: 0, vsYesterdayBadge: '0.00 % Increase', completedCount: 0, completedPercent: '100.00 %' },
    todayFollowups: { count: 0, completedCount: 0, completedPercent: '100.00 %' },
    todayTasks: { count: 0, completedCount: 0, completedPercent: '100.00 %' },
    todayTodos: { count: 0, completedCount: 0, completedPercent: '100.00 %' },
  };

  const leads = data?.leads || {
    new: { count: 0, items: [] },
    processing: { count: 0, items: [] },
    closeBy: { count: 0, items: [] },
  };

  const schedules = data?.schedules || {
    reminder: { count: 0, items: [] },
    meeting: { count: 0, items: [] },
    events: { count: 0, items: [] },
  };

  const tasks = data?.tasks || {
    today: { count: 0, items: [] },
    tomorrow: { count: 0, items: [] },
  };

  const todos = data?.todos || {
    high: { count: 0, items: [] },
    medium: { count: 0, items: [] },
    low: { count: 0, items: [] },
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10 font-sans select-none text-slate-800">
      
      {/* Quick Action Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
            Live LabZenix CRM
          </span>
        </div>
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing}
            className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition shadow-2xs"
            title="Refresh CRM Data"
          >
            <RefreshCw className={`w-3 h-3 mr-1.5 text-slate-400 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => { setModalType('lead'); setIsModalOpen(true); }}
            className="inline-flex items-center px-2.5 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition shadow-2xs"
          >
            <Plus className="w-3 h-3 mr-1" />
            New Lead
          </button>
          <button
            onClick={() => { setModalType('task'); setIsModalOpen(true); }}
            className="inline-flex items-center px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-md transition shadow-2xs"
          >
            <Plus className="w-3 h-3 mr-1" />
            New Task
          </button>
        </div>
      </div>

      {/* Row 1: Top 4 KPI / Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        
        {/* Card 1: Today's Leads (Emerald Green) */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] relative overflow-hidden transition-all duration-200 hover:shadow-md">
          {/* Faint Background Watermark Icon */}
          <div className="absolute right-4 top-4 pointer-events-none text-emerald-200 opacity-60">
            <Filter className="w-9 h-9 stroke-[1.25]" />
          </div>

          {/* Top Row: Icon + Value */}
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-lg bg-[#eefcf4] border border-[#d1f7e0] flex items-center justify-center shrink-0 text-[#10b981]">
              <Filter className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <p className="text-[13px] font-normal text-slate-500 leading-tight">Today's Leads</p>
              <h3 className="text-2xl font-bold text-slate-900 leading-tight mt-0.5">
                {kpis.todayLeads?.count ?? 0}
              </h3>
            </div>
          </div>

          {/* Middle Row: Badge + Comparison */}
          <div className="mt-3.5 mb-4 flex items-center text-xs">
            <span className="bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0] px-2 py-0.5 rounded-full text-[11px] font-semibold inline-flex items-center">
              {kpis.todayLeads?.vsYesterdayBadge || '0.00 % Increase'}
            </span>
            <span className="text-[11px] text-slate-400 font-normal ml-2">vs Yesterday</span>
          </div>

          {/* Bottom Row: Completion Rate */}
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-700 font-medium">Completed Lead</span>
            <span className="font-bold text-[#10b981]">{kpis.todayLeads?.completedPercent || '100.00 %'}</span>
          </div>

          {/* Green Progress Bar Underline */}
          <div className="w-full bg-slate-100 h-[3px] rounded-full mt-2.5 overflow-hidden">
            <div className="bg-[#10b981] h-full rounded-full transition-all duration-500" style={{ width: '100%' }} />
          </div>
        </div>

        {/* Card 2: Today's Followups (Rose Red) */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] relative overflow-hidden transition-all duration-200 hover:shadow-md">
          {/* Faint Background Watermark Icon */}
          <div className="absolute right-4 top-4 pointer-events-none text-rose-200 opacity-60">
            <Send className="w-9 h-9 stroke-[1.25]" />
          </div>

          {/* Top Row: Icon + Value */}
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-lg bg-[#fff1f2] border border-[#ffe4e6] flex items-center justify-center shrink-0 text-[#f43f5e]">
              <Send className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <p className="text-[13px] font-normal text-slate-500 leading-tight">Today's Followups</p>
              <h3 className="text-2xl font-bold text-slate-900 leading-tight mt-0.5">
                {kpis.todayFollowups?.count ?? 0}
              </h3>
            </div>
          </div>

          {/* Middle Row: Badge + Count */}
          <div className="mt-3.5 mb-4 flex items-center text-xs">
            <span className="bg-[#fff1f2] text-[#e11d48] border border-[#fecdd3] px-2.5 py-0.5 rounded-full text-[11px] font-semibold inline-flex items-center">
              {kpis.todayFollowups?.completedCount ?? 0} Completed
            </span>
            <span className="text-[11px] text-slate-400 font-normal ml-2">0</span>
          </div>

          {/* Bottom Row: Completion Rate */}
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-700 font-medium">Completed Followup</span>
            <span className="font-bold text-[#f43f5e]">{kpis.todayFollowups?.completedPercent || '100.00 %'}</span>
          </div>

          {/* Rose Red Progress Bar Underline */}
          <div className="w-full bg-slate-100 h-[3px] rounded-full mt-2.5 overflow-hidden">
            <div className="bg-[#f43f5e] h-full rounded-full transition-all duration-500" style={{ width: '100%' }} />
          </div>
        </div>

        {/* Card 3: Today's Tasks (Amber Orange) */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] relative overflow-hidden transition-all duration-200 hover:shadow-md">
          {/* Faint Background Watermark Icon */}
          <div className="absolute right-4 top-4 pointer-events-none text-amber-200 opacity-60">
            <Calendar className="w-9 h-9 stroke-[1.25]" />
          </div>

          {/* Top Row: Icon + Value */}
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-lg bg-[#fffbeb] border border-[#fef3c7] flex items-center justify-center shrink-0 text-[#f59e0b]">
              <Calendar className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <p className="text-[13px] font-normal text-slate-500 leading-tight">Today's Tasks</p>
              <h3 className="text-2xl font-bold text-slate-900 leading-tight mt-0.5">
                {kpis.todayTasks?.count ?? 0}
              </h3>
            </div>
          </div>

          {/* Middle Row: Badge + Count */}
          <div className="mt-3.5 mb-4 flex items-center text-xs">
            <span className="bg-[#fffbeb] text-[#d97706] border border-[#fde68a] px-2.5 py-0.5 rounded-full text-[11px] font-semibold inline-flex items-center">
              {kpis.todayTasks?.completedCount ?? 0} Completed
            </span>
            <span className="text-[11px] text-slate-400 font-normal ml-2">0</span>
          </div>

          {/* Bottom Row: Completion Rate */}
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-700 font-medium">Completed Task</span>
            <span className="font-bold text-[#f59e0b]">{kpis.todayTasks?.completedPercent || '100.00 %'}</span>
          </div>

          {/* Amber Progress Bar Underline */}
          <div className="w-full bg-slate-100 h-[3px] rounded-full mt-2.5 overflow-hidden">
            <div className="bg-[#f59e0b] h-full rounded-full transition-all duration-500" style={{ width: '100%' }} />
          </div>
        </div>

        {/* Card 4: Today's To-Dos (Cyan Blue) */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] relative overflow-hidden transition-all duration-200 hover:shadow-md">
          {/* Faint Background Watermark Icon */}
          <div className="absolute right-4 top-4 pointer-events-none text-cyan-200 opacity-60">
            <List className="w-9 h-9 stroke-[1.5]" />
          </div>

          {/* Top Row: Icon + Value */}
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-lg bg-[#ecfeff] border border-[#cffafe] flex items-center justify-center shrink-0 text-[#06b6d4]">
              <List className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <p className="text-[13px] font-normal text-slate-500 leading-tight">Today's To-Dos</p>
              <h3 className="text-2xl font-bold text-slate-900 leading-tight mt-0.5">
                {kpis.todayTodos?.count ?? 0}
              </h3>
            </div>
          </div>

          {/* Middle Row: Badge + Count */}
          <div className="mt-3.5 mb-4 flex items-center text-xs">
            <span className="bg-[#ecfeff] text-[#0891b2] border border-[#a5f3fc] px-2.5 py-0.5 rounded-full text-[11px] font-semibold inline-flex items-center">
              {kpis.todayTodos?.completedCount ?? 0} Completed
            </span>
            <span className="text-[11px] text-slate-400 font-normal ml-2">0</span>
          </div>

          {/* Bottom Row: Completion Rate */}
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-700 font-medium">Completed To-Do</span>
            <span className="font-bold text-[#06b6d4]">{kpis.todayTodos?.completedPercent || '100.00 %'}</span>
          </div>

          {/* Cyan Progress Bar Underline */}
          <div className="w-full bg-slate-100 h-[3px] rounded-full mt-2.5 overflow-hidden">
            <div className="bg-[#06b6d4] h-full rounded-full transition-all duration-500" style={{ width: '100%' }} />
          </div>
        </div>

      </div>

      {/* Row 2 & 3: Main 4 Modules in 2x2 Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-1">
        
        {/* Module 1: Leads (Top Left) */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-6 min-h-[360px] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-2 pb-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-[#4f46e5] stroke-[2]" />
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">Leads</h2>
            </div>
            {/* Pill Tabs */}
            <div className="inline-flex items-center bg-[#f3f4f8] p-0.5 rounded-full border border-slate-200/60 text-xs">
              <button
                onClick={() => setLeadsTab('new')}
                className={`px-3 py-1 rounded-full font-medium transition-all ${
                  leadsTab === 'new'
                    ? 'bg-[#e0e7ff] text-[#4338ca] font-semibold shadow-2xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                New ({leads.new?.count ?? 0})
              </button>
              <button
                onClick={() => setLeadsTab('processing')}
                className={`px-3 py-1 rounded-full font-medium transition-all ${
                  leadsTab === 'processing'
                    ? 'bg-[#e0e7ff] text-[#4338ca] font-semibold shadow-2xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Processing ({leads.processing?.count ?? 0})
              </button>
              <button
                onClick={() => setLeadsTab('closeBy')}
                className={`px-3 py-1 rounded-full font-medium transition-all ${
                  leadsTab === 'closeBy'
                    ? 'bg-[#e0e7ff] text-[#4338ca] font-semibold shadow-2xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Close-by ({leads.closeBy?.count ?? 0})
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            {leads[leadsTab]?.items?.length > 0 ? (
              <div className="w-full space-y-3 text-left">
                {leads[leadsTab].items.map((lead: any) => (
                  <div key={lead._id} className="p-3.5 rounded-lg border border-slate-100 hover:border-slate-200 bg-slate-50/50 flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-sm text-slate-800">{lead.company?.name || lead.productInterest || 'Lead Opportunity'}</h4>
                      <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>{lead.contactPerson?.name || 'Contact'}</span>
                        {lead.budget > 0 && <span className="font-medium text-emerald-600">₹{lead.budget.toLocaleString()}</span>}
                      </p>
                    </div>
                    <Link href="/admin/crm/contacts" className="text-xs text-indigo-600 font-medium hover:underline flex items-center">
                      View <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10">
                <Filter className="w-14 h-14 text-slate-300 stroke-[1.25]" />
                <p className="text-sm font-medium text-slate-400 mt-3">There Are No Leads to Display</p>
              </div>
            )}
          </div>
        </div>

        {/* Module 2: Schedules (Top Right) */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-6 min-h-[360px] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-2 pb-4">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-[#4f46e5] stroke-[2]" />
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">Schedules</h2>
            </div>
            {/* Pill Tabs */}
            <div className="inline-flex items-center bg-[#f3f4f8] p-0.5 rounded-full border border-slate-200/60 text-xs">
              <button
                onClick={() => setSchedulesTab('reminder')}
                className={`px-3 py-1 rounded-full font-medium transition-all ${
                  schedulesTab === 'reminder'
                    ? 'bg-[#e0e7ff] text-[#4338ca] font-semibold shadow-2xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Reminder ({schedules.reminder?.count ?? 0})
              </button>
              <button
                onClick={() => setSchedulesTab('meeting')}
                className={`px-3 py-1 rounded-full font-medium transition-all ${
                  schedulesTab === 'meeting'
                    ? 'bg-[#e0e7ff] text-[#4338ca] font-semibold shadow-2xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Meeting ({schedules.meeting?.count ?? 0})
              </button>
              <button
                onClick={() => setSchedulesTab('events')}
                className={`px-3 py-1 rounded-full font-medium transition-all ${
                  schedulesTab === 'events'
                    ? 'bg-[#e0e7ff] text-[#4338ca] font-semibold shadow-2xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Events ({schedules.events?.count ?? 0})
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            {schedules[schedulesTab]?.items?.length > 0 ? (
              <div className="w-full space-y-3 text-left">
                {schedules[schedulesTab].items.map((item: any) => (
                  <div key={item._id} className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-sm text-slate-800">{item.title || item.subject || 'Scheduled Item'}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {item.contact?.name && `${item.contact.name} • `}
                        {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'Today'}
                      </p>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">Scheduled</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10">
                <Bell className="w-14 h-14 text-slate-300 stroke-[1.25]" />
                <p className="text-sm font-medium text-slate-400 mt-3">There Are No Schedules to Display</p>
              </div>
            )}
          </div>
        </div>

        {/* Module 3: Tasks (Bottom Left) */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-6 min-h-[360px] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-2 pb-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-[#4f46e5] stroke-[2]" />
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">Tasks</h2>
            </div>
            {/* Pill Tabs */}
            <div className="inline-flex items-center bg-[#f3f4f8] p-0.5 rounded-full border border-slate-200/60 text-xs">
              <button
                onClick={() => setTasksTab('today')}
                className={`px-3 py-1 rounded-full font-medium transition-all ${
                  tasksTab === 'today'
                    ? 'bg-[#e0e7ff] text-[#4338ca] font-semibold shadow-2xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Today ({tasks.today?.count ?? 0})
              </button>
              <button
                onClick={() => setTasksTab('tomorrow')}
                className={`px-3 py-1 rounded-full font-medium transition-all ${
                  tasksTab === 'tomorrow'
                    ? 'bg-[#e0e7ff] text-[#4338ca] font-semibold shadow-2xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Tomorrow ({tasks.tomorrow?.count ?? 0})
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            {tasks[tasksTab]?.items?.length > 0 ? (
              <div className="w-full space-y-3 text-left">
                {tasks[tasksTab].items.map((task: any) => (
                  <div key={task._id} className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => toggleTaskComplete(task._id, task.status)}
                        className={`w-5 h-5 rounded border flex items-center justify-center transition ${
                          task.status === 'Completed'
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-slate-300 hover:border-slate-400 bg-white'
                        }`}
                      >
                        {task.status === 'Completed' && <Check className="w-3.5 h-3.5" />}
                      </button>
                      <div>
                        <h4 className={`text-sm font-semibold ${task.status === 'Completed' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                          {task.title}
                        </h4>
                        <p className="text-xs text-slate-500">{task.contact?.name || 'Internal task'}</p>
                      </div>
                    </div>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                      task.priority === 'High' ? 'bg-red-50 text-red-600' : task.priority === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10">
                <Calendar className="w-14 h-14 text-slate-300 stroke-[1.25]" />
              </div>
            )}
          </div>
        </div>

        {/* Module 4: To-Dos (Bottom Right) */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-6 min-h-[360px] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-2 pb-4">
            <div className="flex items-center space-x-2">
              <List className="w-5 h-5 text-[#4f46e5] stroke-[2.2]" />
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">To-Dos</h2>
            </div>
            {/* Pill Tabs */}
            <div className="inline-flex items-center bg-[#f3f4f8] p-0.5 rounded-full border border-slate-200/60 text-xs">
              <button
                onClick={() => setTodosTab('high')}
                className={`px-3 py-1 rounded-full font-medium transition-all ${
                  todosTab === 'high'
                    ? 'bg-[#e0e7ff] text-[#4338ca] font-semibold shadow-2xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                High ({todos.high?.count ?? 0})
              </button>
              <button
                onClick={() => setTodosTab('medium')}
                className={`px-3 py-1 rounded-full font-medium transition-all ${
                  todosTab === 'medium'
                    ? 'bg-[#e0e7ff] text-[#4338ca] font-semibold shadow-2xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Medium ({todos.medium?.count ?? 0})
              </button>
              <button
                onClick={() => setTodosTab('low')}
                className={`px-3 py-1 rounded-full font-medium transition-all ${
                  todosTab === 'low'
                    ? 'bg-[#e0e7ff] text-[#4338ca] font-semibold shadow-2xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Low ({todos.low?.count ?? 0})
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            {todos[todosTab]?.items?.length > 0 ? (
              <div className="w-full space-y-3 text-left">
                {todos[todosTab].items.map((todo: any) => (
                  <div key={todo._id} className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => toggleTaskComplete(todo._id, todo.status)}
                        className={`w-5 h-5 rounded border flex items-center justify-center transition ${
                          todo.status === 'Completed'
                            ? 'bg-cyan-500 border-cyan-500 text-white'
                            : 'border-slate-300 hover:border-slate-400 bg-white'
                        }`}
                      >
                        {todo.status === 'Completed' && <Check className="w-3.5 h-3.5" />}
                      </button>
                      <div>
                        <h4 className={`text-sm font-semibold ${todo.status === 'Completed' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                          {todo.title}
                        </h4>
                        <p className="text-xs text-slate-500">{todo.description || 'Priority actionable item'}</p>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400 font-medium">
                      {new Date(todo.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10">
                <List className="w-14 h-14 text-slate-300 stroke-[1.25]" />
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Quick Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              {modalType === 'lead' ? 'Add New Lead' : modalType === 'todo' ? 'Add To-Do Item' : 'Add New Task'}
            </h3>
            <form onSubmit={handleQuickSubmit} className="space-y-4">
              {modalType === 'lead' ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Name *</label>
                    <input
                      type="text"
                      required
                      value={formInput.name}
                      onChange={e => setFormInput({ ...formInput, name: e.target.value })}
                      placeholder="e.g. Dr. Rajesh Sharma"
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Organization *</label>
                    <input
                      type="text"
                      required
                      value={formInput.company}
                      onChange={e => setFormInput({ ...formInput, company: e.target.value })}
                      placeholder="e.g. Apollo Diagnostics"
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={formInput.email}
                      onChange={e => setFormInput({ ...formInput, email: e.target.value })}
                      placeholder="e.g. rajesh@apollodiag.com"
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={formInput.phone}
                      onChange={e => setFormInput({ ...formInput, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Title *</label>
                    <input
                      type="text"
                      required
                      value={formInput.title}
                      onChange={e => setFormInput({ ...formInput, title: e.target.value })}
                      placeholder="e.g. Call client for calibration quote"
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                    <select
                      value={formInput.priority}
                      onChange={e => setFormInput({ ...formInput, priority: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                    >
                      <option value="High">High Priority</option>
                      <option value="Medium">Medium Priority</option>
                      <option value="Low">Low Priority</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date</label>
                    <input
                      type="date"
                      value={formInput.dueDate}
                      onChange={e => setFormInput({ ...formInput, dueDate: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Description / Notes</label>
                    <textarea
                      rows={2}
                      value={formInput.description}
                      onChange={e => setFormInput({ ...formInput, description: e.target.value })}
                      placeholder="Optional notes or context..."
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>
                </>
              )}

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save & Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
