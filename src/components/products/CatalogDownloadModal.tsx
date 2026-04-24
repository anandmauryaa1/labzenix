'use client';

import { useState } from 'react';
import { X, Download, Send, CheckCircle2, FileText, Loader2 } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import toast from 'react-hot-toast';

interface CatalogDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  productId: string;
  catalogUrl: string;
}

export default function CatalogDownloadModal({ 
  isOpen, 
  onClose, 
  productName, 
  productId,
  catalogUrl 
}: CatalogDownloadModalProps) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          productId,
          subject: `Catalog Download: ${productName}`,
          message: `User requested catalog download for ${productName}. Company: ${form.company}`,
          source: 'download catalog'
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        toast.success('Information submitted successfully!');
        
        // Trigger download
        const link = document.createElement('a');
        link.href = catalogUrl;
        link.download = `catalog-${productName.toLowerCase().replace(/\s+/g, '-')}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        toast.error('Failed to process request. Please try again.');
      }
    } catch (err) {
      toast.error('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-secondary/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white max-w-lg w-full relative animate-in zoom-in-95 duration-300 shadow-2xl border border-white/20">
        <div className="absolute top-0 left-0 w-full h-2 bg-primary" />
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-secondary hover:bg-gray-100 transition-all z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 md:p-10">
          {!submitted ? (
            <div className="space-y-8">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                  <FileText className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-black text-secondary uppercase tracking-tighter">Download Product Catalog</h2>
                <p className="text-gray-500 text-sm font-medium px-4">
                  Please provide your contact information to unlock the high-resolution technical catalog for <span className="text-secondary font-bold">{productName}</span>.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <Input 
                  label="Full Name *" 
                  placeholder="John Doe" 
                  value={form.name}
                  onChange={(e) => setForm({...form, name: e.target.value})}
                  required 
                />
                <Input 
                  label="Work Email *" 
                  placeholder="john@company.com" 
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({...form, email: e.target.value})}
                  required 
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Input 
                    label="Phone Number *" 
                    placeholder="+91-0000000000" 
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({...form, phone: e.target.value})}
                    required 
                  />
                  <Input 
                    label="Company Name" 
                    placeholder="LabZenix Solutions"
                    value={form.company}
                    onChange={(e) => setForm({...form, company: e.target.value})}
                  />
                </div>

                <div className="pt-4">
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full flex items-center justify-center space-x-3 py-5 bg-secondary text-white font-black uppercase tracking-[0.2em] text-xs hover:bg-gray-900 shadow-xl shadow-secondary/20 transition-all"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    <span>{loading ? 'Processing...' : 'Verify & Download'}</span>
                  </Button>
                </div>
                <p className="text-[10px] text-gray-400 text-center uppercase tracking-widest font-bold">
                  Secure Download • 100% Privacy Protected
                </p>
              </form>
            </div>
          ) : (
            <div className="text-center py-10 space-y-8 animate-in fade-in slide-in-from-bottom-4">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto text-green-500">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <div className="space-y-3">
                <h2 className="text-3xl font-black text-secondary uppercase tracking-tighter">Download Started</h2>
                <p className="text-gray-500 font-medium">
                  The technical catalog for <span className="font-bold text-secondary">{productName}</span> is being downloaded to your device.
                </p>
              </div>
              <div className="pt-4">
                <button 
                  onClick={onClose}
                  className="px-10 py-4 border-2 border-secondary text-secondary text-xs font-black uppercase tracking-widest hover:bg-secondary hover:text-white transition-all"
                >
                  Return to Product
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
