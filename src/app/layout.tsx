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

import { Inter } from 'next/font/google';
import Script from "next/script";
import dbConnect from "@/lib/dbConnect";
import SettingsModel from "@/models/Settings";
import ConditionalWrapper from "@/components/layout/ConditionalWrapper";
import { cache } from 'react';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const getGlobalSettings = cache(async () => {
  await dbConnect();
  return SettingsModel.findOne({ configKey: 'global' }).lean();
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let gaId = '';
  let gscVerification = '';

  try {
    const settings = await getGlobalSettings();
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
      <body className={`min-h-full flex flex-col font-display bg-white text-secondary ${inter.variable}`} suppressHydrationWarning>
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
        <Script id="tawk-to" strategy="lazyOnload">
          {`
            var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
            (function(){
            var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
            s1.async=true;
            s1.src='https://embed.tawk.to/6a26f1606dd5c81c327338f4/1jqk1tov4';
            s1.charset='UTF-8';
            s1.setAttribute('crossorigin','*');
            s0.parentNode.insertBefore(s1,s0);
            })();
          `}
        </Script>
        <ConditionalWrapper>
          {children}
        </ConditionalWrapper>
      </body>
    </html>
  );
}
