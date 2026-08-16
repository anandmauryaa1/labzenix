'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Wrench, 
  Clock, 
  CheckCircle2, 
  X, 
  AlertCircle,
  User, 
  Building2,
  Tag,
  Scale
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ServiceTickets() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [engineers, setEngineers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter
  const [statusFilter, setStatusFilter] = useState('');

  // Create modal states
  const [isOpen, setIsOpen] = useState(false);
  const [companyId, setCompanyId] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [assignedEngineer, setAssignedEngineer] = useState('');

  useEffect(() => {
    fetchTickets();
    fetchConfig();
  }, [statusFilter]);

  async function fetchTickets() {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (statusFilter) queryParams.append('status', statusFilter);
      const res = await fetch(`/api/admin/crm/service-tickets?${queryParams}`);
      if (res.ok) {
        const data = await res.json();
        setTickets(data);
      }
    } catch (err) {
      toast.error('Failed to load service tickets');
    } finally {
      setLoading(false);
    }
  }

  async function fetchConfig() {
    try {
      const [companiesRes, usersRes] = await Promise.all([
        fetch('/api/admin/crm/contacts?limit=100'),
        fetch('/api/admin/users')
      ]);

      if (companiesRes.ok) {
        const data = await companiesRes.json();
        setCompanies(data.companies || []);
      }

      if (usersRes.ok) {
        const data = await usersRes.json();
        setEngineers(data.filter((u: any) => u.role === 'service-engineer' || u.role === 'super-admin'));
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleCreateTicket(e: React.FormEvent) {
    e.preventDefault();
    if (!companyId) {
      toast.error('Associated B2B Customer is required');
      return;
    }

    try {
      const res = await fetch('/api/admin/crm/service-tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: companyId,
          machineSerialNumber: serialNumber,
          productInterest: productName,
          problemDescription: description,
          priority,
          assignedEngineer: assignedEngineer || undefined,
        })
      });

      if (res.ok) {
        toast.success('Service ticket registered successfully');
        setIsOpen(false);
        setCompanyId('');
        setSerialNumber('');
        setProductName('');
        setDescription('');
        setPriority('Medium');
        setAssignedEngineer('');
        fetchTickets();
      } else {
        toast.error('Failed to register service ticket');
      }
    } catch (err) {
      toast.error('Operation failed');
    }
  }

  async function updateTicketStatus(id: string, newStatus: string) {
    try {
      const res = await fetch('/api/admin/crm/service-tickets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      });
      if (res.ok) {
        toast.success(`Ticket status updated to ${newStatus}`);
        setTickets(tickets.map(t => t._id === id ? { ...t, status: newStatus } : t));
      }
    } catch (err) {
      toast.error('Operation failed');
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-secondary tracking-tighter uppercase mb-2">Service Tickets</h1>
          <p className="text-gray-500 font-medium text-sm">Log machine issues, track troubleshooting progress, and dispatch technicians.</p>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="bg-primary text-white hover:bg-primary/95 text-xs font-black uppercase tracking-widest px-6 py-3 flex items-center shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          Log Service Ticket
        </button>
      </div>

      {/* Toolbar filters */}
      <div className="bg-white border border-gray-200 p-4 flex justify-between items-center shadow-sm">
        <div className="flex gap-4">
          {['', 'Open', 'In Progress', 'Resolved', 'Closed'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 border ${
                statusFilter === st 
                  ? 'bg-secondary border-secondary text-white' 
                  : 'bg-white border-gray-200 text-gray-400 hover:text-secondary'
              }`}
            >
              {st === '' ? 'All Tickets' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets Grid */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400 bg-white border border-gray-100 animate-pulse">
            Loading active service logs...
          </div>
        ) : tickets.length === 0 ? (
          <div className="bg-white border border-gray-150 p-20 text-center shadow-sm">
            <CheckCircle2 className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <h3 className="font-bold text-secondary text-base uppercase">All Clean</h3>
            <p className="text-xs text-gray-400 font-medium mt-1">No pending service tickets logged in this queue.</p>
          </div>
        ) : (
          tickets.map(ticket => {
            const isResolved = ticket.status === 'Resolved' || ticket.status === 'Closed';

            return (
              <div 
                key={ticket._id}
                className={`bg-white border p-6 flex flex-col md:flex-row md:items-start justify-between gap-6 shadow-sm hover:shadow-md transition-all ${
                  isResolved ? 'border-gray-100 opacity-60' : 'border-gray-200'
                }`}
              >
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 border ${
                      ticket.priority === 'High' 
                        ? 'bg-red-50 border-red-200 text-red-600'
                        : 'bg-blue-50 border-blue-200 text-blue-600'
                    }`}>
                      {ticket.priority} Priority
                    </span>

                    <span className="text-[9px] font-black uppercase tracking-widest bg-gray-100 border border-gray-200 px-2 py-0.5 text-gray-600">
                      SN: {ticket.machineSerialNumber}
                    </span>

                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      Opened: {new Date(ticket.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-black text-secondary uppercase tracking-tight">
                      {ticket.productInterest || 'Testing Equipment'} issue
                    </h3>
                    <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-2xl mt-1">{ticket.problemDescription}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-dashed border-gray-100 pt-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <span className="flex items-center text-primary">
                      <Building2 className="w-3.5 h-3.5 mr-1.5" />
                      Client: {ticket.company?.name}
                    </span>
                    {ticket.assignedEngineer && (
                      <span className="flex items-center text-secondary">
                        <User className="w-3.5 h-3.5 mr-1.5" />
                        Technician: {ticket.assignedEngineer.name}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col md:items-end gap-3 self-center md:self-start">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Status:</span>
                    <select
                      value={ticket.status}
                      onChange={(e) => updateTicketStatus(ticket._id, e.target.value)}
                      className="border border-gray-200 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-secondary focus:outline-none bg-white"
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* LOG TICKET MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-secondary/50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-full md:w-[450px] bg-white shadow-2xl flex flex-col p-6 animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-6">
              <h2 className="text-lg font-black text-secondary tracking-tight uppercase">Log Service Ticket</h2>
              <button onClick={() => setIsOpen(false)} className="p-1 text-gray-400 hover:text-secondary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="flex-1 overflow-y-auto space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Associated B2B Customer *</label>
                <select
                  required
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                  className="w-full p-2.5 text-xs border border-gray-200 focus:border-primary focus:outline-none text-gray-600 bg-white"
                >
                  <option value="">Select B2B client...</option>
                  {companies.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Machine Serial Number *</label>
                <input
                  type="text"
                  required
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  className="w-full p-2.5 text-xs border border-gray-200 focus:border-primary focus:outline-none font-semibold"
                  placeholder="e.g. LT-SN-10255"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Machine Model / Instrument Name</label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full p-2.5 text-xs border border-gray-200 focus:border-primary focus:outline-none"
                  placeholder="e.g. Box Compression Tester - Computerized"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Issue Priority</label>
                <select
                  value={priority}
                  onChange={(e: any) => setPriority(e.target.value)}
                  className="w-full p-2.5 text-xs border border-gray-200 focus:border-primary focus:outline-none text-gray-600 bg-white font-semibold"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Assign Engineer / Technician</label>
                <select
                  value={assignedEngineer}
                  onChange={(e) => setAssignedEngineer(e.target.value)}
                  className="w-full p-2.5 text-xs border border-gray-200 focus:border-primary focus:outline-none text-gray-600 bg-white"
                >
                  <option value="">Unassigned...</option>
                  {engineers.map(e => (
                    <option key={e._id} value={e._id}>{e.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Problem Description *</label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full p-2.5 text-xs border border-gray-200 focus:border-primary focus:outline-none font-medium text-gray-600"
                  placeholder="Describe interface panel errors, load fluctuations, or mechanical issues in detail..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-white hover:bg-primary/95 text-xs font-black uppercase tracking-widest py-3 mt-4"
              >
                Log Ticket Card
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
