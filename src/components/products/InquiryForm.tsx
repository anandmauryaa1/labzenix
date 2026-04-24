'use client';
import { useState } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import toast from 'react-hot-toast';
import { CheckCircle2 } from 'lucide-react';

interface InquiryFormProps {
  productId: string;
  productName: string;
}

export default function InquiryForm({ productId, productName }: InquiryFormProps) {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, productId, productName, source: 'product page' }),
      });
      setForm({ name: '', email: '', message: '' });
      setSubmitted(true);
      toast.success('Inquiry submitted successfully');
    } catch (err) {
      toast.error('Failed to submit inquiry');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-100 p-8 text-center space-y-4 animate-in zoom-in-95 duration-300">
        <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
        <h3 className="text-xl font-black text-secondary uppercase tracking-tighter">Inquiry Received</h3>
        <p className="text-sm text-gray-500 font-medium">Thank you for your interest in {productName}. Our technical team will review your requirements and respond shortly.</p>
        <button 
          onClick={() => setSubmitted(false)}
          className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
        >
          Send another inquiry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Name" value={form.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, name: e.target.value })} required />
      <Input label="Email" type="email" value={form.email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, email: e.target.value })} required />
      <div className="space-y-1">
        <label className="text-sm font-medium text-secondary">Message</label>
        <textarea 
          className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none h-32" 
          placeholder="Tell us about your requirements..." 
          value={form.message} 
          onChange={(e) => setForm({ ...form, message: e.target.value })} 
          required 
        />
      </div>
      <Button type="submit" className="w-full py-4 uppercase tracking-[0.2em] font-black text-xs" disabled={loading}>{loading ? 'Sending...' : 'Submit Inquiry'}</Button>
    </form>
  );
}
