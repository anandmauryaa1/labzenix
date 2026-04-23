'use client';

import { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Globe, 
  Mail, 
  Phone, 
  MapPin, 
  Save, 
  ShieldCheck, 
  Database,
  Lock,
  Share2,
  Circle,
  BarChart3
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'seo' | 'security'>('general');
  const [users, setUsers] = useState<any[]>([]);
  
  const [config, setConfig] = useState({
    communication: {
      supportEmail: '',
      supportPhone: '',
      salesEmail: '',
      salesPhone: '',
      marketingEmail: '',
      marketingPhone: '',
      seoEmail: '',
      seoPhone: '',
      address: '',
    },
    social: {
      facebook: '',
      twitter: '',
      linkedin: '',
      instagram: '',
    },
    seo: {
      titleSuffix: '',
      globalDescription: '',
    },
    integrations: {
      inquiryCapture: true,
      nightlyBackup: false,
      googleAnalyticsId: '',
      googleAnalyticsUrl: ''
    }
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        setConfig(prev => ({
          communication: { ...prev.communication, ...(data.communication || {}) },
          social: { ...prev.social, ...(data.social || {}) },
          seo: { ...prev.seo, ...(data.seo || {}) },
          integrations: { ...prev.integrations, ...(data.integrations || {}) },
        }));
      }
    } catch (err) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      
      if (res.ok) {
        toast.success('Settings saved successfully');
      } else {
        toast.error('Failed to save settings');
      }
    } catch (err) {
      toast.error('Network error');
    } finally {
      setSaving(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        toast.error('Failed to load users');
      }
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, active: !currentStatus })
      });

      if (res.ok) {
        const updatedUser = await res.json();
        setUsers(users.map(u => u._id === userId ? updatedUser : u));
        toast.success(`User ${!currentStatus ? 'enabled' : 'disabled'} successfully`);
      } else {
        toast.error('Failed to update user status');
      }
    } catch (err) {
      toast.error('Failed to update user status');
    }
  };

  useEffect(() => {
    if (activeTab === 'security') {
      fetchUsers();
    }
  }, [activeTab]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-secondary tracking-tighter uppercase mb-2">Protocol Settings</h1>
          <p className="text-gray-500 font-medium">Define global platform behaviors, technical contact parameters, and security standards.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center space-x-2 px-8 py-4 bg-primary text-white text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
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
            <SettingsIcon className="w-4 h-4" />
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
                         <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Support Email</label>
                              <input 
                                type="email" 
                                value={config.communication.supportEmail}
                                onChange={(e) => setConfig({...config, communication: {...config.communication, supportEmail: e.target.value}})}
                                placeholder="support@labzenix.com" 
                                className="w-full p-4 bg-gray-50 border border-gray-100 focus:border-primary outline-none transition-all font-bold text-secondary" 
                              />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Support Phone</label>
                              <input 
                                type="text" 
                                value={config.communication.supportPhone}
                                onChange={(e) => setConfig({...config, communication: {...config.communication, supportPhone: e.target.value}})}
                                placeholder="+91 98765 00001" 
                                className="w-full p-4 bg-gray-50 border border-gray-100 focus:border-primary outline-none transition-all font-bold text-secondary" 
                              />
                           </div>
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Sales Email</label>
                              <input 
                                type="email" 
                                value={config.communication.salesEmail}
                                onChange={(e) => setConfig({...config, communication: {...config.communication, salesEmail: e.target.value}})}
                                placeholder="sales@labzenix.com" 
                                className="w-full p-4 bg-gray-50 border border-gray-100 focus:border-primary outline-none transition-all font-bold text-secondary" 
                              />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Sales Hotline</label>
                              <input 
                                type="text" 
                                value={config.communication.salesPhone}
                                onChange={(e) => setConfig({...config, communication: {...config.communication, salesPhone: e.target.value}})}
                                placeholder="+91 98765 00002" 
                                className="w-full p-4 bg-gray-50 border border-gray-100 focus:border-primary outline-none transition-all font-bold text-secondary" 
                              />
                           </div>
                         </div>
                         
                         <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Marketing Email</label>
                              <input 
                                type="email" 
                                value={config.communication.marketingEmail}
                                onChange={(e) => setConfig({...config, communication: {...config.communication, marketingEmail: e.target.value}})}
                                placeholder="marketing@labzenix.com" 
                                className="w-full p-4 bg-gray-50 border border-gray-100 focus:border-primary outline-none transition-all font-bold text-secondary" 
                              />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Marketing Phone</label>
                              <input 
                                type="text" 
                                value={config.communication.marketingPhone}
                                onChange={(e) => setConfig({...config, communication: {...config.communication, marketingPhone: e.target.value}})}
                                placeholder="+91 98765 00003" 
                                className="w-full p-4 bg-gray-50 border border-gray-100 focus:border-primary outline-none transition-all font-bold text-secondary" 
                              />
                           </div>
                         </div>
                         
                         <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">SEO Team Email</label>
                              <input 
                                type="email" 
                                value={config.communication.seoEmail}
                                onChange={(e) => setConfig({...config, communication: {...config.communication, seoEmail: e.target.value}})}
                                placeholder="seo@labzenix.com" 
                                className="w-full p-4 bg-gray-50 border border-gray-100 focus:border-primary outline-none transition-all font-bold text-secondary" 
                              />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">SEO Team Phone</label>
                              <input 
                                type="text" 
                                value={config.communication.seoPhone}
                                onChange={(e) => setConfig({...config, communication: {...config.communication, seoPhone: e.target.value}})}
                                placeholder="+91 98765 00004" 
                                className="w-full p-4 bg-gray-50 border border-gray-100 focus:border-primary outline-none transition-all font-bold text-secondary" 
                              />
                           </div>
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
                         <textarea 
                           rows={4} 
                           value={config.communication.address}
                           onChange={(e) => setConfig({...config, communication: {...config.communication, address: e.target.value}})}
                           placeholder="Industrial Park, Sector 4..." 
                           className="w-full p-4 bg-gray-50 border border-gray-100 focus:border-primary outline-none transition-all font-medium text-gray-600 resize-none" 
                         />
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-gray-100">
                    <h3 className="text-xs font-black uppercase tracking-widest text-secondary flex items-center mb-6">
                      <Share2 className="w-4 h-4 mr-2 text-primary" />
                      Social Media Connectors
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Facebook URL</label>
                         <input 
                           type="text" 
                           value={config.social.facebook}
                           onChange={(e) => setConfig({...config, social: {...config.social, facebook: e.target.value}})}
                           placeholder="https://facebook.com/yourpage"
                           className="w-full p-4 bg-gray-50 border border-gray-100 focus:border-primary outline-none transition-all font-bold text-secondary" 
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Twitter (X) URL</label>
                         <input 
                           type="text" 
                           value={config.social.twitter}
                           onChange={(e) => setConfig({...config, social: {...config.social, twitter: e.target.value}})}
                           placeholder="https://twitter.com/yourhandle"
                           className="w-full p-4 bg-gray-50 border border-gray-100 focus:border-primary outline-none transition-all font-bold text-secondary" 
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">LinkedIn URL</label>
                         <input 
                           type="text" 
                           value={config.social.linkedin}
                           onChange={(e) => setConfig({...config, social: {...config.social, linkedin: e.target.value}})}
                           placeholder="https://linkedin.com/company/yourcompany"
                           className="w-full p-4 bg-gray-50 border border-gray-100 focus:border-primary outline-none transition-all font-bold text-secondary" 
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Instagram URL</label>
                         <input 
                           type="text" 
                           value={config.social.instagram}
                           onChange={(e) => setConfig({...config, social: {...config.social, instagram: e.target.value}})}
                           placeholder="https://instagram.com/yourprofile"
                           className="w-full p-4 bg-gray-50 border border-gray-100 focus:border-primary outline-none transition-all font-bold text-secondary" 
                         />
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-gray-100">
                    <h3 className="text-xs font-black uppercase tracking-widest text-secondary flex items-center mb-6">
                      <Database className="w-4 h-4 mr-2 text-primary" />
                      Platform Integration
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div 
                        onClick={() => setConfig({...config, integrations: {...config.integrations, inquiryCapture: !config.integrations.inquiryCapture}})}
                        className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 cursor-pointer"
                      >
                        <div className="flex items-center space-x-3">
                          <ShieldCheck className={`w-5 h-5 ${config.integrations.inquiryCapture ? 'text-green-500' : 'text-gray-300'}`} />
                          <span className={`text-xs font-bold uppercase tracking-widest ${config.integrations.inquiryCapture ? 'text-secondary' : 'text-gray-400'}`}>Inquiry Auto-Capture</span>
                        </div>
                        <div className={`w-12 h-6 rounded-full relative transition-colors ${config.integrations.inquiryCapture ? 'bg-primary' : 'bg-gray-200'}`}>
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${config.integrations.inquiryCapture ? 'right-1' : 'left-1'}`} />
                        </div>
                      </div>
                      <div 
                        onClick={() => setConfig({...config, integrations: {...config.integrations, nightlyBackup: !config.integrations.nightlyBackup}})}
                        className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 cursor-pointer"
                      >
                        <div className="flex items-center space-x-3">
                          <SettingsIcon className={`w-5 h-5 ${config.integrations.nightlyBackup ? 'text-primary' : 'text-gray-300'}`} />
                          <span className={`text-xs font-bold uppercase tracking-widest ${config.integrations.nightlyBackup ? 'text-secondary' : 'text-gray-400'}`}>Cloud Backup (Nightly)</span>
                        </div>
                        <div className={`w-12 h-6 rounded-full relative transition-colors ${config.integrations.nightlyBackup ? 'bg-primary' : 'bg-gray-200'}`}>
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${config.integrations.nightlyBackup ? 'right-1' : 'left-1'}`} />
                        </div>
                      </div>
                    </div>

                    <div className="pt-8 border-t border-gray-100">
                      <h3 className="text-xs font-black uppercase tracking-widest text-secondary flex items-center mb-6">
                        <BarChart3 className="w-4 h-4 mr-2 text-primary" />
                        Google Analytics Configuration
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Measurement ID (G-XXXXXXX)</label>
                           <input 
                             type="text" 
                             value={config.integrations.googleAnalyticsId}
                             onChange={(e) => setConfig({...config, integrations: {...config.integrations, googleAnalyticsId: e.target.value}})}
                             placeholder="G-XXXXXXXXXX"
                             className="w-full p-4 bg-gray-50 border border-gray-100 focus:border-primary outline-none transition-all font-bold text-secondary" 
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Dashboard Embedded URL</label>
                           <input 
                             type="text" 
                             value={config.integrations.googleAnalyticsUrl}
                             onChange={(e) => setConfig({...config, integrations: {...config.integrations, googleAnalyticsUrl: e.target.value}})}
                             placeholder="https://analytics.google.com/..."
                             className="w-full p-4 bg-gray-50 border border-gray-100 focus:border-primary outline-none transition-all font-bold text-secondary" 
                           />
                           <p className="text-[10px] text-gray-400 mt-1 italic">Enter your GA4 report URL to display it in the Analytics dashboard section.</p>
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
                      <h3 className="text-xl text-white uppercase tracking-tight mb-2">Global Meta Architecture</h3>
                      <p className="text-sm text-white/60 font-medium">These settings apply site-wide when individual pages lack specific metadata.</p>
                    </div>
                    <Globe className="absolute -bottom-10 -right-10 w-40 h-40 text-white/5" />
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Fallback Title Suffix</label>
                       <input 
                         type="text" 
                         value={config.seo.titleSuffix}
                         onChange={(e) => setConfig({...config, seo: {...config.seo, titleSuffix: e.target.value}})}
                         placeholder="| LabZenix Laboratory Instruments" 
                         className="w-full p-4 bg-gray-50 border border-gray-100 focus:border-primary outline-none transition-all font-bold text-secondary" 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Global Search Description</label>
                       <textarea 
                         rows={4} 
                         value={config.seo.globalDescription}
                         onChange={(e) => setConfig({...config, seo: {...config.seo, globalDescription: e.target.value}})}
                         className="w-full p-4 bg-gray-50 border border-gray-100 focus:border-primary outline-none transition-all font-medium text-gray-600 resize-none" 
                       />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                  <div className="bg-primary/5 p-6 border-l-4 border-primary">
                    <h4 className="font-black text-xs uppercase tracking-widest text-primary mb-2">Personnel & Access Control</h4>
                    <p className="text-sm text-secondary/70 font-medium">
                      Manage user accounts, enable/disable access, and monitor active sessions.
                    </p>
                  </div>

                  {loadingUsers ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : users.length > 0 ? (
                    <div className="space-y-4">
                      <h3 className="text-xs font-black uppercase tracking-widest text-secondary flex items-center">
                        <Lock className="w-4 h-4 mr-2 text-primary" />
                        Active Staff Directory ({users.length})
                      </h3>
                      <div className="divide-y divide-gray-100 border border-gray-100 overflow-hidden">
                        {users.map((user) => {
                          const isOnline = user.active && user.lastLogin && (Date.now() - new Date(user.lastLogin).getTime()) < 3600000; // 1 hour
                          return (
                            <div key={user._id} className="flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-all">
                              <div className="flex items-center space-x-4 flex-1">
                                <div className="w-10 h-10 bg-secondary text-white flex items-center justify-center text-[10px] font-black rounded-full">
                                  {user.name[0].toUpperCase()}
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-bold text-secondary">{user.name}</p>
                                  <div className="flex items-center space-x-2 text-[10px] text-gray-400 uppercase tracking-widest">
                                    <span>{user.username}</span>
                                    <span>•</span>
                                    <span className={`font-bold ${user.active ? (isOnline ? 'text-green-600' : 'text-gray-400') : 'text-red-600'}`}>
                                      {user.active ? (isOnline ? 'Online' : 'Offline') : 'Disabled'}
                                    </span>
                                    {user.active && (
                                      <Circle className={`w-2 h-2 fill-current ${isOnline ? 'text-green-600' : 'text-gray-400'}`} />
                                    )}
                                  </div>
                                </div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                  {user.role}
                                </div>
                              </div>
                              <button 
                                onClick={() => toggleUserStatus(user._id, user.active)}
                                className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                                  user.active 
                                    ? 'bg-green-50 text-green-600 border border-green-200 hover:bg-green-100' 
                                    : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                                }`}
                              >
                                {user.active ? 'Disable' : 'Enable'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-400 font-medium">No users found</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
