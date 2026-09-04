"use client"

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react"
import { 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  X, 
  ZoomIn, 
  ZoomOut, 
  Sparkles,
  Layers
} from "lucide-react"

interface ProductImageSliderProps {
  productName: string
  image: string
  gallery?: string[]
  images?: string[]
  isSpecial?: boolean
  oldPrice?: number
  price?: number
}

export default function ProductImageSlider({
  productName,
  image,
  gallery = [],
  images = [],
  isSpecial = false,
  oldPrice,
  price,
}: ProductImageSliderProps) {
  const [activeIndex, setActiveIndex] = useState<number>(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false)
  const [isZoomed, setIsZoomed] = useState<boolean>(false)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const [touchEndX, setTouchEndX] = useState<number | null>(null)

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

  // Reset activeIndex if image list changes or selected product changes
  useEffect(() => {
    setActiveIndex(0)
    setIsZoomed(false)
  }, [image, gallery])

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

  const total = allImages.length
  const hasMultiple = total > 1

  const goToNext = useCallback(() => {
    if (!hasMultiple) return
    setActiveIndex((prev) => (prev + 1) % total)
  }, [hasMultiple, total])

  const goToPrev = useCallback(() => {
    if (!hasMultiple) return
    setActiveIndex((prev) => (prev - 1 + total) % total)
  }, [hasMultiple, total])

  // Keyboard navigation when Lightbox is open
  useEffect(() => {
    if (!isLightboxOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsLightboxOpen(false)
        setIsZoomed(false)
      } else if (e.key === "ArrowLeft") {
        goToNext()
      } else if (e.key === "ArrowRight") {
        goToPrev()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isLightboxOpen, goToNext, goToPrev])

  // Touch swipe handling
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX)
    setTouchEndX(null)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return
    const diff = touchStartX - touchEndX
    // Swipe threshold
    if (diff > 45) {
      // Swiped left -> Next
      goToNext()
    } else if (diff < -45) {
      // Swiped right -> Prev
      goToPrev()
    }
    setTouchStartX(null)
    setTouchEndX(null)
  }

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
      {/* ─── Main Image Stage ─── */}
      <div
        className="relative aspect-square w-full rounded-3xl overflow-hidden border border-border/50 bg-gradient-to-b from-muted/20 to-muted/5 shadow-md group"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Slides container */}
        <div className="relative w-full h-full">
          {allImages.map((imgSrc, idx) => (
            <div
              key={`${imgSrc}-${idx}`}
              className={`absolute inset-0 w-full h-full transition-all duration-500 ease-out flex items-center justify-center p-3 sm:p-4 ${
                idx === activeIndex
                  ? "opacity-100 scale-100 z-10 pointer-events-auto"
                  : "opacity-0 scale-95 z-0 pointer-events-none"
              }`}
            >
              <img
                src={imgSrc}
                alt={`${productName} - تصویر ${idx + 1}`}
                onClick={() => setIsLightboxOpen(true)}
                className="w-full h-full object-contain rounded-2xl cursor-zoom-in transition-transform duration-300 hover:scale-[1.02]"
                loading={idx === 0 ? "eager" : "lazy"}
              />
            </div>
          ))}
        </div>

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
            onClick={() => setIsLightboxOpen(true)}
            aria-label="بزرگ‌نمایی تصویر"
            className="size-8 rounded-full bg-background/80 hover:bg-background backdrop-blur-md border border-border/50 text-foreground/80 hover:text-primary flex items-center justify-center shadow-sm transition-all hover:scale-105 cursor-pointer"
          >
            <Maximize2 className="size-3.5" />
          </button>
        </div>

        {/* ─── Floating Navigation Arrows ─── */}
        {hasMultiple && (
          <>
            {/* Right Button (Previous in Persian RTL) */}
            <button
              type="button"
              onClick={goToPrev}
              aria-label="تصویر قبلی"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 size-10 rounded-full bg-background/80 hover:bg-background backdrop-blur-md border border-border/50 text-foreground/80 hover:text-primary flex items-center justify-center shadow-lg transition-all opacity-80 group-hover:opacity-100 hover:scale-110 active:scale-95 cursor-pointer"
            >
              <ChevronRight className="size-5" />
            </button>

            {/* Left Button (Next in Persian RTL) */}
            <button
              type="button"
              onClick={goToNext}
              aria-label="تصویر بعدی"
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 size-10 rounded-full bg-background/80 hover:bg-background backdrop-blur-md border border-border/50 text-foreground/80 hover:text-primary flex items-center justify-center shadow-lg transition-all opacity-80 group-hover:opacity-100 hover:scale-110 active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="size-5" />
            </button>
          </>
        )}

        {/* ─── Dot Indicators (Bottom center) ─── */}
        {hasMultiple && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/75 backdrop-blur-md border border-border/40 shadow-sm">
            {allImages.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveIndex(idx)}
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

      {/* ─── Thumbnail Gallery Strip ─── */}
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
                onClick={() => setActiveIndex(idx)}
                aria-label={`انتخاب تصویر ${idx + 1}`}
                className={`relative size-16 sm:size-20 shrink-0 rounded-2xl overflow-hidden border-2 transition-all duration-200 bg-muted/10 cursor-pointer ${
                  isActive
                    ? "border-primary ring-2 ring-primary/30 shadow-md scale-105 opacity-100"
                    : "border-border/50 hover:border-primary/50 opacity-60 hover:opacity-100 hover:scale-[1.02]"
                }`}
              >
                <img
                  src={imgSrc}
                  alt={`پیش‌نمایش ${idx + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </button>
            )
          })}
        </div>
      )}

      {/* ─── Fullscreen Lightbox Modal ─── */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200"
          dir="rtl"
          onClick={() => {
            setIsLightboxOpen(false)
            setIsZoomed(false)
          }}
        >
          {/* Modal Top Bar */}
          <div
            className="flex items-center justify-between text-white/90 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="text-sm font-black truncate max-w-[200px] sm:max-w-md">
                {productName}
              </span>
              {hasMultiple && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-white/80 font-bold">
                  {formatPersianNumber(activeIndex + 1)} از {formatPersianNumber(total)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsZoomed((prev) => !prev)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white cursor-pointer"
                aria-label={isZoomed ? "کوچک‌نمایی" : "بزرگ‌نمایی"}
              >
                {isZoomed ? <ZoomOut className="size-5" /> : <ZoomIn className="size-5" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsLightboxOpen(false)
                  setIsZoomed(false)
                }}
                className="p-2 rounded-xl bg-white/10 hover:bg-rose-500/30 hover:text-rose-400 transition-colors text-white cursor-pointer"
                aria-label="بستن گالری"
              >
                <X className="size-5" />
              </button>
            </div>
          </div>

          {/* Modal Main Image Stage */}
          <div
            className="relative flex-1 flex items-center justify-center overflow-hidden my-4"
            onClick={(e) => e.stopPropagation()}
          >
            {hasMultiple && (
              <button
                type="button"
                onClick={goToPrev}
                aria-label="تصویر قبلی"
                className="absolute right-2 sm:right-6 z-20 size-12 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center backdrop-blur-md transition-all hover:scale-110 active:scale-95 cursor-pointer"
              >
                <ChevronRight className="size-7" />
              </button>
            )}

            <div
              className={`transition-all duration-300 max-w-full max-h-full flex items-center justify-center ${
                isZoomed ? "scale-150 cursor-zoom-out" : "scale-100 cursor-zoom-in"
              }`}
              onClick={() => setIsZoomed((prev) => !prev)}
            >
              <img
                src={allImages[activeIndex]}
                alt={productName}
                className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl select-none"
              />
            </div>

            {hasMultiple && (
              <button
                type="button"
                onClick={goToNext}
                aria-label="تصویر بعدی"
                className="absolute left-2 sm:left-6 z-20 size-12 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center backdrop-blur-md transition-all hover:scale-110 active:scale-95 cursor-pointer"
              >
                <ChevronLeft className="size-7" />
              </button>
            )}
          </div>

          {/* Modal Bottom Thumbnail Strip */}
          {hasMultiple && (
            <div
              className="flex items-center justify-center gap-2 overflow-x-auto py-2 px-4 z-10 max-w-2xl mx-auto no-scrollbar"
              onClick={(e) => e.stopPropagation()}
            >
              {allImages.map((imgSrc, idx) => {
                const isActive = idx === activeIndex
                return (
                  <button
                    key={`modal-thumb-${idx}`}
                    type="button"
                    onClick={() => {
                      setActiveIndex(idx)
                      setIsZoomed(false)
                    }}
                    className={`size-14 sm:size-16 rounded-xl overflow-hidden border-2 transition-all duration-200 shrink-0 cursor-pointer ${
                      isActive
                        ? "border-primary scale-110 shadow-lg ring-2 ring-primary/40 opacity-100"
                        : "border-white/20 opacity-50 hover:opacity-100 hover:border-white/60"
                    }`}
                  >
                    <img
                      src={imgSrc}
                      alt={`تصویر ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
