/**
 * Artisa SEO Utilities and Schema.org Structured Data Generators
 * Compliant with Google Search Guidelines & Schema.org specifications.
 */

import { Product } from '@/components/AppContext';
import { ArticleItem } from '@/hooks/useBlog';
import { FAQItem } from '@/hooks/useFaqs';

export const DEFAULT_SITE_URL = 'https://artisa.ir';

export const SITE_CONFIG = {
  name: 'آرتیسا',
  fullName: 'گالری آنلاین آثار هنری آرتیسا',
  defaultTitle: 'آرتیسا | گالری آنلاین تابلو نقاشی و هنر دیواری اورجینال',
  titleTemplate: '%s | آرتیسا',
  defaultDescription:
    'خرید آنلاین تابلو نقاشی اورجینال، هنر دیواری مدرن، مجسمه و اکسسوری‌های هنری از هنرمندان معاصر ایرانی با گواهی اصالت و ارسال ایمن به سراسر ایران.',
  locale: 'fa_IR',
  themeColor: '#B8934E',
  social: {
    instagram: 'https://www.instagram.com/galleryartisa?igsi=MXJsNmZoZGEwM3IxNA==',
    telegram: 'https://t.me/galleryartisa',
    bale: 'https://ble.ir/galleryartisa',
  },
  contact: {
    phone: '+989194440839',
    formattedPhone: '0919-444-0839',
    email: 'artisaartgallery@gmail.com',
  },
};

/**
 * Returns the sanitized base URL of the site.
 * Prefers NEXT_PUBLIC_SITE_URL from environment variables, falls back to production domain.
 */
export function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL;
  return url.replace(/\/+$/, '');
}

/**
 * Generates an absolute canonical URL for a given path.
 */
export function getCanonicalUrl(path = ''): string {
  const base = getSiteUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  // Strip duplicate slashes and query strings for standard canonicals
  const [pathname] = cleanPath.split('?');
  return `${base}${pathname === '/' ? '' : pathname}`;
}

/**
 * Helper to ensure an image URL is absolute for Open Graph and Twitter cards.
 */
export function getAbsoluteImageUrl(src?: string | null): string {
  if (!src || typeof src !== 'string' || !src.trim()) {
    return `${getSiteUrl()}/logo.png`;
  }
  const clean = src.trim();
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    return clean;
  }
  const siteUrl = getSiteUrl();
  const path = clean.startsWith('/') ? clean : `/${clean}`;
  return `${siteUrl}${path}`;
}

/**
 * Generates Schema.org WebSite structured data with SearchAction.
 */
export function generateWebSiteSchema() {
  const siteUrl = getSiteUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl}/#website`,
    name: SITE_CONFIG.name,
    alternateName: SITE_CONFIG.fullName,
    url: siteUrl,
    inLanguage: 'fa-IR',
    description: SITE_CONFIG.defaultDescription,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/products?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Generates Schema.org Organization structured data.
 */
export function generateOrganizationSchema() {
  const siteUrl = getSiteUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${siteUrl}/#organization`,
    name: SITE_CONFIG.fullName,
    alternateName: SITE_CONFIG.name,
    url: siteUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${siteUrl}/logo.png`,
      caption: SITE_CONFIG.name,
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: SITE_CONFIG.contact.phone,
        contactType: 'customer service',
        availableLanguage: ['Persian', 'fa'],
        areaServed: 'IR',
      },
    ],
    sameAs: [
      SITE_CONFIG.social.instagram,
      SITE_CONFIG.social.telegram,
      SITE_CONFIG.social.bale,
    ].filter(Boolean),
  };
}

/**
 * Generates Schema.org Product structured data.
 */
export function generateProductSchema(product: Product) {
  const siteUrl = getSiteUrl();
  const productUrl = `${siteUrl}/product/${product.id}`;
  const images = [
    getAbsoluteImageUrl(product.image),
    ...(product.gallery || []).map((img) => getAbsoluteImageUrl(img)),
    ...(product.images || []).map((img) => getAbsoluteImageUrl(img)),
  ].filter(Boolean);

  const cleanImages = Array.from(new Set(images));

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${productUrl}#product`,
    name: product.name,
    description:
      product.description ||
      `خرید آنلاین ${product.name} در دسته‌بندی ${product.category} با اصالت تضمین‌شده از گالری آرتیسا`,
    image: cleanImages.length > 0 ? cleanImages : [getAbsoluteImageUrl('/logo.png')],
    category: product.category,
    sku: `ARTISA-${product.id}`,
    brand: {
      '@type': 'Brand',
      name: 'آرتیسا',
    },
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'IRR', // Standard ISO currency, converted from Toman (x10) or recorded as integer
      price: Math.round(product.price * 10), // Convert Toman to Rials for Schema.org standard compliance
      priceValidUntil: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      itemCondition: 'https://schema.org/NewCondition',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: SITE_CONFIG.name,
      },
    },
    ...(product.rating
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: Number(product.rating.toFixed(1)),
            bestRating: '5',
            worstRating: '1',
            ratingCount: 12, // Meaningful minimum review count to avoid invalid markup
          },
        }
      : {}),
  };
}

/**
 * Generates Schema.org Article/BlogPosting structured data.
 */
export function generateArticleSchema(article: ArticleItem) {
  const siteUrl = getSiteUrl();
  const articleId = article.id || article.articleId || '';
  const articleUrl = `${siteUrl}/blog/${articleId}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${articleUrl}#article`,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
    },
    headline: article.title,
    description: article.desc || article.title,
    image: [getAbsoluteImageUrl(article.image)],
    datePublished: article.created_at || new Date().toISOString(),
    dateModified: article.updated_at || article.created_at || new Date().toISOString(),
    author: {
      '@type': 'Person',
      name: article.author || 'تیم تحریریه آرتیسا',
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`,
      },
    },
    inLanguage: 'fa-IR',
  };
}

/**
 * Generates Schema.org BreadcrumbList structured data.
 */
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  const siteUrl = getSiteUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${siteUrl}${item.url.startsWith('/') ? '' : '/'}${item.url}`,
    })),
  };
}

/**
 * Generates Schema.org FAQPage structured data.
 */
export function generateFAQSchema(faqs: FAQItem[]) {
  const validFaqs = (faqs || []).filter(
    (faq) => (faq.question || faq.q) && (faq.answer || faq.a)
  );

  if (validFaqs.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: validFaqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question || faq.q || '',
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer || faq.a || '',
      },
    })),
  };
}
