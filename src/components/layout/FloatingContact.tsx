'use client';

import React from 'react';
import { Phone } from 'lucide-react';

export default function FloatingContact() {
  const phoneNumber = '+919565453120';
  const whatsappUrl = 'https://api.whatsapp.com/send?phone=919565453120';

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-center gap-3 select-none">
      {/* Call Button */}
      <div className="group relative flex items-center">
        <a
          href={`tel:${phoneNumber}`}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/30 transition-all duration-300 hover:scale-110 hover:bg-primary/90 hover:shadow-primary/40 active:scale-95"
          aria-label="Call Us"
        >
          <Phone className="h-5 w-5 animate-pulse" />
        </a>
        
        {/* Tooltip text - expands to the right */}
        <span className="pointer-events-none absolute left-14 scale-95 rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:scale-100 group-hover:opacity-100 whitespace-nowrap shadow-xl">
          Call Support
        </span>
      </div>

      {/* WhatsApp Button */}
      <div className="group relative flex items-center">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/30 transition-all duration-300 hover:scale-110 hover:bg-[#20ba59] hover:shadow-[#20ba59]/40 active:scale-95"
          aria-label="Chat on WhatsApp"
        >
          {/* Breathing live chat circle dot */}
          <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75"></span>
            <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-red-600 border border-[#25D366]"></span>
          </span>
          
          <svg
            viewBox="0 0 24 24"
            className="h-7 w-7 fill-current"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </a>

        {/* Tooltip text - expands to the right */}
        <span className="pointer-events-none absolute left-16 scale-95 rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:scale-100 group-hover:opacity-100 whitespace-nowrap shadow-xl">
          Chat on WhatsApp (Live)
        </span>
      </div>
    </div>
  );
}
