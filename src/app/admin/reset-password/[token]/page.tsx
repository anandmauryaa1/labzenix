'use client';
import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { CheckCircle2 } from 'lucide-react';

export default function ResetPassword({ params: paramsPromise }: { params: Promise<{ token: string }> }) {
  const params = use(paramsPromise);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error('Passwords do not match');
    }
    
    setLoading(true);
    try {
      const res = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: params.token, password })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setSuccess(true);
        toast.success('Access protocol updated');
      } else {
        toast.error(data.error || 'Reset failed');
      }
    } catch (err) {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
      <div className="bg-white p-10 border border-gray-100 shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-500">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-secondary tracking-tighter uppercase">New Protocol</h1>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-2">Initialize your new security credentials</p>
        </div>
        
        {!success ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input 
              label="New Access Key" 
              type="password"
              value={password} 
              onChange={(e: any) => setPassword(e.target.value)} 
              required 
              placeholder="••••••••"
            />
            <Input 
              label="Confirm Access Key" 
              type="password"
              value={confirmPassword} 
              onChange={(e: any) => setConfirmPassword(e.target.value)} 
              required 
              placeholder="••••••••"
            />
            <Button 
              type="submit" 
              className="w-full py-4 text-xs font-black uppercase tracking-widest" 
              disabled={loading}
            >
              {loading ? 'Re-initializing...' : 'Set Protocol'}
            </Button>
          </form>
        ) : (
          <div className="text-center space-y-6">
            <div className="bg-green-50 text-green-600 p-8 flex flex-col items-center">
              <CheckCircle2 className="w-12 h-12 mb-4" />
              <p className="text-xs font-black uppercase tracking-widest text-secondary">
                Configuration Successful
              </p>
            </div>
            <Link href="/admin/login">
              <Button className="w-full py-4 text-xs font-black uppercase tracking-widest">
                Enter Console
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
