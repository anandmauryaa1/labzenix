import { getPageMetadata } from '@/lib/seo';
import ContactForm from '@/components/contact/ContactForm';

export async function generateMetadata() {
  return await getPageMetadata('contact');
}

export default function ContactPage() {
  return <ContactForm />;
}
