'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  LayoutDashboard,
  Upload,
  X,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  FileText
} from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface Application {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  order: number;
  active: boolean;
  category?: string | any;
}

interface Category {
  _id: string;
  name: string;
}

export default function ApplicationManagement() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [assetUploading, setAssetUploading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    order: 0,
    active: true,
    category: ''
  });

  useEffect(() => {
    fetchApplications();
    fetchCategories();
  }, []);

  async function fetchApplications() {
    setLoading(true);
    try {
      const res = await fetch('/api/applications?admin=true');
      if (res.ok) {
        const data = await res.json();
        setApplications(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  }

  async function fetchCategories() {
    try {
      const res = await fetch('/api/application-categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      console.error('Failed to load categories');
    }
  }

  const handleOpenModal = (app: Application | null = null) => {
    if (app) {
      setEditingApp(app);
      setFormData({
        name: app.name,
        description: app.description || '',
        image: app.image,
        order: app.order || 0,
        active: app.active,
        category: typeof app.category === 'object' ? app.category._id : app.category || ''
      });
    } else {
      setEditingApp(null);
      setFormData({
        name: '',
        description: '',
        image: '',
        order: applications.length,
        active: true,
        category: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingApp(null);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Name is required');
      return;
    }
    if (!formData.image) {
      toast.error('Image is required');
      return;
    }

    const url = editingApp ? `/api/applications/${editingApp._id}` : '/api/applications';
    const method = editingApp ? 'PATCH' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        toast.success(editingApp ? 'Application updated' : 'Application created');
        fetchApplications();
        handleCloseModal();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Operation failed');
      }
    } catch (err) {
      toast.error('Network error');
    }
  }

  async function deleteApplication(id: string) {
    if (!confirm('Delete this application? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/applications/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Application removed');
        setApplications(applications.filter(a => a._id !== id));
      }
    } catch (err) {
      toast.error('Delete failed');
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAssetUploading(true);
    const data = new FormData();
    data.append('file', file);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: data
      });
      if (res.ok) {
        const result = await res.json();
        setFormData(prev => ({ ...prev, image: result.url }));
        toast.success('Image uploaded');
      } else {
        toast.error('Upload failed');
      }
    } catch (err) {
      toast.error('Upload error');
    } finally {
      setAssetUploading(false);
    }
  };

  const filteredApps = applications
    .filter(app => app.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-secondary tracking-tighter uppercase mb-2 text-primary">Testing Applications</h1>
          <p className="text-gray-500 font-medium text-sm italic">Manage industry applications for your testing instruments.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center space-x-2 px-6 py-4 bg-secondary text-white text-xs font-black uppercase tracking-widest hover:bg-primary transition-all shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>Add Application</span>
        </button>
      </div>

      <div className="bg-white border border-gray-100 shadow-sm">
        <div className="p-4 border-b border-gray-100 flex items-center bg-gray-50/50">
          <Search className="w-5 h-5 text-gray-400 mr-3" />
          <input 
            type="text" 
            placeholder="Search applications..." 
            className="bg-transparent border-none outline-none text-sm font-medium w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="p-6">
          {loading ? (
            <div className="py-12 text-center text-gray-400 text-xs font-black uppercase tracking-widest">Synchronizing Application Data...</div>
          ) : filteredApps.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-xs font-black uppercase tracking-widest">No applications found</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredApps.map((app) => (
                <div key={app._id} className="group relative bg-white border border-gray-100 flex flex-col hover:border-primary transition-all duration-300 shadow-sm hover:shadow-md">
                  <div className="relative aspect-[5/3] w-full bg-gray-50 overflow-hidden">
                    <Image 
                      src={app.image} 
                      alt={app.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-tighter">
                      Order: {app.order}
                    </div>
                    {!app.active && (
                      <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="px-3 py-1 bg-gray-800 text-white text-[10px] font-black uppercase tracking-widest">Hidden</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-sm font-black text-secondary uppercase tracking-tight line-clamp-1 mb-2">{app.name}</h3>
                    <p className="text-xs text-gray-500 line-clamp-2 flex-1 italic mb-4">{app.description || 'No description provided'}</p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleOpenModal(app)}
                          className="p-2.5 bg-gray-50 text-gray-400 hover:text-primary hover:bg-primary/5 transition-all"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => deleteApplication(app._id)}
                          className="p-2.5 bg-red-50 text-red-400 hover:text-red-600 hover:bg-red-100 transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${app.active ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-gray-50 text-gray-400 border border-gray-100'}`}>
                        {app.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl border border-gray-100 shadow-2xl animate-in zoom-in-95 duration-200 my-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-secondary text-white">
              <h2 className="text-xl font-black uppercase tracking-tighter flex items-center text-white">
                <LayoutDashboard className="w-5 h-5 mr-3 text-primary " />
                {editingApp ? 'Edit Application' : 'Add New Application'}
              </h2>
              <button onClick={handleCloseModal} className="text-white/60 hover:text-white font-bold text-xl">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-4">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Application Image (Visual Reference)</label>
                <div className="relative group aspect-[5/3] bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden transition-all hover:border-primary/50">
                  {formData.image ? (
                    <>
                      <Image 
                        src={formData.image} 
                        alt="Preview" 
                        fill 
                        className="object-cover" 
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <label className="cursor-pointer bg-white text-secondary px-4 py-2 text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-primary hover:text-white transition-all">
                          Change Image
                          <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={assetUploading} />
                        </label>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setFormData({...formData, image: ''})}
                        className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleFileUpload}
                        disabled={assetUploading}
                      />
                      <Upload className={`w-8 h-8 mb-2 ${assetUploading ? 'animate-bounce text-primary' : 'text-gray-300 group-hover:text-primary'}`} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-primary">
                        {assetUploading ? 'Uploading...' : 'Upload Image'}
                      </span>
                    </label>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Application Name</label>
                  <input 
                    type="text" 
                    className="w-full border border-gray-200 px-4 py-3 outline-none focus:border-primary text-sm font-medium transition-all"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Adhesive Testing"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Application Category</label>
                  <select 
                    className="w-full border border-gray-200 px-4 py-3 outline-none focus:border-primary text-sm font-medium transition-all"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Description (Optional)</label>
                <textarea 
                  className="w-full border border-gray-200 px-4 py-3 outline-none focus:border-primary text-sm font-medium transition-all min-h-[100px] resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Briefly describe what this application involves..."
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Display Order</label>
                  <div className="flex items-center space-x-2">
                    <button 
                      type="button"
                      onClick={() => setFormData(p => ({...p, order: Math.max(0, p.order - 1)}))}
                      className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-500 transition-all"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <input 
                      type="number" 
                      className="flex-1 border border-gray-200 px-4 py-3 outline-none focus:border-primary text-sm font-bold text-center transition-all"
                      value={formData.order}
                      onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 0})}
                    />
                    <button 
                      type="button"
                      onClick={() => setFormData(p => ({...p, order: p.order + 1}))}
                      className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-500 transition-all"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center space-x-3 cursor-pointer group w-full bg-gray-50 p-3 border border-gray-100 hover:border-primary/30 transition-all">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 accent-primary cursor-pointer"
                      checked={formData.active}
                      onChange={(e) => setFormData({...formData, active: e.target.checked})}
                    />
                    <div className="flex items-center space-x-2">
                      {formData.active ? <Eye className="w-4 h-4 text-green-500" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 group-hover:text-secondary">Visible on Website</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="pt-6 flex justify-end space-x-4 border-t border-gray-100">
                <button 
                  type="button"
                  onClick={handleCloseModal}
                  className="px-8 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-secondary transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={assetUploading}
                  className="px-10 py-4 bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-secondary transition-all shadow-xl active:scale-95 disabled:opacity-50 flex items-center space-x-2"
                >
                  {assetUploading ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white animate-spin rounded-full" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>{editingApp ? 'Update Application' : 'Save Application'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
