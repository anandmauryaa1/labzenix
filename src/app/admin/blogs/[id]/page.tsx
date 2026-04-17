'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';
import { 
  ArrowLeft, 
  Save, 
  Settings, 
  Globe, 
  Image as ImageIcon,
  ChevronRight,
  Sparkles,
  Plus,
  Trash2
} from 'lucide-react';
import Link from 'next/link';

const RichTextEditor = dynamic(() => import('@/components/blog/RichTextEditor'), { ssr: false });

export default function BlogForm({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = use(paramsPromise);
  const router = useRouter();
  const isNew = params.id === 'new';
  
  const [form, setForm] = useState({
    title: '', 
    slug: '', 
    content: '', 
    image: '', 
    category: '', 
    tags: '', 
    metaTitle: '', 
    metaDescription: ''
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'seo'>('content');

  useEffect(() => {
    if (!isNew) {
      fetch(`/api/blogs/${params.id}`)
        .then(res => res.json())
        .then(data => setForm({ 
          ...data, 
          tags: data.tags?.join(', ') || '' 
        }));
    }
  }, [params.id, isNew]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const payload = { 
      ...form, 
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) 
    };
    
    const method = isNew ? 'POST' : 'PUT';
    const url = isNew ? '/api/blogs' : `/api/blogs/${params.id}`;
    
    try {
      const res = await fetch(url, { 
        method, 
        body: JSON.stringify(payload), 
        headers: { 'Content-Type': 'application/json' } 
      });
      
      if (res.ok) { 
        toast.success(isNew ? 'Article created' : 'Article updated'); 
        router.push('/admin/blogs');
        router.refresh();
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || 'Operation failed');
      }
    } catch (err) {
      toast.error('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updateSlug = (title: string) => {
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setForm(prev => ({ ...prev, title, slug }));
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center space-x-4">
          <Link href="/admin/blogs">
            <button className="p-2 hover:bg-gray-100 transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-500" />
            </button>
          </Link>
          <div>
            <h1 className="text-3xl font-black text-secondary tracking-tighter uppercase">
              {isNew ? 'New Journal Entry' : 'Edit Analysis'}
            </h1>
            <div className="flex items-center text-xs space-x-2 text-gray-400 font-bold uppercase tracking-widest mt-1">
              <span>Journals</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-primary">{isNew ? 'Draft' : form.slug}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center space-x-2 px-8 py-4 bg-primary text-white text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Processing...' : 'Deploy Changes'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Editor Section */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white border border-gray-100 overflow-hidden">
            <div className="flex border-b border-gray-100">
              <button 
                onClick={() => setActiveTab('content')}
                className={`px-6 py-4 text-xs font-black uppercase tracking-widest flex items-center space-x-2 transition-all ${
                  activeTab === 'content' ? 'bg-secondary text-white' : 'text-gray-400 hover:text-secondary hover:bg-gray-50'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Content</span>
              </button>
              <button 
                onClick={() => setActiveTab('seo')}
                className={`px-6 py-4 text-xs font-black uppercase tracking-widest flex items-center space-x-2 transition-all ${
                  activeTab === 'seo' ? 'bg-secondary text-white' : 'text-gray-400 hover:text-secondary hover:bg-gray-50'
                }`}
              >
                <Globe className="w-4 h-4" />
                <span>SEO Metadata</span>
              </button>
            </div>

            <div className="p-8">
              {activeTab === 'content' ? (
                <div className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Article Title</label>
                    <input 
                      type="text" 
                      value={form.title || ''} 
                      onChange={(e) => updateSlug(e.target.value)}
                      placeholder="Enter a compelling industrial title..."
                      className="w-full text-2xl font-black text-secondary border-b-2 border-gray-100 focus:border-primary outline-none py-2 transition-colors placeholder:text-gray-200"
                      required 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Permanent Link (Slug)</label>
                    <div className="flex items-center text-sm font-medium text-gray-400 bg-gray-50 p-3">
                      <span>labzenix.com/blogs/</span>
                      <input 
                        type="text" 
                        value={form.slug || ''} 
                        onChange={(e) => setForm({...form, slug: e.target.value})}
                        className="bg-transparent border-none outline-none text-primary ml-1 flex-1 font-bold"
                        required 
                      />
                    </div>
                  </div>

                  <div className="min-h-[500px]">
                    <RichTextEditor value={form.content} onChange={(val: string) => setForm({ ...form, content: val })} />
                  </div>
                </div>
              ) : (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                  <div className="bg-primary/5 p-6 border-l-4 border-primary mb-8">
                    <div className="flex items-center space-x-2 mb-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <h4 className="font-black text-xs uppercase tracking-widest text-primary">SEO Best Practices</h4>
                    </div>
                    <p className="text-sm text-secondary/60 font-medium">Keep your meta title under 60 characters and description under 160 for optimal search visibility.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">SEO Title Tag</label>
                       <input 
                        type="text" 
                        value={form.metaTitle || ''} 
                        onChange={(e) => setForm({...form, metaTitle: e.target.value})}
                        placeholder="Search result heading..."
                        className="w-full p-4 bg-gray-50 border border-gray-100 focus:border-primary focus:bg-white outline-none transition-all font-bold text-secondary"
                      />
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Meta Description</label>
                       <textarea 
                        value={form.metaDescription || ''} 
                        onChange={(e) => setForm({...form, metaDescription: e.target.value})}
                        placeholder="Concise summary for search engines..."
                        rows={4}
                        className="w-full p-4 bg-gray-50 border border-gray-100 focus:border-primary focus:bg-white outline-none transition-all font-medium text-gray-600 resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Settings Section */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-100 p-6 space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-secondary flex items-center border-b border-gray-100 pb-4">
              <Settings className="w-4 h-4 mr-2 text-primary" />
              Publishing Settings
            </h3>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Category</label>
              <select 
                value={form.category || ''} 
                onChange={(e) => setForm({...form, category: e.target.value})}
                className="w-full p-3 bg-gray-50 border border-gray-100 outline-none text-sm font-bold text-secondary"
                required
              >
                <option value="">Select Category</option>
                <option value="Industrial Standards">Industrial Standards</option>
                <option value="Lab Guides">Lab Guides</option>
                <option value="Product News">Product News</option>
                <option value="Case Studies">Case Studies</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Tags (Comma Sep)</label>
              <input 
                type="text" 
                value={form.tags || ''} 
                onChange={(e) => setForm({...form, tags: e.target.value})}
                placeholder="safety, calibration..."
                className="w-full p-3 bg-gray-50 border border-gray-100 outline-none text-sm font-bold text-secondary"
              />
            </div>
          </div>

          <div className="bg-white border border-gray-100 p-6 space-y-6">
             <h3 className="text-xs font-black uppercase tracking-widest text-secondary flex items-center border-b border-gray-100 pb-4">
              <ImageIcon className="w-4 h-4 mr-2 text-primary" />
              Featured Media
            </h3>
            
            <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Cover Media</label>
            <div className="group relative aspect-video bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden transition-all hover:border-primary hover:bg-primary/5 cursor-pointer">
              {form.image ? (
                <>
                  <img src={form.image} className="w-full h-full object-cover" alt="" />
                  <div className="absolute inset-0 bg-secondary/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      type="button"
                      onClick={() => setForm({...form, image: ''})}
                      className="p-3 bg-red-600 text-white shadow-xl hover:scale-110 transition-transform"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </>
              ) : (
                <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    disabled={loading}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      
                      setLoading(true);
                      const formData = new FormData();
                      formData.append('file', file);
                      
                      try {
                        const res = await fetch('/api/admin/upload', {
                          method: 'POST',
                          body: formData
                        });
                        if (res.ok) {
                          const data = await res.json();
                          setForm(prev => ({ ...prev, image: data.url }));
                          toast.success('Cover asset synced');
                        } else {
                          toast.error('Upload protocol failed');
                        }
                      } catch (err) {
                        toast.error('Network connectivity issues');
                      } finally {
                        setLoading(false);
                      }
                    }}
                  />
                  <div className="text-center p-8">
                    <Plus className={`w-12 h-12 mx-auto mb-3 transition-transform ${loading ? 'animate-spin text-gray-300' : 'text-gray-300 group-hover:text-primary group-hover:scale-110'}`} />
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-primary">
                      {loading ? 'Processing...' : 'Upload Featured Image'}
                    </p>
                  </div>
                </label>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
}

function FileText({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}