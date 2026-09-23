import { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/seo';

const DEFAULT_CATEGORIES = [
  'تابلو نقاشی',
  'هنر دیواری',
  'مجسمه و دکوری',
  'قاب و فریم',
  'هنر مدرن',
  'هدایای هنری',
];

interface ProductItem {
  id: string;
  category?: string;
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

  // 1. Core static pages
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
      priority: 0.85,
    },
    {
      url: `${siteUrl}/faq`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/about-us`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${siteUrl}/contact-us`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${siteUrl}/terms`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // 2. Fetch all products using pagination (FastAPI limit <= 100)
  let allProducts: ProductItem[] = [];
  try {
    let page = 1;
    let total = 0;
    do {
      const res = await fetch(`${backendUrl}/api/v1/products?limit=100&page=${page}`, {
        headers: { Accept: 'application/json' },
        next: { revalidate: 3600 },
      });
      if (!res.ok) break;
      const data = await res.json();
      const items: ProductItem[] =
        data?.items ||
        data?.data?.items ||
        (Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []);
      total = data?.data?.total || data?.total || items.length;
      allProducts = allProducts.concat(items);
      if (items.length === 0 || allProducts.length >= total) break;
      page++;
    } while (page <= 50);
  } catch (err) {
    console.error('Failed to fetch products for sitemap:', err);
  }

  const productRoutes: MetadataRoute.Sitemap = allProducts
    .filter((item) => Boolean(item.id))
    .map((item) => ({
      url: `${siteUrl}/product/${item.id}`,
      lastModified: item.updated_at
        ? new Date(item.updated_at)
        : item.created_at
        ? new Date(item.created_at)
        : now,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

  // 3. Dynamic Categories (Union of defaults and categories from products)
  const categoriesSet = new Set(DEFAULT_CATEGORIES);
  allProducts.forEach((p) => {
    if (p.category && typeof p.category === 'string' && p.category.trim()) {
      categoriesSet.add(p.category.trim());
    }
  });

  const categoryRoutes: MetadataRoute.Sitemap = Array.from(categoriesSet).map((cat) => ({
    url: `${siteUrl}/products?category=${encodeURIComponent(cat)}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.85,
  }));

  // 4. Fetch all blog articles using pagination (FastAPI limit <= 100)
  let allArticles: ArticleItem[] = [];
  try {
    let page = 1;
    let total = 0;
    do {
      const res = await fetch(`${backendUrl}/api/v1/blog/articles?limit=100&page=${page}`, {
        headers: { Accept: 'application/json' },
        next: { revalidate: 3600 },
      });
      if (!res.ok) break;
      const data = await res.json();
      const items: ArticleItem[] =
        data?.items ||
        data?.data?.items ||
        (Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []);
      total = data?.data?.total || data?.total || items.length;
      allArticles = allArticles.concat(items);
      if (items.length === 0 || allArticles.length >= total) break;
      page++;
    } while (page <= 50);
  } catch (err) {
    console.error('Failed to fetch blog articles for sitemap:', err);
  }

  const blogRoutes: MetadataRoute.Sitemap = allArticles
    .filter((item) => Boolean(item.id || item.articleId))
    .map((item) => {
      const id = item.id || item.articleId;
      return {
        url: `${siteUrl}/blog/${id}`,
        lastModified: item.updated_at
          ? new Date(item.updated_at)
          : item.created_at
          ? new Date(item.created_at)
          : now,
        changeFrequency: 'weekly',
        priority: 0.8,
      };
    });

  return [...staticRoutes, ...categoryRoutes, ...productRoutes, ...blogRoutes];
}
