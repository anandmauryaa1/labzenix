import React from 'react';
import dbConnect from '@/lib/dbConnect';
import Settings from '@/models/Settings';
import { ShieldAlert } from 'lucide-react';

export const metadata = {
  title: 'Terms and Conditions | LabZenix',
  description: 'Terms and conditions for using LabZenix laboratory instruments and services.',
};

export const dynamic = 'force-dynamic';

export default async function TermsAndConditionsPage() {
  let content = '<p>Terms and conditions have not been published yet. Please check back later.</p>';
  try {
    await dbConnect();
    const settings = await Settings.findOne({ configKey: 'global' });
    content = settings?.legal?.termsAndConditions || content;
  } catch {
    // DB unavailable — show fallback
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8 md:p-12">
          <div className="flex items-center space-x-3 mb-8 pb-8 border-b border-gray-100">
            <ShieldAlert className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-black text-secondary tracking-tight">Terms and Conditions</h1>
          </div>
          
          <div 
            className="prose prose-lg max-w-none prose-headings:font-black prose-headings:text-secondary prose-a:text-primary hover:prose-a:text-secondary prose-p:text-gray-600 prose-p:font-medium"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </div>
    </div>
  );
}
