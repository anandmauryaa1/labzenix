import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "LabZenix - Precision Laboratory Testing Instruments",
  description: "Manufacturer of high-quality laboratory testing instruments for Paper, Packaging, PET, Plastic, and Paint industries.",
};

import ConditionalWrapper from "@/components/layout/ConditionalWrapper";

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
      </body>
    </html>
  );
}

