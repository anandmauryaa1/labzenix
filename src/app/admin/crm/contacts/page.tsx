'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  X, 
  Phone, 
  Mail, 
  Clock, 
  FileText,
  User, 
  Building2, 
  Tag, 
  Trash2,
  Calendar,
  Sparkles,
  PhoneCall,
  Activity
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ContactsManagement() {
  // Contacts list states
  const [contacts, setContacts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Selected contact details panel
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);

  // Create Contact states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newStatus, setNewStatus] = useState<'Lead' | 'Opportunity' | 'Customer' | 'Inactive'>('Lead');
  const [newNotes, setNewNotes] = useState('');

  // Call Dialer Widget states
  const [isDialing, setIsDialing] = useState(false);
  const [callTimer, setCallTimer] = useState(0);
  const [callNotes, setCallNotes] = useState('');
  const [callOutcome, setCallOutcome] = useState('Completed');
  const callIntervalRef = useRef<any>(null);

  // Email Composer states
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [isComposingEmail, setIsComposingEmail] = useState(false);

  // Note composer states
  const [noteContent, setNoteContent] = useState('');

  // Debounce search
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setPage(1);
      fetchContacts();
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [search, statusFilter]);

  // Refetch when page changes
  useEffect(() => {
    fetchContacts();
  }, [page]);

  // Fetch activities when selected contact changes
  useEffect(() => {
    if (selectedContact) {
      fetchActivities(selectedContact._id);
    }
  }, [selectedContact]);

  async function fetchContacts() {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search,
        status: statusFilter,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      const res = await fetch(`/api/admin/crm/contacts?${queryParams}`);
      if (res.ok) {
        const payload = await res.json();
        setContacts(payload.contacts);
        setTotal(payload.total);
      } else {
        toast.error('Failed to load contacts');
      }
    } catch (err) {
      toast.error('Error fetching contacts');
    } finally {
      setLoading(false);
    }
  }

  async function fetchActivities(contactId: string) {
    setActivitiesLoading(true);
    try {
      const res = await fetch(`/api/admin/crm/activities?contactId=${contactId}`);
      if (res.ok) {
        const data = await res.json();
        setActivities(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActivitiesLoading(false);
    }
  }

  // Create CRM Contact
  async function handleCreateContact(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/crm/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          email: newEmail,
          phone: newPhone,
          company: newCompany,
          jobTitle: newJobTitle,
          status: newStatus,
          notes: newNotes,
        })
      });

      if (res.ok) {
        toast.success('Contact registered successfully');
        setIsCreateOpen(false);
        // Clear fields
        setNewName('');
        setNewEmail('');
        setNewPhone('');
        setNewCompany('');
        setNewJobTitle('');
        setNewNotes('');
        fetchContacts();
      } else {
        const errData = await res.json();
        toast.error(errData.error || 'Failed to create contact');
      }
    } catch (err) {
      toast.error('Request failed');
    }
  }

  // Call Dialer Actions
  function startCall() {
    setIsDialing(true);
    setCallTimer(0);
    setCallNotes('');
    toast.success('Simulated call dialer connected');
    callIntervalRef.current = setInterval(() => {
      setCallTimer(prev => prev + 1);
    }, 1000);
  }

  async function hangUpAndLog() {
    if (callIntervalRef.current) {
      clearInterval(callIntervalRef.current);
    }
    setIsDialing(false);

    try {
      const res = await fetch('/api/admin/crm/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact: selectedContact._id,
          type: 'Call',
          subject: 'Call Log',
          description: `Logged call. Outcome: ${callOutcome}. Notes: ${callNotes || 'No notes entered.'}`,
          duration: callTimer,
          status: 'Completed'
        })
      });

      if (res.ok) {
        toast.success('Call logged to timeline');
        fetchActivities(selectedContact._id);
      } else {
        toast.error('Failed to log call activity');
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Send Email simulated
  async function sendEmailAndLog(e: React.FormEvent) {
    e.preventDefault();
    if (!emailSubject || !emailBody) {
      toast.error('Email subject and body are required');
      return;
    }

    try {
      const res = await fetch('/api/admin/crm/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact: selectedContact._id,
          type: 'Email',
          subject: emailSubject,
          description: emailBody,
          status: 'Sent'
        })
      });

      if (res.ok) {
        toast.success(`Email simulated & sent to ${selectedContact.email}`);
        setIsComposingEmail(false);
        setEmailSubject('');
        setEmailBody('');
        fetchActivities(selectedContact._id);
      } else {
        toast.error('Failed to log email');
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Log Note
  async function logNote(e: React.FormEvent) {
    e.preventDefault();
    if (!noteContent) return;

    try {
      const res = await fetch('/api/admin/crm/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact: selectedContact._id,
          type: 'Note',
          subject: 'Internal Note Added',
          description: noteContent,
        })
      });

      if (res.ok) {
        toast.success('Internal note saved');
        setNoteContent('');
        fetchActivities(selectedContact._id);
      } else {
        toast.error('Failed to save note');
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Apply templates to email body
  function applyEmailTemplate(templateName: string) {
    if (templateName === 'intro') {
      setEmailSubject('Introduction: LabZenix Premium Equipment solutions');
      setEmailBody(`Hi ${selectedContact.name},\n\nI am reaching out from LabZenix to follow up on your operations. We offer leading clinical lab instruments engineered for optimal precision.\n\nLet me know if we can set up a 10-minute demo call this week.\n\nBest regards,\nCRM Sales Team`);
    } else if (templateName === 'proposal') {
      setEmailSubject(`Pricing Quotation & Specs Proposal: ${selectedContact.company}`);
      setEmailBody(`Hi ${selectedContact.name},\n\nFollowing up on our discussions, please find attached the requested lab instrumentation datasheet and pricing quotation.\n\nWe provide 24/7 technical support and customizable specs configurations to match your operations.\n\nBest regards,\nCRM Sales Team`);
    }
  }

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative min-h-[80vh]">
      {/* Page Title & Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-secondary tracking-tighter uppercase mb-2">Contacts Directory</h1>
          <p className="text-gray-500 font-medium text-sm">Coordinate lab customers, filter status channels, and track calls/emails.</p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="bg-primary text-white hover:bg-primary/95 text-xs font-black uppercase tracking-widest px-6 py-3 flex items-center shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Contact
        </button>
      </div>

      {/* Advanced Search & Filtering Toolbar */}
      <div className="bg-white border border-gray-200 p-4 flex flex-col md:flex-row gap-4 justify-between items-center shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, company, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs border border-gray-200 focus:border-primary focus:outline-none placeholder-gray-400 font-medium"
          />
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <div className="flex items-center space-x-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-200 px-3 py-2 text-xs focus:border-primary focus:outline-none font-medium text-gray-500 w-full md:w-auto"
            >
              <option value="">All Statuses</option>
              <option value="Lead">Lead</option>
              <option value="Opportunity">Opportunity</option>
              <option value="Customer">Customer</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contacts Table List */}
      <div className="bg-white border border-gray-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-black uppercase tracking-wider text-gray-400">
              <th className="p-4 pl-6">Client Name</th>
              <th className="p-4">Company</th>
              <th className="p-4">Contact Info</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right pr-6">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              [...Array(6)].map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="p-6 pl-6"><div className="h-4 w-28 bg-gray-100" /></td>
                  <td className="p-6"><div className="h-4 w-36 bg-gray-100" /></td>
                  <td className="p-6"><div className="h-4 w-40 bg-gray-100" /></td>
                  <td className="p-6"><div className="h-6 w-16 bg-gray-100" /></td>
                  <td className="p-6"><div className="h-4 w-12 bg-gray-100 ml-auto" /></td>
                </tr>
              ))
            ) : contacts.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-20 text-center text-gray-400 text-xs font-bold">
                  No contacts found in CRM matching current queries.
                </td>
              </tr>
            ) : (
              contacts.map((contact) => (
                <tr 
                  key={contact._id} 
                  className="hover:bg-gray-50/50 cursor-pointer group transition-colors"
                  onClick={() => setSelectedContact(contact)}
                >
                  <td className="p-4 pl-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-secondary text-white font-black text-xs flex items-center justify-center">
                        {contact.name[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-black text-secondary group-hover:text-primary transition-colors">{contact.name}</p>
                        <p className="text-[10px] text-gray-400">{contact.jobTitle || 'No Title'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center text-xs text-gray-500 font-bold">
                      <Building2 className="w-3.5 h-3.5 mr-1.5 text-gray-300" />
                      {contact.company || 'Private Buyer'}
                    </div>
                  </td>
                  <td className="p-4 space-y-1">
                    <p className="text-[10px] text-gray-400 font-bold flex items-center">
                      <Mail className="w-3.5 h-3.5 mr-1.5 text-gray-300" />
                      {contact.email}
                    </p>
                    {contact.phone && (
                      <p className="text-[10px] text-gray-400 font-bold flex items-center">
                        <Phone className="w-3.5 h-3.5 mr-1.5 text-gray-300" />
                        {contact.phone}
                      </p>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 border ${
                      contact.status === 'Customer' 
                        ? 'bg-green-50 border-green-200 text-green-700' 
                        : contact.status === 'Opportunity'
                        ? 'bg-amber-50 border-amber-200 text-amber-700'
                        : contact.status === 'Inactive'
                        ? 'bg-red-50 border-red-200 text-red-700'
                        : 'bg-blue-50 border-blue-200 text-blue-700'
                    }`}>
                      {contact.status}
                    </span>
                  </td>
                  <td className="p-4 text-right pr-6" onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={() => setSelectedContact(contact)}
                      className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
                    >
                      Log Activity
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {!loading && contacts.length > 0 && (
        <div className="flex items-center justify-between border-t border-gray-100 pt-4">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Showing {(page - 1) * limit + 1} - {Math.min(page * limit, total)} of {total} Contacts
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="p-2 border border-gray-200 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(prev => Math.min(prev + 1, Math.ceil(total / limit)))}
              disabled={page >= Math.ceil(total / limit)}
              className="p-2 border border-gray-200 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* CREATE CONTACT SLIDEOVER MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-secondary/50 backdrop-blur-sm" onClick={() => setIsCreateOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-full md:w-[450px] bg-white shadow-2xl flex flex-col p-6 animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-6">
              <h2 className="text-lg font-black text-secondary tracking-tight uppercase">New LabZenix Contact</h2>
              <button onClick={() => setIsCreateOpen(false)} className="p-1 text-gray-400 hover:text-secondary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateContact} className="flex-1 overflow-y-auto space-y-4 pr-1">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-2.5 text-xs border border-gray-200 focus:border-primary focus:outline-none"
                  placeholder="e.g. Dr. Sarah Jenkins"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Email Address *</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full p-2.5 text-xs border border-gray-200 focus:border-primary focus:outline-none"
                  placeholder="e.g. sjenkins@labs.org"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Phone Number</label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full p-2.5 text-xs border border-gray-200 focus:border-primary focus:outline-none"
                  placeholder="e.g. +1 555-0199"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Company / Institution</label>
                <input
                  type="text"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  className="w-full p-2.5 text-xs border border-gray-200 focus:border-primary focus:outline-none"
                  placeholder="e.g. Apex Diagnostics"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Job Title</label>
                <input
                  type="text"
                  value={newJobTitle}
                  onChange={(e) => setNewJobTitle(e.target.value)}
                  className="w-full p-2.5 text-xs border border-gray-200 focus:border-primary focus:outline-none"
                  placeholder="e.g. Purchasing Manager"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">CRM Lifecycle Status</label>
                <select
                  value={newStatus}
                  onChange={(e: any) => setNewStatus(e.target.value)}
                  className="w-full p-2.5 text-xs border border-gray-200 focus:border-primary focus:outline-none text-gray-600"
                >
                  <option value="Lead">Lead</option>
                  <option value="Opportunity">Opportunity</option>
                  <option value="Customer">Customer</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Internal Lead Notes</label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 text-xs border border-gray-200 focus:border-primary focus:outline-none"
                  placeholder="Enter notes about instruments interest or contact history..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-white hover:bg-primary/95 text-xs font-black uppercase tracking-widest py-3 mt-4"
              >
                Register CRM Contact
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CONTACT DETAILS DRAWER WITH MAIL & DIALER */}
      {selectedContact && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          <div className="absolute inset-0 bg-secondary/30 backdrop-blur-sm" onClick={() => setSelectedContact(null)} />
          <div className="relative w-full md:w-[600px] bg-white h-full shadow-2xl flex flex-col p-6 animate-in slide-in-from-right duration-300 z-10 overflow-y-auto">
            {/* Drawer Header */}
            <div className="flex justify-between items-start border-b border-gray-100 pb-4 mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-secondary text-white font-black flex items-center justify-center">
                  {selectedContact.name[0]?.toUpperCase()}
                </div>
                <div>
                  <h2 className="text-base font-black text-secondary tracking-tight">{selectedContact.name}</h2>
                  <p className="text-xs text-gray-400 font-bold">{selectedContact.jobTitle || 'No Title'} at {selectedContact.company || 'Private buyer'}</p>
                </div>
              </div>
              <button onClick={() => setSelectedContact(null)} className="p-1 text-gray-400 hover:text-secondary">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions Panel: Dialer, Email, Notes */}
            <div className="space-y-4 mb-6">
              {/* Active simulated Dialer */}
              {isDialing ? (
                <div className="bg-red-50 border border-red-200 p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-red-700 flex items-center">
                      <PhoneCall className="w-3.5 h-3.5 mr-1.5 animate-pulse" />
                      Live Outbound Call: {formatTimer(callTimer)}
                    </span>
                    <button 
                      onClick={hangUpAndLog}
                      className="bg-red-600 hover:bg-red-700 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5"
                    >
                      Hang Up & Log
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Enter call details/notes..."
                    value={callNotes}
                    onChange={(e) => setCallNotes(e.target.value)}
                    className="w-full p-2 text-xs border border-red-200 focus:outline-none bg-white font-medium"
                  />
                  <div className="flex items-center space-x-2">
                    <span className="text-[9px] font-bold text-gray-400 uppercase">Call Outcome:</span>
                    <select
                      value={callOutcome}
                      onChange={(e) => setCallOutcome(e.target.value)}
                      className="text-[9px] border border-red-200 px-2 py-1 text-gray-600 focus:outline-none font-bold"
                    >
                      <option value="Completed">Completed</option>
                      <option value="No Answer">No Answer</option>
                      <option value="Busy">Busy</option>
                      <option value="Follow-up Required">Follow-up Required</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={startCall}
                    className="flex-1 bg-green-600 text-white hover:bg-green-700 text-xs font-black uppercase tracking-widest py-3 flex items-center justify-center"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Trigger Call
                  </button>
                  <button
                    onClick={() => setIsComposingEmail(!isComposingEmail)}
                    className="flex-1 bg-primary text-white hover:bg-primary/95 text-xs font-black uppercase tracking-widest py-3 flex items-center justify-center"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Compose Email
                  </button>
                </div>
              )}

              {/* simulated Zoho-like Email panel */}
              {isComposingEmail && (
                <form onSubmit={sendEmailAndLog} className="bg-gray-50 border border-gray-200 p-4 space-y-3">
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">Outbound Email Composer</span>
                    <div className="flex gap-2">
                      <button 
                        type="button"
                        onClick={() => applyEmailTemplate('intro')}
                        className="text-[9px] font-black uppercase tracking-widest text-primary border border-primary/20 px-2 py-1 bg-white"
                      >
                        Intro Template
                      </button>
                      <button 
                        type="button"
                        onClick={() => applyEmailTemplate('proposal')}
                        className="text-[9px] font-black uppercase tracking-widest text-primary border border-primary/20 px-2 py-1 bg-white"
                      >
                        Proposal Template
                      </button>
                    </div>
                  </div>

                  <input
                    type="text"
                    placeholder="Subject Line"
                    required
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full p-2 text-xs border border-gray-200 focus:outline-none bg-white font-semibold"
                  />
                  <textarea
                    placeholder="Compose message body..."
                    required
                    rows={4}
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    className="w-full p-2 text-xs border border-gray-200 focus:outline-none bg-white font-medium"
                  />
                  <div className="flex justify-end gap-2">
                    <button 
                      type="button" 
                      onClick={() => setIsComposingEmail(false)}
                      className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-3 py-1.5"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="bg-primary text-white text-[10px] font-black uppercase tracking-widest px-4 py-2"
                    >
                      Send & Log Mail
                    </button>
                  </div>
                </form>
              )}

              {/* Note logger */}
              {!isComposingEmail && !isDialing && (
                <form onSubmit={logNote} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Append internal deal note..."
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    className="flex-1 p-2.5 text-xs border border-gray-200 focus:border-primary focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="bg-secondary text-white hover:bg-secondary/95 text-xs font-black uppercase tracking-widest px-4"
                  >
                    Save Note
                  </button>
                </form>
              )}
            </div>

            {/* Interaction Feed Timeline */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-secondary uppercase tracking-widest flex items-center border-b border-gray-100 pb-2">
                <Activity className="w-4 h-4 mr-2 text-primary animate-pulse" />
                Nurture Timeline Logs
              </h3>

              <div className="space-y-4 mt-4">
                {activitiesLoading ? (
                  <p className="text-xs text-gray-400 animate-pulse">Loading activity history...</p>
                ) : activities.length === 0 ? (
                  <p className="text-xs text-gray-400">No communication logs recorded for this contact.</p>
                ) : (
                  activities.map((act) => (
                    <div key={act._id} className="relative border-l-2 border-gray-100 pl-4 pb-4 last:pb-0">
                      <div className="absolute -left-[6px] top-1.5 w-2.5 h-2.5 rounded-full bg-primary" />
                      <div className="bg-gray-50/50 border border-gray-100 p-3 shadow-inner rounded-none">
                        <div className="flex items-center justify-between">
                          <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 border ${
                            act.type === 'Call'
                              ? 'bg-blue-50 border-blue-100 text-blue-700'
                              : act.type === 'Email'
                              ? 'bg-amber-50 border-amber-100 text-amber-700'
                              : 'bg-green-50 border-green-100 text-green-700'
                          }`}>
                            {act.type} {act.duration ? `(${formatTimer(act.duration)})` : ''}
                          </span>
                          <span className="text-[10px] text-gray-400 font-medium">
                            {new Date(act.date).toLocaleDateString()} {new Date(act.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                        <p className="text-xs font-black text-secondary uppercase tracking-tighter mt-2">{act.subject}</p>
                        <p className="text-xs text-gray-500 mt-1 whitespace-pre-line font-medium leading-relaxed">{act.description}</p>
                        <p className="text-[8px] text-gray-400 font-bold uppercase mt-2">Operator: {act.createdBy?.name || 'System'}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
