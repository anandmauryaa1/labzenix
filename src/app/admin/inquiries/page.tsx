'use client';

import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Mail, 
  Phone,
  Clock, 
  Trash2, 
  CheckCircle2,
  AlertCircle,
  Hash,
  Eye,
  X,
  Share2,
  Box,
  ExternalLink,
  Target,
  Search,
  Download,
  Filter,
  UserPlus,
  Send,
  Layers,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  LayoutGrid,
  List
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function InquiryManagement() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null);
  const [salesEmail, setSalesEmail] = useState('sales@labzenix.com');

  // Filter & Search
  const [activeSourceFilter, setActiveSourceFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [pushingId, setPushingId] = useState<string | null>(null);

  // Pagination & Layout View Mode
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10); // 10, 25, 50, 100, or -1 for All
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  useEffect(() => {
    fetchInquiries();
  }, []);

  async function fetchInquiries() {
    setLoading(true);
    try {
      const [res, settingsRes] = await Promise.all([
        fetch('/api/inquiries'),
        fetch('/api/admin/settings')
      ]);
      if (res.ok) {
        const data = await res.json();
        setInquiries(data);
      }
      if (settingsRes.ok) {
        const settings = await settingsRes.json();
        if (settings?.communication?.salesEmail) {
          setSalesEmail(settings.communication.salesEmail);
        }
      }
    } catch (err) {
      toast.error('Failed to load form entries');
    } finally {
      setLoading(false);
    }
  }

  async function deleteInquiry(id: string) {
    if (!confirm('Archive this entry permanently?')) return;
    try {
      const res = await fetch(`/api/inquiries`, { 
        method: 'DELETE',
        body: JSON.stringify({ id }),
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        toast.success('Entry archived');
        setInquiries(inquiries.filter(i => i._id !== id));
      }
    } catch (err) {
      toast.error('Operation failed');
    }
  }

  // Push an inquiry into CRM Leads Kanban board
  async function handlePushToCrmLead(lead: any) {
    setPushingId(lead._id);
    try {
      const res = await fetch('/api/admin/crm/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: lead.name,
          phone: lead.phone || '',
          companyName: lead.company || '',
          leadSource: lead.source ? `Website: ${lead.source}` : 'Website Form',
          productInterest: lead.subject || (lead.productId?.title ? lead.productId.title : 'Product Inquiry'),
          notes: `[Inquiry Message]: ${lead.message}\nEmail: ${lead.email}`,
          stage: 'New'
        })
      });

      if (res.ok) {
        toast.success(`"${lead.name}" added to CRM Leads Kanban!`);
      } else {
        toast.error('Failed to push lead to CRM');
      }
    } catch (err) {
      toast.error('Error creating CRM lead');
    } finally {
      setPushingId(null);
    }
  }

  // Source categorization helper
  function getCategory(source: string = ''): string {
    const s = source.toLowerCase();
    if (s.includes('contact')) return 'contact';
    if (s.includes('popup')) return 'popup';
    if (s.includes('product') || s.includes('catalog')) return 'product';
    if (s.includes('blog')) return 'blog';
    if (s.includes('campaign')) return 'campaign';
    if (s.includes('tradindia') || s.includes('indiamart') || s.includes('portal') || s.includes('b2b')) return 'portals';
    return 'other';
  }

  // Counts per category
  const counts = {
    all: inquiries.length,
    contact: inquiries.filter(i => getCategory(i.source) === 'contact').length,
    popup: inquiries.filter(i => getCategory(i.source) === 'popup').length,
    product: inquiries.filter(i => getCategory(i.source) === 'product').length,
    blog: inquiries.filter(i => getCategory(i.source) === 'blog').length,
    campaign: inquiries.filter(i => getCategory(i.source) === 'campaign').length,
    portals: inquiries.filter(i => getCategory(i.source) === 'portals').length,
  };

  // Filtered inquiries
  const filteredInquiries = inquiries.filter(i => {
    const category = getCategory(i.source);
    const matchesCategory = activeSourceFilter === 'all' || category === activeSourceFilter;
    const matchesSearch = search === '' ||
      (i.name && i.name.toLowerCase().includes(search.toLowerCase())) ||
      (i.email && i.email.toLowerCase().includes(search.toLowerCase())) ||
      (i.phone && i.phone.includes(search)) ||
      (i.company && i.company.toLowerCase().includes(search.toLowerCase())) ||
      (i.subject && i.subject.toLowerCase().includes(search.toLowerCase())) ||
      (i.message && i.message.toLowerCase().includes(search.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  // Pagination calculation
  const total = filteredInquiries.length;
  const isAll = limit === -1;
  const totalPages = isAll ? 1 : Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.min(page, totalPages);
  const startIndex = isAll ? 0 : (currentPage - 1) * limit;
  const endIndex = isAll ? total : Math.min(startIndex + limit, total);
  const paginatedInquiries = isAll ? filteredInquiries : filteredInquiries.slice(startIndex, endIndex);

  return (
    <div className="space-y-4 max-w-[1700px] mx-auto pb-12 font-sans select-none text-slate-800">
      
      {/* Top Header Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200/80 px-4 sm:px-6 py-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Form Entries & Inquiries</h1>
            <span className="bg-indigo-50 text-indigo-700 border border-indigo-200/80 text-xs px-2.5 py-0.5 rounded-full font-bold">
              {inquiries.length} Total Leads
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Captured leads and inquiries from Contact Form, Popup, Product Pages, Blogs, Campaigns, and B2B Portals.
          </p>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          
          {/* Search Trigger */}
          {isSearchOpen ? (
            <div className="flex items-center relative w-full sm:w-auto">
              <input
                type="text"
                autoFocus
                placeholder="Search entries, email, company..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="text-xs px-3 py-1.5 pr-8 border border-slate-300 rounded-lg w-full sm:w-60 focus:outline-hidden focus:border-indigo-500"
              />
              <button 
                onClick={() => { setIsSearchOpen(false); setSearch(''); }} 
                className="absolute right-2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-lg transition"
              title="Search"
            >
              <Search className="w-4 h-4" />
            </button>
          )}

          {/* Export CSV */}
          <button 
            onClick={() => {
              const csvContent = "data:text/csv;charset=utf-8," + ["Name,Email,Phone,Company,Source,Date,Message"].concat(filteredInquiries.map(i => `"${i.name || ''}","${i.email || ''}","${i.phone || ''}","${i.company || ''}","${i.source || ''}","${new Date(i.createdAt).toLocaleDateString()}","${(i.message || '').replace(/"/g, '""')}"`)).join("\n");
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", `labzenix_form_entries_${new Date().toISOString().split('T')[0]}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              toast.success('Form entries exported to CSV');
            }}
            className="inline-flex items-center px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-lg transition"
          >
            <Download className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          {/* View Mode Toggle (Cards / Table) */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/80">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-md transition ${viewMode === 'cards' ? 'bg-white shadow-2xs text-[#372b7b]' : 'text-slate-400 hover:text-slate-600'}`}
              title="Card View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition ${viewMode === 'table' ? 'bg-white shadow-2xs text-[#372b7b]' : 'text-slate-400 hover:text-slate-600'}`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* View CRM Leads Kanban */}
          <Link
            href="/admin/crm/leads"
            className="inline-flex items-center px-3 sm:px-3.5 py-1.5 text-xs font-semibold text-white bg-[#372b7b] hover:bg-[#2e236b] rounded-lg transition shadow-xs"
          >
            <Layers className="w-4 h-4 mr-1.5" />
            <span>Leads Board</span>
          </Link>

        </div>
      </div>

      {/* Source Pill Filter Bar */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1.5 pt-0.5 scroll-smooth">
        <button
          onClick={() => { setActiveSourceFilter('all'); setPage(1); }}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition border shrink-0 whitespace-nowrap flex items-center space-x-1.5 ${
            activeSourceFilter === 'all'
              ? 'bg-[#372b7b] text-white border-[#372b7b] shadow-xs'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span>All Entries</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${activeSourceFilter === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
            {counts.all}
          </span>
        </button>

        <button
          onClick={() => { setActiveSourceFilter('contact'); setPage(1); }}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition border shrink-0 whitespace-nowrap flex items-center space-x-1.5 ${
            activeSourceFilter === 'contact'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span>Contact Form</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${activeSourceFilter === 'contact' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-700'}`}>
            {counts.contact}
          </span>
        </button>

        <button
          onClick={() => { setActiveSourceFilter('popup'); setPage(1); }}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition border shrink-0 whitespace-nowrap flex items-center space-x-1.5 ${
            activeSourceFilter === 'popup'
              ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span>Popup Form</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${activeSourceFilter === 'popup' ? 'bg-white/20 text-white' : 'bg-amber-50 text-amber-700'}`}>
            {counts.popup}
          </span>
        </button>

        <button
          onClick={() => { setActiveSourceFilter('product'); setPage(1); }}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition border shrink-0 whitespace-nowrap flex items-center space-x-1.5 ${
            activeSourceFilter === 'product'
              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span>Product Inquiries</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${activeSourceFilter === 'product' ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-700'}`}>
            {counts.product}
          </span>
        </button>

        <button
          onClick={() => { setActiveSourceFilter('blog'); setPage(1); }}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition border shrink-0 whitespace-nowrap flex items-center space-x-1.5 ${
            activeSourceFilter === 'blog'
              ? 'bg-cyan-600 text-white border-cyan-600 shadow-xs'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span>Blog Form</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${activeSourceFilter === 'blog' ? 'bg-white/20 text-white' : 'bg-cyan-50 text-cyan-700'}`}>
            {counts.blog}
          </span>
        </button>

        <button
          onClick={() => { setActiveSourceFilter('campaign'); setPage(1); }}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition border shrink-0 whitespace-nowrap flex items-center space-x-1.5 ${
            activeSourceFilter === 'campaign'
              ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span>Campaign Form</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${activeSourceFilter === 'campaign' ? 'bg-white/20 text-white' : 'bg-purple-50 text-purple-700'}`}>
            {counts.campaign}
          </span>
        </button>

        <button
          onClick={() => { setActiveSourceFilter('portals'); setPage(1); }}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition border shrink-0 whitespace-nowrap flex items-center space-x-1.5 ${
            activeSourceFilter === 'portals'
              ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span>B2B & Portals</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${activeSourceFilter === 'portals' ? 'bg-white/20 text-white' : 'bg-orange-50 text-orange-700'}`}>
            {counts.portals}
          </span>
        </button>
      </div>

      {/* Sub-Header Toolbar: Filter counts summary, Quick All/Paginated toggle, Rows per page selector & Pagination controls */}
      <div className="bg-white rounded-xl border border-slate-200/80 px-4 sm:px-6 py-2.5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3">
          <span className="text-slate-500 font-medium">
            Showing <strong className="text-slate-800">{total > 0 ? (isAll ? `All ${total}` : `${startIndex + 1} - ${endIndex}`) : 0}</strong> of <strong className="text-slate-800">{total}</strong> leads
          </span>

          {/* Quick Toggle: Show All vs Paginated */}
          <button
            onClick={() => {
              if (isAll) {
                setLimit(10);
                setPage(1);
              } else {
                setLimit(-1);
                setPage(1);
              }
            }}
            className={`px-2.5 py-1 rounded-md font-semibold text-[11px] transition border ${
              isAll
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {isAll ? '✓ Showing All (Switch to 10/page)' : 'Show All Leads Data'}
          </button>
        </div>

        {/* Top Mini-Pagination Controls (when total > 0) */}
        {total > 0 && (
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-400 text-[11px]">Per page:</span>
              <select
                value={limit}
                onChange={e => {
                  setLimit(parseInt(e.target.value));
                  setPage(1);
                }}
                className="border border-slate-200 rounded px-2 py-0.5 bg-white text-slate-700 font-semibold text-[11px] focus:outline-hidden"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="-1">All ({total})</option>
              </select>
            </div>

            {!isAll && totalPages > 1 && (
              <div className="flex items-center space-x-1 ml-2 pl-2 border-l border-slate-200">
                <button
                  onClick={() => setPage(1)}
                  disabled={currentPage === 1}
                  className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
                  title="First Page"
                >
                  <ChevronsLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                <span className="px-1.5 text-[11px] font-bold text-slate-700">
                  {currentPage} / {totalPages}
                </span>

                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
                  title="Next Page"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setPage(totalPages)}
                  disabled={currentPage >= totalPages}
                  className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
                  title="Last Page"
                >
                  <ChevronsRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex items-center justify-center p-20 bg-white border border-slate-200 rounded-xl">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#372b7b]"></div>
        </div>
      ) : paginatedInquiries.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-16 text-center">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-base">No entries found</h3>
          <p className="text-xs text-slate-500 mt-1">No form submissions match the selected filter or search term.</p>
        </div>
      ) : viewMode === 'cards' ? (
        /* Cards View */
        <div className="grid grid-cols-1 gap-4">
          {paginatedInquiries.map((lead) => {
            const category = getCategory(lead.source);
            return (
              <div 
                key={lead._id} 
                className="bg-white border border-slate-200/90 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-md transition-all overflow-hidden flex flex-col"
              >
                <div className="p-5 md:p-6 flex-1 space-y-4">
                  
                  {/* Header Row */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    
                    <div className="flex items-start space-x-3.5">
                      <div className="w-11 h-11 rounded-lg bg-[#372b7b] text-white flex items-center justify-center text-lg font-bold shadow-xs shrink-0">
                        {lead.name ? lead.name[0]?.toUpperCase() : 'L'}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-bold text-slate-900 tracking-tight">{lead.name}</h3>
                          {lead.company && (
                            <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                              {lead.company}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 mt-1.5 text-xs text-slate-600">
                          <span className="flex items-center text-slate-600 font-medium">
                            <Mail className="w-3.5 h-3.5 mr-1 text-slate-400" />
                            {lead.email}
                          </span>
                          {lead.phone && (
                            <span className="flex items-center text-emerald-700 font-medium">
                              <Phone className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                              {lead.phone}
                            </span>
                          )}
                          <span className="flex items-center text-slate-400 text-[11px]">
                            <Clock className="w-3 h-3 mr-1" />
                            {new Date(lead.createdAt).toLocaleDateString()} {new Date(lead.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Source Tag Badge */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold border ${
                        category === 'contact'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : category === 'popup'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : category === 'product'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : category === 'blog'
                          ? 'bg-cyan-50 text-cyan-700 border-cyan-200'
                          : category === 'campaign'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : category === 'portals'
                          ? 'bg-orange-50 text-orange-700 border-orange-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        <Target className="w-3 h-3 mr-1" />
                        {lead.source || 'Website Form'}
                      </span>

                      {/* Delete / Archive */}
                      <button 
                        onClick={() => deleteInquiry(lead._id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                        title="Archive entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>

                  {/* Subject & Product Link if available */}
                  {(lead.subject || lead.productId) && (
                    <div className="flex items-center flex-wrap gap-2 text-xs">
                      {lead.subject && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[11px]">
                          <Hash className="w-3 h-3 mr-1 text-slate-400" />
                          {lead.subject}
                        </span>
                      )}
                      {lead.productId && (
                        <Link 
                          href={`/products/${lead.productId.slug || ''}`} 
                          target="_blank"
                          className="inline-flex items-center px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 hover:underline font-semibold text-[11px]"
                        >
                          <Box className="w-3 h-3 mr-1" />
                          <span>Product: {lead.productId.title || 'View Instrument'}</span>
                          <ExternalLink className="w-2.5 h-2.5 ml-1" />
                        </Link>
                      )}
                    </div>
                  )}

                  {/* Message Body */}
                  <div className="bg-slate-50/70 border border-slate-200/70 p-3.5 rounded-lg text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                    <p className="line-clamp-3">{lead.message}</p>
                    {lead.message && lead.message.length > 200 && (
                      <button 
                        onClick={() => setSelectedInquiry(lead)}
                        className="mt-1 text-indigo-600 hover:text-indigo-800 font-bold text-[11px]"
                      >
                        Read full message →
                      </button>
                    )}
                  </div>

                </div>

                {/* Action Toolbar */}
                <div className="bg-slate-50/50 border-t border-slate-100 px-5 py-2.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 text-xs">
                  
                  <span className="text-[11px] text-slate-400">
                    ID: <span className="font-mono text-slate-600">{lead._id.slice(-8).toUpperCase()}</span>
                  </span>

                  <div className="flex items-center flex-wrap gap-2">
                    
                    {/* Push to CRM Leads Kanban */}
                    <button
                      onClick={() => handlePushToCrmLead(lead)}
                      disabled={pushingId === lead._id}
                      className="inline-flex items-center px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-semibold rounded-lg transition disabled:opacity-50"
                      title="Convert to CRM Lead Kanban card"
                    >
                      <Sparkles className="w-3.5 h-3.5 mr-1 text-indigo-600" />
                      <span>{pushingId === lead._id ? 'Converting...' : 'Push to CRM Leads'}</span>
                    </button>

                    {/* WhatsApp */}
                    {lead.phone && (
                      <a
                        href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${lead.name}, thank you for reaching out to LabZenix Testing Instruments.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-semibold rounded-lg transition"
                      >
                        <MessageSquare className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                        <span>WhatsApp</span>
                      </a>
                    )}

                    {/* Reply Email */}
                    <a 
                      href={`mailto:${lead.email}?subject=${encodeURIComponent(lead.subject || 'Re: Inquiry from LabZenix')}`}
                      className="inline-flex items-center px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold rounded-lg transition"
                    >
                      <Mail className="w-3.5 h-3.5 mr-1 text-slate-500" />
                      <span>Reply</span>
                    </a>

                    {/* View Details Modal */}
                    <button
                      onClick={() => setSelectedInquiry(lead)}
                      className="inline-flex items-center px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold rounded-lg transition"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1 text-slate-500" />
                      <span>View</span>
                    </button>

                  </div>

                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* Table List View */
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#2b2553] text-white">
                <tr>
                  <th className="py-3 px-4 font-semibold">Lead Name</th>
                  <th className="py-3 px-4 font-semibold">Contact Info</th>
                  <th className="py-3 px-4 font-semibold">Company</th>
                  <th className="py-3 px-4 font-semibold">Form Source</th>
                  <th className="py-3 px-4 font-semibold">Date</th>
                  <th className="py-3 px-4 font-semibold">Message Preview</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedInquiries.map(lead => {
                  const category = getCategory(lead.source);
                  return (
                    <tr key={lead._id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {lead.name}
                      </td>
                      <td className="py-3.5 px-4 space-y-0.5">
                        <div className="text-slate-600">{lead.email}</div>
                        {lead.phone && <div className="text-emerald-700 font-medium">{lead.phone}</div>}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {lead.company || '-'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                          category === 'contact'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : category === 'popup'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : category === 'product'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : category === 'blog'
                            ? 'bg-cyan-50 text-cyan-700 border-cyan-200'
                            : category === 'campaign'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : category === 'portals'
                            ? 'bg-orange-50 text-orange-700 border-orange-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          {lead.source || 'Website'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-xs">
                        <p className="line-clamp-2">{lead.message}</p>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center space-x-1.5">
                          <button
                            onClick={() => handlePushToCrmLead(lead)}
                            disabled={pushingId === lead._id}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded"
                            title="Push to CRM Leads"
                          >
                            <Sparkles className="w-4 h-4" />
                          </button>
                          {lead.phone && (
                            <a
                              href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${lead.name}, greeting from LabZenix.`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded"
                              title="WhatsApp"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </a>
                          )}
                          <button
                            onClick={() => setSelectedInquiry(lead)}
                            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"
                            title="View Full Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteInquiry(lead._id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Bar */}
      <div className="bg-white rounded-xl border border-slate-200/80 px-4 sm:px-6 py-3.5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-3">
        <div className="flex items-center space-x-2">
          <span>Rows per page:</span>
          <select
            value={limit}
            onChange={e => {
              setLimit(parseInt(e.target.value));
              setPage(1);
            }}
            className="border border-slate-200 rounded px-2.5 py-1 bg-white text-slate-700 font-semibold focus:outline-hidden"
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
            <option value="-1">All ({total})</option>
          </select>
          <span className="ml-3 font-medium">
            {total > 0 ? `${startIndex + 1} - ${endIndex} of ${total}` : '0 - 0 of 0'}
          </span>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => setPage(1)}
            disabled={currentPage === 1}
            className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
            title="First Page"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
            title="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Page Numbers */}
          <div className="flex items-center space-x-1 px-1">
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              let pNum = i + 1;
              if (totalPages > 5 && currentPage > 3) {
                pNum = currentPage - 2 + i;
                if (pNum > totalPages) pNum = totalPages - 4 + i;
              }
              return (
                <button
                  key={pNum}
                  onClick={() => setPage(pNum)}
                  className={`w-7 h-7 rounded text-xs font-semibold transition ${
                    currentPage === pNum
                      ? 'bg-[#372b7b] text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {pNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
            title="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setPage(totalPages)}
            disabled={currentPage >= totalPages}
            className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
            title="Last Page"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Inquiry Detail Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95 duration-200 border border-slate-200">
             
             <div className="flex items-center justify-between p-6 border-b border-slate-100">
               <div>
                 <h2 className="text-xl font-bold text-slate-900">{selectedInquiry.name}</h2>
                 <p className="text-xs text-slate-400 mt-0.5">{new Date(selectedInquiry.createdAt).toLocaleString()}</p>
               </div>
               <button 
                 onClick={() => setSelectedInquiry(null)}
                 className="p-1 text-slate-400 hover:text-slate-600 transition"
               >
                 <X className="w-5 h-5" />
               </button>
             </div>

             <div className="p-6 space-y-5 text-xs">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div>
                   <p className="text-[11px] font-semibold text-slate-400">Email Address</p>
                   <p className="text-slate-900 font-bold mt-0.5 break-all">{selectedInquiry.email}</p>
                 </div>
                 <div>
                   <p className="text-[11px] font-semibold text-slate-400">Phone Number</p>
                   <p className="text-slate-900 font-bold mt-0.5">{selectedInquiry.phone || 'N/A'}</p>
                 </div>
                 <div>
                   <p className="text-[11px] font-semibold text-slate-400">Company / Organization</p>
                   <p className="text-slate-900 font-bold mt-0.5">{selectedInquiry.company || 'N/A'}</p>
                 </div>
                 <div>
                   <p className="text-[11px] font-semibold text-slate-400">Submission Source</p>
                   <p className="text-slate-900 font-bold mt-0.5">{selectedInquiry.source || 'Website Form'}</p>
                 </div>
               </div>

               {selectedInquiry.subject && (
                 <div>
                   <p className="text-[11px] font-semibold text-slate-400">Subject</p>
                   <p className="text-slate-900 font-bold mt-0.5">{selectedInquiry.subject}</p>
                 </div>
               )}

               <div>
                 <p className="text-[11px] font-semibold text-slate-400 mb-1">Requirement / Message</p>
                 <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-slate-800 leading-relaxed whitespace-pre-wrap font-medium">
                   {selectedInquiry.message}
                 </div>
               </div>

               <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                 <button
                   onClick={() => handlePushToCrmLead(selectedInquiry)}
                   className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-xs transition"
                 >
                   <Sparkles className="w-4 h-4 mr-1.5" />
                   Push to CRM Leads
                 </button>
                 <a 
                   href={`mailto:${selectedInquiry.email}?subject=${encodeURIComponent(selectedInquiry.subject || 'Re: Inquiry from LabZenix')}`}
                   className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold rounded-lg transition"
                 >
                   <Mail className="w-4 h-4 mr-1.5 text-slate-500" />
                   Reply Email
                 </a>
                 <button
                   onClick={() => setSelectedInquiry(null)}
                   className="w-full sm:w-auto px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg font-medium"
                 >
                   Close
                 </button>
               </div>
             </div>
          </div>
        </div>
      )}

    </div>
  );
}
