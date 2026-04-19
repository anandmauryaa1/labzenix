'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export default function ForgotPassword() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (!email.trim()) {
      setError('Email address is required');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    
    try {
      const res = await fetch('/api/admin/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim() })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setSubmitted(true);
        toast.success('Reset link sent to your email');
      } else {
        setError(data.error || 'Failed to request reset');
        toast.error(data.error || 'Failed to request reset');
      }
    } catch (err: any) {
      const errorMsg = 'Network error. Please check your connection.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
      <div className="bg-white p-10 border border-gray-100 shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-500">
        <div className="mb-8">
          <button 
            onClick={handleBackToLogin}
            className="inline-flex items-center text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-primary transition-colors mb-6"
            type="button"
          >
            <ArrowLeft className="w-3 h-3 mr-2" />
            Back to Login
          </button>
          <h1 className="text-3xl font-black text-secondary tracking-tighter uppercase">Reset Your Password</h1>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-2">Enter your email to receive recovery link</p>
        </div>

        {!submitted ? (
          <>
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input 
                label="Email Address" 
                type="email"
                value={email} 
                onChange={(e: any) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                required 
                placeholder="admin@labzenix.com"
                disabled={loading}
              />
              <Button 
                type="submit" 
                className="w-full py-4 text-xs font-black uppercase tracking-widest"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>

            <div className="mt-8 pt-8 border-t border-gray-100">
              <p className="text-center text-xs text-gray-400">
                Remember your password?{' '}
                <button 
                  onClick={handleBackToLogin}
                  className="text-primary font-black uppercase hover:text-secondary transition-colors"
                  type="button"
                >
                  Sign In
                </button>
              </p>
            </div>
          </>
        ) : (
          <div className="text-center space-y-6">
            <div className="bg-green-50 text-green-600 p-8 flex flex-col items-center rounded">
              <CheckCircle2 className="w-12 h-12 mb-4" />
              <h2 className="text-lg font-black text-secondary uppercase mb-2">Check Your Email</h2>
              <p className="text-xs text-gray-600 leading-relaxed">
                If an account exists with that email, a reset link has been sent. The link expires in 1 hour.
              </p>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={handleBackToLogin}
                className="w-full py-4 text-xs font-black uppercase tracking-widest"
              >
                Back to Login
              </Button>
              <p className="text-xs text-gray-400 text-center">
                Didn't receive email? Check spam folder or{' '}
                <button 
                  onClick={() => {
                    setSubmitted(false);
                    setEmail('');
                  }}
                  className="text-primary font-black uppercase hover:text-secondary transition-colors"
                  type="button"
                >
                  Try Again
                </button>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
