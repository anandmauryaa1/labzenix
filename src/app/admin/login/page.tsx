'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { AlertCircle } from 'lucide-react';

export default function AdminLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ username: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (!form.username.trim() || !form.password.trim()) {
      setError('Username and password are required');
      return;
    }

    if (form.username.trim().length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', { 
        method: 'POST', 
        body: JSON.stringify(form), 
        headers: { 'Content-Type': 'application/json' } 
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Welcome back!');
        router.push('/admin');
      } else {
        setError(data.error || 'Login failed. Please try again.');
        toast.error(data.error || 'Invalid credentials');
      }
    } catch (err: any) {
      const errorMsg = 'Network error. Please check your connection.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
      <div className="bg-white p-10 border border-gray-100 shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-secondary text-white flex items-center justify-center text-3xl font-black mx-auto mb-4">L</div>
          <h1 className="text-3xl font-black text-secondary tracking-tighter uppercase">Admin Registry</h1>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-2 font-display">Authorized Personnel Only</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600 font-medium">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input 
            label="Personnel Identifier" 
            value={form.username} 
            onChange={(e: any) => {
              setForm({ ...form, username: e.target.value });
              setError('');
            }} 
            required 
            placeholder="Username"
            disabled={loading}
          />
          <Input 
            label="Access Protocol" 
            type="password" 
            value={form.password} 
            onChange={(e: any) => {
              setForm({ ...form, password: e.target.value });
              setError('');
            }} 
            required 
            placeholder="••••••••"
            disabled={loading}
          />
          <Button 
            type="submit" 
            className="w-full py-4 text-xs font-black uppercase tracking-widest"
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Access Console'}
          </Button>
        </form>

        <div className="mt-8 pt-8 border-t border-gray-100">
          <p className="text-center text-xs text-gray-400 mb-4">
            Lost access credentials?
          </p>
          <Link 
            href="/admin/forgot-password" 
            className="block w-full text-center py-2 text-primary font-black uppercase text-xs tracking-widest hover:text-secondary transition-colors"
          >
            Request Reset Link
          </Link>
        </div>
      </div>
    </div>
  );
}