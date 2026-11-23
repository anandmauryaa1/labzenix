'use client';

import React, { useState, useEffect, Fragment, useRef } from 'react';
import { 
  Search, 
  Filter as FilterIcon, 
  FileText, 
  Download, 
  Plus, 
  MoreVertical, 
  LayoutGrid, 
  List, 
  Phone, 
  Calendar, 
  User, 
  Send, 
  MapPin, 
  Star, 
  Trash2, 
  Tag, 
  TrendingUp, 
  UserPlus, 
  RefreshCw, 
  X, 
  ChevronDown,
  Building2,
  MessageSquare,
  Edit3,
  Clock,
  CheckCircle2,
  Briefcase
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

// Stage configuration matching Screenshot 1
const COLUMNS = [
  { id: 'New', label: 'New', color: 'bg-[#00667e]', border: 'border-[#00667e]' },
  { id: 'Processing', label: 'Processing', color: 'bg-[#372b7b]', border: 'border-[#372b7b]' },
  { id: 'Close-by', label: 'Close-by', color: 'bg-[#5b8a05]', border: 'border-[#5b8a05]' },
  { id: 'Confirm', label: 'Confirm', color: 'bg-[#3f7e00]', border: 'border-[#3f7e00]' },
  { id: 'Cancel', label: 'Cancel', color: 'bg-[#e60026]', border: 'border-[#e60026]' }
];

const EXECUTIVES = [
  'LabZenix Industries',
  'Pooja Sharma',
  'Vikram Patel',
  'Anand Maurya',
  'Sales Team Alpha'
];

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [search, setSearch] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeFilterStage, setActiveFilterStage] = useState<string>('all');

  // Drag and drop state
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);

  // Dropdown 3-dots open ID
  const [activeMenuLeadId, setActiveMenuLeadId] = useState<string | null>(null);

  // Add Lead Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    companyName: '',
    leadSource: 'Tradindia',
    estimatedAmount: 0,
    address: '',
    rating: 0,
    stage: 'New'
  });
  const [submitting, setSubmitting] = useState(false);

  // Edit Lead Modal
  const [editingLead, setEditingLead] = useState<any | null>(null);

  // Assign Executive Modal
  const [assigningLead, setAssigningLead] = useState<any | null>(null);
  const [selectedExecutive, setSelectedExecutive] = useState('LabZenix Industries');

  // Manage Tags Modal
  const [taggingLead, setTaggingLead] = useState<any | null>(null);
  const [newTagInput, setNewTagInput] = useState('');

  // Send Proposal Modal
  const [proposingLead, setProposingLead] = useState<any | null>(null);
  const [proposalDocType, setProposalDocType] = useState('Commercial Quotation');
  const [proposalNotes, setProposalNotes] = useState('');

  // Activity Logs Modal
  const [activityLead, setActivityLead] = useState<any | null>(null);

  useEffect(() => {
    fetchLeads();
  }, []);

  async function fetchLeads() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/crm/leads');
      if (res.ok) {
        const data = await res.json();
        setLeads(data);
      } else {
        toast.error('Failed to load leads');
      }
    } catch (err) {
      toast.error('Network error loading leads');
    } finally {
      setLoading(false);
    }
  }

  // Create lead handler
  async function handleAddLead(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/crm/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        toast.success('Lead created successfully!');
        setIsAddOpen(false);
        setFormData({
          name: '',
          phone: '',
          companyName: '',
          leadSource: 'Tradindia',
          estimatedAmount: 0,
          address: '',
          rating: 0,
          stage: 'New'
        });
        fetchLeads();
      } else {
        toast.error('Failed to create lead');
      }
    } catch (err) {
      toast.error('Request failed');
    } finally {
      setSubmitting(false);
    }
  }

  // Update lead stage
  async function updateLeadStage(leadId: string, newStage: string) {
    try {
      setLeads(prev => prev.map(l => l._id === leadId ? { ...l, stage: newStage } : l));
      const res = await fetch('/api/admin/crm/leads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: leadId, stage: newStage })
      });
      if (res.ok) {
        toast.success(`Moved to ${newStage}`);
      } else {
        fetchLeads();
        toast.error('Failed to update stage');
      }
    } catch (err) {
      fetchLeads();
      toast.error('Error updating stage');
    }
  }

  // Update lead rating
  async function updateLeadRating(leadId: string, rating: number) {
    try {
      setLeads(prev => prev.map(l => l._id === leadId ? { ...l, rating } : l));
      await fetch('/api/admin/crm/leads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: leadId, rating })
      });
      toast.success(`Rating set to ${rating} stars`);
    } catch (err) {
      toast.error('Error saving rating');
    }
  }

  // Edit lead details
  async function handleSaveEditLead(e: React.FormEvent) {
    e.preventDefault();
    if (!editingLead) return;
    try {
      const res = await fetch('/api/admin/crm/leads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingLead)
      });
      if (res.ok) {
        toast.success('Lead updated successfully!');
        setLeads(prev => prev.map(l => l._id === editingLead._id ? editingLead : l));
        setEditingLead(null);
      } else {
        toast.error('Failed to update lead');
      }
    } catch (err) {
      toast.error('Error updating lead');
    }
  }

  // Assign executive
  async function handleSaveAssignExecutive() {
    if (!assigningLead) return;
    try {
      const res = await fetch('/api/admin/crm/leads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: assigningLead._id, assignedTo: selectedExecutive })
      });
      if (res.ok) {
        toast.success(`Assigned to ${selectedExecutive}`);
        setLeads(prev => prev.map(l => l._id === assigningLead._id ? { ...l, assignedTo: selectedExecutive } : l));
        setAssigningLead(null);
      } else {
        toast.error('Failed to assign');
      }
    } catch (err) {
      toast.error('Error assigning executive');
    }
  }

  // Send proposal simulation
  async function handleSendProposal() {
    if (!proposingLead) return;
    try {
      const currentCount = proposingLead.proposalsCount || 0;
      const res = await fetch('/api/admin/crm/leads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: proposingLead._id, proposalsCount: currentCount + 1 })
      });
      toast.success(`${proposalDocType} dispatched to ${proposingLead.name || proposingLead.companyName}!`);
      setLeads(prev => prev.map(l => l._id === proposingLead._id ? { ...l, proposalsCount: currentCount + 1 } : l));
      setProposingLead(null);
    } catch (err) {
      toast.error('Error dispatching proposal');
    }
  }

  // Delete lead handler
  async function handleDeleteLead(leadId: string) {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    try {
      const res = await fetch('/api/admin/crm/leads', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: leadId })
      });
      if (res.ok) {
        setLeads(prev => prev.filter(l => l._id !== leadId));
        toast.success('Lead deleted');
      } else {
        toast.error('Failed to delete lead');
      }
    } catch (err) {
      toast.error('Error deleting lead');
    }
  }

  // Filtered leads
  const filteredLeads = leads.filter(l => {
    const matchesSearch = search === '' || 
      (l.name && l.name.toLowerCase().includes(search.toLowerCase())) ||
      (l.phone && l.phone.includes(search)) ||
      (l.companyName && l.companyName.toLowerCase().includes(search.toLowerCase())) ||
      (l.leadSource && l.leadSource.toLowerCase().includes(search.toLowerCase()));

    const matchesStage = activeFilterStage === 'all' || l.stage === activeFilterStage;
    return matchesSearch && matchesStage;
  });

  return (
    <div className="space-y-4 max-w-[1700px] mx-auto pb-12 font-sans select-none text-slate-800">
      
      {/* Top Header Toolbar Matching Screenshot 1 */}
      <div className="bg-white rounded-xl border border-slate-200/80 px-3.5 sm:px-5 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        
        {/* Title */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Leads</h1>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          
          {/* Search Trigger / Input */}
          {isSearchOpen ? (
            <div className="flex items-center relative w-full sm:w-auto">
              <input
                type="text"
                autoFocus
                placeholder="Search leads, phone, company..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="text-xs px-3 py-1.5 pr-8 border border-slate-300 rounded-lg w-full sm:w-52 focus:outline-hidden focus:border-indigo-500"
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

          {/* Export Dropdown */}
          <button 
            onClick={() => {
              const csvContent = "data:text/csv;charset=utf-8," + ["Name,Phone,Company,Source,Stage,Amount"].concat(leads.map(l => `"${l.name || ''}","${l.phone || ''}","${l.companyName || ''}","${l.leadSource || ''}","${l.stage || ''}","${l.estimatedAmount || 0}"`)).join("\n");
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", `labzenix_leads_${new Date().toISOString().split('T')[0]}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              toast.success('Leads exported to CSV');
            }}
            className="inline-flex items-center px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-lg transition"
          >
            <Download className="w-3.5 h-3.5 mr-1 sm:mr-1.5 text-slate-500" />
            <span>Export</span>
          </button>

          {/* Add Lead Button */}
          <button
            onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center px-3 sm:px-3.5 py-1.5 text-xs font-semibold text-white bg-[#372b7b] hover:bg-[#2f2468] rounded-lg transition shadow-xs"
          >
            <Plus className="w-4 h-4 mr-1" />
            <span>Add Lead</span>
          </button>

          {/* View Switcher (Kanban / List) */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/80">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-md transition ${viewMode === 'kanban' ? 'bg-white shadow-2xs text-[#372b7b]' : 'text-slate-400 hover:text-slate-600'}`}
              title="Kanban Board View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition ${viewMode === 'list' ? 'bg-white shadow-2xs text-[#372b7b]' : 'text-slate-400 hover:text-slate-600'}`}
              title="Table List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

      {/* Stage Pill Filter Bar matching Screenshot 1 */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1.5 pt-0.5 scroll-smooth">
        <button
          onClick={() => setActiveFilterStage('all')}
          className={`px-3 py-1 text-xs font-semibold rounded-md transition border shrink-0 whitespace-nowrap ${
            activeFilterStage === 'all'
              ? 'bg-[#372b7b] text-white border-[#372b7b]'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          All ({leads.length})
        </button>
        {COLUMNS.map(col => {
          const count = leads.filter(l => l.stage === col.id).length;
          const isActive = activeFilterStage === col.id;
          return (
            <button
              key={col.id}
              onClick={() => setActiveFilterStage(col.id)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition border shrink-0 whitespace-nowrap flex items-center space-x-1.5 ${
                isActive
                  ? 'bg-[#372b7b] text-white border-[#372b7b]'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{col.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Kanban Board: Horizontally scrollable with identical column width */}
      {viewMode === 'kanban' ? (
        <div className="flex gap-4 items-start overflow-x-auto pb-6 pt-1 scroll-smooth">
          {COLUMNS.map(column => {
            const columnLeads = filteredLeads.filter(l => l.stage === column.id);
            const totalAmount = columnLeads.reduce((acc, curr) => acc + (curr.estimatedAmount || curr.budget || 0), 0);

            return (
              <div
                key={column.id}
                onDragOver={e => e.preventDefault()}
                onDrop={() => {
                  if (draggedLeadId) {
                    updateLeadStage(draggedLeadId, column.id);
                    setDraggedLeadId(null);
                  }
                }}
                className="w-[290px] sm:w-[310px] md:w-[320px] min-w-[290px] sm:min-w-[310px] md:min-w-[320px] shrink-0 flex flex-col min-h-[500px]"
              >
                {/* Column Header matching Screenshot 1 */}
                <div className={`${column.color} text-white px-3.5 py-2.5 rounded-t-lg flex items-center justify-between shadow-xs`}>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm tracking-wide">{column.label}</span>
                    <span className="text-xs text-white/80 font-normal">| ₹ {totalAmount.toFixed(2)}</span>
                  </div>
                  {column.id !== 'Cancel' && (
                    <span className="bg-[#e11d48] text-white text-[11px] font-bold px-2 py-0.2 rounded-full shadow-2xs">
                      {columnLeads.length}
                    </span>
                  )}
                  {column.id === 'Cancel' && (
                    <span className="text-white text-xs font-semibold">
                      ₹ 0
                    </span>
                  )}
                </div>

                {/* Column Cards Container */}
                <div className="space-y-3.5 pt-2 flex-1">
                  {columnLeads.length === 0 ? (
                    <div className="bg-white/60 rounded-b-lg border-x border-b border-dashed border-slate-200 p-8 text-center text-xs text-slate-400">
                      No leads in {column.label}
                    </div>
                  ) : (
                    columnLeads.map(lead => (
                      <div
                        key={lead._id}
                        draggable
                        onDragStart={() => setDraggedLeadId(lead._id)}
                        className="bg-white rounded-lg border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing relative overflow-hidden"
                      >
                        {/* Left vertical colored accent line */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${column.color}`} />

                        <div className="p-3.5 pl-4.5 space-y-2.5">
                          {/* Lead Name & Phone */}
                          <div>
                            <div className="flex items-center justify-between">
                              <h3 
                                onClick={() => setEditingLead(lead)}
                                className="font-bold text-sm text-slate-900 leading-tight hover:text-indigo-600 transition cursor-pointer"
                              >
                                {lead.name || 'Anonymous Lead'}
                              </h3>
                              <button
                                onClick={() => setEditingLead(lead)}
                                className="text-slate-400 hover:text-indigo-600 transition"
                                title="Edit Lead"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {lead.phone && (
                              <div className="flex items-center justify-between mt-1">
                                <p className="text-xs text-slate-600 flex items-center gap-1.5 font-medium">
                                  <Phone className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600/20" />
                                  <span>{lead.phone}</span>
                                </p>
                                <a
                                  href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${lead.name || ''}, greeting from LabZenix Testing Instruments.`)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-emerald-500 hover:text-emerald-600 transition"
                                  title="Chat on WhatsApp"
                                  onClick={e => e.stopPropagation()}
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            )}
                          </div>

                          {/* Source Tag Badge */}
                          <div>
                            <span className="inline-block bg-[#fdf2f8] text-[#be185d] border border-[#fbcfe8] text-[10px] font-semibold px-2 py-0.5 rounded-md">
                              {lead.leadSource || 'Tradindia'}
                            </span>
                          </div>

                          {/* Details Metadata List (CN, CD, BY, TO, AD) */}
                          <div className="space-y-1 text-[11px] text-slate-600 pt-1 border-t border-slate-100">
                            {lead.companyName && (
                              <div className="flex items-start gap-1.5">
                                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                                <span><strong>CN:</strong> {lead.companyName}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span><strong>CD:</strong> {new Date(lead.createdAt || Date.now()).toLocaleDateString()} {new Date(lead.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span><strong>BY:</strong> {lead.createdBy || 'LabZenix Industries'}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Send className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span><strong>TO:</strong> {lead.assignedTo || 'LabZenix Industries'}</span>
                            </div>
                            {lead.address && (
                              <div className="flex items-start gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                                <span className="line-clamp-1"><strong>AD:</strong> {lead.address}</span>
                              </div>
                            )}
                          </div>

                          {/* Rating & Estimated Amount */}
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                            <div>
                              <p className="text-[10px] text-slate-400 font-semibold mb-0.5">Rating</p>
                              <div className="flex items-center space-x-0.5">
                                {[1, 2, 3, 4, 5].map(star => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => updateLeadRating(lead._id, star === lead.rating ? 0 : star)}
                                    className="p-0.5 hover:scale-110 transition"
                                  >
                                    <Star 
                                      className={`w-3.5 h-3.5 ${
                                        star <= (lead.rating || 0)
                                          ? 'text-amber-400 fill-amber-400' 
                                          : 'text-slate-300'
                                      }`} 
                                    />
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] text-slate-400 font-semibold">Estimated Amount</p>
                              <p className="font-bold text-slate-800 text-xs">
                                ₹{(lead.estimatedAmount || lead.budget || 0).toFixed(2)}
                              </p>
                            </div>
                          </div>

                          {/* Bottom Card Footer Actions Matching Screenshot 1 */}
                          <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-slate-400 relative">
                            <div className="flex items-center space-x-2">
                              {/* Red Delete */}
                              <button 
                                onClick={() => handleDeleteLead(lead._id)}
                                className="text-rose-500 hover:text-rose-700 transition" 
                                title="Delete Lead"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                              {/* Green Tag */}
                              <button 
                                onClick={() => setTaggingLead(lead)}
                                className="text-emerald-500 hover:text-emerald-700 transition" 
                                title="Manage Tags"
                              >
                                <Tag className="w-3.5 h-3.5" />
                              </button>
                              {/* Trend chart / Activity Logs */}
                              <button 
                                onClick={() => setActivityLead(lead)}
                                className="text-indigo-500 hover:text-indigo-700 transition" 
                                title="Activity Logs"
                              >
                                <TrendingUp className="w-3.5 h-3.5" />
                              </button>
                              {/* Transfer / assign executive */}
                              <button 
                                onClick={() => {
                                  setAssigningLead(lead);
                                  setSelectedExecutive(lead.assignedTo || 'LabZenix Industries');
                                }}
                                className="text-blue-500 hover:text-blue-700 transition" 
                                title="Assign Executive"
                              >
                                <UserPlus className="w-3.5 h-3.5" />
                              </button>
                              {/* Refresh / cycle next stage */}
                              <button 
                                onClick={() => {
                                  const nextIdx = (COLUMNS.findIndex(c => c.id === lead.stage) + 1) % COLUMNS.length;
                                  updateLeadStage(lead._id, COLUMNS[nextIdx].id);
                                }}
                                className="text-cyan-500 hover:text-cyan-700 transition" 
                                title="Cycle Next Stage"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                              </button>
                              {/* Send Proposal / Document Button */}
                              <button
                                onClick={() => setProposingLead(lead)}
                                className="relative inline-flex items-center hover:opacity-80 transition"
                                title="Send Proposal"
                              >
                                <Send className="w-3.5 h-3.5 text-slate-500" />
                                <span className="ml-0.5 bg-[#372b7b] text-white rounded-full text-[9px] w-3.5 h-3.5 flex items-center justify-center font-bold">
                                  {lead.proposalsCount || 0}
                                </span>
                              </button>
                            </div>

                            {/* 3-dots Menu Button */}
                            <div className="relative">
                              <button 
                                onClick={() => setActiveMenuLeadId(activeMenuLeadId === lead._id ? null : lead._id)}
                                className="text-slate-400 hover:text-slate-600 transition p-1"
                              >
                                <MoreVertical className="w-3.5 h-3.5" />
                              </button>

                              {activeMenuLeadId === lead._id && (
                                <div className="absolute right-0 bottom-full mb-1 w-44 bg-white rounded-lg shadow-xl border border-slate-200 py-1.5 z-30 text-xs">
                                  <button
                                    onClick={() => {
                                      setActiveMenuLeadId(null);
                                      setEditingLead(lead);
                                    }}
                                    className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                                  >
                                    <Edit3 className="w-3.5 h-3.5 text-indigo-500" />
                                    Edit Details
                                  </button>
                                  <button
                                    onClick={() => {
                                      setActiveMenuLeadId(null);
                                      setAssigningLead(lead);
                                      setSelectedExecutive(lead.assignedTo || 'LabZenix Industries');
                                    }}
                                    className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                                  >
                                    <UserPlus className="w-3.5 h-3.5 text-blue-500" />
                                    Assign Executive
                                  </button>
                                  <button
                                    onClick={() => {
                                      setActiveMenuLeadId(null);
                                      setProposingLead(lead);
                                    }}
                                    className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                                  >
                                    <Send className="w-3.5 h-3.5 text-cyan-500" />
                                    Send Proposal
                                  </button>
                                  <button
                                    onClick={() => {
                                      setActiveMenuLeadId(null);
                                      setActivityLead(lead);
                                    }}
                                    className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                                  >
                                    <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                                    View Activity
                                  </button>
                                  <div className="border-t border-slate-100 my-1" />
                                  <button
                                    onClick={() => {
                                      setActiveMenuLeadId(null);
                                      handleDeleteLead(lead._id);
                                    }}
                                    className="w-full text-left px-3 py-1.5 hover:bg-red-50 flex items-center gap-2 text-rose-600"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Delete Lead
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#2b2553] text-white">
              <tr>
                <th className="py-3 px-4">Lead Name</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Company</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4">Stage</th>
                <th className="py-3 px-4">Est. Amount</th>
                <th className="py-3 px-4">Assigned To</th>
                <th className="py-3 px-4">Rating</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeads.map(lead => (
                <tr key={lead._id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-900 cursor-pointer hover:text-indigo-600" onClick={() => setEditingLead(lead)}>
                    {lead.name}
                  </td>
                  <td className="py-3 px-4 text-emerald-600 font-medium">
                    <div className="flex items-center gap-1.5">
                      <span>{lead.phone || '-'}</span>
                      {lead.phone && (
                        <a
                          href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${lead.name || ''}, greeting from LabZenix.`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-500 hover:text-emerald-700"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{lead.companyName || '-'}</td>
                  <td className="py-3 px-4">
                    <span className="bg-[#fdf2f8] text-[#be185d] border border-[#fbcfe8] text-[10px] font-semibold px-2 py-0.5 rounded-md">
                      {lead.leadSource || 'Tradindia'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold px-2 py-0.5 rounded text-white text-[11px]" style={{
                      backgroundColor: COLUMNS.find(c => c.id === lead.stage)?.color.replace('bg-[', '').replace(']', '') || '#372b7b'
                    }}>
                      {lead.stage}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-800">₹{(lead.estimatedAmount || 0).toFixed(2)}</td>
                  <td className="py-3 px-4 text-slate-600">{lead.assignedTo || 'LabZenix Industries'}</td>
                  <td className="py-3 px-4">
                    <div className="flex text-amber-400">
                      {[...Array(lead.rating || 0)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center space-x-1.5">
                      <button
                        onClick={() => setEditingLead(lead)}
                        className="text-slate-500 hover:text-indigo-600 p-1"
                        title="Edit Lead"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setAssigningLead(lead);
                          setSelectedExecutive(lead.assignedTo || 'LabZenix Industries');
                        }}
                        className="text-blue-500 hover:text-blue-700 p-1"
                        title="Assign Executive"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteLead(lead._id)}
                        className="text-rose-500 hover:text-rose-700 p-1"
                        title="Delete Lead"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}


      {/* Add Lead Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-900">Add New Lead</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddLead} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Lead / Contact Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mr. Suresh Megotia"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 919824157186"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Company Name</label>
                <input
                  type="text"
                  placeholder="e.g. Rakshini Colour Coats"
                  value={formData.companyName}
                  onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Lead Source</label>
                  <select
                    value={formData.leadSource}
                    onChange={e => setFormData({ ...formData, leadSource: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-white"
                  >
                    <option value="Tradindia">Tradindia</option>
                    <option value="Indiamart">Indiamart</option>
                    <option value="Website">Website</option>
                    <option value="Referral">Referral</option>
                    <option value="Direct Call">Direct Call</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Pipeline Stage</label>
                  <select
                    value={formData.stage}
                    onChange={e => setFormData({ ...formData, stage: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-white"
                  >
                    <option value="New">New</option>
                    <option value="Processing">Processing</option>
                    <option value="Close-by">Close-by</option>
                    <option value="Confirm">Confirm</option>
                    <option value="Cancel">Cancel</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Estimated Amount (₹)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={formData.estimatedAmount}
                  onChange={e => setFormData({ ...formData, estimatedAmount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Address / Location</label>
                <input
                  type="text"
                  placeholder="e.g. No. 7/12, 15th Cross, Magadi Road, Bengaluru"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-white bg-[#372b7b] hover:bg-[#2e236b] rounded-lg font-semibold shadow-xs disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Lead Modal */}
      {editingLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-900">Edit Lead Details</h3>
              <button onClick={() => setEditingLead(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditLead} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Lead Name *</label>
                  <input
                    type="text"
                    required
                    value={editingLead.name || ''}
                    onChange={e => setEditingLead({ ...editingLead, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone *</label>
                  <input
                    type="text"
                    required
                    value={editingLead.phone || ''}
                    onChange={e => setEditingLead({ ...editingLead, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Company Name</label>
                  <input
                    type="text"
                    value={editingLead.companyName || ''}
                    onChange={e => setEditingLead({ ...editingLead, companyName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Lead Source</label>
                  <select
                    value={editingLead.leadSource || 'Tradindia'}
                    onChange={e => setEditingLead({ ...editingLead, leadSource: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-white"
                  >
                    <option value="Tradindia">Tradindia</option>
                    <option value="Indiamart">Indiamart</option>
                    <option value="Website">Website</option>
                    <option value="Referral">Referral</option>
                    <option value="Direct Call">Direct Call</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Stage</label>
                  <select
                    value={editingLead.stage || 'New'}
                    onChange={e => setEditingLead({ ...editingLead, stage: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-white"
                  >
                    {COLUMNS.map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estimated Amount (₹)</label>
                  <input
                    type="number"
                    value={editingLead.estimatedAmount || 0}
                    onChange={e => setEditingLead({ ...editingLead, estimatedAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Executive</label>
                <select
                  value={editingLead.assignedTo || 'LabZenix Industries'}
                  onChange={e => setEditingLead({ ...editingLead, assignedTo: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-white"
                >
                  {EXECUTIVES.map(ex => (
                    <option key={ex} value={ex}>{ex}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Address / Location</label>
                <input
                  type="text"
                  value={editingLead.address || ''}
                  onChange={e => setEditingLead({ ...editingLead, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingLead(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-white bg-[#372b7b] hover:bg-[#2e236b] rounded-lg font-semibold shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Executive Modal */}
      {assigningLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">Assign Executive</h3>
              <button onClick={() => setAssigningLead(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-slate-600">
                Assign account executive for <strong>{assigningLead.name}</strong> ({assigningLead.companyName || 'Lead'}):
              </p>

              <div className="space-y-2">
                {EXECUTIVES.map(ex => (
                  <label
                    key={ex}
                    onClick={() => setSelectedExecutive(ex)}
                    className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition ${
                      selectedExecutive === ex
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-semibold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span>{ex}</span>
                    {selectedExecutive === ex && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                  </label>
                ))}
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setAssigningLead(null)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAssignExecutive}
                  className="px-4 py-1.5 text-white bg-[#372b7b] hover:bg-[#2e236b] rounded-lg font-semibold shadow-xs"
                >
                  Confirm Assign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manage Tags Modal */}
      {taggingLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">Manage Lead Tags</h3>
              <button onClick={() => setTaggingLead(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-slate-600">
                Tags for <strong>{taggingLead.name}</strong>:
              </p>

              <div className="flex flex-wrap gap-1.5 min-h-[40px] p-2 border border-slate-200 rounded-lg bg-slate-50/50">
                {(taggingLead.tags || ['High Priority', 'Tradindia', 'Lab Instruments']).map((tagText: string, idx: number) => (
                  <span key={idx} className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1">
                    {tagText}
                    <button 
                      onClick={() => {
                        const updated = (taggingLead.tags || ['High Priority', 'Tradindia', 'Lab Instruments']).filter((_: any, i: number) => i !== idx);
                        setTaggingLead({ ...taggingLead, tags: updated });
                      }}
                      className="text-indigo-400 hover:text-indigo-700"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="New tag name..."
                  value={newTagInput}
                  onChange={e => setNewTagInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && newTagInput.trim()) {
                      const updated = [...(taggingLead.tags || ['High Priority', 'Tradindia', 'Lab Instruments']), newTagInput.trim()];
                      setTaggingLead({ ...taggingLead, tags: updated });
                      setNewTagInput('');
                    }
                  }}
                  className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                />
                <button
                  onClick={() => {
                    if (newTagInput.trim()) {
                      const updated = [...(taggingLead.tags || ['High Priority', 'Tradindia', 'Lab Instruments']), newTagInput.trim()];
                      setTaggingLead({ ...taggingLead, tags: updated });
                      setNewTagInput('');
                    }
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Add
                </button>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setTaggingLead(null)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    toast.success('Tags saved successfully');
                    setTaggingLead(null);
                  }}
                  className="px-4 py-1.5 text-white bg-[#372b7b] hover:bg-[#2e236b] rounded-lg font-semibold shadow-xs"
                >
                  Save Tags
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Send Proposal Modal */}
      {proposingLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">Send Quotation / Proposal</h3>
              <button onClick={() => setProposingLead(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <p className="text-slate-600">
                Generate and send formal document for <strong>{proposingLead.name}</strong> ({proposingLead.companyName || 'Prospective Lead'}):
              </p>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Proposal Document Type</label>
                <select
                  value={proposalDocType}
                  onChange={e => setProposalDocType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-white"
                >
                  <option value="Commercial Quotation">Commercial Quotation (Lab Instruments)</option>
                  <option value="Technical Specifications Sheet">Technical Specifications Sheet</option>
                  <option value="Annual Maintenance Contract (AMC)">Annual Maintenance Contract (AMC)</option>
                  <option value="Proforma Invoice">Proforma Invoice</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Internal Note / Remarks</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Quoted with 1-year calibration and standard delivery warranty."
                  value={proposalNotes}
                  onChange={e => setProposalNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Target Value:</span>
                  <span className="font-bold text-slate-900">₹{(proposingLead.estimatedAmount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Destination:</span>
                  <span>{proposingLead.phone || 'Email on file'}</span>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setProposingLead(null)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendProposal}
                  className="px-4 py-1.5 text-white bg-[#372b7b] hover:bg-[#2e236b] rounded-lg font-semibold shadow-xs flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Dispatch Document
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activity Logs Modal */}
      {activityLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">Activity Timeline</h3>
              <button onClick={() => setActivityLead(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{activityLead.name}</h4>
                  <p className="text-slate-500">{activityLead.companyName || 'No Company'}</p>
                </div>
                <span className="px-2 py-0.5 rounded text-white font-semibold text-[11px]" style={{
                  backgroundColor: COLUMNS.find(c => c.id === activityLead.stage)?.color.replace('bg-[', '').replace(']', '') || '#372b7b'
                }}>
                  {activityLead.stage}
                </span>
              </div>

              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                <div className="relative">
                  <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">
                    ✓
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">Lead Stage Set to "{activityLead.stage}"</p>
                    <p className="text-slate-400 text-[11px] flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" /> Updated recently
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px]">
                    👤
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">Assigned to {activityLead.assignedTo || 'LabZenix Industries'}</p>
                    <p className="text-slate-400 text-[11px] flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" /> Account Executive
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[10px]">
                    ★
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">Lead Ingested from {activityLead.leadSource || 'Tradindia'}</p>
                    <p className="text-slate-400 text-[11px] flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" /> {new Date(activityLead.createdAt || Date.now()).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end pt-3 border-t border-slate-100">
                <button
                  onClick={() => setActivityLead(null)}
                  className="px-4 py-1.5 text-white bg-[#372b7b] hover:bg-[#2e236b] rounded-lg font-semibold shadow-xs"
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
