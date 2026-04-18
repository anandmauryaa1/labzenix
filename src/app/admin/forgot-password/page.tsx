'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('/api/admin/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setSubmitted(true);
        toast.success('Check your terminal for the reset link');
      } else {
        toast.error(data.error || 'Failed to request reset');
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
          <Link href="/admin/login" className="inline-flex items-center text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-primary transition-colors mb-6">
            <ArrowLeft className="w-3 h-3 mr-2" />
            Back to Login
          </Link>
          <h1 className="text-3xl font-black text-secondary tracking-tighter uppercase">Reset Protocol</h1>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-2">Enter your email to receive recovery link</p>
        </div>
        
        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input 
              label="Account Email" 
              type="email"
              value={email} 
              onChange={(e: any) => setEmail(e.target.value)} 
              required 
              placeholder="admin@labzenix.com"
            />
            <Button 
              type="submit" 
              className="w-full py-4 text-xs font-black uppercase tracking-widest" 
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Request Link'}
            </Button>
          </form>
        ) : (
          <div className="bg-primary/5 p-6 border-l-4 border-primary space-y-4">
             <p className="text-sm font-medium text-secondary">
               If an account exists with <span className="font-bold">{email}</span>, a recovery link has been sent.
             </p>
             <p className="text-[10px] font-black uppercase tracking-widest text-primary">
               Check your console for the development link.
             </p>
          </div>
        )}
      </div>
    </div>
  );
}
