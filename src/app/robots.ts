import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://labzenix.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/', 
          '/api/', 
          '/_next/', 
          '/private/',
          '/*?*utm_', // Disallow crawling tracking parameters to prevent duplicate indexing
          '/*?*sort=' // Disallow crawling sorted URL variants
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
