import { getPageMetadata } from '@/lib/seo';
import Hero from '@/components/home/Hero';
import DynamicProductRange from '@/components/home/DynamicProductRange';
import AboutSummary from '@/components/home/AboutSummary';
import ProductCarousel from '@/components/home/ProductCarousel';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import ProductRange from '@/components/home/ProductRange';
import Testimonials from '@/components/home/Testimonials';
import CTABanner from '@/components/home/CTABanner';
import Partners from '@/components/home/Partners';
import FAQSection from '@/components/home/FAQSection';

// MongoDB Models
import dbConnect from '@/lib/dbConnect';
import HeroSlide from '@/models/HeroSlide';
import ProductRangeModel from '@/models/ProductRange';
import Product from '@/models/Product';
import AboutContent from '@/models/AboutContent';
import CoreValue from '@/models/CoreValue';
import Partner from '@/models/Partner';
import CompleteProductRange from '@/models/CompleteProductRange';
import Testimonial from '@/models/Testimonial';
import SiteFaq from '@/models/SiteFaq';

export const revalidate = 60; // ISR cache revalidation every 60 seconds

export async function generateMetadata() {
  return await getPageMetadata('home');
}

export default async function Home() {
  await dbConnect();

  // Fetch all data in parallel on the server
  const [
    heroSlides,
    productRanges,
    products,
    aboutContentList,
    coreValues,
    partners,
    completeRanges,
    testimonials,
    faqs,
  ] = await Promise.all([
    HeroSlide.find({}).sort({ order: 1 }).lean().exec(),
    ProductRangeModel.find({ active: true }).sort({ order: 1 }).lean().exec(),
    Product.find({}).lean().exec(),
    AboutContent.find({}).lean().exec(),
    CoreValue.find({}).sort({ order: 1 }).lean().exec(),
    Partner.find({ isActive: true }).sort({ order: 1 }).lean().exec(),
    CompleteProductRange.find({}).sort({ order: 1 }).lean().exec(),
    Testimonial.find({}).sort({ order: 1 }).lean().exec(),
    SiteFaq.find({ isActive: true }).sort({ order: 1, createdAt: -1 }).lean().exec(),
  ]);

  const topProducts = products.sort((a: any, b: any) => (b.views || 0) - (a.views || 0)).slice(0, 6);
  const aboutContent = aboutContentList.length > 0 ? aboutContentList[0] : null;

  // Next.js Server Components require passing plain objects to Client Components
  const serialize = (obj: any) => JSON.parse(JSON.stringify(obj));

  return (
    <main className="overflow-hidden">
      <Hero initialSlides={serialize(heroSlides)} />
      <DynamicProductRange initialRanges={serialize(productRanges)} />
      <ProductCarousel initialProducts={serialize(topProducts)} />
      <AboutSummary initialContent={serialize(aboutContent)} />
      <WhyChooseUs initialReasons={serialize(coreValues)} />
      <Partners initialPartners={serialize(partners)} />
      <ProductRange initialRanges={serialize(completeRanges)} />
      <Testimonials initialTestimonials={serialize(testimonials)} />
      <FAQSection initialFaqs={serialize(faqs)} />
      <CTABanner />
    </main>
  );
}
