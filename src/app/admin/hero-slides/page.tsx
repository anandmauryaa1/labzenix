'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Layers,
  Link as LinkIcon,
  Upload,
  X,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff
} from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface HeroSlide {
  _id: string;
  image: string;
  link: string;
  order: number;
  active: boolean;
}

export default function HeroSlideManagement() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [assetUploading, setAssetUploading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    image: '',
    link: '/',
    order: 0,
    active: true
  });

  useEffect(() => {
    fetchSlides();
  }, []);

  async function fetchSlides() {
    setLoading(true);
    try {
      const res = await fetch('/api/hero-slides?admin=true');
      if (res.ok) {
        const data = await res.json();
        setSlides(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      toast.error('Failed to load slides');
    } finally {
      setLoading(false);
    }
  }

  const handleOpenModal = (slide: HeroSlide | null = null) => {
    if (slide) {
      setEditingSlide(slide);
      setFormData({
        image: slide.image,
        link: slide.link || '/',
        order: slide.order || 0,
        active: slide.active
      });
    } else {
      setEditingSlide(null);
      setFormData({
        image: '',
        link: '/',
        order: slides.length,
        active: true
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSlide(null);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.image) {
      toast.error('Image is required');
      return;
    }

    const url = editingSlide ? `/api/hero-slides/${editingSlide._id}` : '/api/hero-slides';
    const method = editingSlide ? 'PATCH' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        toast.success(editingSlide ? 'Slide updated' : 'Slide created');
        fetchSlides();
        handleCloseModal();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Operation failed');
      }
    } catch (err) {
      toast.error('Network error');
    }
  }

  async function deleteSlide(id: string) {
    if (!confirm('Delete this slide?')) return;
    try {
      const res = await fetch(`/api/hero-slides/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Slide removed');
        setSlides(slides.filter(s => s._id !== id));
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

  const filteredSlides = slides.sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-secondary tracking-tighter uppercase mb-2 text-primary">Hero Slides</h1>
          <p className="text-gray-500 font-medium text-sm italic">Manage the rotating banners on your landing page. Higher order number appears later.</p>
          <strong className='text-red-500'>NOTE: Maintain Aspect Ratio of 16:9 for the images for the best display.</strong>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center space-x-2 px-6 py-4 bg-secondary text-white text-xs font-black uppercase tracking-widest hover:bg-primary transition-all shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Slide</span>
        </button>
      </div>

      <div className="bg-white border border-gray-100 shadow-sm">
        <div className="p-4 border-b border-gray-100 flex items-center bg-gray-50/50">
          <Search className="w-5 h-5 text-gray-400 mr-3" />
          <input 
            type="text" 
            placeholder="Search slides..." 
            className="bg-transparent border-none outline-none text-sm font-medium w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="p-6">
          {loading ? (
            <div className="py-12 text-center text-gray-400 text-xs font-black uppercase tracking-widest">Synchronizing Hero Data...</div>
          ) : filteredSlides.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-xs font-black uppercase tracking-widest">No hero slides found</div>
          ) : (
            <div className="space-y-4">
              {filteredSlides.map((slide) => (
                <div key={slide._id} className="group relative bg-white border border-gray-100 p-4 flex flex-col md:flex-row items-center gap-6 hover:border-primary transition-all duration-300 shadow-sm hover:shadow-md">
                  <div className="relative w-full md:w-48 h-32 flex-shrink-0 bg-gray-50 overflow-hidden">
                    <Image 
                      src={slide.image} 
                      alt="Hero Slide"
                      fill
                      className="object-fill group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-tighter">
                      Order: {slide.order}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0 space-y-2 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start space-x-3">
                      {slide.active ? (
                        <span className="flex items-center text-[9px] font-black text-green-500 bg-green-50 px-2 py-0.5 rounded-full uppercase tracking-widest border border-green-100">Active</span>
                      ) : (
                        <span className="flex items-center text-[9px] font-black text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full uppercase tracking-widest border border-gray-100">Inactive</span>
                      )}
                    </div>
                    <div className="flex items-center justify-center md:justify-start text-[10px] text-primary font-black uppercase tracking-widest space-x-1">
                      <LinkIcon className="w-3 h-3" />
                      <span className="truncate">{slide.link || '/'}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 w-full md:w-auto justify-center">
                    <button 
                      onClick={() => handleOpenModal(slide)}
                      className="p-3 bg-gray-50 text-gray-400 hover:text-secondary hover:bg-gray-100 transition-all rounded-sm flex items-center space-x-2"
                      title="Edit Slide"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span className="md:hidden text-[10px] font-black uppercase">Edit</span>
                    </button>
                    <button 
                      onClick={() => deleteSlide(slide._id)}
                      className="p-3 bg-red-50 text-red-400 hover:text-red-600 hover:bg-red-100 transition-all rounded-sm flex items-center space-x-2"
                      title="Delete Slide"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="md:hidden text-[10px] font-black uppercase">Delete</span>
                    </button>
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
                <Layers className="w-5 h-5 mr-3 text-primary " />
                {editingSlide ? 'Edit Hero Slide' : 'Create New Hero Slide'}
              </h2>
              <button onClick={handleCloseModal} className="text-white/60 hover:text-white font-bold text-xl">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-4">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Slide Image (Recommend 1920x1080)</label>
                <div className="relative group aspect-video bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden transition-all hover:border-primary/50">
                  {formData.image ? (
                    <>
                      <Image 
                        src={formData.image} 
                        alt="Preview" 
                        fill 
                        className="object-fill" 
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
                        {assetUploading ? 'Syncing Asset...' : 'Upload Background Image'}
                      </span>
                    </label>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Link URL (Internal or External)</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-200 px-4 py-3 outline-none focus:border-primary text-sm font-medium transition-all"
                  value={formData.link}
                  onChange={(e) => setFormData({...formData, link: e.target.value})}
                  placeholder="e.g. /products?category=paper"
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
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 group-hover:text-secondary">Visible to Public</span>
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
                    <span>{editingSlide ? 'Update Hero Slide' : 'Publish Slide'}</span>
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
