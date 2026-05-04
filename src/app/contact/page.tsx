import { getPageMetadata } from '@/lib/seo';
import ContactForm from '@/components/contact/ContactForm';
import PageBanner from '@/components/ui/PageBanner';

export async function generateMetadata() {
  return await getPageMetadata('contact');
}

export default function ContactPage() {
  return (
    <>
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
