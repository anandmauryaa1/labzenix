'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (res.ok) {
        setSubmitted(true);
        toast.success('Inquiry sent successfully!');
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
      {/* Header */}
      <section className="bg-secondary py-24 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 pattern-grid opacity-20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <span className="text-primary font-bold tracking-[0.3em] uppercase text-xs mb-4 block">Availability</span>
          <h1 className="text-4xl md:text-6xl font-black mb-6 uppercase tracking-tighter leading-none">Connect With Us</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto font-medium">
            Have questions about our laboratory instruments or need a custom quote? Our technical experts are here to assist you.
          </p>
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            {/* Contact Info */}
            <div className="space-y-12">
              <div>
                <h3 className="text-xl font-bold text-secondary mb-8 uppercase tracking-tighter border-b border-primary inline-block pb-2">Technical Sales</h3>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                      <Phone className="w-6 h-6" />
                    </div>
                    <div className="ml-6">
                      <p className="text-sm font-bold text-secondary uppercase tracking-widest mb-1">Call Us</p>
                      <a href="tel:+919565453120" className="text-lg text-gray-600 hover:text-primary transition-colors font-semibold">+91-9565453120</a>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div className="ml-6">
                      <p className="text-sm font-bold text-secondary uppercase tracking-widest mb-1">Email Us</p>
                      <a href="mailto:info@labzenix.com" className="text-lg text-gray-600 hover:text-primary transition-colors font-semibold">info@labzenix.com</a>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-secondary mb-8 uppercase tracking-tighter border-b border-primary inline-block pb-2">Our Office</h3>
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div className="ml-6">
                    <p className="text-sm font-bold text-secondary uppercase tracking-widest mb-1">Location</p>
                    <p className="text-gray-600 leading-relaxed">
                      123, Instrument Square,<br />
                      Industrial Area Phase II, Mohali,<br />
                      Punjab - 160062, India
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-secondary mb-8 uppercase tracking-tighter border-b border-primary inline-block pb-2">Hours</h3>
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div className="ml-6">
                    <p className="text-sm font-bold text-secondary uppercase tracking-widest mb-1">Working Hours</p>
                    <p className="text-gray-600">Monday - Saturday: 9:00 AM - 6:00 PM</p>
                    <p className="text-gray-600">Sunday: Closed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-2 bg-gray-50 p-8 md:p-12 border border-gray-100 shadow-sm relative">
              <div className="absolute top-0 right-0 w-2 h-full bg-primary" />
              <h3 className="text-2xl font-bold text-secondary mb-8 uppercase tracking-wider">Inquiry Form</h3>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input 
                  label="Your Name *" 
                  placeholder="Enter your full name" 
                  value={form.name}
                  onChange={(e) => setForm({...form, name: e.target.value})}
                  required 
                />
                <Input 
                  label="Email Address *" 
                  placeholder="Enter your business email" 
                  type="email" 
                  value={form.email}
                  onChange={(e) => setForm({...form, email: e.target.value})}
                  required 
                />
                <Input 
                  label="Phone Number *" 
                  placeholder="+91-0000000000" 
                  type="tel" 
                  value={form.phone}
                  onChange={(e) => setForm({...form, phone: e.target.value})}
                  required 
                />
                <Input 
                  label="Subject" 
                  placeholder="Inquiry about..." 
                  value={form.subject}
                  onChange={(e) => setForm({...form, subject: e.target.value})}
                />
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-medium text-secondary">Your Message *</label>
                  <textarea 
                    className="w-full h-32 px-4 py-3 bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                    placeholder="Tell us about your requirements..."
                    value={form.message}
                    onChange={(e) => setForm({...form, message: e.target.value})}
                    required
                  ></textarea>
                </div>
                <div className="md:col-span-2">
                  <Button 
                    type="submit"
                    size="lg" 
                    disabled={loading}
                    className="w-full flex items-center justify-center space-x-2"
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

      {/* Map Placeholder */}
      <section className="h-96 w-full bg-gray-200 mt-12 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center text-gray-500 font-bold text-xl uppercase tracking-widest bg-gray-100 z-10 pointer-events-none">
           Interactive Map Integration
        </div>
        <iframe 
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d11012.34567890123!2d76.7123456!3d30.7123456!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390fef1234567890%3A0x1234567890abcdef!2sIndustrial%20Area%2C%20Phase%20II%2C%20SAS%20Nagar%2C%20Punjab%20160062!5e0!3m2!1sen!2sin!4v1612345678901"
          className="w-full h-full border-0 grayscale opacity-50"
          allowFullScreen
          loading="lazy"
        ></iframe>
      </section>
    </div>
  );
}
