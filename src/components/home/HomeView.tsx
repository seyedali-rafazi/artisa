"use client";

import React, { useEffect } from "react";
import { useLanguage } from "@/components/LanguageContext";
import { useApp } from "@/components/AppContext";
import HeroSlider from "@/components/home/HeroSlider";
import CategoriesGrid from "@/components/home/CategoriesGrid";
import SpecialOffers from "@/components/home/SpecialOffers";
import BlogSection from "@/components/home/BlogSection";
import ProductBox from "@/components/home/ProductBox";
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
}

export default function HomeView({ initialData }: HomeViewProps = {}) {
  const { setSearchQuery } = useApp();
  const { t } = useLanguage();

  // Reset any leftover search query when mounting the home page
  useEffect(() => {
    setSearchQuery("");
  }, [setSearchQuery]);

  const { data: bestSellersApiData, isLoading: isBestSellersLoading } = useProducts(
    {
      isBestSeller: true,
      limit: 8,
    },
    initialData?.bestSellers ? { initialData: initialData.bestSellers } : undefined
  );

  const bestSellers = bestSellersApiData?.items || [];

  return (
    <div className="flex flex-col gap-12">
      <HeroSlider initialBanners={initialData?.banners} />
      <CategoriesGrid />
      <SpecialOffers
        initialOffers={initialData?.activeOffers}
        initialProducts={initialData?.specialProducts}
      />

      {/* Best Sellers Section */}
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
    </div>
  );
}
