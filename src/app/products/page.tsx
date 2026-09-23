import { Suspense } from "react";
import type { Metadata } from "next";
import ProductsView from "@/components/views/ProductsView";
import type { ProductsPaginatedResponse } from "@/hooks/useProducts";
import { getSiteUrl, generateBreadcrumbSchema } from "@/lib/seo";

interface ProductsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export const dynamic = "force-dynamic";

const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://artisa-backend.vercel.app";

export async function generateMetadata({ searchParams }: ProductsPageProps): Promise<Metadata> {
  const resolvedParams = await searchParams;
  const siteUrl = getSiteUrl();
  const category =
    typeof resolvedParams?.category === "string" && resolvedParams.category.trim()
      ? resolvedParams.category.trim()
      : undefined;

  if (category) {
    const title = `خرید و قیمت ${category} اورجینال | گالری آثار هنری آرتیسا`;
    const description = `مشاهده و خرید آنلاین انواع آثار دسته‌بندی ${category} از هنرمندان معاصر ایرانی با گواهی اصالت فیزیکی، بسته‌بندی ۵ لایه ضدضربه و ارسال به سراسر کشور در گالری آرتیسا.`;
    const canonicalPath = `/products?category=${encodeURIComponent(category)}`;
    const fullCanonicalUrl = `${siteUrl}${canonicalPath}`;

    return {
      title,
      description,
      alternates: {
        canonical: canonicalPath,
      },
      openGraph: {
        title,
        description,
        url: fullCanonicalUrl,
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
      },
    };
  }

  const title = "خرید انواع تابلو نقاشی اورجینال و هنر دیواری مدرن | آرتیسا";
  const description =
    "فروشگاه آنلاین تابلو نقاشی، هنر دیواری، مجسمه، قاب و فریم، و هدایای هنری با بالاترین کیفیت، گواهی اصالت اثر و ارسال به سراسر کشور در گالری هنری آرتیسا.";

  return {
    title,
    description,
    alternates: {
      canonical: "/products",
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/products`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

async function getInitialProducts(
  params: { [key: string]: string | string[] | undefined }
): Promise<ProductsPaginatedResponse | undefined> {
  const query = new URLSearchParams();
  query.set("limit", "12");
  query.set("page", typeof params.page === "string" ? params.page : "1");
  query.set("sort_by", typeof params.sort_by === "string" ? params.sort_by : "created_at");
  query.set("sort_order", typeof params.sort_order === "string" ? params.sort_order : "desc");

  if (typeof params.category === "string" && params.category) {
    query.set("category", params.category);
  }
  if (typeof params.search === "string" && params.search) {
    query.set("search", params.search);
  }
  if (params.isSpecial === "true") {
    query.set("isSpecial", "true");
  }
  if (params.isBestSeller === "true") {
    query.set("isBestSeller", "true");
  }
  if (typeof params.minPrice === "string" && params.minPrice) {
    query.set("minPrice", params.minPrice);
  }
  if (typeof params.maxPrice === "string" && params.maxPrice) {
    query.set("maxPrice", params.maxPrice);
  }

  try {
    const res = await fetch(`${backendUrl}/api/v1/products?${query.toString()}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return undefined;
    const json = await res.json();
    const data = json?.data || json;
    return data?.items ? (data as ProductsPaginatedResponse) : undefined;
  } catch (error) {
    console.error("Error prefetching products:", error);
    return undefined;
  }
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const resolvedParams = await searchParams;
  const initialData = await getInitialProducts(resolvedParams);
  const paramsKey = resolvedParams ? JSON.stringify(resolvedParams) : "default";

  const category =
    typeof resolvedParams?.category === "string" && resolvedParams.category.trim()
      ? resolvedParams.category.trim()
      : undefined;

  const breadcrumbItems = [
    { name: "خانه", url: "/" },
    { name: "محصولات", url: "/products" },
    ...(category ? [{ name: category, url: `/products?category=${encodeURIComponent(category)}` }] : []),
  ];
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Suspense
        fallback={
          <div className="min-h-screen py-12 flex flex-col gap-6 animate-pulse" dir="rtl">
            <div className="h-8 w-48 bg-muted/40 rounded-xl" />
            <div className="h-16 w-full bg-muted/40 rounded-2xl" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="h-80 bg-muted/40 rounded-2xl" />
              ))}
            </div>
          </div>
        }
      >
        <ProductsView key={paramsKey} initialData={initialData} initialSearchParams={resolvedParams} />
      </Suspense>
    </>
  );
}
