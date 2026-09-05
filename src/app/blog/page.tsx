import type { Metadata } from "next";
import BlogView from "@/components/views/BlogView";
import { ArticleItem } from "@/hooks/useBlog";
import { getSiteUrl, generateBreadcrumbSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "مجله هنر، دکوراسیون و دانستنی‌های گالری‌داری",
  description:
    "جدیدترین مقالات تخصصی هنر، اصول چیدمان و نصب تابلو بر روی دیوار، معرفی سبک‌های نقاشی مدرن و کلاسیک، و راهنمای خرید آثار هنری در مجله آرتیسا.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "مجله تخصصی هنر و دکوراسیون | آرتیسا",
    description:
      "مقالات، آموزش‌ها و راهنماهای کاربردی چیدمان تابلو، شناخت سبک‌های نقاشی و دکوراسیون داخلی.",
    url: `${getSiteUrl()}/blog`,
    type: "website",
  },
};


async function getArticles(): Promise<ArticleItem[]> {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://artisa-backend.vercel.app';
  try {
    const res = await fetch(`${backendUrl}/api/v1/blog/articles`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data?.items || data?.data || (Array.isArray(data) ? data : [])) as ArticleItem[];
  } catch {
    return [];
  }
}

export default async function BlogPage() {
  const articles = await getArticles();
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "خانه", url: "/" },
    { name: "مجله هنر", url: "/blog" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <BlogView initialArticles={articles} />
    </>
  );
}
