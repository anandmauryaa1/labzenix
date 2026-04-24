'use client';

import { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Mail, 
  Phone,
  Clock, 
  Trash2, 
  CheckCircle2,
  AlertCircle,
  Hash,
  Eye,
  X,
  Share2,
  Box,
  ExternalLink,
  Target
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function InquiryManagement() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null);
  const [salesEmail, setSalesEmail] = useState('sales@labzenix.com');

  useEffect(() => {
    fetchInquiries();
  }, []);

  async function fetchInquiries() {
    try {
      const [res, settingsRes] = await Promise.all([
        fetch('/api/inquiries'),
        fetch('/api/admin/settings')
      ]);
      if (res.ok) {
        const data = await res.json();
        setInquiries(data);
      }
      if (settingsRes.ok) {
        const settings = await settingsRes.json();
        if (settings?.communication?.salesEmail) {
          setSalesEmail(settings.communication.salesEmail);
        }
      }
    } catch (err) {
      toast.error('Failed to load lead data');
    } finally {
      setLoading(false);
    }
  }

  async function deleteInquiry(id: string) {
    if (!confirm('Archive this lead permanently?')) return;
    try {
      const res = await fetch(`/api/inquiries`, { 
        method: 'DELETE',
        body: JSON.stringify({ id }),
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        toast.success('Lead archived');
        setInquiries(inquiries.filter(i => i._id !== id));
      }
    } catch (err) {
      toast.error('Operation failed');
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-secondary tracking-tighter uppercase mb-2">Lead Acquisition</h1>
          <p className="text-gray-500 font-medium text-sm">Coordinate client inquiries and manage laboratory instrument interest.</p>
        </div>
        <div className="bg-primary/5 border border-primary/20 px-4 py-2 flex items-center space-x-2">
           <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
           <span className="text-[10px] font-black uppercase tracking-widest text-primary">{inquiries.length} Active Leads</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="flex items-center justify-center p-20 bg-white border border-gray-100">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : inquiries.length === 0 ? (
          <div className="bg-white border border-gray-100 p-20 text-center">
            <AlertCircle className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <h3 className="font-bold text-secondary text-lg">No active leads found</h3>
            <p className="text-sm text-gray-400">All inquiries have been processed or archived.</p>
          </div>
        ) : inquiries.map((lead) => (
          <div key={lead._id} className="bg-white border border-gray-200 shadow-sm hover:border-primary/30 hover:shadow-md transition-all group rounded-sm overflow-hidden flex flex-col">
            <div className="p-6 md:p-8 flex-1">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-secondary text-white flex items-center justify-center text-xl font-black shadow-inner">
                    {lead.name[0]?.toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-secondary tracking-tight">{lead.name}</h3>
                    <div className="flex flex-wrap items-center gap-y-2 gap-x-4 mt-2">
                      <span className="flex items-center text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                        <Mail className="w-3.5 h-3.5 mr-1.5 text-primary" />
                        {lead.email}
                      </span>
                      {lead.phone && (
                        <span className="flex items-center text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                          <Phone className="w-3.5 h-3.5 mr-1.5 text-primary" />
                          {lead.phone}
                        </span>
                      )}
                      <span className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-100 px-2 py-1">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(lead.createdAt).toLocaleDateString()} {new Date(lead.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className={`flex items-center space-x-1.5 px-3 py-1 border transition-all ${
                    lead.source === 'download catalog' 
                      ? 'bg-amber-50 border-amber-200 text-amber-700' 
                      : lead.source === 'product page'
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-green-50 border-green-200 text-green-700'
                  }`}>
                    <Target className="w-3 h-3" />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Source: {lead.source || 'contact form'}
                    </span>
                  </div>
                  {lead.productId && (
                    <Link 
                      href={`/products/${lead.productId.slug}`} 
                      target="_blank"
                      className="flex items-center space-x-1 text-[9px] font-bold text-gray-400 hover:text-primary transition-colors uppercase tracking-widest"
                    >
                      <Box className="w-3 h-3" />
                      <span>{lead.productId.title?.substring(0, 20)}...</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </Link>
                  )}
                </div>
                
                {/* Archive Button (Top Right) */}
                <button 
                  onClick={() => deleteInquiry(lead._id)}
                  className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors rounded-sm"
                  title="Archive Lead"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              {/* Message Body */}
              <div className="space-y-4">
                {lead.subject && (
                  <div className="flex items-center space-x-2 text-xs font-black text-secondary uppercase tracking-widest py-1.5 px-3 bg-primary/5 text-primary border border-primary/10 w-fit">
                    <Hash className="w-3 h-3" />
                    <span>{lead.subject}</span>
                  </div>
                )}

                <div className="bg-gray-50/50 border border-gray-100 p-5 relative overflow-hidden group-hover:bg-gray-50 transition-colors">
                  <MessageSquare className="absolute top-4 right-4 w-12 h-12 text-gray-100" />
                  <p className="text-gray-600 font-medium leading-relaxed relative z-10 whitespace-pre-wrap text-sm line-clamp-3">
                    {lead.message}
                  </p>
                  <button 
                    onClick={() => setSelectedInquiry(lead)}
                    className="mt-3 text-[10px] font-black text-primary uppercase tracking-widest hover:text-secondary transition-colors inline-flex items-center cursor-pointer"
                  >
                    Read Full Message
                  </button>
                </div>
              </div>
            </div>
            
            {/* Action Footer */}
            <div className="bg-white border-t border-gray-100 p-4 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
               {/* Badges */}
               <div className="flex items-center space-x-4">
                 <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-green-50 border border-green-100 text-green-700">
                   <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                   <span className="text-[9px] font-black uppercase tracking-widest">Verified Inquiry</span>
                 </div>
                 <div className="text-[9px] font-black uppercase tracking-widest text-gray-400 hidden sm:block">
                   ID: <span className="text-gray-600">{lead._id.slice(-8).toUpperCase()}</span>
                 </div>
               </div>

               {/* Buttons */}
               <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button 
                    onClick={() => setSelectedInquiry(lead)}
                    className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2 bg-gray-50 text-secondary text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all border border-gray-200 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-gray-500" />
                    <span>View</span>
                  </button>
                  <a 
                    href={`mailto:${lead.email}?subject=${encodeURIComponent(lead.subject || 'Re: Inquiry from LabZenix')}`} 
                    className="flex-1 sm:flex-none cursor-pointer"
                  >
                    <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-secondary text-white text-[10px] font-black uppercase tracking-widest hover:bg-gray-900 transition-all cursor-pointer">
                      <Mail className="w-3.5 h-3.5 text-primary" />
                      <span className="hidden sm:inline">Reply</span>
                    </button>
                  </a>
                  <a 
                    href={`mailto:${salesEmail}?subject=${encodeURIComponent('New Lead Forward: ' + (lead.subject || 'Inquiry from LabZenix'))}&body=${encodeURIComponent(`Please review the following new lead:\n\nName: ${lead.name}\nEmail: ${lead.email}\nPhone: ${lead.phone || 'N/A'}\nSubject: ${lead.subject || 'N/A'}\n\nMessage:\n${lead.message}`)}`} 
                    className="flex-1 sm:flex-none cursor-pointer"
                  >
                    <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary/20 transition-all border border-primary/20 cursor-pointer">
                      <Share2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Share</span>
                    </button>
                  </a>
                  {lead.phone && (
                    <a href={`tel:${lead.phone}`} className="flex-1 sm:flex-none hidden sm:block cursor-pointer">
                      <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-white text-secondary text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all border border-gray-200 cursor-pointer">
                        <Phone className="w-3.5 h-3.5 text-gray-500" />
                      </button>
                    </a>
                  )}
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* Inquiry Detail Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 bg-secondary/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95 duration-300">
             <div className="absolute top-0 left-0 w-full h-2 bg-primary" />
             <button 
              onClick={() => setSelectedInquiry(null)}
              className="absolute top-6 right-6 p-2 text-gray-400 hover:text-secondary hover:bg-gray-100 transition-all"
             >
               <X className="w-6 h-6" />
             </button>

             <div className="p-8 md:p-12">
               <div className="flex items-center space-x-4 mb-10">
                 <div className="w-16 h-16 bg-secondary text-white flex items-center justify-center text-3xl font-black">
                   {selectedInquiry.name[0]?.toUpperCase()}
                 </div>
                 <div>
                   <h2 className="text-3xl font-black text-secondary tracking-tighter uppercase">{selectedInquiry.name}</h2>
                   <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em]">{new Date(selectedInquiry.createdAt).toLocaleString()}</p>
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                 <div className="space-y-1">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Address</p>
                   <p className="text-secondary font-bold break-all">{selectedInquiry.email}</p>
                 </div>
                 <div className="space-y-1">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Phone Number</p>
                   <p className="text-secondary font-bold">{selectedInquiry.phone || 'N/A'}</p>
                 </div>
                 <div className="md:col-span-2 space-y-1">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Inquiry Source</p>
                   <p className="text-secondary font-bold uppercase">{selectedInquiry.source || 'contact form'}</p>
                 </div>
                 <div className="md:col-span-2 space-y-1">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Subject</p>
                   <p className="text-secondary font-bold uppercase">{selectedInquiry.subject || 'No Subject'}</p>
                 </div>
               </div>

               <div className="space-y-4 mb-12">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Detailed Requirement</p>
                 <div className="bg-gray-50 p-8 border border-gray-100 text-secondary leading-relaxed whitespace-pre-wrap font-medium">
                   {selectedInquiry.message}
                 </div>
               </div>

               <div className="flex flex-col sm:flex-row gap-4">
                  <a 
                    href={`mailto:${selectedInquiry.email}?subject=${encodeURIComponent(selectedInquiry.subject || 'Re: Inquiry from LabZenix')}`} 
                    className="flex-1"
                  >
                    <button className="w-full flex items-center justify-center space-x-3 px-8 py-5 bg-secondary text-white text-xs font-black uppercase tracking-widest hover:bg-gray-950 transition-all">
                      <Mail className="w-5 h-5 text-primary" />
                      <span>Send Email</span>
                    </button>
                  </a>
                  <a 
                    href={`mailto:${salesEmail}?subject=${encodeURIComponent('New Lead Forward: ' + (selectedInquiry.subject || 'Inquiry from LabZenix'))}&body=${encodeURIComponent(`Please review the following new lead:\n\nName: ${selectedInquiry.name}\nEmail: ${selectedInquiry.email}\nPhone: ${selectedInquiry.phone || 'N/A'}\nSubject: ${selectedInquiry.subject || 'N/A'}\n\nMessage:\n${selectedInquiry.message}`)}`} 
                    className="flex-1"
                  >
                    <button className="w-full flex items-center justify-center space-x-3 px-8 py-5 bg-white text-secondary text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition-all border-2 border-secondary">
                      <Share2 className="w-5 h-5 text-primary" />
                      <span>Share to Sales</span>
                    </button>
                  </a>
                  {selectedInquiry.phone && (
                    <a href={`tel:${selectedInquiry.phone}`} className="flex-1">
                      <button className="w-full flex items-center justify-center space-x-3 px-8 py-5 bg-white text-secondary text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition-all border-2 border-secondary">
                        <Phone className="w-5 h-5 text-primary" />
                        <span>Place Call</span>
                      </button>
                    </a>
                  )}
               </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
