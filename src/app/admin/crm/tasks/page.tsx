'use client';

import { useState, useEffect } from 'react';
import { Plus, X, Search, FileText, User, Calendar, Trash2, CheckCircle2, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CRMTasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Contacts and Deals for dropdowns
  const [contacts, setContacts] = useState<any[]>([]);
  const [deals, setDeals] = useState<any[]>([]);

  // Create Task state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newPriority, setNewPriority] = useState('Medium');
  const [newContact, setNewContact] = useState('');
  const [newDeal, setNewDeal] = useState('');

  useEffect(() => {
    fetchTasks();
    fetchContactsAndDeals();
  }, [statusFilter]);

  async function fetchTasks() {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (statusFilter) query.append('status', statusFilter);
      
      const res = await fetch(`/api/admin/crm/tasks?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (err) {
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }

  async function fetchContactsAndDeals() {
    try {
      const [contactRes, dealRes] = await Promise.all([
        fetch('/api/admin/crm/contacts?limit=100'),
        fetch('/api/admin/crm/deals')
      ]);
      
      if (contactRes.ok) {
        const payload = await contactRes.json();
        setContacts(payload.contacts || []);
      }
      if (dealRes.ok) {
        setDeals(await dealRes.json());
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleCreateTask(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload: any = {
        title: newTitle,
        description: newDescription,
        dueDate: newDueDate,
        priority: newPriority,
      };
      if (newContact) payload.contact = newContact;
      if (newDeal) payload.deal = newDeal;

      const res = await fetch('/api/admin/crm/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success('Task created successfully');
        setIsCreateOpen(false);
        setNewTitle('');
        setNewDescription('');
        setNewDueDate('');
        setNewPriority('Medium');
        setNewContact('');
        setNewDeal('');
        fetchTasks();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to create task');
      }
    } catch (err) {
      toast.error('Request failed');
    }
  }

  async function deleteTask(id: string) {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      const res = await fetch('/api/admin/crm/tasks', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        toast.success('Task deleted');
        fetchTasks();
      } else {
        toast.error('Failed to delete task');
      }
    } catch (err) {
      toast.error('Request failed');
    }
  }

  async function updateTaskStatus(id: string, newStatus: string) {
    try {
      const res = await fetch('/api/admin/crm/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      });
      if (res.ok) {
        toast.success(`Task marked as ${newStatus}`);
        fetchTasks();
      } else {
        toast.error('Failed to update task');
      }
    } catch (err) {
      toast.error('Request failed');
    }
  }

  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(search.toLowerCase()) ||
    (task.description && task.description.toLowerCase().includes(search.toLowerCase())) ||
    (task.contact && task.contact.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative min-h-[80vh]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-secondary tracking-tighter uppercase mb-2">CRM Tasks</h1>
          <p className="text-gray-500 font-medium text-sm">Manage your sales to-dos, follow-ups, and daily activities.</p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="bg-primary text-white hover:bg-primary/95 text-xs font-black uppercase tracking-widest px-6 py-3 flex items-center shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Task
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white border border-gray-200 p-4 flex flex-col md:flex-row gap-4 justify-between items-center shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs border border-gray-200 focus:border-primary focus:outline-none placeholder-gray-400 font-medium"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-200 px-3 py-2 text-xs focus:border-primary focus:outline-none font-medium text-gray-500 w-full md:w-auto"
        >
          <option value="">All Tasks</option>
          <option value="Pending">Pending</option>
          <option value="Completed">Completed</option>
          <option value="Overdue">Overdue</option>
        </select>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="bg-white border border-gray-200 p-6 animate-pulse">
              <div className="h-5 bg-gray-200 w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 w-1/4"></div>
            </div>
          ))
        ) : filteredTasks.length === 0 ? (
          <div className="bg-white border border-gray-200 p-12 text-center text-gray-500 text-xs font-bold uppercase tracking-widest">
            No tasks found.
          </div>
        ) : (
          filteredTasks.map(task => (
            <div key={task._id} className={`bg-white border p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
              task.status === 'Completed' ? 'border-green-200 bg-green-50/30' : 
              task.status === 'Overdue' ? 'border-red-200 bg-red-50/30' : 'border-gray-200 hover:border-primary/50'
            }`}>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className={`text-base font-black ${task.status === 'Completed' ? 'text-gray-400 line-through' : 'text-secondary'}`}>
                    {task.title}
                  </h3>
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 border ${
                    task.priority === 'High' ? 'bg-red-50 text-red-600 border-red-200' :
                    task.priority === 'Medium' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                    'bg-blue-50 text-blue-600 border-blue-200'
                  }`}>
                    {task.priority} Priority
                  </span>
                  {task.status === 'Overdue' && (
                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-red-600 text-white border border-red-600">
                      Overdue
                    </span>
                  )}
                </div>
                
                {task.description && (
                  <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-3xl">
                    {task.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">
                  <span className="flex items-center text-primary">
                    <Clock className="w-3.5 h-3.5 mr-1" />
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                  
                  {task.contact && (
                    <span className="flex items-center">
                      <User className="w-3.5 h-3.5 mr-1" />
                      Contact: {task.contact.name}
                    </span>
                  )}
                  
                  {task.deal && (
                    <span className="flex items-center">
                      <FileText className="w-3.5 h-3.5 mr-1" />
                      Deal: {task.deal.title}
                    </span>
                  )}
                  
                  {task.assignedTo && (
                    <span className="flex items-center">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Assignee: {task.assignedTo.name}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {task.status !== 'Completed' ? (
                  <button
                    onClick={() => updateTaskStatus(task._id, 'Completed')}
                    className="p-2 bg-green-50 text-green-600 border border-green-200 hover:bg-green-600 hover:text-white transition-colors"
                    title="Mark as Completed"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => updateTaskStatus(task._id, 'Pending')}
                    className="p-2 bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-600 hover:text-white transition-colors"
                    title="Reopen Task"
                  >
                    <Clock className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => deleteTask(task._id)}
                  className="p-2 text-gray-400 hover:text-red-600 border border-transparent hover:border-red-200 hover:bg-red-50 transition-colors"
                  title="Delete Task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CREATE TASK MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-secondary/50 backdrop-blur-sm" onClick={() => setIsCreateOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-full md:w-[450px] bg-white shadow-2xl flex flex-col p-6 animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-6">
              <h2 className="text-lg font-black text-secondary tracking-tight uppercase">New Follow-up Task</h2>
              <button onClick={() => setIsCreateOpen(false)} className="p-1 text-gray-400 hover:text-secondary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="flex-1 overflow-y-auto space-y-4 pr-1">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Task Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 text-xs border border-gray-200 focus:border-primary focus:outline-none"
                  placeholder="e.g. Call Dr. Sarah regarding demo"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Description</label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 text-xs border border-gray-200 focus:border-primary focus:outline-none"
                  placeholder="Details..."
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Due Date *</label>
                <input
                  type="date"
                  required
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full p-2.5 text-xs border border-gray-200 focus:border-primary focus:outline-none text-gray-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Priority Level</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                  className="w-full p-2.5 text-xs border border-gray-200 focus:border-primary focus:outline-none text-gray-600"
                >
                  <option value="Low">Low Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="High">High Priority</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Link Contact (Optional)</label>
                <select
                  value={newContact}
                  onChange={(e) => setNewContact(e.target.value)}
                  className="w-full p-2.5 text-xs border border-gray-200 focus:border-primary focus:outline-none text-gray-600"
                >
                  <option value="">None</option>
                  {contacts.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Link Deal (Optional)</label>
                <select
                  value={newDeal}
                  onChange={(e) => setNewDeal(e.target.value)}
                  className="w-full p-2.5 text-xs border border-gray-200 focus:border-primary focus:outline-none text-gray-600"
                >
                  <option value="">None</option>
                  {deals.map(d => (
                    <option key={d._id} value={d._id}>{d.title}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-white hover:bg-primary/95 text-xs font-black uppercase tracking-widest py-3 mt-4"
              >
                Create Task
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
