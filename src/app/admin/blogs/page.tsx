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

  async function deleteBlog(id: string) {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    try {
      const res = await fetch(`/api/blogs/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Blog deleted');
        setBlogs(blogs.filter(b => b._id !== id));
      }
    } catch (err) {
      toast.error('Delete failed');
    }
  }

  const filteredBlogs = blogs.filter(b => 
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
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
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">SEO Health</th>
                <th className="px-6 py-4 text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  </td>
                </tr>
              ) : filteredBlogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-medium">
                    No articles found matching your parameters.
                  </td>
                </tr>
              ) : filteredBlogs.map((blog) => (
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
                    <div className="flex items-center space-x-2">
                       <div className={`w-2 h-2 rounded-full ${blog.metaTitle && blog.metaDescription ? 'bg-green-500' : 'bg-orange-500'}`} />
                       <span className="text-[10px] font-bold uppercase tracking-tight text-gray-500">
                         {blog.metaTitle && blog.metaDescription ? 'Optimized' : 'Needs SEO'}
                       </span>
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
                        onClick={() => deleteBlog(blog._id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
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
  );
}
