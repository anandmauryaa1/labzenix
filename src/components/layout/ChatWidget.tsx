'use client';

import { useEffect } from 'react';

export default function ChatWidget() {
  useEffect(() => {
    let scriptLoaded = false;

    const loadTawkScript = () => {
      if (scriptLoaded || document.getElementById('tawk-script')) return;
      scriptLoaded = true;

      const s1 = document.createElement('script');
      s1.id = 'tawk-script';
      s1.async = true;
      s1.src = 'https://embed.tawk.to/6a26f1606dd5c81c327338f4/1jqk1tov4';
      s1.charset = 'UTF-8';
      s1.setAttribute('crossorigin', '*');
      document.head.appendChild(s1);

      cleanupListeners();
    };

    const cleanupListeners = () => {
      window.removeEventListener('scroll', loadTawkScript);
      window.removeEventListener('pointermove', loadTawkScript);
      window.removeEventListener('touchstart', loadTawkScript);
      window.removeEventListener('keydown', loadTawkScript);
      window.removeEventListener('click', loadTawkScript);
    };

    // Load on first user interaction
    window.addEventListener('scroll', loadTawkScript, { passive: true, once: true });
    window.addEventListener('pointermove', loadTawkScript, { passive: true, once: true });
    window.addEventListener('touchstart', loadTawkScript, { passive: true, once: true });
    window.addEventListener('keydown', loadTawkScript, { passive: true, once: true });
    window.addEventListener('click', loadTawkScript, { passive: true, once: true });

    // Fallback: load during idle time after 5 seconds if no interaction
    let idleTimer: any;
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      idleTimer = setTimeout(() => {
        (window as any).requestIdleCallback(loadTawkScript, { timeout: 2000 });
      }, 5000);
    } else {
      idleTimer = setTimeout(loadTawkScript, 6000);
    }

    return () => {
      cleanupListeners();
      if (idleTimer) clearTimeout(idleTimer);
    };
  }, []);

  return null;
}
