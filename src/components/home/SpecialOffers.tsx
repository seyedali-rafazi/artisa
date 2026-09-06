"use client"

import React, { useState, useEffect, useRef, useMemo } from "react"
import Link from "next/link"
import { useApp, Product } from "../AppContext"
import ProductImage from "../ui/ProductImage"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useActiveSpecialOffers, SpecialOffer, SpecialOfferProduct } from "@/hooks/useSpecialOffers"
import { useProducts, ProductsPaginatedResponse } from "@/hooks/useProducts"
import { toPersianDigits } from "@/lib/utils"

// Digikala-Style Smiley Percentage Icon
function DigikalaPercentSmileIcon({ className = "size-16" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Percentage Slash */}
      <line
        x1="57"
        y1="20"
        x2="23"
        y2="58"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
      />
      {/* Top Right Circle / Eye */}
      <circle cx="55" cy="25" r="7" stroke="currentColor" strokeWidth="4.5" />
      {/* Bottom Left Circle / Eye */}
      <circle cx="27" cy="53" r="7" stroke="currentColor" strokeWidth="4.5" />
      {/* Smile Arc Beneath */}
      <path
        d="M20 62C28 75 52 75 60 62"
        stroke="currentColor"
        strokeWidth="5.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

// Isolated Countdown Timer Component - only re-renders its own 3 digits every second
function CountdownTimer({
  endAt,
  onExpire,
  size = "sm",
}: {
  endAt?: string;
  onExpire?: () => void;
  size?: "sm" | "md";
}) {
  const [timeLeft, setTimeLeft] = useState(() => {
    if (!endAt) return { hrs: 0, mins: 0, secs: 0 };
    const diffInSeconds = Math.max(0, Math.floor((new Date(endAt).getTime() - Date.now()) / 1000));
    return {
      hrs: Math.floor((diffInSeconds % 86400) / 3600),
      mins: Math.floor((diffInSeconds % 3600) / 60),
      secs: diffInSeconds % 60,
    };
  });

  useEffect(() => {
    if (!endAt) return;
    const targetTime = new Date(endAt).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const diffInSeconds = Math.max(0, Math.floor((targetTime - now) / 1000));
      if (diffInSeconds <= 0) {
        setTimeLeft({ hrs: 0, mins: 0, secs: 0 });
        onExpire?.();
        return;
      }
      const hrs = Math.floor((diffInSeconds % 86400) / 3600);
      const mins = Math.floor((diffInSeconds % 3600) / 60);
      const secs = diffInSeconds % 60;
      setTimeLeft({ hrs, mins, secs });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [endAt, onExpire]);

  const boxSize =
    size === "md"
      ? "size-7 sm:size-8 text-xs sm:text-sm"
      : "size-6 sm:size-7 text-[11px] sm:text-xs";
  const colonSize = size === "md" ? "text-xs sm:text-sm" : "text-xs";

  return (
    <div className="flex items-center gap-1" dir="ltr" suppressHydrationWarning>
      <div
        suppressHydrationWarning
        className={`${boxSize} rounded-md bg-card text-card-foreground font-black flex items-center justify-center shadow-xs`}
      >
        {toPersianDigits(timeLeft.hrs.toString().padStart(2, "0"))}
      </div>
      <span className={`text-primary-foreground font-black ${colonSize} animate-pulse`}>:</span>

      <div
        suppressHydrationWarning
        className={`${boxSize} rounded-md bg-card text-card-foreground font-black flex items-center justify-center shadow-xs`}
      >
        {toPersianDigits(timeLeft.mins.toString().padStart(2, "0"))}
      </div>
      <span className={`text-primary-foreground font-black ${colonSize} animate-pulse`}>:</span>

      <div
        suppressHydrationWarning
        className={`${boxSize} rounded-md bg-card text-card-foreground font-black flex items-center justify-center shadow-xs`}
      >
        {toPersianDigits(timeLeft.secs.toString().padStart(2, "0"))}
      </div>
    </div>
  );
}

interface SpecialOffersProps {
  initialOffers?: SpecialOffer[];
  initialProducts?: ProductsPaginatedResponse;
}

export default function SpecialOffers({ initialOffers, initialProducts }: SpecialOffersProps = {}) {
  const { setSelectedProduct } = useApp()
  const { data: activeOffers, isLoading: isOffersLoading, refetch } = useActiveSpecialOffers(
    initialOffers ? { initialData: initialOffers } : undefined
  )
  const { data: specialProductsApi, isLoading: isProductsLoading } = useProducts(
    {
      isSpecial: true,
      limit: 24,
    },
    initialProducts ? { initialData: initialProducts } : undefined
  )

  // Get active offer and associated products
  const primaryOffer = activeOffers && activeOffers.length > 0 ? activeOffers[0] : null

  // Use active offer's connected products if available; otherwise fall back to general isSpecial products
  const specialProducts = useMemo(() => {
    if (primaryOffer?.products && primaryOffer.products.length > 0) {
      return primaryOffer.products;
    }
    return specialProductsApi?.items || [];
  }, [primaryOffer, specialProductsApi])

  // Limit carousel items to 16 for optimal mobile DOM size and performance
  const displayProducts = useMemo(() => specialProducts.slice(0, 16), [specialProducts])

  // Carousel ref and scroll handling
  const carouselRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(true)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScroll = () => {
    if (!carouselRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current
    const absScroll = Math.abs(scrollLeft)
    setCanScrollRight(absScroll > 15)
    setCanScrollLeft(absScroll < scrollWidth - clientWidth - 15)
  }

  useEffect(() => {
    const el = carouselRef.current
    if (!el) return
    el.addEventListener("scroll", checkScroll, { passive: true })
    checkScroll()
    return () => el.removeEventListener("scroll", checkScroll)
  }, [displayProducts.length])

  const scroll = (direction: "left" | "right") => {
    if (!carouselRef.current) return
    const el = carouselRef.current
    const offset = direction === "left" ? -280 : 280
    el.scrollBy({ left: offset, behavior: "smooth" })
  }

  const isLoading = isOffersLoading || isProductsLoading

  // If loading finished and no special products found, hide section
  if (!isLoading && specialProducts.length === 0) {
    return null
  }

  return (
    <section
      aria-label="پیشنهادات شگفت‌انگیز"
      className="w-full mt-10 rounded-2xl md:rounded-3xl bg-gradient-to-l from-primary via-[#C19B53] to-primary-dark dark:from-primary dark:to-primary-dark p-3 sm:p-4 text-primary-foreground shadow-xl relative overflow-hidden select-none"
    >
      {/* ─── Mobile Header (< md) ─── */}
      <div className="md:hidden flex items-center justify-between gap-2 mb-3 px-1">
        {/* Right: Icon + Title */}
        <div className="flex items-center gap-1.5">
          <DigikalaPercentSmileIcon className="size-6 sm:size-7 text-primary-foreground drop-shadow-xs" />
          <span className="text-sm sm:text-base font-black text-primary-foreground">
            شگفت‌انگیز
          </span>
        </div>

        {/* Center: Isolated Countdown Timer */}
        <CountdownTimer endAt={primaryOffer?.end_at} onExpire={refetch} size="sm" />

        {/* Left: View All link (همه <) */}
        <Link
          href="/products?isSpecial=true"
          className="flex items-center gap-0.5 text-xs font-bold text-primary-foreground hover:opacity-85 transition-opacity"
        >
          <span>همه</span>
          <ChevronLeft className="size-3.5" />
        </Link>
      </div>

      {/* ─── Main Content (Desktop flex-row with right column, Mobile vertical) ─── */}
      <div className="flex flex-col md:flex-row items-stretch gap-2 md:gap-3">
        {/* ─── Desktop Right Banner Column (hidden on mobile) ─── */}
        <div className="hidden md:flex w-36 md:w-44 shrink-0 flex-col items-center justify-between py-2 sm:py-3 text-center">
          {/* Top Graphic: Smiley % and Persian Typography */}
          <div className="flex flex-col items-center gap-1">
            <DigikalaPercentSmileIcon className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 text-primary-foreground drop-shadow-sm" />
            <h2 className="text-base sm:text-lg md:text-xl font-black text-primary-foreground tracking-tight drop-shadow-xs">
              شگفت‌انگیز
            </h2>
          </div>

          {/* Countdown Timer: Isolated Component */}
          <div className="flex flex-col items-center gap-1.5 my-3">
            <CountdownTimer endAt={primaryOffer?.end_at} onExpire={refetch} size="md" />
          </div>

          {/* Navigate Button to Special Offers Catalog */}
          <Link
            href="/products?isSpecial=true"
            className="flex items-center justify-center gap-1 bg-card hover:bg-card/90 text-primary text-[11px] sm:text-xs font-black px-3 py-2 rounded-xl transition-all shadow-xs hover:shadow active:scale-95 group w-full max-w-[130px]"
          >
            <span>مشاهده همه</span>
            <ChevronLeft className="size-3.5 sm:size-4 text-primary group-hover:-translate-x-0.5 transition-transform" />
          </Link>
        </div>


        {/* ─── Carousel Area (Desktop Left, Mobile Full Width) ─── */}
        <div className="flex-1 min-w-0 relative flex items-center">
          {/* Floating Left Scroll Chevron Button (Desktop / Tablet) */}
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => scroll("left")}
              aria-label="مشاهده محصولات بعدی"
              className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 size-8 sm:size-9 rounded-full bg-card text-foreground hover:text-primary shadow-lg border border-border/80 items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="size-4 sm:size-5" />
            </button>
          )}

          {/* Floating Right Scroll Chevron Button (Desktop / Tablet) */}
          {canScrollRight && (
            <button
              type="button"
              onClick={() => scroll("right")}
              aria-label="مشاهده محصولات قبلی"
              className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 size-8 sm:size-9 rounded-full bg-card text-foreground hover:text-primary shadow-lg border border-border/80 items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer"
            >
              <ChevronRight className="size-4 sm:size-5" />
            </button>
          )}

          {/* Scrollable Track */}
          <div
            ref={carouselRef}
            className="w-full flex items-stretch gap-2 sm:gap-2.5 overflow-x-auto scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-0.5"
          >
            {isLoading ? (
              // Loading Skeleton Cards
              [1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-[145px] sm:w-[165px] md:w-[185px] shrink-0 h-[290px] md:h-[310px] bg-card rounded-2xl p-3 flex flex-col justify-between animate-pulse border border-border/40"
                >
                  <div className="aspect-square w-full bg-muted/60 rounded-xl" />
                  <div className="space-y-2 mt-2">
                    <div className="h-3 bg-muted/60 rounded w-full" />
                    <div className="h-3 bg-muted/60 rounded w-3/4" />
                  </div>
                  <div className="h-4 bg-muted/60 rounded w-1/2 mt-4 self-end" />
                </div>
              ))
            ) : (
              displayProducts.map((product, index) => {
                // Calculate discount percent
                const discountPercent =
                  product.oldPrice && product.oldPrice > product.price
                    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
                    : 15 // default nice discount if not explicitly calculated

                return (
                  <Link
                    key={product.id || index}
                    href={`/product/${product.id}`}
                    onClick={() => setSelectedProduct(product as Product)}
                    className="w-[145px] sm:w-[165px] md:w-[185px] shrink-0 bg-card text-card-foreground rounded-2xl border border-border/50 p-2.5 sm:p-3 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-primary/50 transition-all group cursor-pointer"
                  >
                    {/* Top: Product Image */}
                    <div className="relative aspect-square w-full mb-2 bg-card rounded-xl flex items-center justify-center overflow-hidden">
                      <ProductImage
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 145px, (max-width: 768px) 165px, 185px"
                        className="object-contain p-1 transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>

                    {/* Middle: Product Title (2 lines clamp) */}
                    <h3 className="text-xs md:text-[13px] font-semibold text-foreground leading-snug line-clamp-2 h-9 text-start group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>

                    {/* Bottom: Pricing Section */}
                    <div className="mt-auto pt-2">
                      {/* Row 1: Discount Badge (Right) + Crossed Price (Left) */}
                      <div className="flex items-center justify-between">
                        <span className="bg-destructive text-destructive-foreground text-[10px] sm:text-[11px] font-black px-1.5 py-0.5 rounded-full leading-none shadow-xs">
                          {toPersianDigits(discountPercent)}٪
                        </span>
                        {product.oldPrice && product.oldPrice > product.price ? (
                          <span className="text-[10px] sm:text-[11px] text-muted-foreground line-through font-medium">
                            {toPersianDigits(Math.round(product.oldPrice).toLocaleString("fa-IR"))}
                          </span>
                        ) : (
                          <span className="text-[10px] sm:text-[11px] text-muted-foreground line-through font-medium">
                            {toPersianDigits(
                              Math.round(product.price * (1 + discountPercent / 100)).toLocaleString("fa-IR")
                            )}
                          </span>
                        )}
                      </div>

                      {/* Row 2: Final Price + Toman Label aligned to Left/End */}
                      <div className="flex items-center justify-end gap-1 mt-1 sm:mt-1.5">
                        <span className="text-xs sm:text-sm md:text-base font-black text-foreground">
                          {toPersianDigits(Math.round(product.price).toLocaleString("fa-IR"))}
                        </span>
                        <span className="text-[9px] sm:text-[10px] text-muted-foreground font-medium">تومان</span>
                      </div>
                    </div>
                  </Link>
                )
              })
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
