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
  Trash2,
  FileText,
  Tag as TagIcon,
  Eye,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import SEOMetrics from '@/components/admin/SEOMetrics';
import Input from '@/components/ui/Input';
import TextArea from '@/components/ui/TextArea';

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
    status: 'published',
    tags: '', 
    metaTitle: '', 
    metaDescription: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/categories').then(res => res.json()).then(data => setCategories(data));
    
    if (!isNew) {
      fetch(`/api/blogs/${params.id}`)
        .then(res => res.json())
        .then(data => setForm({ 
          title: data.title || '',
          slug: data.slug || '',
          content: data.content || '',
          image: data.image || '',
          category: data.category || '',
          status: data.status || 'published',
          tags: data.tags?.join(', ') || '',
          metaTitle: data.metaTitle || '',
          metaDescription: data.metaDescription || ''
        }));
    }
  }, [params.id, isNew]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!form.title.trim()) {
      newErrors.title = 'Blog Title is mandatory';
    }
    if (!form.content.trim()) {
      toast.error('Article content cannot be empty'); // Still toast for large editor missing content
    }
    if (!form.image) {
      newErrors.image = 'Featured display image is required';
    }
    if (!form.category) {
      newErrors.category = 'Classification must be selected';
    }
    if (!form.tags.trim()) {
      newErrors.tags = 'At least one indexing tag is required';
    }
    if (!form.metaTitle.trim()) {
      newErrors.metaTitle = 'SEO Title is required for search indexing';
    }
    if (!form.metaDescription.trim()) {
      newErrors.metaDescription = 'SEO Meta Description is mandatory';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error('Please refine the mandatory fields before deploying');
      return false;
    }
    
    if (!form.content.trim()) return false;

    return true;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;
    
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
    <div className="max-w-[1400px] mx-auto pb-20 animate-in slide-in-from-bottom-4 duration-500">
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
              {isNew ? 'New Entry' : 'Edit Analysis'}
            </h1>
            <div className="flex items-center text-xs space-x-2 text-gray-400 font-bold uppercase tracking-widest mt-1">
              <span>Journals</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-primary">{isNew ? 'Draft' : form.slug}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
           {!isNew && (
             <Link href={`/blogs/${form.slug}`} target="_blank">
                <button className="flex items-center space-x-2 px-6 py-4 bg-white border border-gray-200 text-secondary text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition-all">
                  <Eye className="w-4 h-4 text-primary" />
                  <span>View Public</span>
                </button>
             </Link>
           )}
          <button 
            type="button"
            onClick={() => handleSubmit()}
            disabled={loading}
            className="flex items-center space-x-2 px-10 py-4 bg-primary text-white text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Processing...' : isNew ? 'Deploy Changes' : 'Update Analysis'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content (Left) */}
        <div className="lg:col-span-3 space-y-8">
          {/* Title Area */}
          <div className="bg-white border border-gray-100 p-8 shadow-sm space-y-6">
            <Input 
              label="Journal Title"
              value={form.title || ''} 
              onChange={(e) => updateSlug(e.target.value)}
              placeholder="Enter title here..."
              error={errors.title}
              info="The primary headline for this analysis. Keep it descriptive and technical."
              className="text-3xl font-black !p-0 !bg-transparent !border-none"
            />

            <div className="flex flex-col space-y-2 pt-4 border-t border-gray-50">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Public Protocol Path (Slug)</label>
              <div className="flex items-center text-[10px] font-bold text-primary uppercase tracking-widest">
                <span className="mr-2">labzenix.com/blogs/</span>
                <input 
                  type="text" 
                  value={form.slug || ''} 
                  onChange={(e) => setForm({...form, slug: e.target.value})}
                  className="bg-transparent border-none outline-none text-primary ml-1 flex-1 font-black"
                  required 
                />
              </div>
            </div>
          </div>

          {/* Editor Area */}
          <div className="bg-white border border-gray-100 shadow-sm min-h-[600px] flex flex-col">
            <div className="p-1 bg-gray-50 border-b border-gray-100 flex items-center justify-between px-6 py-3">
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Visual Composer</span>
               <Sparkles className="w-3 h-3 text-primary animate-pulse" />
            </div>
            <div className="flex-1 p-2">
               <RichTextEditor value={form.content} onChange={(val: string) => setForm({ ...form, content: val })} />
            </div>
          </div>

          {/* SEO Section (Bottom) */}
          <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-secondary p-6 flex items-center justify-between">
              <h3 className="text-white text-xs font-black uppercase tracking-widest flex items-center">
                <Globe className="w-4 h-4 mr-2 text-primary" />
                Search Console Optimization
              </h3>
              <Sparkles className="w-4 h-4 text-primary/50" />
            </div>
            
            <div className="p-10 space-y-10">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-4">
                    <SEOMetrics label="Title Strength" text={form.metaTitle} min={40} max={60} />
                    <Input 
                      label="SEO Title Tag"
                      value={form.metaTitle || ''} 
                      onChange={(e) => setForm({...form, metaTitle: e.target.value})}
                      placeholder="Heading in search results..."
                      error={errors.metaTitle}
                      info="This title appears in browser tabs and search engine results. Best to keep it between 40-60 characters."
                    />
                  </div>

                  <div className="space-y-4">
                    <SEOMetrics label="Description Strength" text={form.metaDescription} min={120} max={160} />
                    <TextArea 
                      label="Meta Description"
                      value={form.metaDescription || ''} 
                      onChange={(e) => setForm({...form, metaDescription: e.target.value})}
                      placeholder="Brief summary for indexing engines..."
                      rows={3}
                      error={errors.metaDescription}
                      info="A brief summary (120-160 chars) that appears beneath your link in search results."
                    />
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Sidebar (Right) */}
        <div className="space-y-6">
          {/* Status & Category */}
          <div className="bg-white border border-gray-100 p-8 shadow-sm space-y-8">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-secondary flex items-center border-b border-gray-100 pb-5">
              <Settings className="w-4 h-4 mr-2 text-primary" />
              Journal Status
            </h3>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Visibility Control</label>
                <select 
                  value={form.status || 'published'} 
                  onChange={(e) => setForm({...form, status: e.target.value})}
                  className="w-full p-4 bg-gray-50 border border-gray-100 outline-none text-xs font-black uppercase tracking-widest text-secondary focus:border-primary transition-all"
                >
                  <option value="published">Published (Public)</option>
                  <option value="draft">Draft (Private)</option>
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Classification</label>
                  {errors.category && <AlertCircle className="w-3 h-3 text-red-500 animate-pulse" />}
                </div>
                <select 
                  value={form.category || ''} 
                  onChange={(e) => setForm({...form, category: e.target.value})}
                  className={`w-full p-4 bg-gray-50 border ${errors.category ? 'border-red-500 bg-red-50/20' : 'border-gray-100'} outline-none text-xs font-black uppercase tracking-widest text-secondary focus:border-primary transition-all`}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((cat: any) => (
                    <option key={cat._id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
                {errors.category && <p className="text-[9px] font-black uppercase text-red-500 tracking-widest">{errors.category}</p>}
              </div>

              <Input 
                label="Index Tags"
                value={form.tags || ''} 
                onChange={(e) => setForm({...form, tags: e.target.value})}
                placeholder="safety, calibration..."
                error={errors.tags}
                info="Keywords that help users find this article. Comma-separated."
              />
            </div>
          </div>

          {/* Featured Image */}
          <div className="bg-white border border-gray-100 p-8 shadow-sm space-y-6">
             <h3 className="text-[10px] font-black uppercase tracking-widest text-secondary flex items-center border-b border-gray-100 pb-5">
              <ImageIcon className="w-4 h-4 mr-2 text-primary" />
              Featured View
              {errors.image && <AlertCircle className="w-3 h-3 ml-auto text-red-500 animate-pulse" />}
            </h3>
            
            <div className="space-y-4">
              <div className="group relative aspect-square bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden transition-all hover:border-primary hover:bg-primary/5 cursor-pointer">
                {form.image ? (
                  <>
                    <img src={form.image} className="w-full h-full object-cover" alt="" />
                    <div className="absolute inset-0 bg-secondary/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button 
                        type="button"
                        onClick={() => setForm({...form, image: ''})}
                        className="p-4 bg-red-600 text-white shadow-2xl hover:scale-110 transition-transform font-black text-[10px] uppercase tracking-widest flex items-center space-x-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-6 text-center">
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
                            toast.success('Asset Synced');
                          }
                        } catch (err) {
                          toast.error('Sync Failed');
                        } finally {
                          setLoading(false);
                        }
                      }}
                    />
                    <Plus className={`w-10 h-10 mx-auto mb-3 transition-transform ${loading ? 'animate-spin text-gray-200' : 'text-gray-200 group-hover:text-primary group-hover:scale-110'}`} />
                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-400 group-hover:text-primary leading-relaxed">
                      {loading ? 'Processing...' : 'Upload Featured View'}
                    </p>
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