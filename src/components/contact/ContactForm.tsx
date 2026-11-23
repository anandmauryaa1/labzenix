'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle2, ArrowUpRight, MessageSquare, ShieldCheck, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import FadeIn from '@/components/ui/FadeIn';

export default function ContactForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    fetch('/api/settings').then(res => res.json()).then(data => setSettings(data)).catch(console.error);
  }, []);

  // Helper to extract or generate a reliable, working Google Maps embed URL
  const getMapEmbedUrl = () => {
    const rawUrl = settings?.communication?.googleMapUrl?.trim();
    const address = settings?.communication?.address || '59/2/8 Site IV, Sahibabad Industrial Area, Ghaziabad, Uttar Pradesh – 201010';

    if (rawUrl) {
      // If user pasted full iframe tag: <iframe src="..." ...>
      const iframeSrcMatch = rawUrl.match(/src=["'](.*?)["']/);
      if (iframeSrcMatch && iframeSrcMatch[1]) {
        return iframeSrcMatch[1];
      }
      // If it's a valid embed URL that does NOT have the corrupted mock pb parameter
      if (rawUrl.includes('/maps/embed') && !rawUrl.includes('0x390fef')) {
        return rawUrl;
      }
    }

    // Universal working embed: renders interactive Google Map for the exact physical facility address
    return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&t=&z=17&ie=UTF8&iwloc=&output=embed`;
  };

  // Helper to get Google Maps directions URL
  const getDirectionsUrl = () => {
    const address = settings?.communication?.address || '59/2/8 Site IV, Sahibabad Industrial Area, Ghaziabad, Uttar Pradesh 201010';
    const rawUrl = settings?.communication?.googleMapUrl?.trim();
    if (rawUrl && !rawUrl.includes('/maps/embed') && !rawUrl.includes('<iframe') && (rawUrl.includes('google.com') || rawUrl.includes('goo.gl'))) {
      return rawUrl;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, source: 'contact form' })
      });

      if (res.ok) {
        toast.success('Inquiry sent successfully!');
        router.push('/thank-you');
      } else {
        toast.error('Failed to send inquiry. Please try again.');
      }
    } catch (err) {
      toast.error('Something went wrong. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="bg-white min-h-[60vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-8 animate-in zoom-in-95 duration-500">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="w-12 h-12 text-primary animate-in fade-in slide-in-from-bottom-2" />
          </div>
          <h2 className="text-4xl font-black text-secondary uppercase tracking-tighter">Message Received</h2>
          <p className="text-gray-500 font-medium text-lg leading-relaxed">
            Thank you for reaching out to **LabZenix**. Our technical sales team has been notified and will contact you via email or phone within 24 hours.
          </p>
          <div className="pt-4">
            <button
              onClick={() => setSubmitted(false)}
              className="px-8 py-4 bg-secondary text-white text-[10px] font-black uppercase tracking-widest hover:bg-gray-950 transition-all shadow-xl shadow-secondary/20"
            >
              Send Another Message
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* ─── Hero Section with Royal Blue Gradient & Tech Dot Matrix Pattern ────────── */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#031b4e] via-[#004aad] to-[#005cd6] text-white pt-12 sm:pt-16 md:pt-20 pb-28 sm:pb-36 md:pb-40">
        {/* Modern Dot Matrix Texture Overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-25"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255, 255, 255, 0.4) 1.5px, transparent 1.5px)',
            backgroundSize: '24px 24px',
            maskImage: 'radial-gradient(ellipse at 50% 50%, black 70%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse at 50% 50%, black 70%, transparent 100%)'
          }}
        />

        {/* Precision Geometric Concentric Rings */}
        <div className="absolute -top-32 -right-32 w-[520px] h-[520px] rounded-full border border-white/10 pointer-events-none" />
        <div className="absolute -top-16 -right-16 w-[380px] h-[380px] rounded-full border border-white/15 pointer-events-none" />
        <div className="absolute top-0 right-0 w-[240px] h-[240px] rounded-full border border-white/10 pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-[360px] h-[360px] rounded-full border border-white/10 pointer-events-none" />
        <div className="absolute -bottom-44 -left-44 w-[520px] h-[520px] rounded-full border border-white/5 pointer-events-none" />

        {/* Ambient Glows */}
        <div className="absolute -top-24 right-1/4 w-96 h-96 bg-sky-300/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 left-1/3 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full sm:w-[90%] max-w-7xl mx-auto px-4 text-center relative z-10">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="inline-flex items-center space-x-2 text-xs font-semibold text-blue-200/90 mb-4 bg-white/10 px-3.5 py-1 rounded-full border border-white/15 backdrop-blur-xs">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span className="text-blue-300/60">/</span>
            <span className="text-white">Contact Us</span>
          </nav>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-3 sm:mb-4 tracking-tight uppercase leading-tight">
            Connect With Us
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-blue-100/90 max-w-2xl mx-auto font-normal leading-relaxed">
            Have questions about our laboratory instruments or need a custom quote? Our technical experts are here to assist you.
          </p>
        </div>
      </section>

      {/* ─── 3 Floating Contact Cards (Overlapping Hero Boundary) ─────────── */}
      <div className="w-full sm:w-[90%] max-w-7xl mx-auto px-4 -mt-20 sm:-mt-24 md:-mt-28 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">

          {/* Card 1: Call Us */}
          <div className="bg-white rounded-xl p-6 sm:p-7 md:p-8 shadow-[0_15px_45px_rgba(0,0,0,0.08)] border border-gray-100 border-t-[3px] border-t-primary flex flex-col justify-between hover:shadow-[0_20px_50px_rgba(0,74,173,0.12)] hover:-translate-y-1 transition-all duration-300 group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#004aad] flex items-center justify-center mb-5 group-hover:bg-[#004aad] group-hover:text-white transition-colors duration-300">
                <Phone className="w-6 h-6 stroke-[1.8]" />
              </div>
              <h3 className="text-gray-900 font-bold text-lg sm:text-xl mb-1.5">Call us</h3>
              <a
                href={`tel:${(settings?.communication?.supportPhone || '+91 99902 97891').replace(/\s+/g, '')}`}
                className="text-[#004aad] hover:underline font-bold text-base sm:text-lg block mb-2 break-all"
              >
                {settings?.communication?.supportPhone || '+91 99902 97891'}
              </a>
              <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
                Talk to an application engineer
              </p>
            </div>
          </div>

          {/* Card 2: Email Us */}
          <div className="bg-white rounded-xl p-6 sm:p-7 md:p-8 shadow-[0_15px_45px_rgba(0,0,0,0.08)] border border-gray-100 border-t-[3px] border-t-primary flex flex-col justify-between hover:shadow-[0_20px_50px_rgba(0,74,173,0.12)] hover:-translate-y-1 transition-all duration-300 group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#004aad] flex items-center justify-center mb-5 group-hover:bg-[#004aad] group-hover:text-white transition-colors duration-300">
                <Mail className="w-6 h-6 stroke-[1.8]" />
              </div>
              <h3 className="text-gray-900 font-bold text-lg sm:text-xl mb-1.5">Email us</h3>
              <a
                href={`mailto:${settings?.communication?.supportEmail || 'Info@Labourtix.com'}`}
                className="text-[#004aad] hover:underline font-bold text-base sm:text-lg block mb-2 break-all"
              >
                {settings?.communication?.supportEmail || 'Info@Labourtix.com'}
              </a>
              <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
                Send specs, drawings or a standard
              </p>
            </div>
          </div>

          {/* Card 3: Visit Us */}
          <div className="bg-white rounded-xl p-6 sm:p-7 md:p-8 shadow-[0_15px_45px_rgba(0,0,0,0.08)] border border-gray-100 border-t-[3px] border-t-primary flex flex-col justify-between hover:shadow-[0_20px_50px_rgba(0,74,173,0.12)] hover:-translate-y-1 transition-all duration-300 group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#004aad] flex items-center justify-center mb-5 group-hover:bg-[#004aad] group-hover:text-white transition-colors duration-300">
                <MapPin className="w-6 h-6 stroke-[1.8]" />
              </div>
              <h3 className="text-gray-900 font-bold text-lg sm:text-xl mb-1.5">Visit us</h3>
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-4">
                {settings?.communication?.address || '59/2/8 Site IV, Sahibabad Industrial Area, Ghaziabad, Uttar Pradesh – 201010'}
              </p>
            </div>
            <div>
              <a
                href={getDirectionsUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#004aad] hover:underline font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 group-hover:gap-2 transition-all"
              >
                <span>Get directions</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* ─── Inquiry Form & Company Details ──────────────────────────────── */}
      <section className="py-12 sm:py-16 md:py-20 px-4">
        <div className="w-full sm:w-[90%] max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12 lg:gap-14 items-start">

            {/* Contact Details & Working Hours */}
            <div className="space-y-8 bg-gray-50/70 p-6 sm:p-8 rounded-xl border border-gray-100">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-secondary mb-4 uppercase tracking-tight border-b-2 border-primary inline-block pb-1.5">
                  Technical Sales
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0 text-primary">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div className="ml-4 min-w-0">
                      <p className="text-xs font-bold text-secondary uppercase tracking-wider mb-0.5">Sales Hotline</p>
                      <a href={`tel:${(settings?.communication?.salesPhone || '+91-98765-00002').replace(/\s+/g, '')}`} className="text-sm sm:text-base text-gray-700 hover:text-primary transition-colors font-semibold break-all">
                        {settings?.communication?.salesPhone || '+91-98765-00002'}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0 text-primary">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div className="ml-4 min-w-0">
                      <p className="text-xs font-bold text-secondary uppercase tracking-wider mb-0.5">Sales Email</p>
                      <a href={`mailto:${settings?.communication?.salesEmail || 'sales@labzenix.com'}`} className="text-sm sm:text-base text-gray-700 hover:text-primary transition-colors font-semibold break-all">
                        {settings?.communication?.salesEmail || 'sales@labzenix.com'}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-bold text-secondary mb-4 uppercase tracking-tight border-b-2 border-primary inline-block pb-1.5">
                  Customer Support
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0 text-primary">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div className="ml-4 min-w-0">
                      <p className="text-xs font-bold text-secondary uppercase tracking-wider mb-0.5">Support Desk</p>
                      <a href={`tel:${(settings?.communication?.supportPhone || '+91-9565453120').replace(/\s+/g, '')}`} className="text-sm sm:text-base text-gray-700 hover:text-primary transition-colors font-semibold break-all">
                        {settings?.communication?.supportPhone || '+91-9565453120'}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0 text-primary">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div className="ml-4 min-w-0">
                      <p className="text-xs font-bold text-secondary uppercase tracking-wider mb-0.5">Support Email</p>
                      <a href={`mailto:${settings?.communication?.supportEmail || 'info@labzenix.com'}`} className="text-sm sm:text-base text-gray-700 hover:text-primary transition-colors font-semibold break-all">
                        {settings?.communication?.supportEmail || 'info@labzenix.com'}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-bold text-secondary mb-4 uppercase tracking-tight border-b-2 border-primary inline-block pb-1.5">
                  Operating Hours
                </h3>
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0 text-primary">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="ml-4 min-w-0">
                    <p className="text-xs font-bold text-secondary uppercase tracking-wider mb-0.5">Business Hours</p>
                    <p className="text-gray-700 text-sm font-medium">Monday – Saturday: 9:00 AM – 6:00 PM</p>
                    <p className="text-gray-500 text-xs mt-0.5">Sunday: Closed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Inquiry Form */}
            <div className="lg:col-span-2 bg-white p-6 sm:p-8 md:p-10 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary to-blue-500" />
              <div className="mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">Direct Message</span>
                <h3 className="text-xl sm:text-2xl font-black text-secondary tracking-tight mt-0.5">
                  Send Us An Inquiry
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Fill out the form below with your equipment specifications or queries, and our engineers will respond within 24 hours.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <Input
                  label="Your Name *"
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
                <Input
                  label="Email Address *"
                  placeholder="Enter your business email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
                <Input
                  label="Phone Number *"
                  placeholder="+91-0000000000"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  required
                />
                <Input
                  label="Subject"
                  placeholder="Inquiry about testing equipment..."
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                />
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-medium text-secondary">Your Message *</label>
                  <textarea
                    className="w-full h-44 px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none text-sm"
                    placeholder="Tell us about your testing requirements, standard codes (ASTM/ISO), or sample material..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    required
                  ></textarea>
                </div>
                <div className="md:col-span-2 pt-2">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={loading}
                    className="w-full flex items-center justify-center space-x-2 py-3.5 text-sm font-bold shadow-md shadow-primary/20"
                  >
                    <Send className={`w-4 h-4 ${loading ? 'animate-pulse' : ''}`} />
                    <span>{loading ? 'Sending Request...' : 'Send Message'}</span>
                  </Button>
                </div>
              </form>
            </div>

          </div>
        </div>
      </section>

      {/* ─── Map in Card ─────────────────────────────────────────────────── */}
      <section className="pb-12 sm:pb-16 px-4">
        <div className="w-full sm:w-[90%] max-w-7xl mx-auto">
          <FadeIn direction="up">
            <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="h-[380px] sm:h-[480px] w-full rounded-lg overflow-hidden bg-gray-100 relative">
                <iframe
                  src={getMapEmbedUrl()}
                  className="w-full h-full border-0"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="LabZenix Location Map"
                ></iframe>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
