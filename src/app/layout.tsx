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
  verification: {
    google: 'APkZJ_LKvfE6cuHkChOJpQ-2jWVFvg9FEta6Ku6j6rE',
  },
};

import Script from "next/script";
import dbConnect from "@/lib/dbConnect";
import SettingsModel from "@/models/Settings";
import ConditionalWrapper from "@/components/layout/ConditionalWrapper";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let gaId = '';
  let gscVerification = '';

  try {
    await dbConnect();
    const settings = await SettingsModel.findOne({ configKey: 'global' }).lean();
    if (settings && settings.integrations) {
      gaId = settings.integrations.googleAnalyticsId || '';
      gscVerification = settings.integrations.googleSiteVerification || '';
    }
  } catch (error) {
    console.error('Failed to fetch global settings for layout:', error);
  }

  return (
    <html lang="en" className="h-full scroll-smooth" suppressHydrationWarning>
      <head>
        {gscVerification ? (
          <meta name="google-site-verification" content={gscVerification} />
        ) : null}
      </head>
      <body className="min-h-full flex flex-col font-display bg-white text-secondary" suppressHydrationWarning>
        {gaId ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){window.dataLayer.push(arguments);}
                gtag('js', new Date());

                gtag('config', '${gaId}');
              `}
            </Script>
          </>
        ) : null}
        <ConditionalWrapper>
          {children}
        </ConditionalWrapper>
      </body>
    </html>
  );
}
