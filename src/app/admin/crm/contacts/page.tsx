'use client';

import React, { useState, useEffect, Fragment, useRef } from 'react';
import { 
  Search, 
  Plus, 
  Filter as FilterIcon, 
  ChevronDown, 
  ChevronUp, 
  Upload, 
  Download, 
  UserPlus, 
  Trash2, 
  Mail, 
  FileText, 
  MessageSquare, 
  MoreVertical, 
  Star, 
  Edit, 
  Send, 
  Layers, 
  Bell, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  Phone,
  Check,
  Tag,
  Clock,
  CheckCircle2,
  Bookmark
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function ActiveCustomerPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'deactive' | 'favorite' | 'duplicate'>('active');
  const [tabCounts, setTabCounts] = useState({ active: 0, deactive: 0, favorite: 0, duplicate: 0 });

  // Search & Pagination
  const [search, setSearch] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  // Expanded row IDs
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isTagOpen, setIsTagOpen] = useState(false);
  const [isReminderOpen, setIsReminderOpen] = useState(false);
  const [isEmailOpen, setIsEmailOpen] = useState(false);
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [isSendOpen, setIsSendOpen] = useState(false);

  // Selected item for modals
  const [currentCustomer, setCurrentCustomer] = useState<any>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    gstNo: '',
    address: '',
    dob: '',
    anniversaryDate: '',
    convertedBy: 'Pooja Sharma',
    rating: 0,
    status: 'Active' as 'Active' | 'Deactive',
    isFavorite: false
  });

  const [assigneeName, setAssigneeName] = useState('Pooja Sharma');
  const [tagInput, setTagInput] = useState('');
  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderDate, setReminderDate] = useState(new Date().toISOString().split('T')[0]);
  const [reminderPriority, setReminderPriority] = useState('High');
  const [noteContent, setNoteContent] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [proposalType, setProposalType] = useState('Standard Product Quotation');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, [activeTab, page, limit]);

  async function fetchCustomers() {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        tab: activeTab,
        page: page.toString(),
        limit: limit.toString(),
        search
      });
      const res = await fetch(`/api/admin/crm/contacts?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCustomers(data.contacts || []);
        setTotal(data.pagination?.total || 0);
        if (data.tabCounts) {
          setTabCounts(data.tabCounts);
        }
        // Auto-expand first row if only 1 item like in screenshot
        if (data.contacts?.length === 1) {
          setExpandedRows({ [data.contacts[0]._id]: true });
        }
      } else {
        toast.error('Failed to load customers');
      }
    } catch (err) {
      toast.error('Network error loading customers');
    } finally {
      setLoading(false);
    }
  }

  // Toggle single row accordion
  function toggleRow(id: string) {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  }

  // Toggle select all
  function toggleSelectAll() {
    if (selectedCustomerIds.length === customers.length) {
      setSelectedCustomerIds([]);
    } else {
      setSelectedCustomerIds(customers.map(c => c._id));
    }
  }

  // Toggle select single
  function toggleSelectCustomer(id: string) {
    setSelectedCustomerIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }

  // Open Edit Modal
  function handleOpenEdit(customer: any) {
    setCurrentCustomer(customer);
    setFormData({
      name: customer.name || '',
      company: customer.company || '',
      email: customer.email || '',
      phone: customer.phone || '',
      gstNo: customer.gstNo || '',
      address: customer.address || '',
      dob: customer.dob || '',
      anniversaryDate: customer.anniversaryDate || '',
      convertedBy: customer.convertedBy || 'Pooja Sharma',
      rating: customer.rating || 0,
      status: customer.status === 'Deactive' ? 'Deactive' : 'Active',
      isFavorite: !!customer.isFavorite
    });
    setIsEditOpen(true);
    setActiveMenuId(null);
  }

  // Submit Edit
  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!currentCustomer) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/crm/contacts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentCustomer._id,
          ...formData
        })
      });
      if (res.ok) {
        toast.success('Customer updated successfully');
        setIsEditOpen(false);
        fetchCustomers();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to update customer');
      }
    } catch (err) {
      toast.error('Error saving customer');
    } finally {
      setSubmitting(false);
    }
  }

  // Add customer handler
  async function handleAddCustomer(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/crm/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        toast.success('Customer added successfully!');
        setIsAddOpen(false);
        setFormData({
          name: '',
          company: '',
          email: '',
          phone: '',
          gstNo: '',
          address: '',
          dob: '',
          anniversaryDate: '',
          convertedBy: 'Pooja Sharma',
          rating: 0,
          status: 'Active',
          isFavorite: false
        });
        fetchCustomers();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to add customer');
      }
    } catch (err) {
      toast.error('Error submitting customer form');
    } finally {
      setSubmitting(false);
    }
  }

  // Assign Executive Submit
  async function handleAssignExecutive(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const targetIds = currentCustomer ? [currentCustomer._id] : selectedCustomerIds;
    if (targetIds.length === 0) {
      toast.error('No customer selected');
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/admin/crm/contacts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: targetIds,
          convertedBy: assigneeName
        })
      });
      if (res.ok) {
        toast.success(`Assigned to ${assigneeName}`);
        setIsAssignOpen(false);
        fetchCustomers();
      } else {
        toast.error('Failed to assign');
      }
    } catch (err) {
      toast.error('Error saving assignment');
    } finally {
      setSubmitting(false);
    }
  }

  // Add Tag Submit
  async function handleSaveTag(e: React.FormEvent) {
    e.preventDefault();
    if (!currentCustomer || !tagInput.trim()) return;
    setSubmitting(true);
    try {
      const existingTags = currentCustomer.tags || [];
      const updatedTags = Array.from(new Set([...existingTags, tagInput.trim()]));
      const res = await fetch('/api/admin/crm/contacts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentCustomer._id,
          tags: updatedTags
        })
      });
      if (res.ok) {
        toast.success(`Tag "${tagInput}" added`);
        setTagInput('');
        setIsTagOpen(false);
        fetchCustomers();
      } else {
        toast.error('Failed to add tag');
      }
    } catch (err) {
      toast.error('Error adding tag');
    } finally {
      setSubmitting(false);
    }
  }

  // Set Reminder Submit (Creates a CRM Task linked to this customer)
  async function handleSetReminder(e: React.FormEvent) {
    e.preventDefault();
    if (!currentCustomer) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/crm/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: reminderTitle || `Followup with ${currentCustomer.name}`,
          description: `Reminder for customer ${currentCustomer.name} (${currentCustomer.company || ''})`,
          dueDate: new Date(reminderDate).toISOString(),
          priority: reminderPriority,
          status: 'New',
          contact: currentCustomer._id
        })
      });
      if (res.ok) {
        toast.success('Reminder task scheduled!');
        setIsReminderOpen(false);
        setReminderTitle('');
      } else {
        toast.error('Failed to schedule reminder');
      }
    } catch (err) {
      toast.error('Error creating reminder task');
    } finally {
      setSubmitting(false);
    }
  }

  // Add Note Submit (Creates an activity)
  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!currentCustomer || !noteContent.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/crm/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact: currentCustomer._id,
          type: 'Note',
          subject: 'Customer Note',
          description: noteContent.trim()
        })
      });
      if (res.ok) {
        toast.success('Note logged for customer');
        setNoteContent('');
        setIsNoteOpen(false);
      } else {
        toast.error('Failed to save note');
      }
    } catch (err) {
      toast.error('Error saving note');
    } finally {
      setSubmitting(false);
    }
  }

  // Send Proposal / Quotation Submit
  async function handleSendProposal(e: React.FormEvent) {
    e.preventDefault();
    if (!currentCustomer) return;
    setSubmitting(true);
    try {
      await new Promise(r => setTimeout(r, 600)); // simulate quick dispatch
      toast.success(`${proposalType} sent to ${currentCustomer.email}`);
      setIsSendOpen(false);
    } finally {
      setSubmitting(false);
    }
  }

  // Send Email Submit
  function handleSendEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!currentCustomer) return;
    window.open(`mailto:${currentCustomer.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`);
    setIsEmailOpen(false);
    toast.success('Email client opened');
  }

  // Open WhatsApp
  function handleOpenWhatsApp(phone: string, name: string) {
    if (!phone) {
      toast.error('No phone number available');
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    const msg = encodeURIComponent(`Hello ${name}, this is from LabZenix Industries. How may we assist you today?`);
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
  }

  // Toggle Favorite
  async function toggleFavorite(customer: any) {
    try {
      const newFav = !customer.isFavorite;
      await fetch('/api/admin/crm/contacts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: customer._id, isFavorite: newFav })
      });
      toast.success(newFav ? 'Added to Favorites' : 'Removed from Favorites');
      fetchCustomers();
      setActiveMenuId(null);
    } catch (err) {
      toast.error('Error updating favorite');
    }
  }

  // Toggle Deactivate / Activate
  async function toggleStatus(customer: any) {
    try {
      const newStatus = customer.status === 'Deactive' ? 'Active' : 'Deactive';
      await fetch('/api/admin/crm/contacts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: customer._id, status: newStatus })
      });
      toast.success(`Customer marked as ${newStatus}`);
      fetchCustomers();
      setActiveMenuId(null);
    } catch (err) {
      toast.error('Error updating status');
    }
  }

  // Update Rating
  async function updateRating(id: string, rating: number) {
    try {
      setCustomers(prev => prev.map(c => c._id === id ? { ...c, rating } : c));
      await fetch('/api/admin/crm/contacts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, rating })
      });
      toast.success('Rating updated');
    } catch (err) {
      toast.error('Failed to update rating');
    }
  }

  // Delete Single Customer
  async function handleDeleteSingle(id: string) {
    if (!confirm('Are you sure you want to delete this customer?')) return;
    try {
      const res = await fetch('/api/admin/crm/contacts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        toast.success('Customer deleted');
        fetchCustomers();
      } else {
        toast.error('Failed to delete customer');
      }
    } catch (err) {
      toast.error('Error deleting');
    }
    setActiveMenuId(null);
  }

  // Bulk Delete
  async function handleBulkDelete() {
    if (selectedCustomerIds.length === 0) {
      toast('Please select customers to delete', { icon: '⚠️' });
      return;
    }
    if (!confirm(`Delete ${selectedCustomerIds.length} customer(s)?`)) return;

    try {
      const res = await fetch('/api/admin/crm/contacts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedCustomerIds })
      });
      if (res.ok) {
        toast.success(`${selectedCustomerIds.length} customer(s) deleted`);
        setSelectedCustomerIds([]);
        fetchCustomers();
      } else {
        toast.error('Failed to delete');
      }
    } catch (err) {
      toast.error('Error during deletion');
    }
  }

  // CSV Import handler
  async function handleFileImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const rows = text.split('\n').filter(r => r.trim().length > 0);
        if (rows.length < 2) {
          toast.error('CSV file is empty or missing headers');
          return;
        }

        let importedCount = 0;
        // Parse CSV rows skipping header
        for (let i = 1; i < rows.length; i++) {
          const cols = rows[i].split(',').map(c => c.replace(/^["']|["']$/g, '').trim());
          if (cols.length >= 2 && cols[1].includes('@')) {
            await fetch('/api/admin/crm/contacts', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: cols[0] || 'Imported Customer',
                email: cols[1],
                phone: cols[2] || '',
                company: cols[3] || '',
                status: 'Active',
                source: 'CSV Import'
              })
            });
            importedCount++;
          }
        }
        toast.success(`Imported ${importedCount} customers successfully!`);
        fetchCustomers();
      } catch (err) {
        toast.error('Error parsing CSV file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  return (
    <div className="space-y-4 max-w-[1700px] mx-auto pb-12 font-sans select-none text-slate-800">
      
      {/* Hidden File Input for CSV Import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileImport}
        className="hidden"
      />

      {/* Top Header Bar Matching Screenshot 3 */}
      <div className="bg-white rounded-xl border border-slate-200/80 px-3.5 sm:px-5 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        
        {/* Title */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Active Customer</h1>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          
          {/* Search Trigger */}
          {isSearchOpen ? (
            <div className="flex items-center relative w-full sm:w-auto">
              <input
                type="text"
                autoFocus
                placeholder="Search customers..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && fetchCustomers()}
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

          {/* + Add Customer Button Matching Screenshot 3 */}
          <button
            onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center px-3 sm:px-4 py-1.5 text-xs font-bold text-white bg-[#372b7b] hover:bg-[#2e236b] rounded-lg shadow-xs transition"
          >
            <Plus className="w-4 h-4 mr-1" />
            <span>Add Customer</span>
          </button>

          {/* Filter Dropdown */}
          <button 
            onClick={() => fetchCustomers()}
            className="inline-flex items-center px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-lg transition"
          >
            <FilterIcon className="w-3.5 h-3.5 mr-1 text-slate-500" />
            <span>Filter</span>
            <ChevronDown className="w-3 h-3 ml-1 text-slate-400" />
          </button>

        </div>
      </div>

      {/* Sub-Tabs & Action Toolbar Matching Screenshot 3 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        
        {/* Left Tabs: Active, Deactive, Favorite, Duplicate */}
        <div className="flex items-center space-x-4 sm:space-x-6 overflow-x-auto pb-1.5 scroll-smooth border-b border-transparent">
          <button
            onClick={() => { setActiveTab('active'); setPage(1); }}
            className={`pb-1.5 text-sm font-semibold transition relative flex items-center space-x-1.5 shrink-0 whitespace-nowrap ${
              activeTab === 'active' ? 'text-[#372b7b]' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Active</span>
            <span className="bg-[#ede9fe] text-[#5b21b6] text-xs px-2 py-0.2 rounded-full font-bold">
              {tabCounts.active}
            </span>
            {activeTab === 'active' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#372b7b] rounded-full" />
            )}
          </button>

          <button
            onClick={() => { setActiveTab('deactive'); setPage(1); }}
            className={`pb-1.5 text-sm font-semibold transition relative flex items-center space-x-1.5 shrink-0 whitespace-nowrap ${
              activeTab === 'deactive' ? 'text-[#372b7b]' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Deactive</span>
            <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.2 rounded-full font-bold">
              {tabCounts.deactive}
            </span>
            {activeTab === 'deactive' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#372b7b] rounded-full" />
            )}
          </button>

          <button
            onClick={() => { setActiveTab('favorite'); setPage(1); }}
            className={`pb-1.5 text-sm font-semibold transition relative flex items-center space-x-1.5 shrink-0 whitespace-nowrap ${
              activeTab === 'favorite' ? 'text-[#372b7b]' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Favorite</span>
            <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.2 rounded-full font-bold">
              {tabCounts.favorite}
            </span>
            {activeTab === 'favorite' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#372b7b] rounded-full" />
            )}
          </button>

          <button
            onClick={() => { setActiveTab('duplicate'); setPage(1); }}
            className={`pb-1.5 text-sm font-semibold transition relative flex items-center space-x-1.5 shrink-0 whitespace-nowrap ${
              activeTab === 'duplicate' ? 'text-[#372b7b]' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Duplicate</span>
            <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.2 rounded-full font-bold">
              {tabCounts.duplicate}
            </span>
            {activeTab === 'duplicate' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#372b7b] rounded-full" />
            )}
          </button>
        </div>

        {/* Right Action Icons Toolbar Matching Screenshot 3 */}
        <div className="flex items-center space-x-1 bg-white border border-slate-200/80 p-1 rounded-lg shadow-2xs overflow-x-auto max-w-full shrink-0">
          
          {/* Cloud Upload (Import CSV) */}
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition" 
            title="Import Customers from CSV"
          >
            <Upload className="w-4 h-4" />
          </button>

          {/* Cloud Download (Export) */}
          <button 
            onClick={() => {
              const csvContent = "data:text/csv;charset=utf-8," + ["Name,Email,Phone,Company,ConvertedDate"].concat(customers.map(c => `"${c.name}","${c.email}","${c.phone || ''}","${c.company || ''}","${c.convertedDate || ''}"`)).join("\n");
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", `customers_${new Date().toISOString().split('T')[0]}.csv`);
              document.body.appendChild(link);
              link.click();
              toast.success('Customers exported to CSV');
            }}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition" 
            title="Export Customers"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Bulk Assign user */}
          <button 
            onClick={() => {
              if (selectedCustomerIds.length === 0) {
                toast('Select customer(s) to assign', { icon: 'ℹ️' });
                return;
              }
              setCurrentCustomer(null);
              setIsAssignOpen(true);
            }}
            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded transition" 
            title="Assign Executive to Selected"
          >
            <UserPlus className="w-4 h-4" />
          </button>

          {/* Bulk Delete */}
          <button 
            onClick={handleBulkDelete}
            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition" 
            title="Delete Selected"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Mail */}
          <button 
            onClick={() => {
              if (selectedCustomerIds.length === 0 && customers.length > 0) {
                setCurrentCustomer(customers[0]);
              } else if (selectedCustomerIds.length > 0) {
                setCurrentCustomer(customers.find(c => c._id === selectedCustomerIds[0]));
              }
              setIsEmailOpen(true);
            }}
            className="p-1.5 text-purple-600 hover:bg-purple-50 rounded transition" 
            title="Send Email"
          >
            <Mail className="w-4 h-4" />
          </button>

          {/* Note */}
          <button 
            onClick={() => {
              if (selectedCustomerIds.length === 0 && customers.length > 0) {
                setCurrentCustomer(customers[0]);
              } else if (selectedCustomerIds.length > 0) {
                setCurrentCustomer(customers.find(c => c._id === selectedCustomerIds[0]));
              }
              setIsNoteOpen(true);
            }}
            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded transition" 
            title="Add Note"
          >
            <FileText className="w-4 h-4" />
          </button>

          {/* WhatsApp */}
          <button 
            onClick={() => {
              const target = selectedCustomerIds.length > 0 
                ? customers.find(c => c._id === selectedCustomerIds[0]) 
                : customers[0];
              if (target) {
                handleOpenWhatsApp(target.phone, target.name);
              } else {
                toast.error('No customer selected');
              }
            }}
            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition" 
            title="Open WhatsApp"
          >
            <MessageSquare className="w-4 h-4" />
          </button>

          {/* Refresh / 3-dots */}
          <button 
            onClick={() => fetchCustomers()}
            className="p-1.5 text-slate-500 hover:bg-slate-100 rounded transition" 
            title="Refresh Customers"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Main Customers Table Matching Screenshot 3 */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            
            {/* Deep Navy/Purple Table Header */}
            <thead className="bg-[#2b2553] text-white">
              <tr>
                <th className="py-3 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={customers.length > 0 && selectedCustomerIds.length === customers.length}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-400 text-indigo-600 focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-2 w-8 text-center">
                  <ChevronDown className="w-4 h-4 mx-auto text-slate-300" />
                </th>
                <th className="py-3 px-3 w-12 text-center font-bold">No.</th>
                <th className="py-3 px-4 font-bold">Actions</th>
                <th className="py-3 px-4 font-bold">Customer Name</th>
                <th className="py-3 px-4 font-bold">Email</th>
                <th className="py-3 px-4 font-bold">Phone</th>
                <th className="py-3 px-4 font-bold">Converted Date</th>
                <th className="py-3 px-4 font-bold">Converted By</th>
                <th className="py-3 px-4 font-bold">Rating</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-100">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center text-slate-400">
                    No active customers to display
                  </td>
                </tr>
              ) : (
                customers.map((c, index) => {
                  const isExpanded = !!expandedRows[c._id];
                  const isSelected = selectedCustomerIds.includes(c._id);
                  const isMenuOpen = activeMenuId === c._id;

                  return (
                    <Fragment key={c._id}>
                      {/* Main Customer Row */}
                      <tr className={`hover:bg-slate-50/80 transition ${isSelected ? 'bg-indigo-50/30' : ''}`}>
                        {/* Checkbox */}
                        <td className="py-3.5 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectCustomer(c._id)}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-0 cursor-pointer"
                          />
                        </td>

                        {/* Expand Accordion Toggle */}
                        <td className="py-3.5 px-2 text-center cursor-pointer" onClick={() => toggleRow(c._id)}>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-slate-500 mx-auto" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-500 mx-auto" />
                          )}
                        </td>

                        {/* Row Index */}
                        <td className="py-3.5 px-3 text-center text-slate-700 font-semibold">
                          {(page - 1) * limit + index + 1}
                        </td>

                        {/* Actions Row Matching Screenshot 3 */}
                        <td className="py-3.5 px-4 relative">
                          <div className="flex items-center space-x-1.5 text-slate-400">
                            
                            {/* Edit (Orange Pencil) */}
                            <button 
                              onClick={() => handleOpenEdit(c)}
                              className="text-amber-500 hover:text-amber-600 hover:scale-110 transition p-1" 
                              title="Edit Customer Details"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            {/* Assign Executive (User+) */}
                            <button 
                              onClick={() => {
                                setCurrentCustomer(c);
                                setAssigneeName(c.convertedBy || 'Pooja Sharma');
                                setIsAssignOpen(true);
                              }}
                              className="text-rose-500 hover:text-rose-600 hover:scale-110 transition p-1" 
                              title="Assign Executive"
                            >
                              <UserPlus className="w-3.5 h-3.5" />
                            </button>

                            {/* Send Email */}
                            <button 
                              onClick={() => {
                                setCurrentCustomer(c);
                                setEmailSubject(`LabZenix - Following up with ${c.name}`);
                                setIsEmailOpen(true);
                              }}
                              className="text-purple-600 hover:text-purple-700 hover:scale-110 transition p-1" 
                              title="Send Email"
                            >
                              <Mail className="w-3.5 h-3.5" />
                            </button>

                            {/* WhatsApp (Green) */}
                            <button 
                              onClick={() => handleOpenWhatsApp(c.phone, c.name)}
                              className="text-emerald-600 hover:text-emerald-700 hover:scale-110 transition p-1" 
                              title="Chat on WhatsApp"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                            </button>

                            {/* Send Proposal / Message */}
                            <button 
                              onClick={() => {
                                setCurrentCustomer(c);
                                setIsSendOpen(true);
                              }}
                              className="text-blue-500 hover:text-blue-600 hover:scale-110 transition p-1" 
                              title="Send Quotation / Proposal"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>

                            {/* Stack/Layers icon (Manage Tags) */}
                            <button 
                              onClick={() => {
                                setCurrentCustomer(c);
                                setIsTagOpen(true);
                              }}
                              className="text-indigo-500 hover:text-indigo-600 hover:scale-110 transition p-1" 
                              title="Manage Tags"
                            >
                              <Layers className="w-3.5 h-3.5" />
                            </button>

                            {/* Notification Bell (Set Task Reminder) */}
                            <button 
                              onClick={() => {
                                setCurrentCustomer(c);
                                setReminderTitle(`Followup with ${c.name} regarding order`);
                                setIsReminderOpen(true);
                              }}
                              className="text-amber-500 hover:text-amber-600 hover:scale-110 transition p-1" 
                              title="Schedule Reminder Task"
                            >
                              <Bell className="w-3.5 h-3.5" />
                            </button>

                            {/* 3-dots Menu Button */}
                            <div className="relative">
                              <button 
                                onClick={() => setActiveMenuId(isMenuOpen ? null : c._id)}
                                className="text-slate-400 hover:text-slate-600 hover:scale-110 transition p-1" 
                                title="More Actions"
                              >
                                <MoreVertical className="w-3.5 h-3.5" />
                              </button>

                              {/* Dropdown Menu */}
                              {isMenuOpen && (
                                <div className="absolute left-0 top-full mt-1 w-44 bg-white rounded-lg shadow-xl border border-slate-200 z-30 py-1 text-xs animate-in fade-in zoom-in-95">
                                  <button
                                    onClick={() => handleOpenEdit(c)}
                                    className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center text-slate-700"
                                  >
                                    <Edit className="w-3.5 h-3.5 mr-2 text-amber-500" />
                                    Edit Customer
                                  </button>
                                  <button
                                    onClick={() => toggleFavorite(c)}
                                    className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center text-slate-700"
                                  >
                                    <Bookmark className="w-3.5 h-3.5 mr-2 text-indigo-500" />
                                    {c.isFavorite ? 'Remove Favorite' : 'Mark as Favorite'}
                                  </button>
                                  <button
                                    onClick={() => toggleStatus(c)}
                                    className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center text-slate-700"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5 mr-2 text-emerald-500" />
                                    {c.status === 'Deactive' ? 'Mark as Active' : 'Deactivate'}
                                  </button>
                                  <div className="border-t border-slate-100 my-1" />
                                  <button
                                    onClick={() => handleDeleteSingle(c._id)}
                                    className="w-full text-left px-3 py-1.5 hover:bg-rose-50 flex items-center text-rose-600 font-semibold"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 mr-2 text-rose-500" />
                                    Delete Customer
                                  </button>
                                </div>
                              )}
                            </div>

                          </div>
                        </td>

                        {/* Customer Name (Blue Clickable Link) */}
                        <td 
                          onClick={() => toggleRow(c._id)}
                          className="py-3.5 px-4 font-semibold text-blue-600 hover:underline cursor-pointer"
                        >
                          {c.name}
                        </td>

                        {/* Email */}
                        <td className="py-3.5 px-4 text-slate-600 max-w-[180px] truncate">
                          {c.email}
                        </td>

                        {/* Phone */}
                        <td className="py-3.5 px-4 text-slate-700 font-medium">
                          {c.phone || '-'}
                        </td>

                        {/* Converted Date */}
                        <td className="py-3.5 px-4 text-slate-600">
                          {new Date(c.convertedDate || c.createdAt).toLocaleDateString()}{' '}
                          {new Date(c.convertedDate || c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>

                        {/* Converted By */}
                        <td className="py-3.5 px-4 text-slate-700 font-medium">
                          {c.convertedBy || 'Pooja Sharma'}
                        </td>

                        {/* Rating (5 Stars) */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-0.5">
                            {[1, 2, 3, 4, 5].map(star => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => updateRating(c._id, star === c.rating ? 0 : star)}
                                className="hover:scale-110 transition"
                              >
                                <Star 
                                  className={`w-3.5 h-3.5 ${
                                    star <= (c.rating || 0)
                                      ? 'text-amber-400 fill-amber-400'
                                      : 'text-slate-200'
                                  }`} 
                                />
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>

                      {/* Expandable 2-Column Accordion Card Matching Screenshot 3 */}
                      {isExpanded && (
                        <tr className="bg-slate-50/70 border-b border-slate-200">
                          <td colSpan={10} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-8 text-xs text-slate-700 max-w-4xl">
                              
                              {/* Left Column */}
                              <div className="space-y-2">
                                <p><span className="font-semibold text-slate-900 w-36 inline-block">Customer Name :</span> {c.name}</p>
                                <p><span className="font-semibold text-slate-900 w-36 inline-block">Company Name :</span> {c.company || '-'}</p>
                                <p><span className="font-semibold text-slate-900 w-36 inline-block">Email :</span> {c.email}</p>
                                <p><span className="font-semibold text-slate-900 w-36 inline-block">Phone :</span> {c.phone || '-'}</p>
                                <p><span className="font-semibold text-slate-900 w-36 inline-block">GST No :</span> {c.gstNo || '-'}</p>
                                <p><span className="font-semibold text-slate-900 w-36 inline-block">Address :</span> {c.address || '-'}</p>
                              </div>

                              {/* Right Column */}
                              <div className="space-y-2">
                                <p><span className="font-semibold text-slate-900 w-36 inline-block">Date Of Birth :</span> {c.dob || '-'}</p>
                                <p><span className="font-semibold text-slate-900 w-36 inline-block">Anniversary Date :</span> {c.anniversaryDate || '-'}</p>
                                <p><span className="font-semibold text-slate-900 w-36 inline-block">Created By :</span> {c.owner?.name || 'LabZenix Industries'}</p>
                                <p><span className="font-semibold text-slate-900 w-36 inline-block">Converted By :</span> {c.convertedBy || 'Pooja Sharma'}</p>
                                <p><span className="font-semibold text-slate-900 w-36 inline-block">Converted Date :</span> {new Date(c.convertedDate || c.createdAt).toLocaleDateString()} {new Date(c.convertedDate || c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                <p><span className="font-semibold text-slate-900 w-36 inline-block">Assign Tag :</span> {c.tags?.join(', ') || '-'}</p>
                              </div>

                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Footer Matching Screenshot 3 */}
        <div className="px-5 py-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-3">
          <div className="flex items-center space-x-2">
            <span>Rows per page:</span>
            <select
              value={limit}
              onChange={e => { setLimit(parseInt(e.target.value)); setPage(1); }}
              className="border border-slate-200 rounded px-2 py-0.5 bg-white text-slate-700 focus:outline-hidden"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
            <span className="ml-4">
              {total > 0 ? `${(page - 1) * limit + 1} - ${Math.min(page * limit, total)} of ${total}` : '0 - 0 of 0'}
            </span>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-semibold text-slate-800">
              {page} of {Math.max(1, Math.ceil(total / limit))}
            </span>
            <button
              onClick={() => setPage(p => Math.min(Math.ceil(total / limit), p + 1))}
              disabled={page >= Math.ceil(total / limit)}
              className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(Math.ceil(total / limit))}
              disabled={page >= Math.ceil(total / limit)}
              className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* 1. Add Customer Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 border border-slate-100 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-900">Add New Active Customer</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomer} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vinod Kumar N"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rakshini Colour Coats"
                    value={formData.company}
                    onChange={e => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. vinod@rakshinicoats.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 919916583133"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">GST Number</label>
                  <input
                    type="text"
                    placeholder="29AAAAA0000A1Z5"
                    value={formData.gstNo}
                    onChange={e => setFormData({ ...formData, gstNo: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Converted By</label>
                  <input
                    type="text"
                    placeholder="e.g. Pooja Sharma"
                    value={formData.convertedBy}
                    onChange={e => setFormData({ ...formData, convertedBy: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Address</label>
                <input
                  type="text"
                  placeholder="No. 7/12, 15th Cross, Magadi Road, Bengaluru, Karnataka"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date Of Birth</label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={e => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Anniversary Date</label>
                  <input
                    type="date"
                    value={formData.anniversaryDate}
                    onChange={e => setFormData({ ...formData, anniversaryDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
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
                  {submitting ? 'Saving...' : 'Add Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Edit Customer Modal */}
      {isEditOpen && currentCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 border border-slate-100 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-900">Edit Customer: {currentCustomer.name}</h3>
              <button onClick={() => setIsEditOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={e => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">GST Number</label>
                  <input
                    type="text"
                    value={formData.gstNo}
                    onChange={e => setFormData({ ...formData, gstNo: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Converted By</label>
                  <input
                    type="text"
                    value={formData.convertedBy}
                    onChange={e => setFormData({ ...formData, convertedBy: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Deactive">Deactive</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Rating (1-5)</label>
                  <select
                    value={formData.rating}
                    onChange={e => setFormData({ ...formData, rating: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-white"
                  >
                    <option value="0">No Rating</option>
                    <option value="1">1 Star</option>
                    <option value="2">2 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="5">5 Stars</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-white bg-[#372b7b] hover:bg-[#2e236b] rounded-lg font-semibold shadow-xs disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Assign Executive Modal */}
      {isAssignOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-slate-900 mb-3">Assign Executive</h3>
            <p className="text-xs text-slate-500 mb-4">
              Assign {currentCustomer ? currentCustomer.name : `${selectedCustomerIds.length} selected customer(s)`} to an account manager:
            </p>

            <form onSubmit={handleAssignExecutive} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Executive Name</label>
                <select
                  value={assigneeName}
                  onChange={e => setAssigneeName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-white"
                >
                  <option value="Pooja Sharma">Pooja Sharma (Senior Executive)</option>
                  <option value="LabZenix Industries">LabZenix Industries (HQ Operations)</option>
                  <option value="Alok Kumar">Alok Kumar (Field Service Lead)</option>
                  <option value="Rajesh Gupta">Rajesh Gupta (Account Manager)</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAssignOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 text-white bg-[#372b7b] hover:bg-[#2e236b] rounded-lg font-semibold"
                >
                  {submitting ? 'Assigning...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Tag Customer Modal */}
      {isTagOpen && currentCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-slate-900 mb-2">Manage Customer Tags</h3>
            <p className="text-xs text-slate-500 mb-3">Add tags to categorize {currentCustomer.name}:</p>

            {/* Existing tags */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {currentCustomer.tags?.length > 0 ? (
                currentCustomer.tags.map((t: string, i: number) => (
                  <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-indigo-50 text-indigo-700 font-medium">
                    {t}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400">No tags assigned yet.</span>
              )}
            </div>

            <form onSubmit={handleSaveTag} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">New Tag Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VIP, Wholesale, Priority"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsTagOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 text-white bg-[#372b7b] hover:bg-[#2e236b] rounded-lg font-semibold"
                >
                  {submitting ? 'Adding...' : 'Add Tag'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Schedule Reminder Task Modal */}
      {isReminderOpen && currentCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Schedule Reminder / Task</h3>
            <p className="text-xs text-slate-500 mb-4">Linked to: <strong className="text-slate-800">{currentCustomer.name}</strong> ({currentCustomer.company})</p>

            <form onSubmit={handleSetReminder} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reminder Action *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Followup call regarding spectrophotometer pricing"
                  value={reminderTitle}
                  onChange={e => setReminderTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={reminderDate}
                    onChange={e => setReminderDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={reminderPriority}
                    onChange={e => setReminderPriority(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-white"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsReminderOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 text-white bg-[#372b7b] hover:bg-[#2e236b] rounded-lg font-semibold"
                >
                  {submitting ? 'Scheduling...' : 'Set Reminder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Send Proposal Modal */}
      {isSendOpen && currentCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Dispatch Proposal / Quotation</h3>
            <p className="text-xs text-slate-500 mb-4">Send document to <strong className="text-slate-800">{currentCustomer.name}</strong> ({currentCustomer.email})</p>

            <form onSubmit={handleSendProposal} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Document Type</label>
                <select
                  value={proposalType}
                  onChange={e => setProposalType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-white"
                >
                  <option value="Standard Product Quotation">Standard Product Quotation (PDF)</option>
                  <option value="AMC & Calibration Agreement">AMC & Calibration Agreement</option>
                  <option value="Lab Equipment Technical Datasheet">Lab Equipment Technical Datasheet</option>
                  <option value="Commercial Invoice Draft">Commercial Invoice Draft</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSendOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 text-white bg-[#372b7b] hover:bg-[#2e236b] rounded-lg font-semibold"
                >
                  {submitting ? 'Dispatching...' : 'Send Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Quick Email Modal */}
      {isEmailOpen && currentCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Email {currentCustomer.name}</h3>
            <p className="text-xs text-slate-500 mb-4">Recipient: <strong className="text-slate-800">{currentCustomer.email}</strong></p>

            <form onSubmit={handleSendEmail} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={emailSubject}
                  onChange={e => setEmailSubject(e.target.value)}
                  placeholder="e.g. LabZenix Product Inquiries & Support"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Message Body</label>
                <textarea
                  rows={4}
                  value={emailBody}
                  onChange={e => setEmailBody(e.target.value)}
                  placeholder="Write your email message..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEmailOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-white bg-[#372b7b] hover:bg-[#2e236b] rounded-lg font-semibold"
                >
                  Open Email Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. Quick Note Modal */}
      {isNoteOpen && currentCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Add Note for {currentCustomer.name}</h3>
            <p className="text-xs text-slate-500 mb-3">Logs an internal timeline note on this customer record.</p>

            <form onSubmit={handleAddNote} className="space-y-3.5 text-xs">
              <div>
                <textarea
                  rows={4}
                  required
                  value={noteContent}
                  onChange={e => setNoteContent(e.target.value)}
                  placeholder="e.g. Client requested customized spectrophotometer fixtures for Q4."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNoteOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 text-white bg-[#372b7b] hover:bg-[#2e236b] rounded-lg font-semibold"
                >
                  {submitting ? 'Saving...' : 'Save Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
