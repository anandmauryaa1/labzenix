'use client';

import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import FadeIn from '../ui/FadeIn';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQ {
  _id: string;
  question: string;
  answer: string;
}

export default function FAQSection() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const res = await fetch('/api/faqs?active=true');
        if (res.ok) {
          const data = await res.json();
          setFaqs(data);
          if (data.length > 0) {
            setOpenId(data[0]._id); // Open first FAQ by default
          }
        }
      } catch (error) {
        console.error('Failed to fetch FAQs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFaqs();
  }, []);

  if (loading || faqs.length === 0) return null;

  return (
    <section className="py-14 px-4 bg-gray-50 border-t border-gray-100">
      <div className="max-w-4xl mx-auto">
        <FadeIn direction="up">
          <div className="text-center mb-16">
            <span className="text-primary font-bold tracking-widest uppercase text-sm">Support</span>
            <h2 className="text-3xl md:text-4xl font-black text-secondary mt-2 uppercase tracking-tighter">Frequently Asked <span className="text-primary"> Questions </span></h2>
          </div>
        </FadeIn>

        <div className="space-y-4">
          {faqs.map((faq) => (
            <FadeIn key={faq._id} direction="up">
              <div 
                className={`border rounded-none overflow-hidden transition-all duration-300 ${openId === faq._id ? 'border-primary shadow-md bg-white' : 'border-gray-200 bg-white hover:border-gray-300'}`}
              >
                <button
                  onClick={() => setOpenId(openId === faq._id ? null : faq._id)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <span className={`font-bold text-lg pr-8 ${openId === faq._id ? 'text-primary' : 'text-secondary'}`}>
                    {faq.question}
                  </span>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-none flex items-center justify-center transition-colors duration-300 ${openId === faq._id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}`}>
                    <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${openId === faq._id ? 'rotate-180' : ''}`} />
                  </div>
                </button>
                <AnimatePresence>
                  {openId === faq._id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-6 pb-6 text-gray-600 leading-relaxed border-t border-gray-100 pt-4 mt-2">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
