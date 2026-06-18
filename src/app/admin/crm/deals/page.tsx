'use client';

import { useState, useEffect } from 'react';
import { Plus, X, Handshake, Search, Building2, User, DollarSign, Clock, Trash2, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

const STAGES = ['Lead', 'Qualification', 'Proposal', 'Negotiation', 'Won', 'Lost'];

export default function DealsBoard() {
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Contacts for new deal creation
  const [contacts, setContacts] = useState<any[]>([]);

  // Create Deal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContact, setNewContact] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newStage, setNewStage] = useState('Lead');
  const [newExpectedCloseDate, setNewExpectedCloseDate] = useState('');

  // Drag state
  const [draggedDealId, setDraggedDealId] = useState<string | null>(null);

  useEffect(() => {
    fetchDeals();
    fetchContacts();
  }, []);

  async function fetchDeals() {
    try {
      const res = await fetch('/api/admin/crm/deals');
      if (res.ok) {
        const data = await res.json();
        setDeals(data);
      }
    } catch (err) {
      toast.error('Failed to fetch deals');
    } finally {
      setLoading(false);
    }
  }

  async function fetchContacts() {
    try {
      const res = await fetch('/api/admin/crm/contacts?limit=100'); // Fetch up to 100 for dropdown
      if (res.ok) {
        const payload = await res.json();
        setContacts(payload.contacts || []);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleCreateDeal(e: React.FormEvent) {
    e.preventDefault();
    if (!newContact) {
      toast.error('Please select a contact');
      return;
    }
    
    try {
      const res = await fetch('/api/admin/crm/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          contact: newContact,
          value: parseFloat(newValue) || 0,
          stage: newStage,
          expectedCloseDate: newExpectedCloseDate || undefined,
        })
      });

      if (res.ok) {
        toast.success('Deal created successfully');
        setIsCreateOpen(false);
        setNewTitle('');
        setNewContact('');
        setNewValue('');
        setNewStage('Lead');
        setNewExpectedCloseDate('');
        fetchDeals();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to create deal');
      }
    } catch (err) {
      toast.error('Request failed');
    }
  }

  async function deleteDeal(id: string) {
    if (!confirm('Are you sure you want to delete this deal?')) return;
    try {
      const res = await fetch('/api/admin/crm/deals', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        toast.success('Deal deleted');
        fetchDeals();
      } else {
        toast.error('Failed to delete deal');
      }
    } catch (err) {
      toast.error('Request failed');
    }
  }

  async function updateDealStage(id: string, newStage: string) {
    try {
      const res = await fetch('/api/admin/crm/deals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, stage: newStage })
      });
      if (res.ok) {
        toast.success(`Deal moved to ${newStage}`);
        fetchDeals();
      } else {
        toast.error('Failed to update stage');
        fetchDeals(); // Revert optimism
      }
    } catch (err) {
      toast.error('Request failed');
      fetchDeals();
    }
  }

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    setDraggedDealId(dealId);
    e.dataTransfer.effectAllowed = 'move';
    // Small delay to prevent visual glitch on drag start
    setTimeout(() => {
      e.target && (e.target as HTMLElement).classList.add('opacity-50');
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.target && (e.target as HTMLElement).classList.remove('opacity-50');
    setDraggedDealId(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, stage: string) => {
    e.preventDefault();
    if (draggedDealId) {
      const deal = deals.find(d => d._id === draggedDealId);
      if (deal && deal.stage !== stage) {
        // Optimistic UI update
        setDeals(prev => prev.map(d => d._id === draggedDealId ? { ...d, stage } : d));
        updateDealStage(draggedDealId, stage);
      }
    }
  };

  const filteredDeals = deals.filter(deal => 
    deal.title.toLowerCase().includes(search.toLowerCase()) ||
    (deal.contact && deal.contact.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative min-h-[80vh]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-secondary tracking-tighter uppercase mb-2">Deals Pipeline</h1>
          <p className="text-gray-500 font-medium text-sm">Drag and drop opportunities to manage the sales cycle.</p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="bg-primary text-white hover:bg-primary/95 text-xs font-black uppercase tracking-widest px-6 py-3 flex items-center shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Deal
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white border border-gray-200 p-4 flex gap-4 items-center shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search deals by title or contact name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs border border-gray-200 focus:border-primary focus:outline-none placeholder-gray-400 font-medium"
          />
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex overflow-x-auto pb-4 gap-6 items-start h-[calc(100vh-280px)] custom-scrollbar">
        {loading ? (
          <div className="flex w-full gap-6">
            {[1, 2, 3, 4].map(col => (
              <div key={col} className="w-[300px] flex-shrink-0 bg-gray-50 border border-gray-200 p-4 rounded-none min-h-[500px]">
                <div className="h-6 bg-gray-200 w-1/2 mb-4 animate-pulse"></div>
                <div className="h-24 bg-gray-200 w-full mb-3 animate-pulse"></div>
                <div className="h-24 bg-gray-200 w-full animate-pulse"></div>
              </div>
            ))}
          </div>
        ) : (
          STAGES.map(stage => {
            const stageDeals = filteredDeals.filter(d => d.stage === stage);
            const stageValue = stageDeals.reduce((sum, d) => sum + (d.value || 0), 0);
            
            return (
              <div 
                key={stage}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage)}
                className="w-[300px] flex-shrink-0 bg-gray-50/50 border border-gray-200 p-3 flex flex-col h-full"
              >
                {/* Stage Header */}
                <div className="mb-4 pb-2 border-b border-gray-200">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="text-xs font-black text-secondary uppercase tracking-widest">{stage}</h3>
                    <span className="text-[10px] bg-white border border-gray-200 px-2 py-0.5 font-bold text-gray-500">
                      {stageDeals.length}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">
                    ${stageValue.toLocaleString()}
                  </p>
                </div>

                {/* Deal Cards */}
                <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
                  {stageDeals.map(deal => (
                    <div
                      key={deal._id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, deal._id)}
                      onDragEnd={handleDragEnd}
                      className="bg-white border border-gray-200 p-3 cursor-grab hover:border-primary/50 transition-colors shadow-sm relative group"
                    >
                      <button
                        onClick={() => deleteDeal(deal._id)}
                        className="absolute top-2 right-2 p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete Deal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      
                      <h4 className="text-xs font-black text-secondary pr-6 mb-2 line-clamp-2 leading-snug">{deal.title}</h4>
                      
                      {deal.contact && (
                        <div className="flex items-center text-[10px] text-gray-500 mb-1 font-medium">
                          <User className="w-3 h-3 mr-1.5 text-gray-400" />
                          <span className="truncate">{deal.contact.name}</span>
                        </div>
                      )}
                      
                      {deal.contact?.company && (
                        <div className="flex items-center text-[10px] text-gray-500 mb-3 font-medium">
                          <Building2 className="w-3 h-3 mr-1.5 text-gray-400" />
                          <span className="truncate">{deal.contact.company}</span>
                        </div>
                      )}

                      <div className="flex justify-between items-center pt-2 border-t border-gray-100 mt-2">
                        <span className="text-xs font-black text-primary tracking-widest">
                          ${(deal.value || 0).toLocaleString()}
                        </span>
                        {deal.expectedCloseDate && (
                          <div className="flex items-center text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                            <Clock className="w-3 h-3 mr-1 text-gray-300" />
                            {new Date(deal.expectedCloseDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {stageDeals.length === 0 && (
                    <div className="text-center py-6 border-2 border-dashed border-gray-200 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                      Drop deals here
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* CREATE DEAL MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-secondary/50 backdrop-blur-sm" onClick={() => setIsCreateOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-full md:w-[450px] bg-white shadow-2xl flex flex-col p-6 animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-6">
              <h2 className="text-lg font-black text-secondary tracking-tight uppercase">New Opportunity</h2>
              <button onClick={() => setIsCreateOpen(false)} className="p-1 text-gray-400 hover:text-secondary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDeal} className="flex-1 overflow-y-auto space-y-4 pr-1">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Deal Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 text-xs border border-gray-200 focus:border-primary focus:outline-none"
                  placeholder="e.g. 5x Hematology Analyzers"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Associated Contact *</label>
                <select
                  required
                  value={newContact}
                  onChange={(e) => setNewContact(e.target.value)}
                  className="w-full p-2.5 text-xs border border-gray-200 focus:border-primary focus:outline-none text-gray-600"
                >
                  <option value="">Select a contact...</option>
                  {contacts.map(c => (
                    <option key={c._id} value={c._id}>{c.name} {c.company ? `(${c.company})` : ''}</option>
                  ))}
                </select>
                {contacts.length === 0 && (
                  <p className="text-[10px] text-amber-600 mt-1">No contacts available. Please create a contact first.</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Estimated Value ($)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    className="w-full pl-9 pr-4 p-2.5 text-xs border border-gray-200 focus:border-primary focus:outline-none"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Pipeline Stage</label>
                <select
                  value={newStage}
                  onChange={(e) => setNewStage(e.target.value)}
                  className="w-full p-2.5 text-xs border border-gray-200 focus:border-primary focus:outline-none text-gray-600"
                >
                  {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Expected Close Date</label>
                <input
                  type="date"
                  value={newExpectedCloseDate}
                  onChange={(e) => setNewExpectedCloseDate(e.target.value)}
                  className="w-full p-2.5 text-xs border border-gray-200 focus:border-primary focus:outline-none text-gray-600"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-white hover:bg-primary/95 text-xs font-black uppercase tracking-widest py-3 mt-4"
              >
                Create Deal
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
