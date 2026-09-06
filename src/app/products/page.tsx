import { Suspense } from "react";
import ProductsView from "@/components/views/ProductsView";
import type { ProductsPaginatedResponse } from "@/hooks/useProducts";

interface ProductsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://artisa-backend.vercel.app";

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
      cache: "no-store",
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

  return (
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
      <ProductsView initialData={initialData} />
    </Suspense>
  );
}
