import { Suspense } from "react";
import type { Metadata } from "next";
import HomeView, { HomeInitialData } from "@/components/home/HomeView";

export const metadata: Metadata = {
  title: "آرتیسا | گالری آنلاین تابلو نقاشی و هنر دیواری اورجینال",
  description:
    "خرید آنلاین تابلو نقاشی اورجینال، هنر دیواری مدرن، مجسمه و اکسسوری‌های هنری از هنرمندان معاصر ایرانی با گواهی اصالت و ارسال مطمئن به سراسر کشور.",
  alternates: {
    canonical: "/",
  },
};

const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://artisa-backend.vercel.app";

async function getHomeInitialData(): Promise<HomeInitialData> {
  const isrOptions = { next: { revalidate: 300 } };

  try {
    const [bannersRes, bestSellersRes, offersRes, specialRes, blogRes] = await Promise.allSettled([
      fetch(`${backendUrl}/api/v1/banners`, isrOptions).then((r) => (r.ok ? r.json() : null)),
      fetch(`${backendUrl}/api/v1/products?isBestSeller=true&limit=8`, isrOptions).then((r) =>
        r.ok ? r.json() : null
      ),
      fetch(`${backendUrl}/api/v1/special-offers/active`, isrOptions).then((r) =>
        r.ok ? r.json() : null
      ),
      fetch(`${backendUrl}/api/v1/products?isSpecial=true&limit=24`, isrOptions).then((r) =>
        r.ok ? r.json() : null
      ),
      fetch(`${backendUrl}/api/v1/blog/articles`, isrOptions).then((r) => (r.ok ? r.json() : null)),
    ]);

    const banners =
      bannersRes.status === "fulfilled" && bannersRes.value
        ? bannersRes.value.data || bannersRes.value
        : undefined;

    const bestSellers =
      bestSellersRes.status === "fulfilled" && bestSellersRes.value
        ? bestSellersRes.value.data || bestSellersRes.value
        : undefined;

    const activeOffers =
      offersRes.status === "fulfilled" && offersRes.value
        ? offersRes.value.data || offersRes.value
        : undefined;

    const specialProducts =
      specialRes.status === "fulfilled" && specialRes.value
        ? specialRes.value.data || specialRes.value
        : undefined;

    let blogArticles = undefined;
    if (blogRes.status === "fulfilled" && blogRes.value) {
      const val = blogRes.value;
      if (Array.isArray(val)) blogArticles = val;
      else if (val.items && Array.isArray(val.items)) blogArticles = val.items;
      else if (val.data && Array.isArray(val.data)) blogArticles = val.data;
    }

    return {
      banners: Array.isArray(banners) ? banners : undefined,
      bestSellers: bestSellers?.items ? bestSellers : undefined,
      activeOffers: Array.isArray(activeOffers) ? activeOffers : undefined,
      specialProducts: specialProducts?.items ? specialProducts : undefined,
      blogArticles,
    };
  } catch (error) {
    console.error("Error prefetching homepage data:", error);
    return {};
  }
}

export default async function RootPage() {
  const initialData = await getHomeInitialData();

  return (
    <>
      {/* Semantic H1 for Google Search & Accessibility */}
      <h1 className="sr-only">
        گالری آنلاین آثار هنری، تابلو نقاشی اورجینال و هنر دیواری آرتیسا
      </h1>
      <Suspense fallback={<div className="h-64 animate-pulse rounded-3xl bg-muted/30" />}>
        <HomeView initialData={initialData} />
      </Suspense>
    </>
  );
}
