'use client';

import React, { useState } from 'react';
import { 
  CheckCircle2, Loader2, Send, ShieldCheck, Clock, User, 
  Building2, Mail, Phone, Wrench, FileCheck, Sparkles, MessageSquare 
} from 'lucide-react';
import toast from 'react-hot-toast';

interface CampaignEnquiryFormProps {
  campaignTitle?: string;
  campaignSlug?: string;
  className?: string;
}

export default function CampaignEnquiryForm({
  campaignTitle = 'Laboratory Equipment',
  campaignSlug = 'general',
  className = '',
}: CampaignEnquiryFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    materialToTest: '',
    requiredStandard: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<typeof formData | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Please enter your full name');
      return;
    }
    if (!formData.company.trim()) {
      toast.error('Please enter your company name');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      toast.error('Please enter a valid business email');
      return;
    }

    setLoading(true);

    try {
      const messageParts = [
        `Company: ${formData.company.trim()}`,
        formData.materialToTest.trim() ? `Material to Test: ${formData.materialToTest.trim()}` : null,
        formData.requiredStandard.trim() ? `Required Standard: ${formData.requiredStandard.trim()}` : null,
        formData.message.trim() ? `\nClient Requirements:\n${formData.message.trim()}` : null,
      ].filter(Boolean);

      const combinedMessage = messageParts.length > 0 
        ? messageParts.join('\n') 
        : `Quotation inquiry requested for ${campaignTitle}`;

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim() || undefined,
        company: formData.company.trim(),
        subject: `Quotation Request - ${campaignTitle}`,
        message: combinedMessage,
        source: `campaign: ${campaignSlug}`,
      };

      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to submit inquiry');
      }

      setSubmittedData({ ...formData });
      setSubmitted(true);
      toast.success('Inquiry submitted! Our technical sales engineers will contact you shortly.');

      setFormData({
        name: '',
        company: '',
        email: '',
        phone: '',
        materialToTest: '',
        requiredStandard: '',
        message: '',
      });
    } catch (err: any) {
      console.error('Campaign enquiry submission error:', err);
      toast.error(err.message || 'Failed to send inquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className={`p-8 md:p-12 bg-white flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in zoom-in-95 duration-400 font-display ${className}`}>
        <div className="w-20 h-20 bg-emerald-100 border-2 border-emerald-300 rounded-full flex items-center justify-center text-emerald-600 shadow-xl">
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        </div>

        <div className="space-y-3 max-w-md">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 inline-block">
            INQUIRY REGISTERED
          </span>
          <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-slate-900">
            Quotation Request Received
          </h3>
          <p className="text-slate-600 text-sm leading-relaxed font-medium">
            Thank you, <strong className="text-slate-900">{submittedData?.name}</strong>. Your inquiry for{' '}
            <strong className="text-primary">{campaignTitle}</strong> on behalf of{' '}
            <strong className="text-slate-900">{submittedData?.company}</strong> has been assigned to our application engineers.
          </p>
          <div className="bg-slate-50 border border-slate-200 p-4 text-xs text-slate-600 space-y-1 text-left rounded-none">
            <p className="font-bold text-slate-900 uppercase">Summary Logged:</p>
            <p>• Contact Email: <span className="font-semibold text-slate-800">{submittedData?.email}</span></p>
            {submittedData?.phone && <p>• Phone: <span className="font-semibold text-slate-800">{submittedData?.phone}</span></p>}
            {submittedData?.materialToTest && <p>• Material: <span className="font-semibold text-slate-800">{submittedData?.materialToTest}</span></p>}
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="px-6 py-3 bg-slate-900 text-white hover:bg-primary transition-all text-xs font-black uppercase tracking-widest cursor-pointer shadow-lg rounded-none border border-slate-900"
          >
            Submit Another Request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-8 md:p-12 bg-white font-display border border-slate-200 ${className}`}>
      
      {/* Form Header */}
      <div className="mb-6 border-b border-slate-100 pb-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary bg-blue-50 border border-blue-200 px-2.5 py-0.5">
            OFFICIAL QUOTATION
          </span>
          <span className="flex items-center text-[11px] font-bold text-emerald-600">
            <Clock className="w-3.5 h-3.5 mr-1" /> Avg Response &lt; 2 Hours
          </span>
        </div>
        <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 mt-2">
          Request Direct Factory Quote
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Fill out the details below to receive a formal quotation, technical datasheet, and pricing options.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        
        {/* Name & Company */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="campaign-enquiry-name" className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center">
              <User className="w-3.5 h-3.5 mr-1 text-primary" /> Full Name <span className="text-red-500 ml-0.5">*</span>
            </label>
            <input
              id="campaign-enquiry-name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Dr. Rajesh Kumar"
              required
              disabled={loading}
              className="w-full px-3.5 py-2.5 border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all rounded-none bg-slate-50/30 text-xs text-slate-900 placeholder:text-slate-400 font-medium"
            />
          </div>

          <div>
            <label htmlFor="campaign-enquiry-company" className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center">
              <Building2 className="w-3.5 h-3.5 mr-1 text-primary" /> Company / Institution <span className="text-red-500 ml-0.5">*</span>
            </label>
            <input
              id="campaign-enquiry-company"
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="e.g. Apex Packaging Ltd"
              required
              disabled={loading}
              className="w-full px-3.5 py-2.5 border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all rounded-none bg-slate-50/30 text-xs text-slate-900 placeholder:text-slate-400 font-medium"
            />
          </div>
        </div>

        {/* Email & Phone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="campaign-enquiry-email" className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center">
              <Mail className="w-3.5 h-3.5 mr-1 text-primary" /> Business Email <span className="text-red-500 ml-0.5">*</span>
            </label>
            <input
              id="campaign-enquiry-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@company.com"
              required
              disabled={loading}
              className="w-full px-3.5 py-2.5 border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all rounded-none bg-slate-50/30 text-xs text-slate-900 placeholder:text-slate-400 font-medium"
            />
          </div>

          <div>
            <label htmlFor="campaign-enquiry-phone" className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center">
              <Phone className="w-3.5 h-3.5 mr-1 text-primary" /> Phone Number
            </label>
            <input
              id="campaign-enquiry-phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 98765 43210"
              disabled={loading}
              className="w-full px-3.5 py-2.5 border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all rounded-none bg-slate-50/30 text-xs text-slate-900 placeholder:text-slate-400 font-medium"
            />
          </div>
        </div>

        {/* Material & Standard */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="campaign-enquiry-material" className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center">
              <Wrench className="w-3.5 h-3.5 mr-1 text-primary" /> Material to Test
            </label>
            <input
              id="campaign-enquiry-material"
              type="text"
              name="materialToTest"
              value={formData.materialToTest}
              onChange={handleChange}
              placeholder="e.g. Paperboard, Corrugated, Textile"
              disabled={loading}
              className="w-full px-3.5 py-2.5 border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all rounded-none bg-slate-50/30 text-xs text-slate-900 placeholder:text-slate-400 font-medium"
            />
          </div>

          <div>
            <label htmlFor="campaign-enquiry-standard" className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center">
              <FileCheck className="w-3.5 h-3.5 mr-1 text-primary" /> Standard / Regulation
            </label>
            <input
              id="campaign-enquiry-standard"
              type="text"
              name="requiredStandard"
              value={formData.requiredStandard}
              onChange={handleChange}
              placeholder="e.g. ISO 2759, ASTM D3786"
              disabled={loading}
              className="w-full px-3.5 py-2.5 border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all rounded-none bg-slate-50/30 text-xs text-slate-900 placeholder:text-slate-400 font-medium"
            />
          </div>
        </div>

        {/* Requirements / Notes */}
        <div>
          <label htmlFor="campaign-enquiry-message" className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center">
            <MessageSquare className="w-3.5 h-3.5 mr-1 text-primary" /> Specific Technical Requirements
          </label>
          <textarea
            id="campaign-enquiry-message"
            name="message"
            rows={3}
            value={formData.message}
            onChange={handleChange}
            placeholder="Specify pressure range, custom fixtures, software export options, or installation location..."
            disabled={loading}
            className="w-full px-3.5 py-2.5 border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none rounded-none bg-slate-50/30 text-xs text-slate-900 placeholder:text-slate-400 font-medium"
          ></textarea>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary hover:bg-slate-950 text-white font-black uppercase tracking-widest py-3.5 px-6 transition-all shadow-xl shadow-primary/20 rounded-none border border-primary cursor-pointer text-xs flex items-center justify-center space-x-2 mt-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Transmitting Inquiry...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Submit Quotation Request</span>
            </>
          )}
        </button>

        {/* Guarantees */}
        <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-wider font-semibold border-t border-slate-100">
          <span className="flex items-center"><ShieldCheck className="w-3 h-3 text-emerald-600 mr-1" /> Confidential Inquiry</span>
          <span>NABL Traceable</span>
          <span>Factory Warranty</span>
        </div>

      </form>
    </div>
  );
}
