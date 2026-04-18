'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function AdminLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ username: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/admin/login', { method: 'POST', body: JSON.stringify(form), headers: { 'Content-Type': 'application/json' } });
    if (res.ok) {
      toast.success('Logged in');
      router.push('/admin');
    } else {
      toast.error('Invalid credentials');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
      <div className="bg-white p-10 border border-gray-100 shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-secondary text-white flex items-center justify-center text-3xl font-black mx-auto mb-4">L</div>
          <h1 className="text-3xl font-black text-secondary tracking-tighter uppercase">Admin Registry</h1>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-2 font-display">Authorized Personnel Only</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input 
            label="Personnel Identifier" 
            value={form.username} 
            onChange={(e: any) => setForm({ ...form, username: e.target.value })} 
            required 
            placeholder="Username"
          />
          <Input 
            label="Access Protocol" 
            type="password" 
            value={form.password} 
            onChange={(e: any) => setForm({ ...form, password: e.target.value })} 
            required 
            placeholder="••••••••"
          />
          <Button 
            type="submit" 
            className="w-full py-4 text-xs font-black uppercase tracking-widest" 
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Enter Console'}
          </Button>

          <div className="text-center pt-2">
            <Link 
              href="/admin/forgot-password" 
              className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-primary transition-colors"
            >
              Forgot Access Protocol?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}