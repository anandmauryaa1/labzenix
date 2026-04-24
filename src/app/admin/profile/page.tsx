'use client';

import { useState, useEffect } from 'react';
import { 
  User as UserIcon, 
  Mail, 
  ShieldCheck, 
  Lock, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Key
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/admin/me');
      if (res.ok) {
        const data = await res.json();
        setForm(prev => ({
          ...prev,
          name: data.name || '',
          email: data.email || '',
          username: data.username || ''
        }));
      }
    } catch (err) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (form.password && form.password !== form.confirmPassword) {
      return toast.error('Passwords do not match');
    }

    setSaving(true);
    try {
      const payload: any = {
        name: form.name,
        email: form.email,
        username: form.username
      };
      if (form.password) payload.password = form.password;

      const res = await fetch('/api/admin/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success('Profile synchronized successfully');
        setForm(prev => ({ ...prev, password: '', confirmPassword: '' }));
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to update profile');
      }
    } catch (err) {
      toast.error('Network error during synchronization');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-300">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary" />
        <span className="text-[10px] font-black uppercase tracking-widest text-secondary">Decrypting Profile Data...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-12">
        <h1 className="text-4xl font-black text-secondary tracking-tighter uppercase mb-2">Personnel Profile</h1>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.2em] flex items-center">
          <ShieldCheck className="w-4 h-4 mr-2 text-primary" />
          Manage your administrative credentials and security access
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="md:col-span-1">
          <div className="bg-white border border-gray-100 p-8 text-center shadow-sm">
            <div className="w-24 h-24 bg-secondary text-white flex items-center justify-center text-3xl font-black mx-auto mb-6 shadow-xl shadow-secondary/10">
              {form.name[0]?.toUpperCase()}
            </div>
            <h2 className="text-xl font-black text-secondary uppercase tracking-tight mb-1">{form.name}</h2>
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-6">@{form.username}</p>
            
            <div className="pt-6 border-t border-gray-50 flex flex-col gap-3">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                <span>Identity Status</span>
                <span className="text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white border border-gray-100 p-10 shadow-sm space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                  <UserIcon className="w-3 h-3 text-primary" />
                  Legal Name
                </label>
                <input 
                  type="text" 
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full p-4 bg-gray-50 border border-gray-100 outline-none text-xs font-bold text-secondary focus:border-primary transition-all"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                  <Mail className="w-3 h-3 text-primary" />
                  Email Address
                </label>
                <input 
                  type="email" 
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  className="w-full p-4 bg-gray-50 border border-gray-100 outline-none text-xs font-bold text-secondary focus:border-primary transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                <Key className="w-3 h-3 text-primary" />
                Console Username
              </label>
              <input 
                type="text" 
                value={form.username}
                onChange={e => setForm({...form, username: e.target.value})}
                className="w-full p-4 bg-gray-50 border border-gray-100 outline-none text-xs font-bold text-secondary focus:border-primary transition-all"
                required
              />
            </div>

            <div className="pt-6 border-t border-gray-100">
              <h3 className="text-xs font-black uppercase tracking-widest text-secondary mb-6 flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary" />
                Security Vector Update
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">New Password</label>
                  <input 
                    type="password" 
                    value={form.password}
                    onChange={e => setForm({...form, password: e.target.value})}
                    placeholder="••••••••"
                    className="w-full p-4 bg-gray-50 border border-gray-100 outline-none text-xs font-bold text-secondary focus:border-primary transition-all"
                    minLength={8}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Confirm Rotation</label>
                  <input 
                    type="password" 
                    value={form.confirmPassword}
                    onChange={e => setForm({...form, confirmPassword: e.target.value})}
                    placeholder="••••••••"
                    className="w-full p-4 bg-gray-50 border border-gray-100 outline-none text-xs font-bold text-secondary focus:border-primary transition-all"
                  />
                </div>
              </div>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-4 flex items-center gap-2">
                <AlertCircle className="w-3 h-3 text-amber-500" />
                Leave password fields blank to maintain current security state.
              </p>
            </div>

            <button 
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center space-x-3 px-10 py-5 bg-secondary text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-primary transition-all shadow-xl active:scale-95 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Update Credentials</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
