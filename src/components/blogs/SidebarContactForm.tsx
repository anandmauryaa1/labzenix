'use client';

import { useState } from 'react';
import Input from '@/components/ui/Input';
import TextArea from '@/components/ui/TextArea';
import Button from '@/components/ui/Button';

export default function SidebarContactForm({ source = 'contact form' }: { source?: string }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    companyName: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      let finalMessage = formData.message;
      if (formData.companyName) {
        finalMessage += `\n\nCompany Name: ${formData.companyName}`;
      }

      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.mobile,
          message: finalMessage,
          source: source,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit inquiry');
      }

      setSuccess(true);
      setFormData({ name: '', email: '', mobile: '', companyName: '', message: '' });
    } catch (err: any) {
      setError(err.message || 'An error occurred while submitting.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-100 shadow-md rounded-sm p-8 space-y-6">
      <h3 className="text-xl font-bold text-secondary uppercase tracking-[0.5px] mb-6 pb-4 border-b border-gray-200">
          Request Information
        </h3>
        <p className="text-xs text-gray-500 font-medium">
          Fill out the form below and our team will get back to you shortly.
        </p>

      {success ? (
        <div className="bg-green-50 text-green-700 p-4 border border-green-100 text-sm font-bold">
          Thank you! Your inquiry has been submitted successfully.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 text-xs font-bold border border-red-100">
              {error}
            </div>
          )}
          
          <Input 
            name="name"
            label="Name *"
            placeholder="Your full name"
            required
            value={formData.name}
            onChange={handleChange}
          />

          <Input 
            name="email"
            type="email"
            label="Email *"
            placeholder="your.email@example.com"
            required
            value={formData.email}
            onChange={handleChange}
          />

          <Input 
            name="mobile"
            type="tel"
            label="Mobile *"
            placeholder="Your phone number"
            required
            value={formData.mobile}
            onChange={handleChange}
          />

          <Input 
            name="companyName"
            label="Company Name"
            placeholder="Optional"
            value={formData.companyName}
            onChange={handleChange}
          />

          <TextArea 
            name="message"
            label="Message *"
            placeholder="How can we help you?"
            required
            rows={4}
            value={formData.message}
            onChange={handleChange}
          />

          <Button 
            type="submit" 
            variant="primary" 
            className="w-full uppercase tracking-widest font-black text-[10px] py-4"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Inquiry'}
          </Button>
        </form>
      )}
    </div>
  );
}
