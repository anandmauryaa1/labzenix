'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Layers, 
  Edit2, 
  Trash2, 
  Save,
  X,
  ChevronRight,
  ArrowLeft,
  FileText,
  UploadCloud,
  Check,
  Loader2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  XCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function CategoryManagement() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', description: '', catalogUrl: '', catalogPublicId: '' });
  const [isAdding, setIsAdding] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Category name is required');
    if (!form.description.trim()) return toast.error('Category description is required');
    setServerError(null);
    try {
      const url = editingId ? `/api/categories/${editingId}` : '/api/categories';
      const method = editingId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        body: JSON.stringify(form),
        headers: { 'Content-Type': 'application/json' }
      });

      if (res.ok) {
        setSuccess(true);
        toast.success(editingId ? 'Category updated successfully' : 'Category created successfully');
        
        setTimeout(() => {
          setSuccess(false);
          setForm({ name: '', description: '', catalogUrl: '', catalogPublicId: '' });
          setEditingId(null);
          setIsAdding(false);
          fetchCategories();
        }, 1500);
      } else {
        const data = await res.json();
        setServerError(data.error || 'Failed to save category.');
        toast.error('Failed to save category');
      }
    } catch (err) {
      setServerError('Network error. Please check your connection.');
      toast.error('Network error');
    }
  }

  async function deleteCategory(id: string) {
    if (!confirm('Are you sure? This might affect products using this category.')) return;
    
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Category removed');
        setCategories(categories.filter(c => c._id !== id));
      }
    } catch (err) {
      toast.error('Delete failed');
    }
  }

  const startEdit = (cat: any) => {
    setEditingId(cat._id);
    setForm({ 
      name: cat.name, 
      description: cat.description || '',
      catalogUrl: cat.catalogUrl || '',
      catalogPublicId: cat.catalogPublicId || ''
    });
    setIsAdding(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      return toast.error('Only PDF files are permitted for catalogs');
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      });
      
      if (res.ok) {
        const data = await res.json();
        setForm(prev => ({ 
          ...prev, 
          catalogUrl: data.url,
          catalogPublicId: data.public_id 
        }));
        toast.success('File uploaded successfully');
      } else {
        toast.error('Upload failed. Please try again.');
      }
    } catch (err) {
      toast.error('Network error');
    } finally {
      setIsUploading(false);
    }
  };

  const removeCatalog = () => {
    setForm(prev => ({ ...prev, catalogUrl: '', catalogPublicId: '' }));
    toast.success('File removed');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      {/* Success Modal Overlay */}
      {success && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-secondary/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white p-12 text-center max-w-sm w-full mx-4 shadow-2xl border-t-4 border-primary animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-black text-secondary tracking-tighter uppercase mb-2">Success</h2>
            <p className="text-sm text-gray-500 font-medium">Category saved successfully.</p>
          </div>
        </div>
      )}

      {/* Error Message Display */}
      {serverError && (
        <div className="max-w-6xl mx-auto animate-in slide-in-from-top-4 duration-300 mb-8">
          <div className="bg-red-50 border-l-4 border-red-500 p-6 flex items-start space-x-4 shadow-sm">
            <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-black text-red-800 uppercase tracking-widest mb-1">Error</h3>
              <p className="text-xs text-red-600 font-bold">{serverError}</p>
            </div>
            <button onClick={() => setServerError(null)} className="text-red-400 hover:text-red-600 transition-colors ml-auto">
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Link href="/admin/products">
            <button className="p-2 hover:bg-gray-100 transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-500" />
            </button>
          </Link>
          <div>
            <h1 className="text-3xl font-black text-secondary tracking-tighter uppercase mb-2">Categories</h1>
            <p className="text-gray-500 font-medium text-sm">Organize and manage product categories.</p>
          </div>
        </div>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center space-x-2 px-6 py-4 bg-secondary text-white text-xs font-black uppercase tracking-widest hover:bg-primary transition-all shadow-lg active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Domain</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Category List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">
                    <th className="px-6 py-4">Domain Name</th>
                    <th className="px-6 py-4">Descriptor</th>
                    <th className="px-6 py-4">Catalog Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-gray-400 uppercase text-[10px] font-black tracking-widest">
                        Synchronizing...
                      </td>
                    </tr>
                  ) : categories.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-gray-400 font-medium italic">
                        No domains registered in the master catalog.
                      </td>
                    </tr>
                  ) : categories.map((cat) => (
                    <tr key={cat._id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary/10 text-primary flex items-center justify-center font-black text-xs">
                            {cat.name[0]}
                          </div>
                          <div>
                             <p className="font-bold text-secondary uppercase tracking-tight">{cat.name}</p>
                             <p className="text-[10px] text-gray-400 font-medium tracking-widest uppercase">Slug: {cat.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-gray-500 font-medium line-clamp-1">{cat.description || 'No specialized description provided.'}</p>
                      </td>
                      <td className="px-6 py-4">
                        {cat.catalogUrl ? (
                          <div className="flex items-center space-x-2">
                             <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
                               <Check className="w-3 h-3 text-green-600" />
                             </div>
                             <a 
                              href={cat.catalogUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline flex items-center"
                             >
                               View PDF <ExternalLink className="w-2 h-2 ml-1" />
                             </a>
                          </div>
                        ) : (
                          <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">No Asset</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button 
                            onClick={() => startEdit(cat)}
                            className="p-2 text-gray-300 hover:text-secondary transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => deleteCategory(cat._id)}
                            className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                          >
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
        </div>

        {/* Add/Edit Form */}
        {isAdding && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="bg-white border border-gray-100 p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-secondary flex items-center">
                  <Layers className="w-4 h-4 mr-2 text-primary" />
                  {editingId ? 'Refine Domain' : 'Define New Domain'}
                </h3>
                <button 
                  onClick={() => {
                    setIsAdding(false);
                    setEditingId(null);
                    setForm({ name: '', description: '' });
                  }}
                  className="text-gray-400 hover:text-secondary transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Domain Name</label>
                  <input 
                    type="text" 
                    value={form.name}
                    onChange={(e) => setForm({...form, name: e.target.value})}
                    placeholder="e.g. Compression Testing"
                    className="w-full p-4 bg-gray-50 border border-gray-100 text-sm font-bold outline-none focus:border-primary transition-all"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Classification Description</label>
                  <textarea 
                    value={form.description}
                    onChange={(e) => setForm({...form, description: e.target.value})}
                    placeholder="Define the scope of this industrial classification..."
                    rows={4}
                    className="w-full p-4 bg-gray-50 border border-gray-100 text-sm font-medium outline-none focus:border-primary transition-all resize-none"
                  />
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Technical Catalog Asset (PDF)</label>
                  
                  {form.catalogUrl ? (
                    <div className="p-4 bg-green-50 border border-green-100 flex items-center justify-between group">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-green-600" />
                        <span className="text-[10px] font-black text-green-800 uppercase tracking-widest">Master Catalog Loaded</span>
                      </div>
                      <button 
                        type="button"
                        onClick={removeCatalog}
                        className="p-2 text-green-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className={`w-full border-2 border-dashed rounded-sm p-8 flex flex-col items-center justify-center transition-all cursor-pointer ${
                      isUploading ? 'bg-gray-50 border-gray-200' : 'border-gray-200 hover:border-primary hover:bg-primary/5'
                    }`}>
                      <input 
                        type="file" 
                        accept=".pdf" 
                        onChange={handleFileUpload} 
                        className="hidden"
                        disabled={isUploading}
                      />
                      {isUploading ? (
                        <>
                          <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Syncing Asset...</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-8 h-8 text-gray-200 mb-3 group-hover:scale-110 transition-transform" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-primary">Click to Upload Catalog PDF</span>
                        </>
                      )}
                    </label>
                  )}
                </div>

                <button 
                  type="submit"
                  disabled={isUploading}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-secondary text-white text-xs font-black uppercase tracking-widest hover:bg-primary transition-all shadow-md active:scale-95 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingId ? 'Apply Refinements' : 'Deploy Domain'}</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
