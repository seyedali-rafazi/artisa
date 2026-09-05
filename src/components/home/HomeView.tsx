"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/LanguageContext";
import { useApp } from "@/components/AppContext";
import HeroSlider from "@/components/home/HeroSlider";
import CategoriesGrid from "@/components/home/CategoriesGrid";
import SpecialOffers from "@/components/home/SpecialOffers";
import BlogSection from "@/components/home/BlogSection";
import ProductBox from "@/components/home/ProductBox";
import { X, Search } from "lucide-react";
import { useProducts, ProductsPaginatedResponse } from "@/hooks/useProducts";
import type { BannerItem } from "@/hooks/useBanners";
import type { SpecialOffer } from "@/hooks/useSpecialOffers";
import type { ArticleItem } from "@/hooks/useBlog";

export interface HomeInitialData {
  banners?: BannerItem[];
  bestSellers?: ProductsPaginatedResponse;
  activeOffers?: SpecialOffer[];
  specialProducts?: ProductsPaginatedResponse;
  blogArticles?: ArticleItem[];
}

interface HomeViewProps {
  initialData?: HomeInitialData;
  initialSearch?: string;
}

export default function HomeView({ initialData, initialSearch }: HomeViewProps = {}) {
  const { searchQuery, setSearchQuery } = useApp();
  const { t } = useLanguage();
  const router = useRouter();

  // Sync initialSearch with AppContext if provided
  useEffect(() => {
    if (initialSearch !== undefined && initialSearch !== searchQuery) {
      setSearchQuery(initialSearch);
    }
  }, [initialSearch, searchQuery, setSearchQuery]);

  // Dynamic backend fetch for search / category filtering
  const isSpecialSearch = searchQuery === "special";
  const isCategorySearch = [
    "تابلو نقاشی",
    "هنر دیواری",
    "مجسمه و دکوری",
    "قاب و فریم",
    "هنر مدرن",
  ].includes(searchQuery);

  const { data: searchApiData, isLoading: isSearchLoading } = useProducts(
    searchQuery
      ? {
          search: !isSpecialSearch && !isCategorySearch ? searchQuery : undefined,
          category: isCategorySearch ? searchQuery : undefined,
          isSpecial: isSpecialSearch ? true : undefined,
          limit: 50,
        }
      : {}
  );

  const { data: bestSellersApiData, isLoading: isBestSellersLoading } = useProducts(
    {
      isBestSeller: true,
      limit: 8,
    },
    initialData?.bestSellers ? { initialData: initialData.bestSellers } : undefined
  );

  // Dynamic products strictly from backend
  const filteredProducts = searchApiData?.items || [];
  const bestSellers = bestSellersApiData?.items || [];

  const handleClearSearch = () => {
    setSearchQuery("");
    router.push("/");
  };

  return (
    <div className="flex flex-col gap-12">
      {searchQuery ? (
        <div className="w-full">
          <div className="flex items-center justify-between gap-4 mb-8 border-b border-border pb-4">
            <div className="flex items-center gap-2">
              <Search className="size-5 text-primary" />
              <h2 className="text-lg md:text-xl font-black">
                {`نتایج جستجو برای: «${searchQuery}»`}
              </h2>
              <span className="text-xs text-muted-foreground font-semibold">
                ({filteredProducts.length} کالا)
              </span>
            </div>
            <button
              onClick={handleClearSearch}
              className="flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-primary transition-colors cursor-pointer"
            >
              <span>پاک کردن فیلتر</span>
              <X className="size-4" />
            </button>
          </div>

          {isSearchLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-64 rounded-2xl bg-neutral-200 dark:bg-neutral-800 animate-pulse"
                />
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductBox key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-muted-foreground text-sm font-bold mb-4">
                کالایی با این مشخصات یافت نشد.
              </p>
            </div>
          )}
        </div>
      ) : (
        <>
          <HeroSlider initialBanners={initialData?.banners} />
          <CategoriesGrid />
          <SpecialOffers
            initialOffers={initialData?.activeOffers}
            initialProducts={initialData?.specialProducts}
          />

          <section className="w-full">
            <div className="flex flex-col gap-1 mb-8">
              <h2 className="text-xl md:text-2xl font-black text-foreground">
                {t("bestSellersTitle")}
              </h2>
              <p className="text-xs text-muted-foreground">{t("bestSellersSubtitle")}</p>
              <div className="h-1 w-12 bg-primary rounded-full mt-1" />
            </div>

            {isBestSellersLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-64 rounded-2xl bg-neutral-200 dark:bg-neutral-800 animate-pulse"
                  />
                ))}
              </div>
            ) : bestSellers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {bestSellers.map((product) => (
                  <ProductBox key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-muted-foreground font-semibold border border-border/40 rounded-2xl">
                محصولی در بخش پرفروش‌ترین‌ها یافت نشد.
              </div>
            )}
          </section>

          <BlogSection initialArticles={initialData?.blogArticles} />
        </>
      )}
    </div>
  );
}
