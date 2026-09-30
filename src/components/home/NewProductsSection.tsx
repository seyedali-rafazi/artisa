"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { useLanguage } from "../LanguageContext";
import ProductBox from "./ProductBox";
import { useProducts, ProductsPaginatedResponse } from "@/hooks/useProducts";
import { Sparkles, ChevronLeft, ChevronRight } from "lucide-react";

// Swiper imports matching SpecialOffers
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, A11y } from "swiper/modules";
import type { Swiper as SwiperClass } from "swiper";
import "swiper/css";
import "swiper/css/pagination";

interface NewProductsSectionProps {
  initialProducts?: ProductsPaginatedResponse;
}

export default function NewProductsSection({
  initialProducts,
}: NewProductsSectionProps = {}) {
  const { t } = useLanguage();
  const swiperRef = useRef<SwiperClass | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { data: productsData, isLoading } = useProducts(
    {
      sort_by: "created_at",
      sort_order: "desc",
      limit: 12,
    },
    initialProducts ? { initialData: initialProducts } : undefined,
  );

  const products = useMemo(() => productsData?.items || [], [productsData]);

  const handleSlidePrev = () => {
    swiperRef.current?.slidePrev();
  };

  const handleSlideNext = () => {
    swiperRef.current?.slideNext();
  };

  // If loading without initial data
  if (isLoading && !initialProducts) {
    return (
      <section className="w-full">
        <div className="flex flex-col gap-1 mb-8">
          <div className="h-6 w-48 bg-muted rounded-lg animate-pulse" />
          <div className="h-3 w-72 bg-muted/60 rounded-md animate-pulse mt-1" />
          <div className="h-1 w-12 bg-primary/40 rounded-full mt-2" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-72 rounded-2xl bg-muted/40 animate-pulse border border-border/40"
            />
          ))}
        </div>
      </section>
    );
  }

  // If no products found
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="w-full" aria-labelledby="new-products-heading">
      {/* ─── Section Header ─── */}
      <div className="flex items-end justify-between gap-4 mb-6">
        {/* Title, Badge & Subtitle */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary border border-primary/25 shrink-0">
              <Sparkles className="size-4 text-primary" />
            </div>
            <h2
              id="new-products-heading"
              className="text-xl md:text-2xl font-black text-foreground"
            >
              {t("newProductsTitle") || "محصولات جدید آرتیسا"}
            </h2>
          </div>
        </div>

        {/* Header Action: View All Link */}
        <div className="flex items-center gap-3">
          <Link
            href="/products?sort_by=created_at&sort_order=desc"
            className="text-xs md:text-sm font-bold text-primary hover:text-primary-hover flex items-center gap-1 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-primary/5"
          >
            <span>{t("viewAll") || "مشاهده همه"}</span>
            <ChevronLeft className="size-4" />
          </Link>
        </div>
      </div>

      {/* ─── Swiper Carousel Area (Product Cards + Floating Navigation Arrows + Dots) ─── */}
      <div className="relative w-full z-10">
        {/* Floating Right Navigation Button (RTL: Previous / Back to start) */}
        {isMounted && !isBeginning && (
          <button
            type="button"
            onClick={handleSlidePrev}
            aria-label="مشاهده محصولات قبلی"
            className="hidden sm:flex absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 size-10 rounded-full bg-card text-foreground shadow-lg border border-border/80 hover:border-primary hover:text-primary items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer"
          >
            <ChevronRight className="size-5" />
          </button>
        )}

        {/* Floating Left Navigation Button (RTL: Next / Show more) */}
        {isMounted && !isEnd && (
          <button
            type="button"
            onClick={handleSlideNext}
            aria-label="مشاهده محصولات بعدی"
            className="hidden sm:flex absolute -left-3.5 top-1/2 -translate-y-1/2 z-20 size-10 rounded-full bg-card text-foreground shadow-lg border border-border/80 hover:border-primary hover:text-primary items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer"
          >
            <ChevronLeft className="size-5" />
          </button>
        )}

        {!isMounted ? (
          /* Pre-mount / SSR clean track: fixed-width cards prevent 100% width and full-screen height expansion on initial page load */
          <div className="w-full flex gap-2.5 sm:gap-3.5 overflow-hidden py-1">
            {products.slice(0, 6).map((product) => (
              <div
                key={product.id}
                className="w-[165px] sm:w-[195px] md:w-[220px] shrink-0 h-auto"
              >
                <ProductBox
                  product={product}
                  className="h-full"
                />
              </div>
            ))}
          </div>
        ) : (
          /* Swiper Slider Component matching SpecialOffers */
          <Swiper
            dir="rtl"
            modules={[Pagination, A11y]}
            slidesPerView={1.8}
            spaceBetween={10}
            observer={true}
            observeParents={true}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
              setIsBeginning(swiper.isBeginning);
              setIsEnd(swiper.isEnd);
            }}
            onSlideChange={(swiper) => {
              setIsBeginning(swiper.isBeginning);
              setIsEnd(swiper.isEnd);
            }}
            grabCursor={true}
            pagination={{
              clickable: true,
              el: ".new-products-pagination",
              bulletClass:
                "transition-all duration-300 rounded-full cursor-pointer inline-block bg-muted-foreground/30 dark:bg-muted-foreground/20 size-2",
              bulletActiveClass:
                "!w-6 !h-2 !bg-primary !rounded-full shadow-sm",
            }}
            breakpoints={{
              320: {
                slidesPerView: 1.8,
                spaceBetween: 10,
              },
              420: {
                slidesPerView: 2.2,
                spaceBetween: 12,
              },
              640: {
                slidesPerView: 3.2,
                spaceBetween: 14,
              },
              768: {
                slidesPerView: 3.8,
                spaceBetween: 16,
              },
              1024: {
                slidesPerView: 4.6,
                spaceBetween: 16,
              },
              1280: {
                slidesPerView: 5.5,
                spaceBetween: 18,
              },
            }}
            className="w-full py-1 new-products-swiper [&_.swiper-wrapper]:items-stretch"
          >
            {products.map((product) => (
              <SwiperSlide key={product.id} className="h-auto">
                <ProductBox
                  product={product}
                  className="h-full"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        )}

        {/* Swiper Pagination Dots (Matching SpecialOffers) */}
        <div className="new-products-pagination flex items-center justify-center gap-1.5 mt-3 sm:mt-4 select-none min-h-[8px]" />
      </div>
    </section>
  );
}
