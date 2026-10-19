import { getPageMetadata } from '@/lib/seo';
import dynamic from 'next/dynamic';
import Hero from '@/components/home/Hero';
import DynamicProductRange from '@/components/home/DynamicProductRange';
import AboutSummary from '@/components/home/AboutSummary';
import ProductCarousel from '@/components/home/ProductCarousel';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import ProductRange from '@/components/home/ProductRange';
import Testimonials from '@/components/home/Testimonials';
import CTABanner from '@/components/home/CTABanner';
import Partners from '@/components/home/Partners';

// Dynamically import non-critical below-the-fold FAQ accordion to minimize initial bundle
const FAQSection = dynamic(() => import('@/components/home/FAQSection'));

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

// Revalidate homepage every 60 seconds (ISR) for fast response times while preserving freshness
export const revalidate = 60;

export async function generateMetadata() {
  return await getPageMetadata('home');
}

export default async function Home() {
  let heroSlides: any[] = [];
  let productRanges: any[] = [];
  let products: any[] = [];
  let aboutContentList: any[] = [];
  let coreValues: any[] = [];
  let partners: any[] = [];
  let completeRanges: any[] = [];
  let testimonials: any[] = [];
  let faqs: any[] = [];

  try {
    await dbConnect();
    [
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
      Product.find({})
        .select('title slug modelNumber images category description views createdAt')
        .sort({ views: -1, createdAt: 1, _id: 1 })
        .limit(6)
        .lean()
        .exec(),
      AboutContent.find({}).limit(1).lean().exec(),
      CoreValue.find({}).sort({ order: 1 }).lean().exec(),
      Partner.find({ isActive: true }).sort({ order: 1 }).lean().exec(),
      CompleteProductRange.find({}).sort({ order: 1 }).lean().exec(),
      Testimonial.find({}).sort({ order: 1 }).lean().exec(),
      SiteFaq.find({ isActive: true }).sort({ order: 1, createdAt: -1 }).lean().exec(),
    ]);
  } catch {
    // DB unavailable at build time — components will render with empty/fallback data
  }

  const topProducts = products;
  const aboutContent = aboutContentList.length > 0 ? aboutContentList[0] : null;

  // Next.js Server Components require passing plain objects to Client Components
  const serialize = (obj: any) => JSON.parse(JSON.stringify(obj));

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://labzenix.com';

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${siteUrl}/#organization`,
    name: 'LabZenix Industries Pvt. Ltd.',
    alternateName: 'LabZenix',
    url: siteUrl,
    logo: `${siteUrl}/icon.png`,
    description: 'Manufacturer of high-precision laboratory testing instruments for Paper, Packaging, PET, Plastic, and Paint industries.',
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+91-9565453120',
        contactType: 'customer service',
        areaServed: 'IN',
        availableLanguage: ['English', 'Hindi'],
      },
    ],
    address: {
      '@type': 'PostalAddress',
      streetAddress: '3D/98, New Industrial Town',
      addressLocality: 'Faridabad',
      addressRegion: 'Haryana',
      postalCode: '121001',
      addressCountry: 'IN',
    },
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl}/#website`,
    url: siteUrl,
    name: 'LabZenix',
    publisher: {
      '@id': `${siteUrl}/#organization`,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/products?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'LabZenix Industries Pvt. Ltd.',
    image: `${siteUrl}/icon.png`,
    '@id': `${siteUrl}/#localbusiness`,
    url: siteUrl,
    telephone: '+91-9565453120',
    priceRange: '₹₹₹',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '3D/98, New Industrial Town',
      addressLocality: 'Faridabad',
      addressRegion: 'Haryana',
      postalCode: '121001',
      addressCountry: 'IN',
    },
  };

  return (
    <main className="overflow-hidden">
      {/* ─── Structured Data (JSON-LD) ─────────────────────────── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />

      <h1 className="sr-only">LabZenix - Precision Laboratory &amp; Industrial Testing Equipment</h1>
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
