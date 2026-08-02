'use client';

import { useState, useEffect } from 'react';
import { X, User, Phone, Mail, Building2, Package, MessageSquare, Send, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const POPUP_VISITED_KEY = 'labzenix_popup_shown';

export default function LeadCapturePopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    companyName: '',
    product: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Check if popup was already shown to this visitor
    const alreadyShown = localStorage.getItem(POPUP_VISITED_KEY);
    if (alreadyShown) return;

    // Show popup after 5 seconds
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    // Mark as shown so it won't appear again in this session / browser
    localStorage.setItem(POPUP_VISITED_KEY, 'true');
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.phone.trim()) newErrors.phone = 'Mobile number is required';
    else if (!/^[+]?[\d\s\-()]{7,15}$/.test(form.phone.trim())) newErrors.phone = 'Enter a valid mobile number';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) newErrors.email = 'Enter a valid email';
    if (!form.companyName.trim()) newErrors.companyName = 'Company name is required';
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setIsSubmitting(true);

    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        subject: form.companyName.trim(),
        message: [
          form.product ? `Product of Interest: ${form.product}` : null,
          form.message ? `Message: ${form.message}` : null,
          `Company: ${form.companyName}`,
        ].filter(Boolean).join('\n') || `Inquiry from ${form.companyName}`,
        source: 'popup',
      };

      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsSubmitted(true);
        localStorage.setItem(POPUP_VISITED_KEY, 'true');
        toast.success('Thank you! We will get back to you shortly.');
        setTimeout(() => {
          setIsVisible(false);
        }, 3000);
      } else {
        const data = await res.json();
        toast.error(data?.error || 'Submission failed. Please try again.');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Popup Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="popup-title"
        className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
      >
        <div className="relative w-full max-w-lg bg-white shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Accent top border */}
          <div className="h-1 w-full bg-gradient-to-r from-primary via-primary/70 to-primary/30" />

          {/* Close Button */}
          <button
            onClick={handleClose}
            aria-label="Close popup"
            className="absolute top-4 right-4 z-10 p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-6 md:p-8">
            {isSubmitted ? (
              /* Success State */
              <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-9 h-9 text-green-500" />
                </div>
                <h2 className="text-xl font-black text-secondary uppercase tracking-tight">
                  Thank You!
                </h2>
                <p className="text-sm text-gray-500 font-medium max-w-xs">
                  Our team will reach out to you shortly with more information.
                </p>
              </div>
            ) : (
              /* Form State */
              <>
                <div className="mb-6">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">
                    Exclusive Offer
                  </p>
                  <h2
                    id="popup-title"
                    className="text-xl md:text-2xl font-black text-secondary uppercase tracking-tighter leading-tight"
                  >
                    Get a Free Product Consultation
                  </h2>
                  <p className="text-sm text-gray-500 font-medium mt-1">
                    Talk to our experts and find the right lab instrument for your needs.
                  </p>
                </div>

                <form onSubmit={handleSubmit} noValidate className="space-y-3">
                  {/* Row: Name + Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Name */}
                    <div>
                      <label htmlFor="popup-name" className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                        <input
                          id="popup-name"
                          name="name"
                          type="text"
                          autoComplete="name"
                          value={form.name}
                          onChange={handleChange}
                          placeholder="Your Name"
                          className={`w-full pl-9 pr-3 py-2.5 text-sm border ${errors.name ? 'border-red-400 bg-red-50' : 'border-gray-200'} focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all`}
                        />
                      </div>
                      {errors.name && <p className="text-red-500 text-[10px] mt-0.5 font-bold">{errors.name}</p>}
                    </div>

                    {/* Phone */}
                    <div>
                      <label htmlFor="popup-phone" className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">
                        Mobile Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                        <input
                          id="popup-phone"
                          name="phone"
                          type="tel"
                          autoComplete="tel"
                          value={form.phone}
                          onChange={handleChange}
                          placeholder="+91 98765 43210"
                          className={`w-full pl-9 pr-3 py-2.5 text-sm border ${errors.phone ? 'border-red-400 bg-red-50' : 'border-gray-200'} focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all`}
                        />
                      </div>
                      {errors.phone && <p className="text-red-500 text-[10px] mt-0.5 font-bold">{errors.phone}</p>}
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="popup-email" className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                      <input
                        id="popup-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="you@company.com"
                        className={`w-full pl-9 pr-3 py-2.5 text-sm border ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200'} focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all`}
                      />
                    </div>
                    {errors.email && <p className="text-red-500 text-[10px] mt-0.5 font-bold">{errors.email}</p>}
                  </div>

                  {/* Company Name */}
                  <div>
                    <label htmlFor="popup-company" className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">
                      Company Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                      <input
                        id="popup-company"
                        name="companyName"
                        type="text"
                        autoComplete="organization"
                        value={form.companyName}
                        onChange={handleChange}
                        placeholder="Your Company"
                        className={`w-full pl-9 pr-3 py-2.5 text-sm border ${errors.companyName ? 'border-red-400 bg-red-50' : 'border-gray-200'} focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all`}
                      />
                    </div>
                    {errors.companyName && <p className="text-red-500 text-[10px] mt-0.5 font-bold">{errors.companyName}</p>}
                  </div>

                  {/* Product (Optional) */}
                  <div>
                    <label htmlFor="popup-product" className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">
                      Product of Interest <span className="text-gray-400 font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                      <input
                        id="popup-product"
                        name="product"
                        type="text"
                        value={form.product}
                        onChange={handleChange}
                        placeholder="e.g. Bursting Strength Tester"
                        className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Message (Optional) */}
                  <div>
                    <label htmlFor="popup-message" className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">
                      Message <span className="text-gray-400 font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-3 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                      <textarea
                        id="popup-message"
                        name="message"
                        rows={3}
                        value={form.message}
                        onChange={handleChange}
                        placeholder="Tell us about your requirement..."
                        className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                      />
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    id="popup-submit-btn"
                    disabled={isSubmitting}
                    className="w-full bg-primary text-white py-3 px-6 font-black uppercase tracking-widest text-sm hover:bg-primary/90 transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Request Free Consultation
                      </>
                    )}
                  </button>

                  <p className="text-[10px] text-center text-gray-400 font-medium">
                    We respect your privacy. No spam, ever.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
