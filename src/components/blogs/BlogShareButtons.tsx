'use client';

import React, { useState } from 'react';
import { MessageSquare, Link as LinkIcon, Mail, Check } from 'lucide-react';

interface BlogShareButtonsProps {
  title: string;
  slug: string;
}

export default function BlogShareButtons({ title, slug }: BlogShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const getShareUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.href;
    }
    const cleanSlug = slug.startsWith('/') ? slug.substring(1) : slug;
    return `https://labzenix.com/blogs/${cleanSlug}`;
  };

  const handleWhatsApp = () => {
    const url = getShareUrl();
    const text = `${title}\n\n${url}`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleMessage = async () => {
    const url = getShareUrl();
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title,
          text: `Check out this article: ${title}`,
          url,
        });
        return;
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          window.open(`sms:?&body=${encodeURIComponent(`${title} - ${url}`)}`, '_blank');
        }
      }
    } else {
      window.open(`sms:?&body=${encodeURIComponent(`${title} - ${url}`)}`, '_blank');
    }
  };

  const handleCopyLink = async () => {
    const url = getShareUrl();
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // quiet fallback without popups
    }
  };

  const handleMail = () => {
    const url = getShareUrl();
    const subject = encodeURIComponent(title);
    const body = encodeURIComponent(`Hi,\n\nI thought you might find this article interesting:\n\n${title}\n${url}\n\nBest regards!`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div className="flex items-center space-x-3">
      {/* WhatsApp */}
      <button
        type="button"
        onClick={handleWhatsApp}
        title="Share on WhatsApp"
        aria-label="Share on WhatsApp"
        className="w-10 h-10 flex items-center justify-center bg-gray-100 text-secondary hover:bg-[#25D366] hover:text-white transition-all duration-300 rounded cursor-pointer"
      >
        <svg
          viewBox="0 0 24 24"
          className="w-4 h-4 fill-current"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </button>

      {/* Message / Native Share */}
      <button
        type="button"
        onClick={handleMessage}
        title="Share via Message"
        aria-label="Share via Message"
        className="w-10 h-10 flex items-center justify-center bg-gray-100 text-secondary hover:bg-primary hover:text-white transition-all duration-300 rounded cursor-pointer"
      >
        <MessageSquare className="w-4 h-4" />
      </button>

      {/* Copy Link */}
      <button
        type="button"
        onClick={handleCopyLink}
        title={copied ? 'Link Copied!' : 'Copy Link'}
        aria-label={copied ? 'Link Copied' : 'Copy Link'}
        className={`w-10 h-10 flex items-center justify-center transition-all duration-300 rounded cursor-pointer ${
          copied
            ? 'bg-emerald-600 text-white'
            : 'bg-gray-100 text-secondary hover:bg-primary hover:text-white'
        }`}
      >
        {copied ? <Check className="w-4 h-4 animate-in zoom-in-75 duration-200" /> : <LinkIcon className="w-4 h-4" />}
      </button>

      {/* Mail */}
      <button
        type="button"
        onClick={handleMail}
        title="Share via Email"
        aria-label="Share via Email"
        className="w-10 h-10 flex items-center justify-center bg-gray-100 text-secondary hover:bg-primary hover:text-white transition-all duration-300 rounded cursor-pointer"
      >
        <Mail className="w-4 h-4" />
      </button>
    </div>
  );
}
