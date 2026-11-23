'use client';

import React, { useState } from 'react';
import { Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BlogNewsletter({ className = '' }: { className?: string } = {}) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid business email');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Newsletter Subscriber',
          email: email.trim().toLowerCase(),
          subject: 'Scientific Insights Newsletter',
          message: 'Subscribed to Scientific Insights and technical standards newsletter.',
          source: 'newsletter',
        }),
      });

      if (res.ok) {
        setIsSubscribed(true);
        toast.success('Thank you! You have subscribed to Scientific Insights.');
      } else {
        toast.error('Subscription failed. Please try again.');
      }
    } catch {
      toast.error('Network error. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={`bg-[#0B1E38] text-white py-8 sm:py-10 border-t border-blue-900/50 relative overflow-hidden mb-[50px] ${className}`}>
      {/* Subtle background radial glow and engineering dot matrix */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_70%_at_50%_0%,rgba(0,74,173,0.35),transparent)] pointer-events-none" />
      <div
        className="absolute inset-0 pointer-events-none opacity-15"
        style={{
          backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
        aria-hidden="true"
      />

      <div className="w-full sm:w-[90%] max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-blue-500/15 border border-blue-400/30 text-blue-300 font-bold text-[11px] sm:text-xs uppercase tracking-widest mb-4">
          <Mail className="w-3.5 h-3.5 text-blue-400" />
          <span>Technical Newsletter</span>
        </div>

        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-black text-white uppercase tracking-tight leading-tight mb-3">
          Subscribe to Scientific Insights
        </h2>

        <p className="text-sm sm:text-base text-blue-100/85 max-w-2xl mx-auto mb-6 font-normal leading-relaxed">
          Get the latest industrial testing standards, material research, and equipment whitepapers delivered directly to your inbox.
        </p>

        {isSubscribed ? (
          <div className="flex items-center justify-center gap-3 p-4 bg-emerald-500/10 border border-emerald-400/30 rounded-sm max-w-lg mx-auto text-emerald-300 font-semibold text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>You're subscribed! We'll send our next technical issue directly to your inbox.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5 max-w-xl mx-auto w-full">
            <div className="relative flex-1">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your business email"
                className="w-full pl-10 pr-4 py-3 bg-white/10 hover:bg-white/15 focus:bg-white text-white focus:text-slate-900 border border-white/20 focus:border-primary rounded-sm text-sm font-medium outline-none transition-all placeholder:text-slate-400 shadow-inner"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-7 py-3 bg-primary hover:bg-[#003d8f] text-white font-bold text-xs sm:text-sm uppercase tracking-wider rounded-sm shadow-md hover:shadow-lg transition-all shrink-0 cursor-pointer flex items-center justify-center gap-2 group active:scale-95 disabled:opacity-70"
            >
              <span>{isSubmitting ? 'Subscribing...' : 'Subscribe'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
