'use client';

import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import Navbar from './Navbar';
import Footer from './Footer';
import { Toaster } from 'react-hot-toast';

// Dynamically load non-critical client widgets to reduce initial bundle and TBT
const FloatingContact = dynamic(() => import('./FloatingContact'), { ssr: false });
const LeadCapturePopup = dynamic(() => import('./LeadCapturePopup'), { ssr: false });
const ChatWidget = dynamic(() => import('./ChatWidget'), { ssr: false });

export default function ConditionalWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <Navbar />
      <main className="flex-grow pt-[94px] sm:pt-[104px] md:pt-[124px] lg:pt-[136px] xl:pt-[148px]">
        {children}
      </main>
      <Footer />
      <FloatingContact />
      <LeadCapturePopup />
      <ChatWidget />
    </>
  );
}

