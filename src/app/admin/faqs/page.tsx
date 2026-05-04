'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import toast from 'react-hot-toast';

interface FAQ {
  _id: string;
  question: string;
  answer: string;
  isActive: boolean;
  order: number;
}

export default function FAQManagement() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    isActive: true,
    order: 0
  });

  useEffect(() => {
    fetchFaqs();
  }, []);

  async function fetchFaqs() {
    setLoading(true);
    try {
      const res = await fetch('/api/faqs');
      if (res.ok) {
        const data = await res.json();
        setFaqs(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      toast.error('Failed to load FAQs');
    } finally {
      setLoading(false);
    }
  }

  const handleOpenModal = (faq: FAQ | null = null) => {
    if (faq) {
      setEditingFaq(faq);
      setFormData({
        question: faq.question,
        answer: faq.answer,
        isActive: faq.isActive,
        order: faq.order
      });
    } else {
      setEditingFaq(null);
      setFormData({
        question: '',
        answer: '',
        isActive: true,
        order: faqs.length
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingFaq(null);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const url = editingFaq ? `/api/faqs/${editingFaq._id}` : '/api/faqs';
    const method = editingFaq ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        toast.success(editingFaq ? 'FAQ updated' : 'FAQ created');
        fetchFaqs();
        handleCloseModal();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Operation failed');
      }
    } catch (err) {
      toast.error('Network error');
    }
  }

  async function deleteFaq(id: string) {
    if (!confirm('Delete this FAQ?')) return;
    try {
      const res = await fetch(`/api/faqs/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('FAQ deleted');
        setFaqs(faqs.filter(f => f._id !== id));
      }
    } catch (err) {
      toast.error('Delete failed');
    }
  }

  async function toggleActive(faq: FAQ) {
    try {
      const res = await fetch(`/api/faqs/${faq._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...faq, isActive: !faq.isActive })
      });
      if (res.ok) {
        setFaqs(faqs.map(f => f._id === faq._id ? { ...f, isActive: !f.isActive } : f));
        toast.success('Status updated');
      }
    } catch (err) {
      toast.error('Update failed');
    }
  }

  const filteredFaqs = faqs.filter(f => 
    f.question.toLowerCase().includes(search.toLowerCase()) ||
    f.answer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-secondary tracking-tighter uppercase mb-2">FAQ Management</h1>
          <p className="text-gray-500 font-medium text-sm">Create and manage frequently asked questions for the website.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center space-x-2 px-6 py-4 bg-secondary text-white text-xs font-black uppercase tracking-widest hover:bg-primary transition-all shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>Add FAQ</span>
        </button>
      </div>

      <div className="bg-white border border-gray-100 shadow-sm">
        <div className="p-4 border-b border-gray-100 flex items-center bg-gray-50/50">
          <Search className="w-5 h-5 text-gray-400 mr-3" />
          <input 
            type="text" 
            placeholder="Search questions or answers..." 
            className="bg-transparent border-none outline-none text-sm font-medium w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">
                <th className="px-6 py-4">Order</th>
                <th className="px-6 py-4">Question</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400 text-xs font-bold uppercase">Loading FAQs...</td>
                </tr>
              ) : filteredFaqs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400 text-xs font-bold uppercase">No FAQs found</td>
                </tr>
              ) : filteredFaqs.map((faq) => (
                <tr key={faq._id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4 text-xs font-bold text-gray-400">{faq.order}</td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-secondary uppercase text-xs tracking-tight line-clamp-1">{faq.question}</p>
                    <p className="text-[10px] text-gray-400 line-clamp-1 mt-1 font-medium">{faq.answer}</p>
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => toggleActive(faq)} className="flex items-center">
                      {faq.isActive ? (
                        <span className="flex items-center text-green-600 text-[10px] font-black uppercase tracking-tighter bg-green-50 px-2 py-1">
                          <ToggleRight className="w-4 h-4 mr-1" /> Active
                        </span>
                      ) : (
                        <span className="flex items-center text-gray-400 text-[10px] font-black uppercase tracking-tighter bg-gray-50 px-2 py-1">
                          <ToggleLeft className="w-4 h-4 mr-1" /> Inactive
                        </span>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button onClick={() => handleOpenModal(faq)} className="p-2 text-gray-300 hover:text-secondary transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteFaq(faq._id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors">
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl border border-gray-100 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-secondary text-white">
              <h2 className="text-xl font-black uppercase tracking-tighter">
                {editingFaq ? 'Edit FAQ' : 'Add New FAQ'}
              </h2>
              <button onClick={handleCloseModal} className="text-white/60 hover:text-white font-bold text-xl">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Question</label>
                <input 
                  type="text" 
                  required
                  className="w-full border border-gray-200 px-4 py-3 outline-none focus:border-primary text-sm font-medium transition-all"
                  value={formData.question}
                  onChange={(e) => setFormData({...formData, question: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Answer</label>
                <textarea 
                  required
                  rows={5}
                  className="w-full border border-gray-200 px-4 py-3 outline-none focus:border-primary text-sm font-medium transition-all resize-none"
                  value={formData.answer}
                  onChange={(e) => setFormData({...formData, answer: e.target.value})}
                />
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
                  className="px-10 py-4 bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-secondary transition-all shadow-xl active:scale-95"
                >
                  {editingFaq ? 'Update FAQ' : 'Create FAQ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
