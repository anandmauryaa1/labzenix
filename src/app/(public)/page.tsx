import Hero from '@/components/home/Hero';
import AboutSummary from '@/components/home/AboutSummary';
import ProductCategories from '@/components/home/ProductCategories';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import Testimonials from '@/components/home/Testimonials';
import CTABanner from '@/components/home/CTABanner';

export const metadata = {
  title: 'LabZenix | Precision Packaging Testing Instruments',
  description: 'High-quality packaging testing instruments for material analysis and quality assurance. Tensile testers, compression testers, leak detectors and more.',
};

export default function Home() {
  return (
    <main className="overflow-hidden">
      <Hero />
      <AboutSummary />
      <ProductCategories />
      <WhyChooseUs />
      <Testimonials />
      <CTABanner />
    </main>
  );
}