'use client';

import Link from 'next/link';
import { ShieldAlert, ArrowLeft, Lock, ShieldCheck } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-6">
      <div className="max-w-2xl w-full text-center space-y-8 animate-in fade-in zoom-in duration-700">
        <div className="relative inline-block">
          <div className="w-24 h-24 bg-red-600 text-white flex items-center justify-center mx-auto shadow-2xl shadow-red-200">
            <ShieldAlert className="w-12 h-12" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-secondary border-4 border-white flex items-center justify-center">
            <Lock className="w-4 h-4 text-white" />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl font-black text-secondary tracking-tighter uppercase leading-none">
            Access Vector Denied
          </h1>
          <p className="text-gray-400 text-xs font-black uppercase tracking-[0.4em] font-display">
            Security Protocol Error 403: Insufficient Authorization
          </p>
        </div>

        <div className="bg-white border border-gray-100 p-10 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-red-600" />
          <p className="text-secondary font-medium text-lg leading-relaxed mb-6">
            Your current administrative profile does not possess the required **Access Vectors** to enter this sector. This area is restricted to authorized personnel only.
          </p>
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center space-x-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span>Contact System Administrator to upgrade your identity credentials</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link 
            href="/admin" 
            className="w-full sm:w-auto flex items-center justify-center space-x-3 px-10 py-5 bg-secondary text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-primary transition-all shadow-xl shadow-secondary/10 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Return to Command Center</span>
          </Link>
          <button 
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto px-10 py-5 bg-white border border-gray-200 text-secondary text-[10px] font-black uppercase tracking-[0.3em] hover:bg-gray-50 transition-all"
          >
            Retry Verification
          </button>
        </div>

        <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest pt-10">
          LabZenix Industrial Security Framework v2.4.0
        </p>
      </div>
    </div>
  );
}
