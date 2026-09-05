import { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogDetailsView from "@/components/views/BlogDetailsView";
import { ArticleItem } from "@/hooks/useBlog";
import {
  getSiteUrl,
  generateArticleSchema,
  generateBreadcrumbSchema,
  getAbsoluteImageUrl,
} from "@/lib/seo";

interface BlogDetailPageProps {
  params: Promise<{ id: string }>;
}

async function getArticle(id: string): Promise<ArticleItem | null> {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://artisa-backend.vercel.app";
  try {
    const res = await fetch(`${backendUrl}/api/v1/blog/articles/${encodeURIComponent(id)}`, {
      next: { revalidate: 300 }, // ISR: Cache for 5 minutes
    });

    if (!res.ok) {
      return null;
    }

    const json = await res.json();
    const article = json?.data || json;
    return article && (article.id || article.articleId) ? (article as ArticleItem) : null;
  } catch (error) {
    console.error(`Error fetching article ${id}:`, error);
    return null;
  }
}

export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const article = await getArticle(id);

  if (!article) {
    return {
      title: "مقاله مورد نظر یافت نشد | آرتیسا",
      description: "متاسفانه مقاله مورد نظر یافت نشد یا ممکن است حذف شده باشد.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const siteUrl = getSiteUrl();
  const targetId = article.id || article.articleId || id;
  const canonicalUrl = `${siteUrl}/blog/${targetId}`;
  const title = `${article.title} | مجله هنر آرتیسا`;
  const cleanDescription =
    article.desc?.replace(/<[^>]+>/g, " ").trim().slice(0, 160) ||
    article.title;

  const coverImage = getAbsoluteImageUrl(article.image);

  return {
    title,
    description: cleanDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description: cleanDescription,
      url: canonicalUrl,
      type: "article",
      publishedTime: article.created_at,
      modifiedTime: article.updated_at || article.created_at,
      authors: [article.author || "تیم تحریریه آرتیسا"],
      images: [
        {
          url: coverImage,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: cleanDescription,
      images: [coverImage],
    },
  };
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { id } = await params;
  const article = await getArticle(id);

  if (!article) {
    notFound();
  }

  const targetId = article.id || article.articleId || id;
  const articleSchema = generateArticleSchema(article);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "خانه", url: "/" },
    { name: "مجله هنر", url: "/blog" },
    { name: article.title, url: `/blog/${targetId}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <BlogDetailsView article={article} />
    </>
  );
}
