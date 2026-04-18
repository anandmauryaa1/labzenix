import { getPageMetadata } from '@/lib/seo';
import Hero from '@/components/home/Hero';
import AboutSummary from '@/components/home/AboutSummary';
import ProductCategories from '@/components/home/ProductCategories';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import ProductRange from '@/components/home/ProductRange';
import Testimonials from '@/components/home/Testimonials';
import CTABanner from '@/components/home/CTABanner';

export async function generateMetadata() {
  return await getPageMetadata('home');
}


export default function Home() {
  return (
    <main className="overflow-hidden">
      <Hero />
      <AboutSummary />
      <ProductCategories />
      <WhyChooseUs />
      <ProductRange />
      <Testimonials />
      <CTABanner />
    </main>
  );
}

