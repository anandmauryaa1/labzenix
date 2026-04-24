import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "LabZenix - Precision Laboratory Testing Instruments",
  description: "Manufacturer of high-quality laboratory testing instruments for Paper, Packaging, PET, Plastic, and Paint industries.",
  openGraph: {
    title: "LabZenix - Precision Laboratory Testing Instruments",
    description: "Manufacturer of high-quality laboratory testing instruments for Paper, Packaging, PET, Plastic, and Paint industries.",
    url: 'https://labzenix.com',
    siteName: 'LabZenix',
    images: [
      {
        url: '/og-image.jpg', // Assuming this exists or will be added
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LabZenix - Precision Laboratory Testing Instruments',
    description: 'Manufacturer of high-quality laboratory testing instruments for Paper, Packaging, PET, Plastic, and Paint industries.',
    images: ['/og-image.jpg'],
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

