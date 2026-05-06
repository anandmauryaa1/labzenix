'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Quote,
  Star,
  X,
  MessageSquareQuote
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Testimonial {
  _id: string;
  name: string;
  role: string;
  text: string;
  rating: number;
  isActive: boolean;
  order: number;
}

export default function TestimonialManagement() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    text: '',
    rating: 5,
    isActive: true,
    order: 0
  });

  useEffect(() => {
    fetchTestimonials();
  }, []);

  async function fetchTestimonials() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/testimonials');
      if (res.ok) {
        const data = await res.json();
        setTestimonials(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      toast.error('Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  }

  const handleOpenModal = (testimonial: Testimonial | null = null) => {
    if (testimonial) {
      setEditingTestimonial(testimonial);
      setFormData({
        name: testimonial.name,
        role: testimonial.role,
        text: testimonial.text,
        rating: testimonial.rating,
        isActive: testimonial.isActive,
        order: testimonial.order || 0
      });
    } else {
      setEditingTestimonial(null);
      setFormData({
        name: '',
        role: '',
        text: '',
        rating: 5,
        isActive: true,
        order: testimonials.length
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTestimonial(null);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    const url = editingTestimonial ? `/api/admin/testimonials/${editingTestimonial._id}` : '/api/admin/testimonials';
    const method = editingTestimonial ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        toast.success(editingTestimonial ? 'Review updated' : 'Review created');
        fetchTestimonials();
        handleCloseModal();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Operation failed');
      }
    } catch (err) {
      toast.error('Network error');
    }
  }

  async function deleteTestimonial(id: string) {
    if (!confirm('Delete this landing page review?')) return;
    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Review removed');
        setTestimonials(testimonials.filter(t => t._id !== id));
      }
    } catch (err) {
      toast.error('Delete failed');
    }
  }

  const filteredTestimonials = testimonials.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.text.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-secondary tracking-tighter uppercase mb-2">Landing Reviews</h1>
          <p className="text-gray-500 font-medium text-sm">Manage customer stories and testimonials displayed on the landing page.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center space-x-2 px-6 py-4 bg-secondary text-white text-xs font-black uppercase tracking-widest hover:bg-primary transition-all shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>Add Review</span>
        </button>
      </div>

      <div className="bg-white border border-gray-100 shadow-sm">
        <div className="p-4 border-b border-gray-100 flex items-center bg-gray-50/50">
          <Search className="w-5 h-5 text-gray-400 mr-3" />
          <input 
            type="text" 
            placeholder="Search reviews by name or content..." 
            className="bg-transparent border-none outline-none text-sm font-medium w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Reviewer</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Content</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Rating</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 text-xs font-black uppercase tracking-widest">
                    Synchronizing Reviews...
                  </td>
                </tr>
              ) : filteredTestimonials.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 text-xs font-black uppercase tracking-widest">
                    No reviews registered
                  </td>
                </tr>
              ) : filteredTestimonials.map((testimonial) => (
                <tr key={testimonial._id} className="group hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary text-white flex items-center justify-center font-bold text-lg uppercase tracking-tighter shadow-sm">
                        {testimonial.name[0]}
                      </div>
                      <div>
                        <p className="font-black text-secondary uppercase text-xs tracking-widest leading-none mb-1">{testimonial.name}</p>
                        <p className="text-[10px] font-bold text-primary leading-none uppercase">{testimonial.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6 max-w-md">
                    <p className="text-gray-600 text-sm italic line-clamp-2">"{testimonial.text}"</p>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-3 h-3 ${i < testimonial.rating ? 'text-primary fill-primary' : 'text-gray-200 fill-gray-200'}`} 
                        />
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-6 text-center">
                    <span className={`inline-flex items-center px-2 py-1 text-[9px] font-black uppercase tracking-widest rounded-full ${
                      testimonial.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {testimonial.isActive ? 'Visible' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-6 py-6 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => handleOpenModal(testimonial)}
                        className="p-2 bg-gray-100 text-gray-400 hover:text-secondary hover:bg-gray-200 transition-all rounded-sm"
                        title="Edit Review"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => deleteTestimonial(testimonial._id)}
                        className="p-2 bg-red-50 text-red-400 hover:text-red-600 hover:bg-red-100 transition-all rounded-sm"
                        title="Delete Review"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl border border-gray-100 shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-secondary text-white">
              <h2 className="text-xl font-black uppercase tracking-tighter flex items-center text-white">
                <MessageSquareQuote className="w-5 h-5 mr-3 text-primary " />
                {editingTestimonial ? 'Edit Review' : 'Add New Landing Review'}
              </h2>
              <button onClick={handleCloseModal} className="text-white/60 hover:text-white font-bold text-xl">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Reviewer Name</label>
                  <input 
                    type="text" 
                    required
                    className="w-full border border-gray-200 px-4 py-3 outline-none focus:border-primary text-sm font-medium transition-all"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Dr. Rajesh Sharma"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Role / Designation</label>
                  <input 
                    type="text" 
                    required
                    className="w-full border border-gray-200 px-4 py-3 outline-none focus:border-primary text-sm font-medium transition-all"
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    placeholder="e.g. Quality Assurance Manager"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Review Content</label>
                <textarea 
                  required
                  rows={4}
                  className="w-full border border-gray-200 px-4 py-3 outline-none focus:border-primary text-sm font-medium transition-all resize-none italic"
                  value={formData.text}
                  onChange={(e) => setFormData({...formData, text: e.target.value})}
                  placeholder="Enter the customer testimonial here..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Star Rating</label>
                  <select 
                    className="w-full border border-gray-200 px-4 py-3 outline-none focus:border-primary text-sm font-medium transition-all appearance-none"
                    value={formData.rating}
                    onChange={(e) => setFormData({...formData, rating: parseInt(e.target.value)})}
                  >
                    {[5, 4, 3, 2, 1].map(num => (
                      <option key={num} value={num}>{num} Stars</option>
                    ))}
                  </select>
                </div>

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
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 group-hover:text-secondary">Visible on Home</span>
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
                  className="px-10 py-4 bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-secondary transition-all shadow-xl active:scale-95"
                >
                  {editingTestimonial ? 'Update Review' : 'Publish Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
