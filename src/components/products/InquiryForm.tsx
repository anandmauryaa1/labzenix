'use client';
import { useState } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface InquiryFormProps {
  productId: string;
  productName: string;
}

export default function InquiryForm({ productId, productName }: InquiryFormProps) {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, productId, productName }),
      });
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Name" value={form.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, name: e.target.value })} required />
      <Input label="Email" type="email" value={form.email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, email: e.target.value })} required />
      <textarea className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark" placeholder="Message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
      <Button type="submit" disabled={loading}>{loading ? 'Sending...' : 'Send Inquiry'}</Button>
    </form>
  );
}
