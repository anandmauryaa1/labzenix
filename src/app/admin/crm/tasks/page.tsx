'use client';

import React, { useState, useEffect, Fragment } from 'react';
import { 
  Search, 
  FileText, 
  Plus, 
  Filter as FilterIcon, 
  LayoutGrid, 
  List, 
  ChevronDown, 
  X, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  MoreVertical,
  Check,
  User,
  AlertCircle,
  Edit3,
  Download
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const TASK_STAGES = [
  { id: 'New', label: 'New', color: 'bg-[#00667e]', hasBadge: true },
  { id: 'In Feedback', label: 'In Feedback', color: 'bg-[#372b7b]', hasBadge: true },
  { id: 'Completed', label: 'Completed', color: 'bg-[#5b8a05]', hasBadge: true },
  { id: 'Rejected', label: 'Rejected', color: 'bg-[#e60026]', hasBadge: true },
  { id: 'Processing', label: 'Processing', color: 'bg-[#3b2d82]', hasBadge: false }
];

export default function CRMTasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [search, setSearch] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeStageFilter, setActiveStageFilter] = useState('all');

  // Add Task Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'New',
    priority: 'Medium',
    dueDate: new Date().toISOString().split('T')[0]
  });
  const [submitting, setSubmitting] = useState(false);

  // Edit Task Modal
  const [editingTask, setEditingTask] = useState<any | null>(null);

  // Drag state
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/crm/tasks');
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      } else {
        toast.error('Failed to load tasks');
      }
    } catch (err) {
      toast.error('Network error loading tasks');
    } finally {
      setLoading(false);
    }
  }

  // Create task handler
  async function handleCreateTask(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/crm/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          status: formData.status,
          priority: formData.priority,
          dueDate: new Date(formData.dueDate).toISOString()
        })
      });
      if (res.ok) {
        toast.success('Task created successfully');
        setIsAddOpen(false);
        setFormData({
          title: '',
          description: '',
          status: 'New',
          priority: 'Medium',
          dueDate: new Date().toISOString().split('T')[0]
        });
        fetchTasks();
      } else {
        toast.error('Failed to create task');
      }
    } catch (err) {
      toast.error('Request failed');
    } finally {
      setSubmitting(false);
    }
  }

  // Edit task handler
  async function handleSaveEditTask(e: React.FormEvent) {
    e.preventDefault();
    if (!editingTask) return;
    try {
      const res = await fetch('/api/admin/crm/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingTask._id,
          title: editingTask.title,
          description: editingTask.description,
          status: editingTask.status,
          priority: editingTask.priority,
          dueDate: new Date(editingTask.dueDate).toISOString()
        })
      });
      if (res.ok) {
        toast.success('Task updated successfully');
        setTasks(prev => prev.map(t => t._id === editingTask._id ? editingTask : t));
        setEditingTask(null);
      } else {
        toast.error('Failed to update task');
      }
    } catch (err) {
      toast.error('Error updating task');
    }
  }

  // Update task stage
  async function updateTaskStatus(taskId: string, newStatus: string) {
    try {
      setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
      const res = await fetch('/api/admin/crm/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, status: newStatus })
      });
      if (res.ok) {
        toast.success(`Task moved to ${newStatus}`);
      } else {
        fetchTasks();
        toast.error('Failed to update status');
      }
    } catch (err) {
      fetchTasks();
      toast.error('Error updating task');
    }
  }

  // Toggle complete
  async function toggleTaskComplete(task: any) {
    const newStatus = task.status === 'Completed' ? 'New' : 'Completed';
    await updateTaskStatus(task._id, newStatus);
  }

  // Delete task
  async function handleDeleteTask(taskId: string) {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      const res = await fetch('/api/admin/crm/tasks', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId })
      });
      if (res.ok) {
        setTasks(prev => prev.filter(t => t._id !== taskId));
        toast.success('Task deleted');
      } else {
        toast.error('Failed to delete task');
      }
    } catch (err) {
      toast.error('Error deleting task');
    }
  }

  // Filter tasks
  const filteredTasks = tasks.filter(t => {
    const matchesSearch = search === '' || 
      (t.title && t.title.toLowerCase().includes(search.toLowerCase())) ||
      (t.description && t.description.toLowerCase().includes(search.toLowerCase()));
    
    // Normalize status mapping if needed (e.g., Pending -> New)
    const taskStatus = t.status === 'Pending' ? 'New' : t.status;
    const matchesStage = activeStageFilter === 'all' || taskStatus === activeStageFilter;
    return matchesSearch && matchesStage;
  });

  return (
    <div className="space-y-5 max-w-[1700px] mx-auto pb-12 font-sans select-none text-slate-800">
      
      {/* Top Header Toolbar Matching Screenshot 2 */}
      <div className="bg-white rounded-xl border border-slate-200/80 px-3.5 sm:px-5 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        
        {/* Title */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Tasks</h1>
        </div>

        {/* Right Actions */}
        <div className="flex items-center flex-wrap gap-2">
          
          {/* Search Trigger */}
          {isSearchOpen ? (
            <div className="flex items-center relative w-full sm:w-auto">
              <input
                type="text"
                autoFocus
                placeholder="Search tasks..."
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

          {/* Export CSV */}
          <button 
            onClick={() => {
              const csvContent = "data:text/csv;charset=utf-8," + ["Title,Status,Priority,DueDate,Description"].concat(tasks.map(t => `"${t.title || ''}","${t.status || ''}","${t.priority || ''}","${t.dueDate ? new Date(t.dueDate).toISOString().split('T')[0] : ''}","${t.description || ''}"`)).join("\n");
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", `labzenix_tasks_${new Date().toISOString().split('T')[0]}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              toast.success('Tasks exported to CSV');
            }}
            className="inline-flex items-center px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-lg transition"
          >
            <Download className="w-3.5 h-3.5 mr-1 sm:mr-1.5 text-slate-500" />
            <span>Export</span>
          </button>

          {/* Add Task Button */}
          <button
            onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center px-3 sm:px-3.5 py-1.5 text-xs font-semibold text-white bg-[#372b7b] hover:bg-[#2f2468] rounded-lg transition shadow-xs"
          >
            <Plus className="w-4 h-4 mr-1" />
            <span>Add Task</span>
          </button>

          {/* Kanban / List Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/80">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-md transition ${viewMode === 'kanban' ? 'bg-white shadow-2xs text-[#372b7b]' : 'text-slate-400 hover:text-slate-600'}`}
              title="Kanban Board"
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

      {/* Pill Filter Bar matching Screenshot 2 */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1.5 pt-0.5 scroll-smooth">
        <button
          onClick={() => setActiveStageFilter('all')}
          className={`px-3 py-1 text-xs font-semibold rounded-md transition border shrink-0 whitespace-nowrap ${
            activeStageFilter === 'all'
              ? 'bg-[#372b7b] text-white border-[#372b7b]'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          All ({tasks.length})
        </button>
        {TASK_STAGES.map(stage => {
          const count = tasks.filter(t => (t.status === 'Pending' ? 'New' : t.status) === stage.id).length;
          const isActive = activeStageFilter === stage.id;
          return (
            <button
              key={stage.id}
              onClick={() => setActiveStageFilter(stage.id)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition border shrink-0 whitespace-nowrap flex items-center space-x-1.5 ${
                isActive
                  ? 'bg-[#372b7b] text-white border-[#372b7b]'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{stage.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main View: Kanban Board Matching Screenshot 2 */}
      {viewMode === 'kanban' ? (
        <div className="space-y-4">
          
          {loading ? (
            <div className="flex gap-4 overflow-x-auto pb-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-[280px] sm:w-[300px] md:w-[310px] min-w-[280px] sm:min-w-[300px] md:min-w-[310px] shrink-0 h-64 bg-slate-50 rounded-lg border border-slate-200/60 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="flex gap-4 items-start overflow-x-auto pb-6 pt-1 scroll-smooth">
              {TASK_STAGES.map(stage => {
                const stageTasks = filteredTasks.filter(t => (t.status === 'Pending' ? 'New' : t.status) === stage.id);
                return (
                  <div
                    key={stage.id}
                    className="w-[280px] sm:w-[300px] md:w-[310px] min-w-[280px] sm:min-w-[300px] md:min-w-[310px] shrink-0 flex flex-col shadow-xs rounded-lg overflow-hidden"
                  >
                    {/* Unified Column Header */}
                    <div
                      className={`${stage.color} text-white px-3.5 py-2.5 flex items-center justify-between font-bold text-sm tracking-wide`}
                    >
                      <span>{stage.label}</span>
                      {stage.hasBadge && (
                        <span className="bg-[#e11d48] text-white text-[11px] font-bold px-2 py-0.2 rounded-full shadow-2xs">
                          {stageTasks.length}
                        </span>
                      )}
                    </div>

                    {/* Unified Drop Zone & Task Cards */}
                    <div
                      onDragOver={e => e.preventDefault()}
                      onDrop={() => {
                        if (draggedTaskId) {
                          updateTaskStatus(draggedTaskId, stage.id);
                          setDraggedTaskId(null);
                        }
                      }}
                      className="space-y-3 min-h-[450px] bg-slate-50/50 p-2.5 rounded-b-lg border-x border-b border-slate-200/60 flex-1"
                    >
                    {stageTasks.length === 0 ? (
                      <p className="text-center text-xs text-slate-400 py-8">No tasks in {stage.label}</p>
                    ) : (
                      stageTasks.map(task => (
                        <div
                          key={task._id}
                          draggable
                          onDragStart={() => setDraggedTaskId(task._id)}
                          className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs hover:shadow-md transition cursor-grab active:cursor-grabbing space-y-2.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => toggleTaskComplete(task)}
                                className={`w-4 h-4 rounded border flex items-center justify-center transition shrink-0 ${
                                  task.status === 'Completed'
                                    ? 'bg-emerald-500 border-emerald-500 text-white'
                                    : 'border-slate-300 hover:border-indigo-500'
                                }`}
                                title={task.status === 'Completed' ? 'Mark incomplete' : 'Mark completed'}
                              >
                                {task.status === 'Completed' && <Check className="w-3 h-3 stroke-[3]" />}
                              </button>
                              <h4 
                                onClick={() => setEditingTask(task)}
                                className={`text-sm font-bold leading-snug cursor-pointer hover:text-indigo-600 transition ${
                                  task.status === 'Completed' ? 'line-through text-slate-400' : 'text-slate-800'
                                }`}
                              >
                                {task.title}
                              </h4>
                            </div>

                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${
                              task.priority === 'High' ? 'bg-red-50 text-red-600' : task.priority === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {task.priority}
                            </span>
                          </div>

                          {task.description && (
                            <p className="text-xs text-slate-500 line-clamp-2 pl-6">{task.description}</p>
                          )}

                          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => setEditingTask(task)}
                                className="text-slate-400 hover:text-indigo-600 transition"
                                title="Edit task"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteTask(task._id)}
                                className="text-slate-400 hover:text-rose-500 transition"
                                title="Delete task"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
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
          )}

        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#2b2553] text-white">
              <tr>
                <th className="py-3 px-4">Task Title</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status / Stage</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 text-xs">
                    There are no records to display
                  </td>
                </tr>
              ) : (
                filteredTasks.map(task => (
                  <tr key={task._id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleTaskComplete(task)}
                          className={`w-4 h-4 rounded border flex items-center justify-center transition shrink-0 ${
                            task.status === 'Completed'
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'border-slate-300 hover:border-indigo-500'
                          }`}
                        >
                          {task.status === 'Completed' && <Check className="w-3 h-3 stroke-[3]" />}
                        </button>
                        <span 
                          onClick={() => setEditingTask(task)}
                          className={`cursor-pointer hover:text-indigo-600 ${task.status === 'Completed' ? 'line-through text-slate-400' : ''}`}
                        >
                          {task.title}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{new Date(task.dueDate).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        task.priority === 'High' ? 'bg-red-50 text-red-600' : task.priority === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-xs px-2 py-0.5 rounded text-white" style={{
                        backgroundColor: TASK_STAGES.find(s => s.id === (task.status === 'Pending' ? 'New' : task.status))?.color.replace('bg-[', '').replace(']', '') || '#372b7b'
                      }}>
                        {task.status === 'Pending' ? 'New' : task.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center space-x-2">
                        <button
                          onClick={() => setEditingTask(task)}
                          className="text-slate-400 hover:text-indigo-600"
                          title="Edit Task"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task._id)}
                          className="text-rose-500 hover:text-rose-700"
                          title="Delete Task"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}


      {/* Add Task Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-900">Add New Task</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Schedule laboratory demo with Zenith"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Stage / Column</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-white"
                  >
                    {TASK_STAGES.map(s => (
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={e => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-white"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description / Notes</label>
                <textarea
                  rows={3}
                  placeholder="Task details and instructions..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
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
                  {submitting ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-900">Edit Task</h3>
              <button onClick={() => setEditingTask(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditTask} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={editingTask.title || ''}
                  onChange={e => setEditingTask({ ...editingTask, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Stage / Column</label>
                  <select
                    value={editingTask.status || 'New'}
                    onChange={e => setEditingTask({ ...editingTask, status: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-white"
                  >
                    {TASK_STAGES.map(s => (
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={editingTask.priority || 'Medium'}
                    onChange={e => setEditingTask({ ...editingTask, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-white"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={editingTask.dueDate ? new Date(editingTask.dueDate).toISOString().split('T')[0] : ''}
                  onChange={e => setEditingTask({ ...editingTask, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description / Notes</label>
                <textarea
                  rows={3}
                  value={editingTask.description || ''}
                  onChange={e => setEditingTask({ ...editingTask, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
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

    </div>
  );
}
