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
        {/* Google Tag Manager */}
        <Script id="google-tag-manager" strategy="beforeInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-MBQCBC45');`}
        </Script>
        {/* End Google Tag Manager */}
        {gscVerification ? (
          <meta name="google-site-verification" content={gscVerification} />
        ) : null}
      </head>
      <body className={`min-h-full flex flex-col font-display bg-white text-secondary ${inter.variable}`} suppressHydrationWarning>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-MBQCBC45"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
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
        {/* Tawk.to Live Chat Widget */}
        <Script id="tawk-to" strategy="lazyOnload" src="https://embed.tawk.to/6a26f1606dd5c81c327338f4/1jqk1tov4" />
        <ConditionalWrapper>
          {children}
        </ConditionalWrapper>
      </body>
    </html>
  );
}
