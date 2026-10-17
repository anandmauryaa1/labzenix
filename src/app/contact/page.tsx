import { getPageMetadata } from '@/lib/seo';
import ContactForm from '@/components/contact/ContactForm';
import PageBanner from '@/components/ui/PageBanner';

export async function generateMetadata() {
  return await getPageMetadata('contact');
}

export default function ContactPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://labzenix.com';

  const contactSchema = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact LabZenix',
    url: `${siteUrl}/contact`,
    description: 'Get in touch with LabZenix for laboratory testing instrument inquiries, quotations, and technical support.',
    mainEntity: {
      '@type': 'LocalBusiness',
      name: 'LabZenix Industries Pvt. Ltd.',
      telephone: '+91-9565453120',
      email: 'info@labzenix.com',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '3D/98, New Industrial Town',
        addressLocality: 'Faridabad',
        addressRegion: 'Haryana',
        postalCode: '121001',
        addressCountry: 'IN',
      },
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Contact Us',
        item: `${siteUrl}/contact`,
      },
    ],
  };

  return (
    <>
      {/* ─── Structured Data (JSON-LD) ─────────────────────────── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <PageBanner 
        title="Contact Us" 
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Contact Us' }
        ]} 
      />
      <ContactForm />
    </>
  );
}
