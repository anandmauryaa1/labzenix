import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "LabZenix - Precision Laboratory Testing Instruments",
  description: "Manufacturer of high-quality laboratory testing instruments for Paper, Packaging, PET, Plastic, and Paint industries.",
  metadataBase: new URL('https://labzenix.com'),
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/apple-icon.png',
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: "LabZenix - Precision Laboratory Testing Instruments",
    description: "Manufacturer of high-quality laboratory testing instruments for Paper, Packaging, PET, Plastic, and Paint industries.",
    url: 'https://labzenix.com',
    siteName: 'LabZenix',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'LabZenix - Precision Laboratory Instruments'
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LabZenix - Precision Laboratory Testing Instruments',
    description: 'Manufacturer of high-quality laboratory testing instruments for Paper, Packaging, PET, Plastic, and Paint industries.',
    images: ['/og-image.png'],
  },
};

import ConditionalWrapper from "@/components/layout/ConditionalWrapper";
import { Toaster } from "react-hot-toast";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth" suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-display bg-white text-secondary" suppressHydrationWarning>
        <ConditionalWrapper>
          {children}
        </ConditionalWrapper>
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      </body>
    </html>
  );
}

