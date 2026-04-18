'use client';

import { useState, useEffect } from 'react';
import { 
  Globe, 
  Search, 
  Save, 
  Sparkles, 
  AlertCircle,
  Layout,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import SEOMetrics from '@/components/admin/SEOMetrics';

const PAGES = [
  { key: 'home', name: 'Home Landing', path: '/' },
  { key: 'about', name: 'About Us', path: '/about' },
  { key: 'products', name: 'Global Products', path: '/products' },
  { key: 'blogs', name: 'Knowledge Center', path: '/blogs' },
  { key: 'contact', name: 'Contact Protocol', path: '/contact' },
];

export default function SEOManagement() {
  const [activePage, setActivePage] = useState(PAGES[0]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [metaData, setMetaData] = useState<any[]>([]);
  const [form, setForm] = useState({
    metaTitle: '',
    metaDescription: '',
    h1: '',
    keywords: ''
  });

  useEffect(() => {
    fetchMetaData();
  }, []);

  useEffect(() => {
    const current = metaData.find(m => m.pageKey === activePage.key);
    if (current) {
      setForm({
        metaTitle: current.metaTitle || '',
        metaDescription: current.metaDescription || '',
        h1: current.h1 || '',
        keywords: current.keywords?.join(', ') || ''
      });
    } else {
      setForm({ metaTitle: '', metaDescription: '', h1: '', keywords: '' });
    }
  }, [activePage, metaData]);

  async function fetchMetaData() {
    try {
      const res = await fetch('/api/admin/seo');
      if (res.ok) {
        const data = await res.json();
        setMetaData(data);
      }
    } catch (err) {
      toast.error('Failed to load SEO metadata');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!form.metaTitle.trim()) return toast.error('Browser Title is mandatory');
    if (!form.metaDescription.trim()) return toast.error('Search Snippet Description is required');
    if (!form.h1.trim()) return toast.error('Primary Page Heading (H1) is required');
    if (!form.keywords.trim()) return toast.error('At least one indexing keyword is required');

    setSaving(true);
    try {
      const payload = {
        pageKey: activePage.key,
        ...form,
        keywords: form.keywords.split(',').map(k => k.trim()).filter(Boolean)
      };

      const res = await fetch('/api/admin/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success(`${activePage.name} SEO Synced`);
        fetchMetaData();
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || 'SEO sync failure');
      }
    } catch (err) {
      toast.error('Global SEO node connection failure');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-[1400px] mx-auto pb-20 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-secondary tracking-tighter uppercase mb-1">Search Engine Console</h1>
          <p className="text-gray-500 font-medium">Calibrate global visibility parameters for root system pages.</p>
        </div>
        
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center space-x-2 px-10 py-4 bg-primary text-white text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Syncing...' : 'Deploy SEO Headers'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4 px-4">System Nodes</div>
          {PAGES.map((page) => {
            const isActive = activePage.key === page.key;
            return (
              <button
                key={page.key}
                onClick={() => setActivePage(page)}
                className={`w-full flex items-center justify-between px-6 py-4 transition-all duration-200 border-l-4 text-left ${
                  isActive 
                    ? 'border-primary bg-primary/5 text-secondary font-black' 
                    : 'border-transparent text-gray-400 hover:text-secondary hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Layout className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-gray-300'}`} />
                  <span className="text-xs uppercase tracking-widest">{page.name}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-primary" />}
              </button>
            );
          })}
        </div>

        {/* Configuration Area */}
        <div className="lg:col-span-3 space-y-8">
           <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
             <div className="bg-secondary p-6 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                   <div className="p-2 bg-primary/10 rounded-none">
                      <Globe className="w-4 h-4 text-primary" />
                   </div>
                   <div>
                      <h3 className="text-white text-xs font-black uppercase tracking-widest">Header Configuration: {activePage.name}</h3>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Path: {activePage.path}</p>
                   </div>
                </div>
                <a href={activePage.path} target="_blank" className="p-2 text-gray-400 hover:text-white transition-colors">
                   <ExternalLink className="w-4 h-4" />
                </a>
             </div>

             <div className="p-10 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                   {/* Meta Title */}
                   <div className="space-y-4">
                      <SEOMetrics label="Header Strength" text={form.metaTitle} min={40} max={60} />
                      <div className="space-y-2 pt-2">
                         <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Browser Display Title</label>
                         <input 
                          type="text" 
                          value={form.metaTitle} 
                          onChange={(e) => setForm({...form, metaTitle: e.target.value})}
                          placeholder="Meta Title Tag..."
                          className="w-full p-4 bg-gray-50 border border-gray-100 focus:border-primary focus:bg-white outline-none transition-all font-bold text-secondary text-sm"
                        />
                      </div>
                   </div>

                   {/* Meta Description */}
                   <div className="space-y-4">
                      <SEOMetrics label="Summary Strength" text={form.metaDescription} min={120} max={160} />
                      <div className="space-y-2 pt-2">
                         <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Search Snippet Description</label>
                         <textarea 
                          value={form.metaDescription} 
                          onChange={(e) => setForm({...form, metaDescription: e.target.value})}
                          placeholder="The snippet shown in search results..."
                          rows={3}
                          className="w-full p-4 bg-gray-50 border border-gray-100 focus:border-primary focus:bg-white outline-none transition-all font-medium text-gray-600 text-xs resize-none leading-relaxed"
                        />
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-6 border-t border-gray-50">
                   {/* H1 Heading */}
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Primary Page Heading (H1)</label>
                      <input 
                        type="text" 
                        value={form.h1} 
                        onChange={(e) => setForm({...form, h1: e.target.value})}
                        placeholder="Visible page title..."
                        className="w-full p-4 bg-gray-50 border border-gray-100 focus:border-primary focus:bg-white outline-none transition-all font-bold text-secondary text-sm"
                      />
                   </div>

                   {/* Keywords */}
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Index Keywords</label>
                      <input 
                        type="text" 
                        value={form.keywords} 
                        onChange={(e) => setForm({...form, keywords: e.target.value})}
                        placeholder="laboratory, testing, instruments..."
                        className="w-full p-4 bg-gray-50 border border-gray-100 focus:border-primary focus:bg-white outline-none transition-all font-bold text-secondary text-sm"
                      />
                   </div>
                </div>

                <div className="bg-primary/5 p-6 border-l-4 border-primary flex items-start space-x-4">
                   <AlertCircle className="w-5 h-5 text-primary mt-1" />
                   <div>
                      <p className="text-xs font-black uppercase tracking-widest text-secondary mb-1">Optimization Note</p>
                      <p className="text-[10px] text-gray-500 leading-relaxed font-medium">
                        Changes to root headers will propagate to search engines on the next crawl. 
                        Ensure your visibility index is above 80% for optimal ranking performance.
                      </p>
                   </div>
                </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
