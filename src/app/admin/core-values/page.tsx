'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface CoreValue {
  _id: string;
  title: string;
  description: string;
  icon: string;
  order: number;
}

const availableIcons = [
  'ShieldCheck', 'Zap', 'Repeat', 'Globe', 'Award', 'CheckCircle', 
  'Star', 'Heart', 'TrendingUp', 'Users', 'Activity', 'Anchor', 
  'Aperture', 'Archive', 'ArrowRight', 'Briefcase', 'Camera', 'Cloud'
];

export default function CoreValuesManagement() {
  const [values, setValues] = useState<CoreValue[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingValue, setEditingValue] = useState<CoreValue | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon: 'ShieldCheck',
    order: 0
  });

  useEffect(() => {
    fetchValues();
  }, []);

  async function fetchValues() {
    setLoading(true);
    try {
      const res = await fetch('/api/core-values');
      if (res.ok) {
        const data = await res.json();
        setValues(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      toast.error('Failed to load core values');
    } finally {
      setLoading(false);
    }
  }

  const handleOpenModal = (value: CoreValue | null = null) => {
    if (value) {
      setEditingValue(value);
      setFormData({
        title: value.title,
        description: value.description,
        icon: value.icon,
        order: value.order
      });
    } else {
      setEditingValue(null);
      setFormData({
        title: '',
        description: '',
        icon: 'ShieldCheck',
        order: values.length
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingValue(null);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const url = editingValue ? `/api/core-values/${editingValue._id}` : '/api/core-values';
    const method = editingValue ? 'PUT' : 'POST'; // Wait, should be PATCH based on route I wrote, but let's check. Ah, I wrote PATCH in the route. I'll use PATCH here.
    const actualMethod = editingValue ? 'PATCH' : 'POST';

    try {
      const res = await fetch(url, {
        method: actualMethod,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        toast.success(editingValue ? 'Value updated' : 'Value created');
        fetchValues();
        handleCloseModal();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Operation failed');
      }
    } catch (err) {
      toast.error('Network error');
    }
  }

  async function deleteValue(id: string) {
    if (!confirm('Delete this Core Value?')) return;
    try {
      const res = await fetch(`/api/core-values/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Core Value deleted');
        setValues(values.filter(f => f._id !== id));
      }
    } catch (err) {
      toast.error('Delete failed');
    }
  }

  const filteredValues = values.filter(f => 
    f.title.toLowerCase().includes(search.toLowerCase()) ||
    f.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-secondary tracking-tighter uppercase mb-2">Core Values</h1>
          <p className="text-gray-500 font-medium text-sm">Manage the "Why LabZenix" items on the homepage.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center space-x-2 px-6 py-4 bg-secondary text-white text-xs font-black uppercase tracking-widest hover:bg-primary transition-all shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>Add Value</span>
        </button>
      </div>

      <div className="bg-white border border-gray-100 shadow-sm">
        <div className="p-4 border-b border-gray-100 flex items-center bg-gray-50/50">
          <Search className="w-5 h-5 text-gray-400 mr-3" />
          <input 
            type="text" 
            placeholder="Search core values..." 
            className="bg-transparent border-none outline-none text-sm font-medium w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">
                <th className="px-6 py-4">Order</th>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Icon Name</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400 text-xs font-bold uppercase">Loading...</td>
                </tr>
              ) : filteredValues.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400 text-xs font-bold uppercase">No core values found</td>
                </tr>
              ) : filteredValues.map((value) => (
                <tr key={value._id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4 text-xs font-bold text-gray-400">{value.order}</td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-secondary uppercase text-xs tracking-tight line-clamp-1">{value.title}</p>
                    <p className="text-[10px] text-gray-400 line-clamp-1 mt-1 font-medium">{value.description}</p>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">
                    {value.icon}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button onClick={() => handleOpenModal(value)} className="p-2 text-gray-300 hover:text-secondary transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteValue(value._id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl border border-gray-100 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-secondary text-white">
              <h2 className="text-xl font-black uppercase tracking-tighter">
                {editingValue ? 'Edit Core Value' : 'Add New Core Value'}
              </h2>
              <button onClick={handleCloseModal} className="text-white/60 hover:text-white font-bold text-xl">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Title</label>
                <input 
                  type="text" 
                  required
                  className="w-full border border-gray-200 px-4 py-3 outline-none focus:border-primary text-sm font-medium transition-all"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Description</label>
                <textarea 
                  required
                  rows={4}
                  className="w-full border border-gray-200 px-4 py-3 outline-none focus:border-primary text-sm font-medium transition-all resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Display Order</label>
                  <input 
                    type="number" 
                    className="w-full border border-gray-200 px-4 py-3 outline-none focus:border-primary text-sm font-medium transition-all"
                    value={formData.order}
                    onChange={(e) => setFormData({...formData, order: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Icon</label>
                  <select 
                    className="w-full border border-gray-200 px-4 py-3 outline-none focus:border-primary text-sm font-medium transition-all bg-white"
                    value={formData.icon}
                    onChange={(e) => setFormData({...formData, icon: e.target.value})}
                  >
                    {availableIcons.map(icon => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-4">
                <button 
                  type="button"
                  onClick={handleCloseModal}
                  className="px-8 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-secondary transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-10 py-4 bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-secondary transition-all shadow-xl active:scale-95"
                >
                  {editingValue ? 'Update Value' : 'Create Value'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
