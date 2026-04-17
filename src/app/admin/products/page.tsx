'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Search, 
  Package, 
  Edit2, 
  Trash2, 
  Layers, 
  Shield, 
  DollarSign,
  ChevronRight,
  Filter,
  Eye,
  ChevronLeft
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProductListing() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      toast.error('Failed to load catalog');
    } finally {
      setLoading(false);
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = (currentVisibleProducts: any[]) => {
    const visibleIds = currentVisibleProducts.map(p => p._id);
    const allSelected = visibleIds.every(id => selectedIds.includes(id));
    
    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  async function deleteProduct(id: string) {
    if (!confirm('Warning: This will remove the instrument from the catalog. Proceed?')) return;
    
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Product decommissioned');
        setProducts(products.filter(p => p._id !== id));
        setSelectedIds(prev => prev.filter(i => i !== id));
      } else {
        const err = await res.json();
        toast.error(err.error || 'Decommission failed');
      }
    } catch (err) {
      toast.error('Operation failed');
    }
  }

  async function bulkDelete() {
    if (!confirm(`Permanently decommission ${selectedIds.length} selected instruments?`)) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/products/bulk', {
        method: 'DELETE',
        body: JSON.stringify({ ids: selectedIds }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (res.ok) {
        toast.success('Batch operation complete');
        setProducts(products.filter(p => !selectedIds.includes(p._id)));
        setSelectedIds([]);
      } else {
        toast.error('Batch deletion failed');
      }
    } catch (err) {
      toast.error('Network protocol error');
    } finally {
      setLoading(false);
    }
  }

  const filteredProducts = (products || []).filter(p => 
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination Logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-secondary tracking-tighter uppercase mb-2">Instrument Catalog</h1>
          <p className="text-gray-500 font-medium text-sm">Manage precision laboratory instruments, technical specifications, and usage classifications.</p>
        </div>
        <Link href="/admin/products/new">
          <button className="flex items-center space-x-2 px-6 py-4 bg-secondary text-white text-xs font-black uppercase tracking-widest hover:bg-primary transition-all shadow-lg active:scale-95">
            <Plus className="w-4 h-4" />
            <span>Add New Instrument</span>
          </button>
        </Link>
      </div>

      <div className="bg-white border border-gray-100 shadow-sm relative overflow-hidden">
        {/* Bulk Action Bar */}
        {selectedIds.length > 0 && (
          <div className="absolute top-0 left-0 w-full h-[60px] bg-secondary z-20 flex items-center justify-between px-6 animate-in slide-in-from-top-full duration-300">
            <div className="flex items-center space-x-4">
              <span className="text-[10px] font-black text-white uppercase tracking-widest bg-primary px-2 py-1 rounded-sm">
                {selectedIds.length} Selected
              </span>
              <button 
                onClick={() => setSelectedIds([])}
                className="text-[10px] font-bold text-gray-400 hover:text-white uppercase tracking-wider transition-colors"
              >
                Cancel
              </button>
            </div>
            <button 
              onClick={bulkDelete}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all border border-red-500/20"
            >
              <Trash2 className="w-4 h-4" />
              <span>Decommission All</span>
            </button>
          </div>
        )}

        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center flex-1">
            <Search className="w-5 h-5 text-gray-400 mr-3" />
            <input 
              type="text" 
              placeholder="Search by instrument name or category..." 
              className="bg-transparent border-none outline-none text-sm font-medium w-full placeholder:text-gray-400"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">
                <th className="px-6 py-4 w-10">
                   <input 
                    type="checkbox" 
                    checked={currentItems.length > 0 && currentItems.every(p => selectedIds.includes(p._id))}
                    onChange={() => toggleSelectAll(currentItems)}
                    className="accent-primary"
                  />
                </th>
                <th className="px-6 py-4">Instrument / ID</th>
                <th className="px-6 py-4">Classification</th>
                <th className="px-6 py-4">Usage Layer</th>
                <th className="px-6 py-4">Market Value</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Synchronizing Catalog...</span>
                    </div>
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center space-y-2">
                       <Package className="w-8 h-8 text-gray-200 mb-2" />
                       <span className="text-sm font-bold text-gray-400 uppercase tracking-tight">No instruments found matching criteria.</span>
                    </div>
                  </td>
                </tr>
              ) : currentItems.map((product) => (
                <tr 
                  key={product._id} 
                  className={`hover:bg-gray-50/50 transition-colors group ${selectedIds.includes(product._id) ? 'bg-primary/5' : ''}`}
                >
                  <td className="px-6 py-4">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(product._id)}
                      onChange={() => toggleSelect(product._id)}
                      className="accent-primary"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center">
                        {product.images && product.images[0] ? (
                          <img src={product.images[0]} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <Package className="w-5 h-5 text-gray-300" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-secondary truncate max-w-[200px] uppercase tracking-tight">{product.title || 'Untitled'}</p>
                        <p className="text-[10px] text-gray-400 font-medium truncate">ID: {product._id?.slice(-8).toUpperCase()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-xs text-gray-500 font-medium">
                      <Layers className="w-3 h-3 mr-2 text-primary" />
                      {product.category || 'Uncategorized'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 text-[10px] font-black uppercase tracking-tighter ${
                      product.usage === 'Laboratory' ? 'bg-blue-50 text-blue-600' : 
                      product.usage === 'Production' ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'
                    }`}>
                      <Shield className="w-3 h-3 mr-1" />
                      {product.usage || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center font-black text-secondary text-sm">
                      <DollarSign className="w-3 h-3 text-gray-400" />
                      {product.price?.toLocaleString() || '0'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                       <Link href={`/products`}>
                        <button className="p-2 text-gray-300 hover:text-primary transition-colors tooltip" title="View Public Page">
                          <Eye className="w-4 h-4" />
                        </button>
                      </Link>
                      <Link href={`/admin/products/${product._id}`}>
                        <button className="p-2 text-gray-300 hover:text-secondary transition-colors" title="Edit Configuration">
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </Link>
                      <button 
                        onClick={() => deleteProduct(product._id)}
                        className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                        title="Decommission"
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

        {/* Improved Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-6 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              Showing <span className="text-secondary">{startIndex + 1}</span> to <span className="text-secondary">{Math.min(startIndex + itemsPerPage, filteredProducts.length)}</span> of <span className="text-secondary">{filteredProducts.length}</span> units
            </p>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-200 text-gray-400 hover:text-secondary hover:border-gray-400 disabled:opacity-30 disabled:hover:border-gray-200 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 text-[10px] font-black transition-all ${
                      currentPage === page ? 'bg-secondary text-white' : 'text-gray-400 hover:text-secondary hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-200 text-gray-400 hover:text-secondary hover:border-gray-400 disabled:opacity-30 disabled:hover:border-gray-200 transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}