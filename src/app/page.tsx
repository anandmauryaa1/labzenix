import { getPageMetadata } from '@/lib/seo';
import Hero from '@/components/home/Hero';
import DynamicProductRange from '@/components/home/DynamicProductRange';
import AboutSummary from '@/components/home/AboutSummary';
import ProductCarousel from '@/components/home/ProductCarousel';
// import ProductCategories from '@/components/home/ProductCategories'; // Removed as requested
import WhyChooseUs from '@/components/home/WhyChooseUs';
import ProductRange from '@/components/home/ProductRange';
import Testimonials from '@/components/home/Testimonials';
import CTABanner from '@/components/home/CTABanner';
import Partners from '@/components/home/Partners';
import FAQSection from '@/components/home/FAQSection';

export async function generateMetadata() {
  return await getPageMetadata('home');
}

export default function Home() {
  return (
    <main className="overflow-hidden">
      <Hero />
      <DynamicProductRange />
      <ProductCarousel />
      <AboutSummary />
      <WhyChooseUs />
      <Partners />
      <ProductRange />
      <Testimonials />
      <FAQSection />
      <CTABanner />
    </main>
  );
}

