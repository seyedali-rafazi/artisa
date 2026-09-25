"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { useApp, Product } from "../AppContext";
import ProductImage from "../ui/ProductImage";
import {
  ChevronLeft,
  ChevronRight,
  Star,
  ShoppingCart,
  Check,
} from "lucide-react";
import {
  useActiveSpecialOffers,
  SpecialOffer,
  SpecialOfferProduct,
} from "@/hooks/useSpecialOffers";
import { toPersianDigits } from "@/lib/utils";

// Swiper imports
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, A11y } from "swiper/modules";
import type { Swiper as SwiperClass } from "swiper";
import "swiper/css";
import "swiper/css/pagination";

export function DiscountTagIcon({
  size = 64,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M9.5 30.2L30.2 9.5C31.2 8.5 32.6 8 34.1 8H48C52.4 8 56 11.6 56 16V29.9C56 31.4 55.5 32.8 54.5 33.8L33.8 54.5C31.9 56.4 28.8 56.4 26.9 54.5L9.5 37.1C7.6 35.2 7.6 32.1 9.5 30.2Z"
        fill="currentColor"
      />

      <circle cx="44" cy="20" r="4" fill="white" />

      <path
        d="M24 39L39 24"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
      />

      <circle cx="25" cy="25" r="3" fill="white" />
      <circle cx="39" cy="39" r="3" fill="white" />

      <path
        d="M12 18L5 14M9 25L2 25M14 11L11 4"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

// 4-Unit Countdown Timer Component with Hydration Safety (Day, Hour, Minute, Second)
function CountdownTimer({
  endAt,
  onExpire,
  size = "md",
}: {
  endAt?: string;
  onExpire?: () => void;
  size?: "sm" | "md";
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hrs: 0,
    mins: 0,
    secs: 0,
  });

  useEffect(() => {
    setIsMounted(true);
    if (!endAt) return;

    const targetTime = new Date(endAt).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const diffInSeconds = Math.max(0, Math.floor((targetTime - now) / 1000));
      if (diffInSeconds <= 0) {
        setTimeLeft({ days: 0, hrs: 0, mins: 0, secs: 0 });
        onExpire?.();
        return;
      }
      const days = Math.floor(diffInSeconds / 86400);
      const hrs = Math.floor((diffInSeconds % 86400) / 3600);
      const mins = Math.floor((diffInSeconds % 3600) / 60);
      const secs = diffInSeconds % 60;
      setTimeLeft({ days, hrs, mins, secs });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [endAt, onExpire]);

  const isMd = size === "md";

  const boxClass = isMd
    ? "flex flex-col items-center justify-center min-w-[46px] sm:min-w-[52px] h-[50px] sm:h-[56px] px-1.5 sm:px-2 rounded-xl sm:rounded-2xl bg-primary text-primary-foreground shadow-xs hover:bg-primary-hover transition-colors"
    : "flex flex-col items-center justify-center min-w-[40px] sm:min-w-[44px] h-[44px] sm:h-[48px] px-1.5 py-0.5 rounded-xl bg-primary text-primary-foreground shadow-xs";

  const numClass = isMd
    ? "text-sm sm:text-base font-black text-primary-foreground tabular-nums leading-none tracking-tight"
    : "text-xs sm:text-[13px] font-black text-primary-foreground tabular-nums leading-none";

  const labelClass = isMd
    ? "text-[9.5px] sm:text-[10.5px] font-bold text-primary-foreground/90 leading-none mt-1"
    : "text-[8px] sm:text-[9px] font-bold text-primary-foreground/90 leading-none mt-0.5";

  const formatDigits = (val: number) => {
    return toPersianDigits(
      val < 10 ? val.toString().padStart(2, "0") : val.toString(),
    );
  };

  return (
    <div
      className="flex items-center gap-1.5 sm:gap-2 select-none"
      dir="ltr"
      suppressHydrationWarning
    >
      {/* 1. Days */}
      <div className={boxClass} suppressHydrationWarning>
        <span className={numClass} suppressHydrationWarning>
          {isMounted ? formatDigits(timeLeft.days) : toPersianDigits("00")}
        </span>
        <span className={labelClass}>روز</span>
      </div>

      {/* 2. Hours */}
      <div className={boxClass} suppressHydrationWarning>
        <span className={numClass} suppressHydrationWarning>
          {isMounted ? formatDigits(timeLeft.hrs) : toPersianDigits("00")}
        </span>
        <span className={labelClass}>ساعت</span>
      </div>

      {/* 3. Minutes */}
      <div className={boxClass} suppressHydrationWarning>
        <span className={numClass} suppressHydrationWarning>
          {isMounted ? formatDigits(timeLeft.mins) : toPersianDigits("00")}
        </span>
        <span className={labelClass}>دقیقه</span>
      </div>

      {/* 4. Seconds */}
      <div className={boxClass} suppressHydrationWarning>
        <span className={numClass} suppressHydrationWarning>
          {isMounted ? formatDigits(timeLeft.secs) : toPersianDigits("00")}
        </span>
        <span className={labelClass}>ثانیه</span>
      </div>
    </div>
  );
}

interface SpecialOffersProps {
  initialOffers?: SpecialOffer[];
  initialProducts?: unknown;
}

export default function SpecialOffers({
  initialOffers,
}: SpecialOffersProps = {}) {
  const { setSelectedProduct, addToCart, cart } = useApp();
  const [isExpired, setIsExpired] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Swiper state
  const swiperRef = useRef<SwiperClass | null>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const {
    data: activeOffers,
    isLoading: isOffersLoading,
    refetch,
  } = useActiveSpecialOffers(
    initialOffers ? { initialData: initialOffers } : undefined,
  );

  // Primary active offer
  const primaryOffer =
    activeOffers && activeOffers.length > 0 ? activeOffers[0] : null;

  // Reset expired state when primary offer changes
  useEffect(() => {
    setIsExpired(false);
  }, [primaryOffer?.id]);

  // Check if primary offer is currently active and not expired
  const isOfferActive = useMemo(() => {
    if (!primaryOffer) return false;
    if (primaryOffer.is_active === false) return false;
    if (primaryOffer.status && primaryOffer.status !== "active") return false;
    if (primaryOffer.end_at) {
      const endMs = new Date(primaryOffer.end_at).getTime();
      if (!isNaN(endMs) && endMs <= Date.now()) {
        return false;
      }
    }
    return true;
  }, [primaryOffer]);

  // Products belonging strictly to the active special offer
  const specialProducts = useMemo(() => {
    if (!isOfferActive || !primaryOffer?.products) {
      return [];
    }
    return primaryOffer.products;
  }, [isOfferActive, primaryOffer]);

  // Display products from the active offer
  const displayProducts = useMemo(
    () => specialProducts.slice(0, 24),
    [specialProducts],
  );

  const handleSlidePrev = () => {
    swiperRef.current?.slidePrev();
  };

  const handleSlideNext = () => {
    swiperRef.current?.slideNext();
  };

  const handleExpire = () => {
    setIsExpired(true);
    refetch();
  };

  // If loading without initial offers, or no active offer exists, or the offer is expired/has no products: DO NOT SHOW THIS SECTION.
  if (
    (isOffersLoading && !initialOffers) ||
    !isOfferActive ||
    !primaryOffer ||
    isExpired ||
    displayProducts.length === 0
  ) {
    return null;
  }

  return (
    <section
      aria-label="تخفیف‌های شگفت‌انگیز"
      className="w-full mt-8 sm:mt-12 rounded-3xl bg-gradient-to-l from-primary via-[#C19B53] to-primary-dark dark:from-primary/95 dark:via-[#A37E3A] dark:to-primary-dark p-4 sm:p-6 md:p-7 text-primary-foreground shadow-xl relative overflow-hidden select-none"
    >
      {/* Ambient luxury light effect */}
      <div className="absolute -top-32 -right-32 size-80 bg-white/20 dark:bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 size-80 bg-black/15 dark:bg-black/25 rounded-full blur-3xl pointer-events-none" />

      {/* ─── Top Banner Bar (Elevated Card with Title, Description, and Countdown Timer) ─── */}
      <div className="w-full rounded-2xl md:rounded-3xl bg-card/95 text-card-foreground backdrop-blur-md border border-white/30 dark:border-white/10 p-4 sm:p-5 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm relative z-10 mb-4 sm:mb-6">
        {/* Right side on desktop / Top on mobile: Icon + Title + Subtitle */}
        <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto">
          <div className="size-12 sm:size-14 rounded-2xl bg-primary/15 dark:bg-primary/25 flex items-center justify-center shrink-0 border border-primary/25 shadow-xs">
            <DiscountTagIcon className="size-7 sm:size-8 text-primary" />
          </div>
          <div className="flex flex-col text-start">
            <h2 className="text-base sm:text-lg md:text-xl font-black text-foreground tracking-tight">
              {primaryOffer.title || "تخفیف‌های شگفت‌انگیز"}
            </h2>
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
              {primaryOffer.description ||
                "فقط برای مدت محدود، محصولات منتخب با تخفیف ویژه"}
            </p>
          </div>
        </div>

        {/* Left side on desktop / Bottom on mobile: Countdown Timer */}
        <div className="flex items-center justify-center md:justify-end gap-2.5 sm:gap-3 w-full md:w-auto">
          <CountdownTimer
            endAt={primaryOffer.end_at}
            onExpire={handleExpire}
            size="md"
          />
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
            {displayProducts.slice(0, 6).map((product, index) => {
              const isInCart = Boolean(
                cart?.some((item) => String(item.id) === String(product.id)),
              );
              return (
                <div
                  key={product.id || index}
                  className="w-[165px] sm:w-[195px] md:w-[220px] shrink-0 h-auto"
                >
                  <SpecialOfferProductCard
                    product={product}
                    isInCart={isInCart}
                    onAddToCart={addToCart}
                    onSelectProduct={setSelectedProduct}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          /* Swiper Slider Component */
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
              el: ".special-offers-pagination",
              bulletClass:
                "transition-all duration-300 rounded-full cursor-pointer inline-block bg-white/40 dark:bg-black/30 size-2",
              bulletActiveClass: "!w-6 !h-2 !bg-card !rounded-full shadow-sm",
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
            className="w-full py-1 special-offers-swiper [&_.swiper-wrapper]:items-stretch"
          >
            {displayProducts.map((product, index) => {
              const isInCart = Boolean(
                cart?.some((item) => String(item.id) === String(product.id)),
              );
              return (
                <SwiperSlide key={product.id || index} className="h-auto">
                  <SpecialOfferProductCard
                    product={product}
                    isInCart={isInCart}
                    onAddToCart={addToCart}
                    onSelectProduct={setSelectedProduct}
                  />
                </SwiperSlide>
              );
            })}
          </Swiper>
        )}

        {/* Swiper Pagination Dots (Styling matching mockup) */}
        <div className="special-offers-pagination flex items-center justify-center gap-1.5 mt-3 sm:mt-4 select-none min-h-[8px]" />
      </div>
    </section>
  );
}

// Subcomponent for individual Special Offer Product Card
function SpecialOfferProductCard({
  product,
  isInCart,
  onAddToCart,
  onSelectProduct,
}: {
  product: SpecialOfferProduct;
  isInCart: boolean;
  onAddToCart: (p: Product) => void;
  onSelectProduct: (p: Product) => void;
}) {
  const discountPercent =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(
          ((product.oldPrice - product.price) / product.oldPrice) * 100,
        )
      : 25;

  const hasDiscount =
    Boolean(product.oldPrice && product.oldPrice > product.price) ||
    discountPercent > 0;
  const calculatedOldPrice =
    product.oldPrice && product.oldPrice > product.price
      ? product.oldPrice
      : Math.round(product.price * (1 + discountPercent / 100));

  return (
    <div className="h-full max-w-[260px] mx-auto bg-card text-card-foreground rounded-2xl border border-border/60 p-2.5 sm:p-3 flex flex-col justify-between shadow-sm hover:shadow-xl hover:border-primary/50 transition-all duration-300 group">
      {/* Top: Product Image with Overlaid Discount Badge */}
      <Link
        href={`/product/${product.id}`}
        onClick={() => onSelectProduct(product as unknown as Product)}
        className="relative aspect-square w-full max-h-[220px] rounded-xl overflow-hidden bg-muted/20 mb-2.5 block cursor-pointer"
      >
        <ProductImage
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 165px, (max-width: 768px) 190px, 225px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Overlaid Discount Badge (-30%) */}
        {hasDiscount && (
          <div className="absolute top-2 right-2 z-10 px-2 py-0.5 text-[10.5px] sm:text-[11px] font-black text-primary-foreground bg-primary rounded-lg shadow-sm">
            {toPersianDigits(discountPercent)}٪-
          </div>
        )}
      </Link>

      {/* Middle: Title */}
      <Link
        href={`/product/${product.id}`}
        onClick={() => onSelectProduct(product as unknown as Product)}
        className="text-xs sm:text-[13px] font-extrabold text-foreground leading-snug line-clamp-1 group-hover:text-primary transition-colors text-start mb-1.5 block cursor-pointer"
      >
        {product.name}
      </Link>

      {/* Rating Row (★ 4.8 (124)) */}
      <div className="flex items-center gap-1 mb-2.5">
        <Star className="size-3.5 fill-amber-400 text-amber-400" />
        <span className="text-[11px] font-black text-foreground">
          {toPersianDigits((product.rating || 4.8).toFixed(1))}
        </span>
        <span className="text-[10px] font-medium text-muted-foreground">
          ({toPersianDigits(124)})
        </span>
      </div>

      {/* Bottom Row: Price + Add to Cart Button */}
      <div className="mt-auto flex items-center justify-between pt-2 border-t border-border/40">
        {/* Prices */}
        <div className="flex flex-col text-start gap-0.5">
          <span className="text-[10px] sm:text-[11px] text-muted-foreground line-through font-medium leading-none">
            {toPersianDigits(
              Math.round(calculatedOldPrice).toLocaleString("fa-IR"),
            )}{" "}
            تومان
          </span>
          <span className="text-xs sm:text-[13px] font-black text-foreground leading-none">
            {toPersianDigits(
              Math.round(product.price).toLocaleString("fa-IR"),
            )}{" "}
            تومان
          </span>
        </div>

        {/* Add to Cart Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onAddToCart(product as unknown as Product);
          }}
          aria-label={`افزودن ${product.name} به سبد خرید`}
          className={`size-8 sm:size-9 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-95 shadow-xs shrink-0 cursor-pointer ${
            isInCart
              ? "bg-primary text-primary-foreground"
              : "bg-foreground text-background dark:bg-card-foreground dark:text-card hover:bg-primary dark:hover:bg-primary hover:text-primary-foreground"
          }`}
          title={isInCart ? "موجود در سبد خرید" : "افزودن به سبد خرید"}
        >
          {isInCart ? (
            <Check className="size-4 stroke-[2.5]" />
          ) : (
            <ShoppingCart className="size-4" />
          )}
        </button>
      </div>
    </div>
  );
}
