"use client";

import React, { useEffect } from "react";
import { useApp } from "@/components/AppContext";
import HeroSlider from "@/components/home/HeroSlider";
import CategoriesGrid from "@/components/home/CategoriesGrid";
import SpecialOffers from "@/components/home/SpecialOffers";
import NewProductsSection from "@/components/home/NewProductsSection";
import BestSellersSection from "@/components/home/BestSellersSection";
import BlogSection from "@/components/home/BlogSection";
import type { ProductsPaginatedResponse } from "@/hooks/useProducts";
import type { BannerItem } from "@/hooks/useBanners";
import type { SpecialOffer } from "@/hooks/useSpecialOffers";
import type { ArticleItem } from "@/hooks/useBlog";

export interface HomeInitialData {
  banners?: BannerItem[];
  bestSellers?: ProductsPaginatedResponse;
  activeOffers?: SpecialOffer[];
  specialProducts?: ProductsPaginatedResponse;
  newProducts?: ProductsPaginatedResponse;
  blogArticles?: ArticleItem[];
}

interface HomeViewProps {
  initialData?: HomeInitialData;
}

export default function HomeView({ initialData }: HomeViewProps = {}) {
  const { setSearchQuery } = useApp();

  // Reset any leftover search query when mounting the home page
  useEffect(() => {
    setSearchQuery("");
  }, [setSearchQuery]);

  return (
    <div className="flex flex-col gap-12">
      <HeroSlider initialBanners={initialData?.banners} />
      <CategoriesGrid />
      <SpecialOffers
        initialOffers={initialData?.activeOffers}
      />

      {/* New Products of Artisa Section (Swiper with Scrollbar) */}
      <NewProductsSection initialProducts={initialData?.newProducts} />

      {/* Best Sellers of Artisa Section (Swiper Carousel) */}
      <BestSellersSection initialProducts={initialData?.bestSellers} />

      <BlogSection initialArticles={initialData?.blogArticles} />
    </div>
  );
}
