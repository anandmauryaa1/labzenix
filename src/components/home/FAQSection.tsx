'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface FAQ {
  _id: string;
  question: string;
  answer: string;
}

export default function FAQSection({ initialFaqs }: { initialFaqs?: FAQ[] }) {
  const faqs = initialFaqs || [];
  
  // Try to open the first FAQ initially if available
  const [openId, setOpenId] = useState<string | null>(faqs.length > 0 ? faqs[0]._id : null);

  if (faqs.length === 0) return null;

  return (
    <section className="py-14 px-4 bg-gray-50 border-t border-gray-100">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-primary font-bold tracking-widest uppercase text-sm">Support</span>
          <h2 className="text-3xl md:text-4xl font-black text-secondary mt-2 uppercase tracking-tighter">
            Frequently Asked <span className="text-primary"> Questions </span>
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq) => {
            const isOpen = openId === faq._id;
            return (
              <div 
                key={faq._id}
                className={`border rounded-none overflow-hidden transition-all duration-300 ${isOpen ? 'border-primary shadow-md bg-white' : 'border-gray-200 bg-white hover:border-gray-300'}`}
              >
                <button
                  onClick={() => setOpenId(isOpen ? null : faq._id)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <span className={`font-bold text-lg pr-8 ${isOpen ? 'text-primary' : 'text-secondary'}`}>
                    {faq.question}
                  </span>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-none flex items-center justify-center transition-colors duration-300 ${isOpen ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}`}>
                    <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                  </div>
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 text-gray-600 leading-relaxed border-t border-gray-100 pt-4 mt-2">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
