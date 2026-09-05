import { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/products',
          '/product/',
          '/blog',
          '/about-us',
          '/contact-us',
          '/faq',
        ],
        disallow: [
          '/admin/',
          '/admin',
          '/api/',
          '/cart',
          '/checkout',
          '/profile/',
          '/profile',
          '/login',
          '/register',
          '/forgot-password',
          '/reset-password',
          '/verify-email',
          '/track-order',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
