'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Save,
  X,
  FileText,
  UploadCloud,
  Check,
  Loader2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  XCircle,
  GripVertical,
  ArrowUp,
  ArrowDown,
  ListOrdered,
  Award
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function CompanyCertificates() {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', description: '', fileUrl: '', filePublicId: '' });
  const [isAdding, setIsAdding] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Reorder state
  const [reorderMode, setReorderMode] = useState(false);
  const [orderedCertificates, setOrderedCertificates] = useState<any[]>([]);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  useEffect(() => {
    fetchCertificates();
  }, []);

  async function fetchCertificates() {
    try {
      const res = await fetch('/api/company-certificates');
      if (res.ok) {
        const data = await res.json();
        setCertificates(data);
        setOrderedCertificates(data);
      }
    } catch (err) {
      toast.error('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.fileUrl) return toast.error('Certificate file is required');
    setServerError(null);
    try {
      const url = editingId ? `/api/company-certificates/${editingId}` : '/api/company-certificates';
      const method = editingId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        body: JSON.stringify(form),
        headers: { 'Content-Type': 'application/json' }
      });

      if (res.ok) {
        setSuccess(true);
        toast.success(editingId ? 'Certificate updated successfully' : 'Certificate created successfully');
        
        setTimeout(() => {
          setSuccess(false);
          setForm({ title: '', description: '', fileUrl: '', filePublicId: '' });
          setEditingId(null);
          setIsAdding(false);
          fetchCertificates();
        }, 1500);
      } else {
        const data = await res.json();
        setServerError(data.error || 'Failed to save certificate.');
        toast.error('Failed to save certificate');
      }
    } catch (err) {
      setServerError('Network error. Please check your connection.');
      toast.error('Network error');
    }
  }

  async function deleteCertificate(id: string) {
    if (!confirm('Are you sure you want to remove this certificate?')) return;
    
    try {
      const res = await fetch(`/api/company-certificates/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Certificate removed');
        const updated = certificates.filter(c => c._id !== id);
        setCertificates(updated);
        setOrderedCertificates(updated);
      }
    } catch (err) {
      toast.error('Delete failed');
    }
  }

  const startEdit = (cert: any) => {
    setEditingId(cert._id);
    setForm({ 
      title: cert.title, 
      description: cert.description || '',
      fileUrl: cert.fileUrl || '',
      filePublicId: cert.filePublicId || ''
    });
    setIsAdding(true);
    setReorderMode(false);
  };

  const handleDragStart = (index: number) => {
    dragItem.current = index;
  };

  const handleDragEnter = (index: number) => {
    dragOverItem.current = index;
    if (dragItem.current === null || dragItem.current === index) return;
    const newList = [...orderedCertificates];
    const dragged = newList.splice(dragItem.current, 1)[0];
    newList.splice(index, 0, dragged);
    dragItem.current = index;
    setOrderedCertificates(newList);
  };

  const handleDragEnd = () => {
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newList = [...orderedCertificates];
    [newList[index - 1], newList[index]] = [newList[index], newList[index - 1]];
    setOrderedCertificates(newList);
  };

  const moveDown = (index: number) => {
    if (index === orderedCertificates.length - 1) return;
    const newList = [...orderedCertificates];
    [newList[index], newList[index + 1]] = [newList[index + 1], newList[index]];
    setOrderedCertificates(newList);
  };

  async function saveOrder() {
    setIsSavingOrder(true);
    try {
      const payload = orderedCertificates.map((cert, idx) => ({ id: cert._id, order: idx }));
      const res = await fetch('/api/company-certificates/reorder', {
        method: 'PUT',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        toast.success('Certificate order saved');
        setCertificates([...orderedCertificates]);
        setReorderMode(false);
      } else {
        toast.error('Failed to save order');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setIsSavingOrder(false);
    }
  }

  const cancelReorder = () => {
    setOrderedCertificates([...certificates]);
    setReorderMode(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.type.startsWith('image/')) {
      return toast.error('Only PDF or Image files are permitted');
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
          fileUrl: data.url,
          filePublicId: data.public_id 
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

  const removeFile = () => {
    setForm(prev => ({ ...prev, fileUrl: '', filePublicId: '' }));
    toast.success('File removed');
  };

  const displayList = reorderMode ? orderedCertificates : certificates;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      {success && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-secondary/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white p-12 text-center max-w-sm w-full mx-4 shadow-2xl border-t-4 border-primary animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-black text-secondary tracking-tighter uppercase mb-2">Success</h2>
            <p className="text-sm text-gray-500 font-medium">Certificate saved successfully.</p>
          </div>
        </div>
      )}

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
        <div>
          <h1 className="text-3xl font-black text-secondary tracking-tighter uppercase mb-2">Company Certificates</h1>
          <p className="text-gray-500 font-medium text-sm">Manage company certificates displayed on the about page.</p>
        </div>
        <div className="flex items-center gap-3">
          {!isAdding && !reorderMode && (
            <>
              <button
                onClick={() => { setReorderMode(true); setOrderedCertificates([...certificates]); setIsAdding(false); }}
                className="flex items-center space-x-2 px-5 py-4 bg-white border border-gray-200 text-secondary text-xs font-black uppercase tracking-widest hover:border-primary hover:text-primary transition-all shadow-sm active:scale-95"
              >
                <ListOrdered className="w-4 h-4" />
                <span>Reorder</span>
              </button>
              <button 
                onClick={() => setIsAdding(true)}
                className="flex items-center space-x-2 px-6 py-4 bg-secondary text-white text-xs font-black uppercase tracking-widest hover:bg-primary transition-all shadow-lg active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Add Certificate</span>
              </button>
            </>
          )}
          {reorderMode && (
            <>
              <button
                onClick={cancelReorder}
                className="flex items-center space-x-2 px-5 py-4 bg-white border border-gray-200 text-gray-500 text-xs font-black uppercase tracking-widest hover:border-red-300 hover:text-red-500 transition-all shadow-sm active:scale-95"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
              <button
                onClick={saveOrder}
                disabled={isSavingOrder}
                className="flex items-center space-x-2 px-6 py-4 bg-primary text-white text-xs font-black uppercase tracking-widest hover:bg-secondary transition-all shadow-lg active:scale-95 disabled:opacity-50"
              >
                {isSavingOrder ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{isSavingOrder ? 'Saving...' : 'Save Order'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {reorderMode && (
        <div className="bg-primary/5 border border-primary/20 px-6 py-3 flex items-center space-x-3 animate-in slide-in-from-top-2 duration-300">
          <GripVertical className="w-4 h-4 text-primary flex-shrink-0" />
          <p className="text-xs font-bold text-primary uppercase tracking-widest">
            Drag rows or use ↑ ↓ arrows to reorder — then click <span className="font-black">Save Order</span>.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">
                    {reorderMode && <th className="px-4 py-4 w-10"></th>}
                    <th className="px-6 py-4">Certificate File</th>
                    <th className="px-6 py-4 text-right">{reorderMode ? 'Move' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr>
                      <td colSpan={reorderMode ? 4 : 3} className="px-6 py-12 text-center text-gray-400 uppercase text-[10px] font-black tracking-widest">
                        Loading...
                      </td>
                    </tr>
                  ) : displayList.length === 0 ? (
                    <tr>
                      <td colSpan={reorderMode ? 4 : 3} className="px-6 py-12 text-center text-gray-400 font-medium italic">
                        No certificates uploaded yet.
                      </td>
                    </tr>
                  ) : displayList.map((cert, index) => (
                    <tr
                      key={cert._id}
                      draggable={reorderMode}
                      onDragStart={reorderMode ? () => handleDragStart(index) : undefined}
                      onDragEnter={reorderMode ? () => handleDragEnter(index) : undefined}
                      onDragEnd={reorderMode ? handleDragEnd : undefined}
                      onDragOver={reorderMode ? (e) => e.preventDefault() : undefined}
                      className={`hover:bg-gray-50/50 transition-colors group ${reorderMode ? 'cursor-grab active:cursor-grabbing' : ''}`}
                    >
                      {reorderMode && (
                        <td className="px-4 py-4">
                          <GripVertical className="w-4 h-4 text-gray-300 group-hover:text-gray-400 transition-colors" />
                        </td>
                      )}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          {reorderMode && (
                            <span className="text-[10px] font-black text-gray-300 w-4 text-center select-none">{index + 1}</span>
                          )}
                          <div className="w-8 h-8 bg-primary/10 text-primary flex items-center justify-center font-black rounded-full overflow-hidden shrink-0">
                            <Award className="w-4 h-4" />
                          </div>
                          <div className="flex items-center">
                             <p className="font-bold text-secondary uppercase tracking-tight">Certificate Asset</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {cert.fileUrl ? (
                          <div className="flex items-center space-x-2">
                             <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                               <Check className="w-3 h-3 text-green-600" />
                             </div>
                             <a 
                               href={cert.fileUrl} 
                               target="_blank" 
                               rel="noopener noreferrer"
                               className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline flex items-center"
                             >
                               View File <ExternalLink className="w-2 h-2 ml-1" />
                             </a>
                          </div>
                        ) : (
                          <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">No Asset</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {reorderMode ? (
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => moveUp(index)}
                              disabled={index === 0}
                              className="p-2 text-gray-300 hover:text-secondary transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => moveDown(index)}
                              disabled={index === orderedCertificates.length - 1}
                              className="p-2 text-gray-300 hover:text-secondary transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                            >
                              <ArrowDown className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end space-x-2">
                            <button 
                              onClick={() => startEdit(cert)}
                              className="p-2 text-gray-300 hover:text-secondary transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => deleteCertificate(cert._id)}
                              className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {isAdding && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="bg-white border border-gray-100 p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-secondary flex items-center">
                  <Award className="w-4 h-4 mr-2 text-primary" />
                  {editingId ? 'Edit Certificate' : 'Add New Certificate'}
                </h3>
                <button 
                  onClick={() => {
                    setIsAdding(false);
                    setEditingId(null);
                    setForm({ title: '', description: '', fileUrl: '', filePublicId: '' });
                  }}
                  className="text-gray-400 hover:text-secondary transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Certificate File (PDF or Image)</label>
                  {form.fileUrl ? (
                    <div className="p-4 bg-green-50 border border-green-100 flex flex-col items-center justify-center group h-32 relative">
                      <FileText className="w-8 h-8 text-green-600 mb-2" />
                      <span className="text-[10px] font-black text-green-800 uppercase tracking-widest text-center">Certificate Loaded</span>
                      <button 
                        type="button"
                        onClick={removeFile}
                        className="absolute top-2 right-2 p-1.5 bg-white rounded-full text-red-500 shadow-sm hover:scale-110 transition-transform"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <label className={`w-full h-32 border-2 border-dashed rounded-sm p-4 flex flex-col items-center justify-center transition-all cursor-pointer ${
                      isUploading ? 'bg-gray-50 border-gray-200' : 'border-gray-200 hover:border-primary hover:bg-primary/5'
                    }`}>
                      <input type="file" accept=".pdf,image/*" onChange={handleFileUpload} className="hidden" disabled={isUploading} />
                      {isUploading ? (
                        <Loader2 className="w-6 h-6 text-primary animate-spin mb-2" />
                      ) : (
                        <UploadCloud className="w-6 h-6 text-gray-300 mb-2 group-hover:scale-110 transition-transform" />
                      )}
                      <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 text-center">Upload File</span>
                    </label>
                  )}
                </div>

                <button 
                  type="submit"
                  disabled={isUploading || !form.fileUrl}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-secondary text-white text-xs font-black uppercase tracking-widest hover:bg-primary transition-all shadow-md active:scale-95 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingId ? 'Save Changes' : 'Add Certificate'}</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
