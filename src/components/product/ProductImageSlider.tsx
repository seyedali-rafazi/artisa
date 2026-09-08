"use client"

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react"
import Image from "next/image"
import { 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  ZoomIn, 
  Sparkles,
  Layers
} from "lucide-react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Keyboard, A11y } from "swiper/modules"
import type { Swiper as SwiperClass } from "swiper"
import ProductLightboxModal from "./ProductLightboxModal"

// Import Swiper core styles
import "swiper/css"

interface ProductImageSliderProps {
  productName: string
  image: string
  gallery?: string[]
  images?: string[]
  isSpecial?: boolean
  oldPrice?: number
  price?: number
  category?: string
}

export default function ProductImageSlider({
  productName,
  image,
  gallery = [],
  images = [],
  isSpecial = false,
  oldPrice,
  price,
  category,
}: ProductImageSliderProps) {
  const [activeIndex, setActiveIndex] = useState<number>(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false)

  const mainSwiperRef = useRef<SwiperClass | null>(null)
  const thumbnailContainerRef = useRef<HTMLDivElement>(null)

  // Deduplicate and consolidate all image sources
  const allImages = useMemo(() => {
    const list: string[] = []
    if (image) list.push(image)
    if (Array.isArray(gallery)) list.push(...gallery)
    if (Array.isArray(images)) list.push(...images)

    const cleanList = list
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter((url) => url.length > 0)

    const unique = Array.from(new Set(cleanList))
    return unique.length > 0 ? unique : ["/placeholder.png"]
  }, [image, gallery, images])

  const total = allImages.length
  const hasMultiple = total > 1

  const [prevImage, setPrevImage] = useState<string>(image)
  if (prevImage !== image) {
    setPrevImage(image)
    setActiveIndex(0)
  }

  // Reset swiper position when product or images change
  useEffect(() => {
    if (mainSwiperRef.current) {
      if (hasMultiple) {
        mainSwiperRef.current.slideToLoop(0, 0)
      } else {
        mainSwiperRef.current.slideTo(0, 0)
      }
    }
  }, [image, gallery, hasMultiple])

  // Navigate to slide index helper
  const goToIndex = useCallback((idx: number) => {
    if (!mainSwiperRef.current) return
    if (hasMultiple) {
      mainSwiperRef.current.slideToLoop(idx)
    } else {
      mainSwiperRef.current.slideTo(idx)
    }
  }, [hasMultiple])

  // RTL navigation:
  // Left button is Next in Persian RTL (advances 1 -> 2 -> 3)
  const handleNext = useCallback(() => {
    if (!hasMultiple || !mainSwiperRef.current) return
    mainSwiperRef.current.slideNext()
  }, [hasMultiple])

  // Right button is Prev in Persian RTL (returns 3 -> 2 -> 1)
  const handlePrev = useCallback(() => {
    if (!hasMultiple || !mainSwiperRef.current) return
    mainSwiperRef.current.slidePrev()
  }, [hasMultiple])

  // Auto-scroll thumbnail container to keep active thumbnail visible
  useEffect(() => {
    if (thumbnailContainerRef.current) {
      const activeEl = thumbnailContainerRef.current.children[activeIndex] as HTMLElement
      if (activeEl) {
        activeEl.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        })
      }
    }
  }, [activeIndex])

  // Calculate discount percentage
  const discountPercent =
    oldPrice && price && oldPrice > price
      ? Math.round(((oldPrice - price) / oldPrice) * 100)
      : null

  const formatPersianNumber = (num: number) => {
    return num.toLocaleString("fa-IR")
  }

  return (
    <div className="flex flex-col gap-3.5 w-full select-none" dir="rtl">
      {/* ─── Main Image Stage with Swiper ─── */}
      <div className="relative aspect-square w-full rounded-3xl overflow-hidden border border-border/50 bg-gradient-to-b from-muted/20 to-muted/5 shadow-md group">
        <Swiper
          modules={[Keyboard, A11y]}
          dir="rtl"
          loop={hasMultiple}
          speed={450}
          spaceBetween={0}
          slidesPerView={1}
          onSwiper={(swiper) => {
            mainSwiperRef.current = swiper
          }}
          onSlideChange={(swiper) => {
            setActiveIndex(swiper.realIndex)
          }}
          className="w-full h-full [&_.swiper-wrapper]:h-full [&_.swiper-slide]:h-full"
        >
          {allImages.map((imgSrc, idx) => (
            <SwiperSlide
              key={`${imgSrc}-${idx}`}
              className="w-full h-full flex items-center justify-center p-3 sm:p-4 select-none"
            >
              <div 
                className="relative w-full h-full flex items-center justify-center group/stage cursor-zoom-in"
                onClick={() => setIsLightboxOpen(true)}
              >
                <Image
                  src={imgSrc}
                  alt={`${productName} - تصویر ${idx + 1}`}
                  fill
                  priority={idx === 0}
                  loading={idx === 0 ? "eager" : "lazy"}
                  sizes="(max-width: 768px) 100vw, 600px"
                  quality={85}
                  draggable={false}
                  className="w-full h-full object-contain rounded-2xl transition-transform duration-300 group-hover/stage:scale-[1.02]"
                />

                {/* Subtle Hover Hint to indicate Zoom */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover/stage:opacity-100 transition-all duration-300 pointer-events-none hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/65 backdrop-blur-md border border-white/20 text-white text-xs shadow-xl scale-95 group-hover/stage:scale-100">
                  <ZoomIn className="size-3.5 text-amber-400" />
                  <span>کلیک برای مشاهده بزرگ‌نمایی و جزئیات</span>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* ─── Badges (Top right & left) ─── */}
        <div className="absolute top-3 right-3 z-20 flex flex-col gap-2 pointer-events-none">
          {isSpecial && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white text-[11px] font-black shadow-lg shadow-rose-500/20 backdrop-blur-md">
              <Sparkles className="size-3.5 fill-white animate-pulse" />
              <span>پیشنهاد شگفت‌انگیز</span>
            </div>
          )}

          {discountPercent !== null && (
            <div className="inline-flex items-center justify-center size-8 rounded-full bg-rose-500 text-white text-xs font-black shadow-lg shadow-rose-500/30">
              {formatPersianNumber(discountPercent)}٪-
            </div>
          )}
        </div>

        {/* ─── Top Left: Counter & Zoom Trigger ─── */}
        <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
          {hasMultiple && (
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-background/80 backdrop-blur-md border border-border/50 shadow-sm text-foreground/80 text-xs font-black">
              <Layers className="size-3 text-primary" />
              <span>
                {formatPersianNumber(activeIndex + 1)} / {formatPersianNumber(total)}
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setIsLightboxOpen(true)
            }}
            aria-label="بزرگ‌نمایی تصویر با کیفیت بالا"
            title="بزرگ‌نمایی تصویر"
            className="size-8 rounded-full bg-background/80 hover:bg-background backdrop-blur-md border border-border/50 text-foreground/80 hover:text-primary flex items-center justify-center shadow-sm transition-all hover:scale-105 cursor-pointer"
          >
            <Maximize2 className="size-3.5" />
          </button>
        </div>

        {/* ─── Floating Navigation Arrows (RTL: Left is Next 1->2, Right is Prev 2->1) ─── */}
        {hasMultiple && (
          <>
            {/* Right Button (Previous in Persian RTL) */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handlePrev()
              }}
              aria-label="تصویر قبلی"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 size-10 rounded-full bg-background/80 hover:bg-background backdrop-blur-md border border-border/50 text-foreground/80 hover:text-primary flex items-center justify-center shadow-lg transition-all opacity-80 group-hover:opacity-100 hover:scale-110 active:scale-95 cursor-pointer"
            >
              <ChevronRight className="size-5" />
            </button>

            {/* Left Button (Next in Persian RTL: goes from 1 to 2) */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleNext()
              }}
              aria-label="تصویر بعدی"
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 size-10 rounded-full bg-background/80 hover:bg-background backdrop-blur-md border border-border/50 text-foreground/80 hover:text-primary flex items-center justify-center shadow-lg transition-all opacity-80 group-hover:opacity-100 hover:scale-110 active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="size-5" />
            </button>
          </>
        )}

        {/* ─── Dot Indicators (Bottom center, RTL flow) ─── */}
        {hasMultiple && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/75 backdrop-blur-md border border-border/40 shadow-sm pointer-events-auto">
            {allImages.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  goToIndex(idx)
                }}
                aria-label={`رفتن به تصویر ${idx + 1}`}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  idx === activeIndex
                    ? "w-5 h-2 bg-primary shadow-sm shadow-primary/40"
                    : "size-2 bg-muted-foreground/35 hover:bg-muted-foreground/70"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ─── Thumbnail Gallery Strip (RTL flow) ─── */}
      {hasMultiple && (
        <div
          ref={thumbnailContainerRef}
          className="flex items-center gap-2.5 overflow-x-auto py-1 px-0.5 no-scrollbar scroll-smooth"
        >
          {allImages.map((imgSrc, idx) => {
            const isActive = idx === activeIndex
            return (
              <button
                key={`${imgSrc}-thumb-${idx}`}
                type="button"
                onClick={() => goToIndex(idx)}
                aria-label={`انتخاب تصویر ${idx + 1}`}
                className={`relative size-16 sm:size-20 shrink-0 rounded-2xl overflow-hidden border-2 transition-all duration-200 bg-muted/10 cursor-pointer ${
                  isActive
                    ? "border-primary ring-2 ring-primary/30 shadow-md scale-105 opacity-100"
                    : "border-border/50 hover:border-primary/50 opacity-60 hover:opacity-100 hover:scale-[1.02]"
                }`}
              >
                <Image
                  src={imgSrc}
                  alt={`پیش‌نمایش بندانگشتی تصویر ${idx + 1} از ${productName}`}
                  fill
                  sizes="80px"
                  draggable={false}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </button>
            )
          })}
        </div>
      )}

      {/* ─── Luxury Gallery Lightbox Modal ─── */}
      <ProductLightboxModal
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        images={allImages}
        initialIndex={activeIndex}
        productName={productName}
        category={category}
        onIndexChange={(newIndex) => {
          setActiveIndex(newIndex)
          goToIndex(newIndex)
        }}
      />
    </div>
  )
}
