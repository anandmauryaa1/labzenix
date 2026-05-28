'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function AboutContentManagement() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    subtitle: '',
    title: '',
    titleHighlight: '',
    description: ''
  });

  useEffect(() => {
    fetchContent();
  }, []);

  async function fetchContent() {
    setLoading(true);
    try {
      const res = await fetch('/api/about-content');
      if (res.ok) {
        const data = await res.json();
        setFormData({
          subtitle: data.subtitle || 'Precision & Quality',
          title: data.title || 'About',
          titleHighlight: data.titleHighlight || 'LabZenix',
          description: data.description || ''
        });
      }
    } catch (err) {
      toast.error('Failed to load about content');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/about-content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        toast.success('About content updated');
      } else {
        const err = await res.json();
        toast.error(err.error || 'Update failed');
      }
    } catch (err) {
      toast.error('Network error');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="text-gray-500 font-bold text-sm uppercase">Loading...</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl">
      <div>
        <h1 className="text-3xl font-black text-secondary tracking-tighter uppercase mb-2">About LabZenix Content</h1>
        <p className="text-gray-500 font-medium text-sm">Manage the About summary section shown on the landing page.</p>
      </div>

      <div className="bg-white border border-gray-100 shadow-sm p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Subtitle (Small text above title)</label>
            <input 
              type="text" 
              required
              className="w-full border border-gray-200 px-4 py-3 outline-none focus:border-primary text-sm font-medium transition-all"
              value={formData.subtitle}
              onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Main Title Part 1</label>
              <input 
                type="text" 
                required
                className="w-full border border-gray-200 px-4 py-3 outline-none focus:border-primary text-sm font-medium transition-all"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Main Title Highlight (Colored part)</label>
              <input 
                type="text" 
                required
                className="w-full border border-gray-200 px-4 py-3 outline-none focus:border-primary text-sm font-medium transition-all text-primary"
                value={formData.titleHighlight}
                onChange={(e) => setFormData({...formData, titleHighlight: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Description Text</label>
            <textarea 
              required
              rows={6}
              className="w-full border border-gray-200 px-4 py-3 outline-none focus:border-primary text-sm font-medium transition-all resize-none"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button 
              type="submit"
              disabled={saving}
              className="px-10 py-4 bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-secondary transition-all shadow-xl active:scale-95 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
