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
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function InquiryManagement() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null);

  useEffect(() => {
    fetchInquiries();
  }, []);

  async function fetchInquiries() {
    try {
      const res = await fetch('/api/inquiries');
      if (res.ok) {
        const data = await res.json();
        setInquiries(data);
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
          <div key={lead._id} className="bg-white border-l-4 border-primary border-y border-r border-gray-100 shadow-sm hover:shadow-md transition-all group overflow-hidden">
            <div className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="space-y-6 flex-1">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-secondary text-white flex items-center justify-center text-xl font-black rounded-none">
                      {lead.name[0]?.toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-secondary uppercase tracking-tight">{lead.name}</h3>
                      <div className="flex flex-wrap items-center gap-y-1 gap-x-4 mt-1">
                        <span className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          <Mail className="w-3 h-3 mr-1.5 text-primary" />
                          {lead.email}
                        </span>
                        {lead.phone && (
                          <span className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            <Phone className="w-3 h-3 mr-1.5 text-primary" />
                            {lead.phone}
                          </span>
                        )}
                        <span className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          <Clock className="w-3 h-3 mr-1.5" />
                          {new Date(lead.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {lead.subject && (
                    <div className="flex items-center space-x-2 text-xs font-black text-secondary uppercase tracking-widest py-2 px-3 bg-gray-50 border border-gray-100 w-fit">
                      <Hash className="w-3 h-3 text-primary" />
                      <span>{lead.subject}</span>
                    </div>
                  )}

                  <div className="bg-gray-50 border border-gray-100 p-6 relative">
                    <MessageSquare className="absolute top-4 right-4 w-10 h-10 text-gray-200/50" />
                    <p className="text-secondary font-medium leading-relaxed relative z-10 whitespace-pre-wrap">
                      {lead.message}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap md:flex-col gap-3">
                  <button 
                    onClick={() => setSelectedInquiry(lead)}
                    className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gray-100 text-secondary text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all border border-gray-200"
                  >
                    <Eye className="w-4 h-4 text-primary" />
                    <span>View Detail</span>
                  </button>
                  <a 
                    href={`mailto:${lead.email}?subject=${encodeURIComponent(lead.subject || 'Re: Inquiry from LabZenix')}`} 
                    className="flex-1"
                  >
                    <button className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-secondary text-white text-[10px] font-black uppercase tracking-widest hover:bg-gray-950 transition-all shadow-lg shadow-secondary/10">
                      <Mail className="w-4 h-4 text-primary" />
                      <span>Mail Client</span>
                    </button>
                  </a>
                  {lead.phone && (
                    <a href={`tel:${lead.phone}`} className="flex-1">
                      <button className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-white text-secondary text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all border border-gray-200">
                        <Phone className="w-4 h-4 text-primary" />
                        <span>Call Now</span>
                      </button>
                    </a>
                  )}
                  <button 
                    onClick={() => deleteInquiry(lead._id)}
                    className="flex items-center justify-center space-x-2 px-6 py-3 bg-red-600/5 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all border border-red-600/10"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Archive</span>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 px-8 py-3 flex items-center justify-between border-t border-gray-100 mt-2">
               <div className="flex items-center space-x-2">
                 <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Status:</span>
                 <span className="text-[10px] font-black uppercase tracking-widest text-green-600">Verified Web Inquiry</span>
               </div>
               <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                 Source ID: <span className="ml-1 text-secondary">{lead._id.slice(-8).toUpperCase()}</span>
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
