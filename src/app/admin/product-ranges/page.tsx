'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Layers,
  Upload,
  X,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  List
} from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface ProductRange {
  _id: string;
  title: string;
  slug: string;
  description: string;
  image: string;
  coreComponents: string[];
  order: number;
  active: boolean;
}

export default function ProductRangeManagement() {
  const [ranges, setRanges] = useState<ProductRange[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRange, setEditingRange] = useState<ProductRange | null>(null);
  const [assetUploading, setAssetUploading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    coreComponents: [] as string[],
    order: 0,
    active: true
  });

  const [newComponent, setNewComponent] = useState('');

  useEffect(() => {
    fetchRanges();
  }, []);

  async function fetchRanges() {
    setLoading(true);
    try {
      const res = await fetch('/api/product-ranges?admin=true');
      if (res.ok) {
        const data = await res.json();
        setRanges(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      toast.error('Failed to load product ranges');
    } finally {
      setLoading(false);
    }
  }

  const handleOpenModal = (range: ProductRange | null = null) => {
    if (range) {
      setEditingRange(range);
      setFormData({
        title: range.title,
        description: range.description || '',
        image: range.image,
        coreComponents: range.coreComponents || [],
        order: range.order || 0,
        active: range.active
      });
    } else {
      setEditingRange(null);
      setFormData({
        title: '',
        description: '',
        image: '',
        coreComponents: [],
        order: ranges.length,
        active: true
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRange(null);
    setNewComponent('');
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.title) {
      toast.error('Title is required');
      return;
    }
    if (!formData.image) {
      toast.error('Image is required');
      return;
    }
    if (formData.description.length > 120) {
      toast.error('Description must be under 120 characters');
      return;
    }

    const url = editingRange ? `/api/product-ranges/${editingRange._id}` : '/api/product-ranges';
    const method = editingRange ? 'PATCH' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        toast.success(editingRange ? 'Product Range updated' : 'Product Range created');
        fetchRanges();
        handleCloseModal();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Operation failed');
      }
    } catch (err) {
      toast.error('Network error');
    }
  }

  async function deleteRange(id: string) {
    if (!confirm('Delete this product range? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/product-ranges/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Product Range removed');
        setRanges(ranges.filter(r => r._id !== id));
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

  const addComponent = () => {
    if (!newComponent.trim()) return;
    setFormData(prev => ({
      ...prev,
      coreComponents: [...prev.coreComponents, newComponent.trim()]
    }));
    setNewComponent('');
  };

  const removeComponent = (index: number) => {
    setFormData(prev => ({
      ...prev,
      coreComponents: prev.coreComponents.filter((_, i) => i !== index)
    }));
  };

  const filteredRanges = ranges
    .filter(range => range.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-secondary tracking-tighter uppercase mb-2 text-primary">Complete Product Range</h1>
          <p className="text-gray-500 font-medium text-sm italic">Manage the high-level product series shown on your landing page.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center space-x-2 px-6 py-4 bg-secondary text-white text-xs font-black uppercase tracking-widest hover:bg-primary transition-all shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product Range</span>
        </button>
      </div>

      <div className="bg-white border border-gray-100 shadow-sm">
        <div className="p-4 border-b border-gray-100 flex items-center bg-gray-50/50">
          <Search className="w-5 h-5 text-gray-400 mr-3" />
          <input 
            type="text" 
            placeholder="Search product ranges..." 
            className="bg-transparent border-none outline-none text-sm font-medium w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="p-6">
          {loading ? (
            <div className="py-12 text-center text-gray-400 text-xs font-black uppercase tracking-widest">Synchronizing Range Data...</div>
          ) : filteredRanges.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-xs font-black uppercase tracking-widest">No product ranges found</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRanges.map((range) => (
                <div key={range._id} className="group relative bg-white border border-gray-100 flex flex-col hover:border-primary transition-all duration-300 shadow-sm hover:shadow-md overflow-hidden">
                  {/* Card Header/Image */}
                  <div className="relative aspect-video bg-gray-50 overflow-hidden">
                    <Image 
                      src={range.image} 
                      alt={range.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-tighter shadow-xl">
                      Order: {range.order}
                    </div>
                    <div className="absolute top-3 right-3 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleOpenModal(range)}
                        className="p-2 bg-white/90 backdrop-blur-sm text-secondary hover:text-primary transition-all shadow-lg"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => deleteRange(range._id)}
                        className="p-2 bg-white/90 backdrop-blur-sm text-red-500 hover:text-red-600 transition-all shadow-lg"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Card Content */}
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="mb-4">
                      <h3 className="text-base font-black text-secondary uppercase tracking-tight mb-2 line-clamp-1">{range.title}</h3>
                      <p className="text-[11px] text-gray-500 line-clamp-2 italic mb-4 h-8 leading-relaxed">{range.description}</p>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-4 min-h-[50px]">
                      {range.coreComponents.slice(0, 4).map((item, idx) => (
                        <span key={idx} className="px-2 py-1 bg-gray-50 text-[9px] font-bold text-gray-400 border border-gray-100 uppercase tracking-tight">
                          {item}
                        </span>
                      ))}
                      {range.coreComponents.length > 4 && (
                        <span className="px-2 py-1 bg-primary/5 text-[9px] font-bold text-primary border border-primary/10 uppercase tracking-tight">
                          +{range.coreComponents.length - 4} More
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 ${range.active ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-gray-50 text-gray-400 border border-gray-100'}`}>
                        {range.active ? 'Visible' : 'Hidden'}
                      </span>
                      <button 
                        onClick={() => handleOpenModal(range)}
                        className="text-[9px] font-black uppercase tracking-widest text-primary hover:underline flex items-center gap-1"
                      >
                        Quick Edit <ChevronUp className="w-3 h-3 rotate-90" />
                      </button>
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
          <div className="bg-white w-full max-w-3xl border border-gray-100 shadow-2xl animate-in zoom-in-95 duration-200 my-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-secondary text-white">
              <h2 className="text-xl font-black uppercase tracking-tighter flex items-center text-white">
                <Layers className="w-5 h-5 mr-3 text-primary " />
                {editingRange ? 'Edit Product Range' : 'Add New Product Range'}
              </h2>
              <button onClick={handleCloseModal} className="text-white/60 hover:text-white font-bold text-xl">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Side: Image & Meta */}
                <div className="space-y-6">
                  <div className="space-y-4">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Range Visual</label>
                    <div className="relative group aspect-square bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden transition-all hover:border-primary/50">
                      {formData.image ? (
                        <>
                          <Image src={formData.image} alt="Preview" fill className="object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <label className="cursor-pointer bg-white text-secondary px-4 py-2 text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-primary hover:text-white transition-all">
                              Change Image
                              <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={assetUploading} />
                            </label>
                          </div>
                          <button type="button" onClick={() => setFormData({...formData, image: ''})} className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                            <X className="w-3 h-3" />
                          </button>
                        </>
                      ) : (
                        <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                          <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={assetUploading} />
                          <Upload className={`w-8 h-8 mb-2 ${assetUploading ? 'animate-bounce text-primary' : 'text-gray-300 group-hover:text-primary'}`} />
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-primary">
                            {assetUploading ? 'Uploading...' : 'Upload Image'}
                          </span>
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Display Order</label>
                    <div className="flex items-center space-x-2">
                      <button type="button" onClick={() => setFormData(p => ({...p, order: Math.max(0, p.order - 1)}))} className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-500 transition-all">
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <input type="number" className="flex-1 border border-gray-200 px-4 py-3 outline-none focus:border-primary text-sm font-bold text-center transition-all" value={formData.order} onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 0})} />
                      <button type="button" onClick={() => setFormData(p => ({...p, order: p.order + 1}))} className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-500 transition-all">
                        <ChevronUp className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <label className="flex items-center space-x-3 cursor-pointer group w-full bg-gray-50 p-3 border border-gray-100 hover:border-primary/30 transition-all">
                    <input type="checkbox" className="w-5 h-5 accent-primary cursor-pointer" checked={formData.active} onChange={(e) => setFormData({...formData, active: e.target.checked})} />
                    <div className="flex items-center space-x-2">
                      {formData.active ? <Eye className="w-4 h-4 text-green-500" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 group-hover:text-secondary">Visible on Website</span>
                    </div>
                  </label>
                </div>

                {/* Right Side: Content & Components */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Range Title</label>
                    <input type="text" className="w-full border border-gray-200 px-4 py-3 outline-none focus:border-primary text-sm font-medium transition-all" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="e.g. Paper & Packaging Testing" required />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Detailed Description</label>
                      <span className={`text-[9px] font-black uppercase tracking-widest ${formData.description.length > 120 ? 'text-red-500' : 'text-gray-300'}`}>
                        {formData.description.length} / 120
                      </span>
                    </div>
                    <textarea 
                      maxLength={120}
                      className="w-full border border-gray-200 px-4 py-3 outline-none focus:border-primary text-sm font-medium transition-all min-h-[120px] resize-none" 
                      value={formData.description} 
                      onChange={(e) => setFormData({...formData, description: e.target.value})} 
                      placeholder="Describe the expertise in this range..." 
                      required 
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Core Components / Key Instruments</label>
                    <div className="flex space-x-2">
                      <input type="text" className="flex-1 border border-gray-200 px-4 py-3 outline-none focus:border-primary text-sm font-medium transition-all" value={newComponent} onChange={(e) => setNewComponent(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addComponent())} placeholder="Add an instrument name..." />
                      <button type="button" onClick={addComponent} className="p-3 bg-secondary text-white hover:bg-primary transition-all shadow-md">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="max-h-[150px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                      {formData.coreComponents.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-2.5 bg-gray-50 border border-gray-100 group/item">
                          <div className="flex items-center space-x-3">
                            <List className="w-3.5 h-3.5 text-gray-300" />
                            <span className="text-xs font-bold text-secondary uppercase tracking-tight">{item}</span>
                          </div>
                          <button type="button" onClick={() => removeComponent(index)} className="text-gray-300 hover:text-red-500 transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      {formData.coreComponents.length === 0 && (
                        <p className="text-[10px] text-gray-400 italic text-center py-4">No instruments added yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 flex justify-end space-x-4 border-t border-gray-100">
                <button type="button" onClick={handleCloseModal} className="px-8 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-secondary transition-all">Cancel</button>
                <button type="submit" disabled={assetUploading} className="px-10 py-4 bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-secondary transition-all shadow-xl active:scale-95 disabled:opacity-50 flex items-center space-x-2">
                  {assetUploading ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white animate-spin rounded-full" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>{editingRange ? 'Update Range' : 'Save Range'}</span>
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
