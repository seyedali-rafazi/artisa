import { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/seo';

const CATEGORIES = [
  'تابلو نقاشی',
  'هنر دیواری',
  'مجسمه و دکوری',
  'قاب و فریم',
  'هنر مدرن',
  'هدایای هنری',
];

interface ProductItem {
  id: string;
  updated_at?: string;
  created_at?: string;
}

interface ArticleItem {
  id: string;
  articleId?: string;
  updated_at?: string;
  created_at?: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://artisa-backend.vercel.app';
  const now = new Date();

  // Core static pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${siteUrl}/products`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/faq`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${siteUrl}/about-us`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${siteUrl}/contact-us`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // Category routes
  const categoryRoutes: MetadataRoute.Sitemap = CATEGORIES.map((cat) => ({
    url: `${siteUrl}/products?category=${encodeURIComponent(cat)}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.85,
  }));

  // Dynamic Product routes
  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${backendUrl}/api/v1/products?limit=1000`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      const items: ProductItem[] = data?.items || data?.data?.items || (Array.isArray(data) ? data : []);
      productRoutes = items
        .filter((item) => Boolean(item.id))
        .map((item) => ({
          url: `${siteUrl}/product/${item.id}`,
          lastModified: item.updated_at ? new Date(item.updated_at) : (item.created_at ? new Date(item.created_at) : now),
          changeFrequency: 'weekly',
          priority: 0.8,
        }));
    }
  } catch (err) {
    console.error('Failed to fetch products for sitemap:', err);
  }

  // Dynamic Blog routes
  let blogRoutes: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${backendUrl}/api/v1/blog/articles?limit=1000`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      const items: ArticleItem[] = data?.items || data?.data || (Array.isArray(data) ? data : []);
      blogRoutes = items
        .filter((item) => Boolean(item.id || item.articleId))
        .map((item) => {
          const id = item.id || item.articleId;
          return {
            url: `${siteUrl}/blog/${id}`,
            lastModified: item.updated_at ? new Date(item.updated_at) : (item.created_at ? new Date(item.created_at) : now),
            changeFrequency: 'weekly',
            priority: 0.7,
          };
        });
    }
  } catch (err) {
    console.error('Failed to fetch blog articles for sitemap:', err);
  }

  return [...staticRoutes, ...categoryRoutes, ...productRoutes, ...blogRoutes];
}
