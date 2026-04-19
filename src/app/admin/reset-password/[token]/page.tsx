'use client';
import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { CheckCircle2, AlertCircle, Check, X } from 'lucide-react';

const passwordRequirements = {
  length: (pwd: string) => pwd.length >= 8,
  uppercase: (pwd: string) => /[A-Z]/.test(pwd),
  lowercase: (pwd: string) => /[a-z]/.test(pwd),
  number: (pwd: string) => /[0-9]/.test(pwd),
};

export default function ResetPassword({ params: paramsPromise }: { params: Promise<{ token: string }> }) {
  const params = use(paramsPromise);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState(false);

  const passwordValid = Object.values(passwordRequirements).every(check => check(password));
  const passwordsMatch = password === confirmPassword && password.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password strength
    if (!passwordValid) {
      setError('Password does not meet all requirements');
      return;
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
        toast.success('Password reset successfully');
      } else {
        setError(data.error || 'Reset failed');
        toast.error(data.error || 'Reset failed');
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
        <div className="mb-8">
          <h1 className="text-3xl font-black text-secondary tracking-tighter uppercase">New Protocol</h1>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-2">Initialize your new security credentials</p>
        </div>
        
        {!success ? (
          <>
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Input 
                  label="New Access Key" 
                  type="password"
                  value={password} 
                  onChange={(e: any) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  required 
                  placeholder="••••••••"
                  disabled={loading}
                />
                
                {/* Password Requirements */}
                {password && (
                  <div className="mt-4 p-4 bg-gray-50 rounded border border-gray-200">
                    <p className="text-xs font-black text-secondary uppercase mb-3">Password Requirements:</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs">
                        {passwordRequirements.length(password) ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <X className="w-4 h-4 text-gray-300" />
                        )}
                        <span className={passwordRequirements.length(password) ? 'text-gray-700' : 'text-gray-400'}>
                          At least 8 characters
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        {passwordRequirements.uppercase(password) ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <X className="w-4 h-4 text-gray-300" />
                        )}
                        <span className={passwordRequirements.uppercase(password) ? 'text-gray-700' : 'text-gray-400'}>
                          One uppercase letter
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        {passwordRequirements.lowercase(password) ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <X className="w-4 h-4 text-gray-300" />
                        )}
                        <span className={passwordRequirements.lowercase(password) ? 'text-gray-700' : 'text-gray-400'}>
                          One lowercase letter
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        {passwordRequirements.number(password) ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <X className="w-4 h-4 text-gray-300" />
                        )}
                        <span className={passwordRequirements.number(password) ? 'text-gray-700' : 'text-gray-400'}>
                          One number
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Input 
                label="Confirm Access Key" 
                type="password"
                value={confirmPassword} 
                onChange={(e: any) => {
                  setConfirmPassword(e.target.value);
                  setError('');
                }}
                required 
                placeholder="••••••••"
                disabled={loading}
              />

              {password && confirmPassword && (
                <div className={`p-3 rounded text-xs font-black uppercase flex items-center gap-2 ${
                  passwordsMatch 
                    ? 'bg-green-50 text-green-600 border border-green-200' 
                    : 'bg-red-50 text-red-600 border border-red-200'
                }`}>
                  {passwordsMatch ? (
                    <>
                      <Check className="w-4 h-4" />
                      Passwords match
                    </>
                  ) : (
                    <>
                      <X className="w-4 h-4" />
                      Passwords do not match
                    </>
                  )}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full py-4 text-xs font-black uppercase tracking-widest" 
                disabled={loading || !passwordValid || !passwordsMatch}
              >
                {loading ? 'Re-initializing...' : 'Set Protocol'}
              </Button>
            </form>

            <div className="mt-8 pt-8 border-t border-gray-100">
              <p className="text-center text-xs text-gray-400">
                <Link href="/admin/login" className="text-primary font-black uppercase hover:text-secondary transition-colors">
                  Back to Login
                </Link>
              </p>
            </div>
          </>
        ) : (
          <div className="text-center space-y-6">
            <div className="bg-green-50 text-green-600 p-8 flex flex-col items-center rounded">
              <CheckCircle2 className="w-12 h-12 mb-4" />
              <p className="text-xs font-black uppercase tracking-widest text-secondary">
                Configuration Successful
              </p>
              <p className="text-xs text-gray-600 mt-2">
                Your password has been reset. You can now login with your new credentials.
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
