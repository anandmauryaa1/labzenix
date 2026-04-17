'use client';

import { useState } from 'react';
import { 
  Settings, 
  Globe, 
  Mail, 
  Phone, 
  MapPin, 
  Save, 
  ShieldCheck, 
  Database,
  Lock
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminSettings() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'seo' | 'security'>('general');

  const handleSave = async () => {
    setLoading(true);
    // Simulating save logic for now as it would require a Settings model or Config file
    setTimeout(() => {
      toast.success('System configuration updated');
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-secondary tracking-tighter uppercase mb-2">Protocol Settings</h1>
          <p className="text-gray-500 font-medium">Define global platform behaviors, technical contact parameters, and security standards.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="flex items-center space-x-2 px-8 py-4 bg-primary text-white text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-primary/20"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? 'Synchronizing...' : 'Save Configuration'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="bg-white border border-gray-100 p-2 h-fit">
          <button 
            onClick={() => setActiveTab('general')}
            className={`w-full flex items-center space-x-3 px-4 py-4 text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === 'general' ? 'bg-secondary text-white' : 'text-gray-400 hover:text-secondary hover:bg-gray-50'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>General Config</span>
          </button>
          <button 
            onClick={() => setActiveTab('seo')}
            className={`w-full flex items-center space-x-3 px-4 py-4 text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === 'seo' ? 'bg-secondary text-white' : 'text-gray-400 hover:text-secondary hover:bg-gray-50'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Global SEO</span>
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center space-x-3 px-4 py-4 text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === 'security' ? 'bg-secondary text-white' : 'text-gray-400 hover:text-secondary hover:bg-gray-50'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Personnel & Access</span>
          </button>
        </div>

        {/* Form Area */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-gray-100 overflow-hidden">
            <div className="p-8 md:p-12">
              {activeTab === 'general' && (
                <div className="space-y-10 animate-in fade-in slide-in-from-right-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center">
                        <Mail className="w-4 h-4 mr-2" />
                        Communication Protocol
                      </h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Support Email</label>
                           <input type="email" placeholder="support@labzenix.com" className="w-full p-4 bg-gray-50 border border-gray-100 focus:border-primary outline-none transition-all font-bold text-secondary" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Sales Hotline</label>
                           <input type="text" placeholder="+91 98765 43210" className="w-full p-4 bg-gray-50 border border-gray-100 focus:border-primary outline-none transition-all font-bold text-secondary" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        Facility Location
                      </h3>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Physical Address</label>
                         <textarea rows={4} placeholder="Industrial Park, Sector 4..." className="w-full p-4 bg-gray-50 border border-gray-100 focus:border-primary outline-none transition-all font-medium text-gray-600 resize-none" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-gray-100">
                    <h3 className="text-xs font-black uppercase tracking-widest text-secondary flex items-center mb-6">
                      <Database className="w-4 h-4 mr-2 text-primary" />
                      Platform Integration
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100">
                        <div className="flex items-center space-x-3">
                          <ShieldCheck className="w-5 h-5 text-green-500" />
                          <span className="text-xs font-bold uppercase tracking-widest">Inquiry Auto-Capture</span>
                        </div>
                        <div className="w-12 h-6 bg-primary rounded-full relative">
                          <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100">
                        <div className="flex items-center space-x-3 text-gray-400">
                          <Settings className="w-5 h-5" />
                          <span className="text-xs font-bold uppercase tracking-widest">Cloud Backup (Nightly)</span>
                        </div>
                        <div className="w-12 h-6 bg-gray-200 rounded-full relative">
                          <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'seo' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                  <div className="bg-secondary p-8 text-white relative overflow-hidden">
                    <div className="relative z-10">
                      <h3 className="text-xl font-black uppercase tracking-tight mb-2">Global Meta Architecture</h3>
                      <p className="text-sm text-white/60 font-medium">These settings apply site-wide when individual pages lack specific metadata.</p>
                    </div>
                    <Globe className="absolute -bottom-10 -right-10 w-40 h-40 text-white/5" />
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Fallback Title Suffix</label>
                       <input type="text" placeholder="| LabZenix Laboratory Instruments" className="w-full p-4 bg-gray-50 border border-gray-100 focus:border-primary outline-none transition-all font-bold text-secondary" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Global Search Description</label>
                       <textarea rows={4} className="w-full p-4 bg-gray-50 border border-gray-100 focus:border-primary outline-none transition-all font-medium text-gray-600 resize-none" />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                  <div className="bg-primary/5 p-6 border-l-4 border-primary">
                    <h4 className="font-black text-xs uppercase tracking-widest text-primary mb-2">RBAC Control Panel</h4>
                    <p className="text-sm text-secondary/70 font-medium whitespace-pre-line">
                      Current Roles Defined:
                      - Admin: Global Clearance
                      - SEO Team: Catalog & Journal Metadata
                      - Marketing: Inventory & Resource Acquisition
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-secondary flex items-center">
                      <Lock className="w-4 h-4 mr-2 text-primary" />
                      Active Staff Sessions
                    </h3>
                    <div className="divide-y divide-gray-100 border border-gray-100">
                      {['Admin Official', 'SEO Specialist', 'Marketing Lead'].map((user) => (
                        <div key={user} className="flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-all">
                          <div className="flex items-center space-x-4">
                            <div className="w-8 h-8 bg-secondary text-white flex items-center justify-center text-[10px] font-black">{user[0]}</div>
                            <div>
                              <p className="text-sm font-bold text-secondary">{user}</p>
                              <p className="text-[10px] text-gray-400 uppercase tracking-widest">Active • Laboratory Network</p>
                            </div>
                          </div>
                          <button className="text-[10px] font-black uppercase tracking-widest text-primary border border-primary/20 bg-primary/5 px-3 py-1">Rotate Key</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
