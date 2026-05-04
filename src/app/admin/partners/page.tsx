'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Handshake,
  Globe,
  Upload,
  X,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface Partner {
  _id: string;
  name: string;
  logo: string;
  website: string;
  isActive: boolean;
  order: number;
}

export default function PartnerManagement() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [assetUploading, setAssetUploading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    website: '',
    isActive: true,
    order: 0
  });

  useEffect(() => {
    fetchPartners();
  }, []);

  async function fetchPartners() {
    setLoading(true);
    try {
      const res = await fetch('/api/partners');
      if (res.ok) {
        const data = await res.json();
        setPartners(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      toast.error('Failed to load partners');
    } finally {
      setLoading(false);
    }
  }

  const handleOpenModal = (partner: Partner | null = null) => {
    if (partner) {
      setEditingPartner(partner);
      setFormData({
        name: partner.name,
        logo: partner.logo,
        website: partner.website || '',
        isActive: partner.isActive,
        order: partner.order || 0
      });
    } else {
      setEditingPartner(null);
      setFormData({
        name: '',
        logo: '',
        website: '',
        isActive: true,
        order: partners.length
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPartner(null);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.logo) {
      toast.error('Logo is required');
      return;
    }

    const url = editingPartner ? `/api/partners/${editingPartner._id}` : '/api/partners';
    const method = editingPartner ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        toast.success(editingPartner ? 'Partner updated' : 'Partner created');
        fetchPartners();
        handleCloseModal();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Operation failed');
      }
    } catch (err) {
      toast.error('Network error');
    }
  }

  async function deletePartner(id: string) {
    if (!confirm('Delete this partner?')) return;
    try {
      const res = await fetch(`/api/partners/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Partner removed');
        setPartners(partners.filter(p => p._id !== id));
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
        setFormData(prev => ({ ...prev, logo: result.url }));
        toast.success('Logo uploaded');
      } else {
        toast.error('Upload failed');
      }
    } catch (err) {
      toast.error('Upload error');
    } finally {
      setAssetUploading(false);
    }
  };

  const filteredPartners = partners.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-secondary tracking-tighter uppercase mb-2">Partner Management</h1>
          <p className="text-gray-500 font-medium text-sm">Manage global partner logos and associations displayed on the homepage.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center space-x-2 px-6 py-4 bg-secondary text-white text-xs font-black uppercase tracking-widest hover:bg-primary transition-all shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>Add Partner</span>
        </button>
      </div>

      <div className="bg-white border border-gray-100 shadow-sm">
        <div className="p-4 border-b border-gray-100 flex items-center bg-gray-50/50">
          <Search className="w-5 h-5 text-gray-400 mr-3" />
          <input 
            type="text" 
            placeholder="Search partners by name..." 
            className="bg-transparent border-none outline-none text-sm font-medium w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
          {loading ? (
            <div className="col-span-full py-12 text-center text-gray-400 text-xs font-black uppercase tracking-widest">Synchronizing Partners...</div>
          ) : filteredPartners.length === 0 ? (
            <div className="col-span-full py-12 text-center text-gray-400 text-xs font-black uppercase tracking-widest">No partners registered</div>
          ) : filteredPartners.map((partner) => (
            <div key={partner._id} className="group relative bg-white border border-gray-100 p-6 flex flex-col items-center justify-center space-y-4 hover:border-primary transition-all duration-300 shadow-sm hover:shadow-md">
              <div className="relative w-full aspect-[3/2] flex items-center justify-center grayscale group-hover:grayscale-0 transition-all">
                <Image 
                  src={partner.logo} 
                  alt={partner.name}
                  fill
                  className="object-contain"
                />
              </div>
              <div className="text-center">
                <p className="font-black text-secondary uppercase text-xs tracking-widest">{partner.name}</p>
                <p className="text-[9px] text-gray-400 truncate max-w-[150px] mt-1">{partner.website || 'No website link'}</p>
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <button 
                  onClick={() => handleOpenModal(partner)}
                  className="p-2 bg-gray-50 text-gray-400 hover:text-secondary hover:bg-gray-100 transition-all rounded-sm"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => deletePartner(partner._id)}
                  className="p-2 bg-red-50 text-red-400 hover:text-red-600 hover:bg-red-100 transition-all rounded-sm"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="absolute top-2 right-2">
                {partner.isActive ? (
                  <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-gray-300" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl border border-gray-100 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-secondary text-white">
              <h2 className="text-xl font-black uppercase tracking-tighter flex items-center text-white">
                <Handshake className="w-5 h-5 mr-3 text-primary " />
                {editingPartner ? 'Edit Partner' : 'Register New Partner'}
              </h2>
              <button onClick={handleCloseModal} className="text-white/60 hover:text-white font-bold text-xl">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-4">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Partner Brand Logo</label>
                <div className="relative group aspect-[3/1] bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden transition-all hover:border-primary/50">
                  {formData.logo ? (
                    <>
                      <Image 
                        src={formData.logo} 
                        alt="Preview" 
                        fill 
                        className="object-contain p-4" 
                      />
                      <button 
                        type="button"
                        onClick={() => setFormData({...formData, logo: ''})}
                        className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
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
                        {assetUploading ? 'Syncing Asset...' : 'Upload Logo'}
                      </span>
                    </label>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Partner Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full border border-gray-200 px-4 py-3 outline-none focus:border-primary text-sm font-medium transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Scientific Solutions Inc."
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Website URL (Optional)</label>
                <div className="flex">
                  <div className="bg-gray-100 border border-r-0 border-gray-200 px-3 flex items-center text-gray-400">
                    <Globe className="w-3.5 h-3.5" />
                  </div>
                  <input 
                    type="url" 
                    className="flex-1 border border-gray-200 px-4 py-3 outline-none focus:border-primary text-sm font-medium transition-all"
                    value={formData.website}
                    onChange={(e) => setFormData({...formData, website: e.target.value})}
                    placeholder="https://partner-website.com"
                  />
                </div>
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
                <div className="flex items-end pb-1">
                  <label className="flex items-center space-x-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 accent-primary"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 group-hover:text-secondary">Visible on Website</span>
                  </label>
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
                  disabled={assetUploading}
                  className="px-10 py-4 bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-secondary transition-all shadow-xl active:scale-95 disabled:opacity-50"
                >
                  {editingPartner ? 'Update Partner' : 'Register Partner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
