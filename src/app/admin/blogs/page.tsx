'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Eye,
  Calendar,
  FileText,
  Tag
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function BlogListing() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchBlogs();
  }, []);

  async function fetchBlogs() {
    try {
      const res = await fetch('/api/blogs');
      if (res.ok) {
        const data = await res.json();
        setBlogs(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      toast.error('Failed to load blogs');
    } finally {
      setLoading(false);
    }
  }

  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function deleteBlog() {
    if (!deleteId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/blogs/${deleteId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Journal entry decommissioned');
        setBlogs(blogs.filter(b => b._id !== deleteId));
        setDeleteId(null);
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || 'System Protocol: Decommission Failed');
      }
    } catch (err) {
      toast.error('Network protocol interrupted');
    } finally {
      setLoading(false);
    }
  }

  const filteredBlogs = blogs.filter(b => 
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-secondary tracking-tighter uppercase mb-2">Internal Journals</h1>
          <p className="text-gray-500 font-medium">Manage LabZenix insights and industry laboratory standards documentation.</p>
        </div>
        <Link href="/admin/blogs/new">
          <button className="flex items-center space-x-2 px-6 py-3 bg-primary text-white text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4" />
            <span>Create New Entry</span>
          </button>
        </Link>
      </div>

      <div className="bg-white border border-gray-100 shadow-sm">
        <div className="p-4 border-b border-gray-100 flex items-center bg-gray-50/50">
          <Search className="w-5 h-5 text-gray-400 mr-3" />
          <input 
            type="text" 
            placeholder="Search by title or category..." 
            className="bg-transparent border-none outline-none text-sm font-medium w-full placeholder:text-gray-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">
                <th className="px-6 py-4">Article</th>
                <th className="px-6 py-4">Author</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">SEO Health</th>
                <th className="px-6 py-4 text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && !deleteId ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  </td>
                </tr>
              ) : filteredBlogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400 font-medium">
                    No articles found matching your parameters.
                  </td>
                </tr>
              ) : filteredBlogs.map((blog) => {
                const hasMetaTitle = blog.metaTitle?.length >= 40;
                const hasMetaDesc = blog.metaDescription?.length >= 120;
                const seoStrength = (hasMetaTitle ? 50 : 0) + (hasMetaDesc ? 50 : 0);
                
                return (
                  <tr key={blog._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-100 overflow-hidden border border-gray-200">
                          {blog.image ? (
                            <img src={blog.image} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <FileText className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-secondary truncate max-w-[200px]">{blog.title}</p>
                          <p className="text-[10px] text-gray-400 font-medium truncate">/{blog.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary uppercase">
                            {blog.author?.name?.[0] || 'A'}
                          </div>
                          <span className="text-xs font-bold text-gray-600">
                            {blog.author?.name || 'Technical Team'}
                          </span>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 bg-secondary/5 text-secondary text-[10px] font-black uppercase tracking-tighter">
                        {blog.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-xs text-gray-500 font-medium">
                        <Calendar className="w-3 h-3 mr-2" />
                        {new Date(blog.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-widest text-gray-400 mb-1">
                           <span>Visibility Index</span>
                           <span>{seoStrength}%</span>
                        </div>
                        <div className="w-24 h-1 bg-gray-100 rounded-full overflow-hidden">
                           <div 
                             className={`h-full transition-all duration-1000 ${seoStrength === 100 ? 'bg-green-500' : seoStrength >= 50 ? 'bg-orange-400' : 'bg-red-500'}`} 
                             style={{ width: `${seoStrength}%` }}
                           />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link href={`/blogs/${blog.slug}`} target="_blank">
                          <button className="p-2 text-gray-400 hover:text-primary transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                        </Link>
                        <Link href={`/admin/blogs/${blog._id}`}>
                          <button className="p-2 text-gray-400 hover:text-secondary transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </Link>
                        <button 
                          onClick={() => setDeleteId(blog._id)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Decommission Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white max-w-md w-full p-8 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-300">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-red-50 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-black text-secondary uppercase tracking-tight">Decommission Entry</h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Protocol Override Required</p>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 leading-relaxed mb-8">
              You are about to permanently remove this analysis from the centralized database. This action is irreversible and will affect all public-facing knowledge center indices.
            </p>

            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setDeleteId(null)}
                className="flex-1 px-6 py-4 bg-gray-50 text-secondary text-xs font-black uppercase tracking-widest hover:bg-gray-100 transition-all border border-gray-100"
              >
                Abort
              </button>
              <button 
                onClick={deleteBlog}
                disabled={loading}
                className="flex-1 px-6 py-4 bg-red-600 text-white text-xs font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-500/20 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
