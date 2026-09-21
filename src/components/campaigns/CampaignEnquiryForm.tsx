'use client';

import React, { useState } from 'react';
import { CheckCircle2, Loader2, Send } from 'lucide-react';
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
      // Assemble structured message for comprehensive inquiry records
      const messageParts = [
        `Company: ${formData.company.trim()}`,
        formData.materialToTest.trim() ? `Material to Test: ${formData.materialToTest.trim()}` : null,
        formData.requiredStandard.trim() ? `Required Standard: ${formData.requiredStandard.trim()}` : null,
        formData.message.trim() ? `\nClient Notes:\n${formData.message.trim()}` : null,
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
      toast.success('Enquiry submitted successfully! Our engineering team will contact you shortly.');

      // Reset form fields
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
      toast.error(err.message || 'Failed to send inquiry. Please check your network and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className={`p-8 md:p-12 bg-white flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in zoom-in-95 duration-400 ${className}`}>
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shadow-inner">
          <CheckCircle2 className="w-9 h-9 text-emerald-600" />
        </div>

        <div className="space-y-2 max-w-md">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 inline-block">
            Inquiry Registered
          </span>
          <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-slate-900">
            Quotation Request Received
          </h3>
          <p className="text-slate-600 text-sm leading-relaxed font-medium">
            Thank you, <strong className="text-slate-900">{submittedData?.name}</strong>. Your inquiry for{' '}
            <strong className="text-slate-900">{campaignTitle}</strong> on behalf of{' '}
            <strong className="text-slate-900">{submittedData?.company}</strong> has been logged.
          </p>
          <p className="text-xs text-slate-400">
            A confirmation has been routed to our technical sales and laboratory specialists. We will reach out to{' '}
            <span className="font-semibold text-slate-700">{submittedData?.email}</span> within 24 business hours.
          </p>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="px-6 py-3 bg-slate-900 text-white hover:bg-primary transition-colors text-xs font-black uppercase tracking-widest cursor-pointer shadow-md"
          >
            Submit Another Inquiry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-8 md:p-12 bg-white ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label htmlFor="campaign-enquiry-name" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Name <span className="text-red-500">*</span>
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
              className="w-full px-4 py-3 border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all rounded-none bg-white text-sm text-slate-900 placeholder:text-slate-400"
            />
          </div>
          <div>
            <label htmlFor="campaign-enquiry-company" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Company / Institution <span className="text-red-500">*</span>
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
              className="w-full px-4 py-3 border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all rounded-none bg-white text-sm text-slate-900 placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label htmlFor="campaign-enquiry-email" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Business Email <span className="text-red-500">*</span>
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
              className="w-full px-4 py-3 border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all rounded-none bg-white text-sm text-slate-900 placeholder:text-slate-400"
            />
          </div>
          <div>
            <label htmlFor="campaign-enquiry-phone" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Phone Number
            </label>
            <input
              id="campaign-enquiry-phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 98765 43210"
              disabled={loading}
              className="w-full px-4 py-3 border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all rounded-none bg-white text-sm text-slate-900 placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label htmlFor="campaign-enquiry-material" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Material to Test
            </label>
            <input
              id="campaign-enquiry-material"
              type="text"
              name="materialToTest"
              value={formData.materialToTest}
              onChange={handleChange}
              placeholder="e.g. Corrugated Board, Paper, Textile"
              disabled={loading}
              className="w-full px-4 py-3 border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all rounded-none bg-white text-sm text-slate-900 placeholder:text-slate-400"
            />
          </div>
          <div>
            <label htmlFor="campaign-enquiry-standard" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Required Standard / Regulation
            </label>
            <input
              id="campaign-enquiry-standard"
              type="text"
              name="requiredStandard"
              value={formData.requiredStandard}
              onChange={handleChange}
              placeholder="e.g. ISO 2759, ASTM D3786, TAPPI"
              disabled={loading}
              className="w-full px-4 py-3 border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all rounded-none bg-white text-sm text-slate-900 placeholder:text-slate-400"
            />
          </div>
        </div>

        <div>
          <label htmlFor="campaign-enquiry-message" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Technical Requirements or Notes
          </label>
          <textarea
            id="campaign-enquiry-message"
            name="message"
            rows={3}
            value={formData.message}
            onChange={handleChange}
            placeholder="Please specify any custom capacity, software export, or testing range requirements..."
            disabled={loading}
            className="w-full px-4 py-3 border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none rounded-none bg-white text-sm text-slate-900 placeholder:text-slate-400"
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white font-black uppercase tracking-widest py-4 px-8 mt-2 hover:bg-slate-900 disabled:bg-slate-400 transition-all shadow-lg shadow-primary/30 rounded-none border border-primary cursor-pointer text-sm flex items-center justify-center space-x-2"
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

        <p className="text-[11px] text-slate-400 text-center uppercase tracking-wider">
          Direct manufacturer quotation • Factory calibrated • Calibration certificate included
        </p>
      </form>
    </div>
  );
}
