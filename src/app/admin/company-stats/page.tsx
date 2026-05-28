'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, GripVertical } from 'lucide-react';

interface CompanyStat {
  _id: string;
  label: string;
  value: string;
  order: number;
  active: boolean;
}

export default function CompanyStatsAdmin() {
  const [stats, setStats] = useState<CompanyStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<CompanyStat>>({});
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/company-stats?admin=true');
      const data = await res.json();
      if (res.ok) setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (id?: string) => {
    try {
      const url = id ? `/api/company-stats/${id}` : '/api/company-stats';
      const method = id ? 'PATCH' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsAdding(false);
        setEditingId(null);
        setFormData({});
        fetchStats();
      } else {
        alert('Failed to save company stat');
      }
    } catch (error) {
      console.error('Error saving stat:', error);
      alert('Error saving company stat');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this stat?')) return;
    try {
      const res = await fetch(`/api/company-stats/${id}`, { method: 'DELETE' });
      if (res.ok) fetchStats();
      else alert('Failed to delete stat');
    } catch (error) {
      console.error('Error deleting stat:', error);
      alert('Error deleting company stat');
    }
  };

  const moveUp = async (index: number) => {
    if (index === 0) return;
    const newStats = [...stats];
    const temp = newStats[index];
    newStats[index] = newStats[index - 1];
    newStats[index - 1] = temp;
    
    // Update order for both items
    await fetch(`/api/company-stats/${newStats[index]._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: index }),
    });
    
    await fetch(`/api/company-stats/${newStats[index - 1]._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: index - 1 }),
    });
    
    setStats(newStats);
  };

  const moveDown = async (index: number) => {
    if (index === stats.length - 1) return;
    const newStats = [...stats];
    const temp = newStats[index];
    newStats[index] = newStats[index + 1];
    newStats[index + 1] = temp;
    
    // Update order for both items
    await fetch(`/api/company-stats/${newStats[index]._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: index }),
    });
    
    await fetch(`/api/company-stats/${newStats[index + 1]._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: index + 1 }),
    });
    
    setStats(newStats);
  };

  if (loading) return <div className="p-8 text-secondary font-bold">Loading...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-secondary tracking-tighter uppercase mb-2 text-primary">Company Stats</h1>
          <p className="text-gray-500 font-medium text-sm italic">Manage the premium stats section on the About Us page.</p>
        </div>
        <button
          onClick={() => { setIsAdding(true); setFormData({ active: true, order: stats.length }); }}
          className="flex items-center space-x-2 px-6 py-4 bg-secondary text-white text-xs font-black uppercase tracking-widest hover:bg-primary transition-all shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>Add Stat</span>
        </button>
      </div>

      <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6">
          <table className="w-full">
            <thead>
              <tr className="text-left text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-100">
                <th className="pb-4 w-16 text-center">Order</th>
                <th className="pb-4">Label</th>
                <th className="pb-4">Value</th>
                <th className="pb-4 w-24 text-center">Status</th>
                <th className="pb-4 w-32 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isAdding && (
                <tr className="bg-gray-50/50">
                  <td className="py-4 text-center">-</td>
                  <td className="py-4 pr-4">
                    <input
                      type="text"
                      placeholder="e.g. Countries Served"
                      className="w-full border border-gray-200 px-4 py-3 outline-none focus:border-primary text-sm font-medium transition-all"
                      value={formData.label || ''}
                      onChange={e => setFormData({ ...formData, label: e.target.value })}
                    />
                  </td>
                  <td className="py-4 pr-4">
                    <input
                      type="text"
                      placeholder="e.g. 45+"
                      className="w-full border border-gray-200 px-4 py-3 outline-none focus:border-primary text-sm font-medium transition-all"
                      value={formData.value || ''}
                      onChange={e => setFormData({ ...formData, value: e.target.value })}
                    />
                  </td>
                  <td className="py-4 text-center">
                    <input
                      type="checkbox"
                      checked={formData.active !== false}
                      onChange={e => setFormData({ ...formData, active: e.target.checked })}
                      className="w-5 h-5 accent-primary cursor-pointer"
                    />
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleSave()} className="p-2 text-green-600 hover:bg-green-50 rounded-lg"><Save className="w-4 h-4" /></button>
                      <button onClick={() => { setIsAdding(false); setFormData({}); }} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><X className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              )}

              {stats.map((stat, index) => (
                <tr key={stat._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <button onClick={() => moveUp(index)} disabled={index === 0} className="text-gray-400 hover:text-primary disabled:opacity-30">▲</button>
                      <span className="text-xs font-bold text-gray-500">{stat.order}</span>
                      <button onClick={() => moveDown(index)} disabled={index === stats.length - 1} className="text-gray-400 hover:text-primary disabled:opacity-30">▼</button>
                    </div>
                  </td>
                  
                  <td className="py-4 pr-4">
                    {editingId === stat._id ? (
                      <input
                        type="text"
                        className="w-full border border-gray-200 px-4 py-3 outline-none focus:border-primary text-sm font-medium transition-all"
                        value={formData.label || ''}
                        onChange={e => setFormData({ ...formData, label: e.target.value })}
                      />
                    ) : (
                      <span className="font-bold text-secondary text-sm uppercase tracking-wider">{stat.label}</span>
                    )}
                  </td>
                  
                  <td className="py-4 pr-4">
                    {editingId === stat._id ? (
                      <input
                        type="text"
                        className="w-full border border-gray-200 px-4 py-3 outline-none focus:border-primary text-sm font-medium transition-all"
                        value={formData.value || ''}
                        onChange={e => setFormData({ ...formData, value: e.target.value })}
                      />
                    ) : (
                      <span className="text-primary font-black text-xl tracking-tighter">{stat.value}</span>
                    )}
                  </td>
                  
                  <td className="py-4 text-center">
                    {editingId === stat._id ? (
                      <input
                        type="checkbox"
                        checked={formData.active !== false}
                        onChange={e => setFormData({ ...formData, active: e.target.checked })}
                        className="w-5 h-5 accent-primary cursor-pointer"
                      />
                    ) : (
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${stat.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {stat.active ? 'Active' : 'Hidden'}
                      </span>
                    )}
                  </td>

                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {editingId === stat._id ? (
                        <>
                          <button onClick={() => handleSave(stat._id)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg"><Save className="w-4 h-4" /></button>
                          <button onClick={() => { setEditingId(null); setFormData({}); }} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><X className="w-4 h-4" /></button>
                        </>
                      ) : (
                        <>
                          <button 
                            onClick={() => { setEditingId(stat._id); setFormData(stat); }} 
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(stat._id)} 
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              
              {!isAdding && stats.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500 font-medium">
                    No stats found. Click "Add Stat" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
