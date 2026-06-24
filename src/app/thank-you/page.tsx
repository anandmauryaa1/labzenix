import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2, Phone, Mail, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Thank You | LabZenix',
  description: 'Thank you for contacting LabZenix. Our team will connect with you as soon as possible.',
  robots: 'noindex, nofollow',
};

export default function ThankYouPage() {
  return (
    <div className="min-h-[80vh] bg-white flex items-center justify-center px-4 py-20">
      <div className="max-w-2xl w-full text-center">

        {/* Animated Check Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-28 h-28 rounded-full bg-primary/10 flex items-center justify-center animate-in zoom-in-50 duration-500">
              <CheckCircle2 className="w-14 h-14 text-primary" strokeWidth={1.5} />
            </div>
            {/* Pulse rings */}
            <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping opacity-30" />
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="text-primary font-black tracking-[0.3em] uppercase text-xs block">
            Inquiry Received
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-secondary uppercase tracking-tighter leading-tight">
            Thank You!
          </h1>
          <div className="w-16 h-1 bg-primary mx-auto" />
        </div>

        {/* Message */}
        <div className="mt-8 space-y-3 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
          <p className="text-lg text-gray-600 font-medium leading-relaxed">
            We have received your inquiry and our team will connect you
            <strong className="text-secondary"> as soon as possible.</strong>
          </p>
          <p className="text-sm text-gray-400 font-medium">
            You can also reach us directly via the contact details below.
          </p>
        </div>

        {/* Contact Info Cards */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          <a
            href="tel:+919565453120"
            className="flex items-center gap-3 border border-gray-200 p-4 hover:border-primary hover:bg-primary/5 transition-all group"
          >
            <div className="w-10 h-10 bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary transition-colors">
              <Phone className="w-4 h-4 text-primary group-hover:text-white transition-colors" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Call Us</p>
              <p className="text-sm font-bold text-secondary">+91 95654 53120</p>
            </div>
          </a>

          <a
            href="mailto:info@labzenix.com"
            className="flex items-center gap-3 border border-gray-200 p-4 hover:border-primary hover:bg-primary/5 transition-all group"
          >
            <div className="w-10 h-10 bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary transition-colors">
              <Mail className="w-4 h-4 text-primary group-hover:text-white transition-colors" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Email Us</p>
              <p className="text-sm font-bold text-secondary">info@labzenix.com</p>
            </div>
          </a>
        </div>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 text-xs font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
          >
            Browse Products
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 border border-gray-300 text-secondary px-8 py-4 text-xs font-black uppercase tracking-widest hover:bg-gray-50 hover:border-secondary transition-all"
          >
            Back to Home
          </Link>
        </div>

      </div>
    </div>
  );
}
