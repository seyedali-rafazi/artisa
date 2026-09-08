"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import Image from "next/image"
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  RefreshCw,
  Layers,
  Eye,
  EyeOff,
  Move
} from "lucide-react"

interface ProductLightboxModalProps {
  isOpen: boolean
  onClose: () => void
  images: string[]
  initialIndex?: number
  productName: string
  category?: string
  onIndexChange?: (index: number) => void
}

export default function ProductLightboxModal({
  isOpen,
  onClose,
  images,
  initialIndex = 0,
  productName,
  category,
  onIndexChange,
}: ProductLightboxModalProps) {
  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex)
  const [prevInitialIndex, setPrevInitialIndex] = useState<number>(initialIndex)
  const [scale, setScale] = useState<number>(1)
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [rotation, setRotation] = useState<number>(0)
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [showThumbnails, setShowThumbnails] = useState<boolean>(true)
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)

  // React-recommended pattern for synchronizing state when prop changes without cascading useEffect render
  if (prevInitialIndex !== initialIndex) {
    setPrevInitialIndex(initialIndex)
    setCurrentIndex(initialIndex)
    setScale(1)
    setPosition({ x: 0, y: 0 })
    setRotation(0)
  }

  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const thumbnailStripRef = useRef<HTMLDivElement>(null)

  const total = images.length
  const hasMultiple = total > 1
  const currentImage = images[currentIndex] || "/placeholder.png"

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (!isOpen) return
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [isOpen])

  // Listen to fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  // Auto-scroll active thumbnail into view
  useEffect(() => {
    if (thumbnailStripRef.current && showThumbnails) {
      const activeEl = thumbnailStripRef.current.children[currentIndex] as HTMLElement
      if (activeEl) {
        activeEl.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        })
      }
    }
  }, [currentIndex, showThumbnails])

  // Reset transform state
  const resetTransform = useCallback(() => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
    setRotation(0)
  }, [])

  // Switch image index
  const goToImage = useCallback(
    (index: number) => {
      if (index === currentIndex) return
      resetTransform()
      setCurrentIndex(index)
      onIndexChange?.(index)
    },
    [currentIndex, onIndexChange, resetTransform]
  )

  // RTL Navigation:
  // Next in Persian RTL is left button / Left arrow
  const handleNext = useCallback(() => {
    if (!hasMultiple) return
    const nextIdx = (currentIndex + 1) % total
    goToImage(nextIdx)
  }, [currentIndex, hasMultiple, total, goToImage])

  // Prev in Persian RTL is right button / Right arrow
  const handlePrev = useCallback(() => {
    if (!hasMultiple) return
    const prevIdx = (currentIndex - 1 + total) % total
    goToImage(prevIdx)
  }, [currentIndex, hasMultiple, total, goToImage])

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    setScale((prev) => {
      const next = Math.min(4, Number((prev + 0.5).toFixed(2)))
      return next
    })
  }, [])

  const handleZoomOut = useCallback(() => {
    setScale((prev) => {
      const next = Math.max(1, Number((prev - 0.5).toFixed(2)))
      if (next === 1) {
        setPosition({ x: 0, y: 0 })
      }
      return next
    })
  }, [])

  const handleRotate = useCallback(() => {
    setRotation((prev) => (prev + 90) % 360)
  }, [])

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        if (containerRef.current?.requestFullscreen) {
          await containerRef.current.requestFullscreen()
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen()
        }
      }
    } catch {
      // Fullscreen not supported or permitted
    }
  }, [])

  // Double click to zoom in to 2x or reset
  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (scale > 1) {
        resetTransform()
      } else {
        setScale(2)
      }
    },
    [scale, resetTransform]
  )

  // Mouse wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const delta = e.deltaY < 0 ? 0.35 : -0.35
    setScale((prev) => {
      const next = Math.max(1, Math.min(4, Number((prev + delta).toFixed(2))))
      if (next === 1) {
        setPosition({ x: 0, y: 0 })
      }
      return next
    })
  }, [])

  // Pointer drag panning
  const handlePointerDown = (e: React.PointerEvent) => {
    if (scale <= 1) return
    e.preventDefault()
    e.stopPropagation()
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    setIsDragging(true)
    dragStartRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    }
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || scale <= 1) return
    e.preventDefault()

    const stage = stageRef.current
    const stageWidth = stage?.clientWidth || 800
    const stageHeight = stage?.clientHeight || 600

    // Boundaries to prevent panning too far off screen
    const maxBoundX = ((scale - 1) * stageWidth) / 2 + 80
    const maxBoundY = ((scale - 1) * stageHeight) / 2 + 80

    const nextX = e.clientX - dragStartRef.current.x
    const nextY = e.clientY - dragStartRef.current.y

    setPosition({
      x: Math.max(-maxBoundX, Math.min(maxBoundX, nextX)),
      y: Math.max(-maxBoundY, Math.min(maxBoundY, nextY)),
    })
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return
    try {
      ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
    } catch {
      // Pointer capture might already be released
    }
    setIsDragging(false)
  }

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid interrupting if user is typing in an input
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) {
        return
      }

      switch (e.key) {
        case "Escape":
          onClose()
          break
        case "ArrowLeft":
          handleNext()
          break
        case "ArrowRight":
          handlePrev()
          break
        case "+":
        case "=":
          handleZoomIn()
          break
        case "-":
        case "_":
          handleZoomOut()
          break
        case "0":
          resetTransform()
          break
        case "r":
        case "R":
          handleRotate()
          break
        case "f":
        case "F":
          toggleFullscreen()
          break
        default:
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [
    isOpen,
    onClose,
    handleNext,
    handlePrev,
    handleZoomIn,
    handleZoomOut,
    resetTransform,
    handleRotate,
    toggleFullscreen,
  ])

  if (!isOpen) return null

  const formatPersianNumber = (num: number) => num.toLocaleString("fa-IR")
  const zoomPercent = Math.round(scale * 100)

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] flex flex-col justify-between overflow-hidden select-none bg-[#0a0a0c]/95 backdrop-blur-2xl text-foreground font-sans transition-opacity duration-300 animate-in fade-in"
      dir="rtl"
      onClick={onClose}
    >
      {/* ─── Ambient Artistic Glow Background ─── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[65vw] h-[65vh] rounded-full bg-gradient-to-tr from-amber-600/10 via-amber-500/5 to-rose-600/10 blur-[130px] opacity-70" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(10,10,12,0.8)_80%)]" />
      </div>

      {/* ─── Header Top Bar ─── */}
      <header
        className="relative z-30 flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 bg-gradient-to-b from-black/70 via-black/40 to-transparent backdrop-blur-sm border-b border-white/5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Right Info: Product Name & Category */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="size-9 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 shadow-inner">
            <Sparkles className="size-4 text-amber-400" />
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-white/95 truncate max-w-[200px] sm:max-w-md lg:max-w-lg">
                {productName}
              </h2>
              {category && (
                <span className="hidden sm:inline-block text-[11px] font-medium px-2 py-0.5 rounded-full bg-white/10 text-amber-300/90 border border-amber-400/20">
                  {category}
                </span>
              )}
            </div>
            <span className="text-[11px] text-white/50 hidden sm:inline-block">
              گالری تخصصی آثار هنری و دست‌ساز آرتیسا
            </span>
          </div>
        </div>

        {/* Center: Image Counter Badge */}
        {hasMultiple && (
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/10 backdrop-blur-md shadow-lg text-white/90 text-xs font-bold">
            <Layers className="size-3.5 text-amber-400" />
            <span>
              تصویر {formatPersianNumber(currentIndex + 1)} از {formatPersianNumber(total)}
            </span>
          </div>
        )}

        {/* Left Actions: Fullscreen & Close */}
        <div className="flex items-center gap-2">
          {hasMultiple && (
            <div className="md:hidden flex items-center px-2.5 py-1 rounded-full bg-white/10 border border-white/10 text-white/90 text-xs font-bold">
              <span>
                {formatPersianNumber(currentIndex + 1)}/{formatPersianNumber(total)}
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? "خروج از تمام‌صفحه" : "حالت تمام‌صفحه"}
            title="تمام‌صفحه (کلید F)"
            className="hidden sm:flex size-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white/80 hover:text-white items-center justify-center backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-lg"
          >
            {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
          </button>

          <button
            type="button"
            onClick={onClose}
            aria-label="بستن پنجره بزرگ‌نمایی"
            title="بستن (کلید Escape)"
            className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full bg-white/10 hover:bg-rose-500/25 border border-white/15 hover:border-rose-500/40 text-white/90 hover:text-rose-200 backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-lg group"
          >
            <span className="text-xs font-semibold hidden sm:inline-block">بستن</span>
            <X className="size-4 transition-transform group-hover:rotate-90 duration-200" />
            <span className="hidden sm:inline-block text-[10px] bg-white/15 px-1.5 py-0.5 rounded text-white/70 font-mono">
              ESC
            </span>
          </button>
        </div>
      </header>

      {/* ─── Main Interactive Stage ─── */}
      <main
        ref={stageRef}
        className="relative flex-1 w-full h-full flex items-center justify-center overflow-hidden touch-none my-1"
        onClick={(e) => e.stopPropagation()}
        onWheel={handleWheel}
      >
        {/* Floating Side Navigation: Prev / Next */}
        {hasMultiple && (
          <>
            {/* Right Arrow (Prev in Persian RTL) */}
            <button
              type="button"
              onClick={handlePrev}
              aria-label="تصویر قبلی"
              title="تصویر قبلی (کلید راست)"
              className="absolute right-3 sm:right-6 md:right-8 z-30 size-11 sm:size-14 rounded-full bg-white/10 hover:bg-amber-500/20 text-white/90 hover:text-amber-200 border border-white/15 hover:border-amber-400/30 flex items-center justify-center backdrop-blur-xl transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer shadow-2xl group"
            >
              <ChevronRight className="size-6 sm:size-7 transition-transform group-hover:translate-x-0.5" />
            </button>

            {/* Left Arrow (Next in Persian RTL) */}
            <button
              type="button"
              onClick={handleNext}
              aria-label="تصویر بعدی"
              title="تصویر بعدی (کلید چپ)"
              className="absolute left-3 sm:left-6 md:left-8 z-30 size-11 sm:size-14 rounded-full bg-white/10 hover:bg-amber-500/20 text-white/90 hover:text-amber-200 border border-white/15 hover:border-amber-400/30 flex items-center justify-center backdrop-blur-xl transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer shadow-2xl group"
            >
              <ChevronLeft className="size-6 sm:size-7 transition-transform group-hover:-translate-x-0.5" />
            </button>
          </>
        )}

        {/* The Zoomable & Draggable Artwork Stage */}
        <div
          className={`relative max-w-[92vw] max-h-[76vh] flex items-center justify-center transition-transform ${
            isDragging ? "duration-0" : "duration-250 ease-out"
          } ${
            scale > 1
              ? isDragging
                ? "cursor-grabbing"
                : "cursor-grab"
              : "cursor-zoom-in"
          }`}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
            transformOrigin: "center center",
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onDoubleClick={handleDoubleClick}
        >
          {/* Subtle frame glow behind the artwork */}
          <div className="absolute inset-0 rounded-2xl bg-amber-400/5 blur-xl pointer-events-none" />

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentImage}
            alt={`${productName} - تصویر بزرگ‌نمایی شده`}
            draggable={false}
            className="max-w-[90vw] max-h-[72vh] object-contain rounded-2xl shadow-2xl drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)] select-none pointer-events-none border border-white/10"
          />
        </div>

        {/* Helpful Desktop Hint Pill (Fades after interaction or displays subtley) */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white/60 text-[11px]">
          <Move className="size-3 text-amber-400" />
          <span>اسکرول برای زوم • درگ برای جابجایی • دوبار کلیک برای بزرگ‌نمایی</span>
        </div>
      </main>

      {/* ─── Bottom Section: Floating Control Dock & Filmstrip ─── */}
      <footer
        className="relative z-30 flex flex-col items-center gap-3 px-4 pb-4 sm:pb-6 pt-2 bg-gradient-to-t from-black/90 via-black/50 to-transparent"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Glassmorphic Control Dock */}
        <div className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:py-2 rounded-2xl bg-[#141418]/90 backdrop-blur-2xl border border-white/15 shadow-2xl">
          {/* Zoom Out Button */}
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={scale <= 1}
            aria-label="کوچک‌نمایی"
            title="کوچک‌نمایی (کلید -)"
            className="size-9 rounded-xl flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 active:scale-90 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          >
            <ZoomOut className="size-4" />
          </button>

          {/* Zoom Percentage Badge / Reset Zoom */}
          <button
            type="button"
            onClick={resetTransform}
            aria-label="بازنشانی زوم"
            title="بازنشانی زوم و موقعیت (کلید 0)"
            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-amber-500/20 text-white hover:text-amber-200 text-xs font-bold border border-white/10 transition-all cursor-pointer flex items-center gap-1"
          >
            <span>{formatPersianNumber(zoomPercent)}٪</span>
          </button>

          {/* Zoom In Button */}
          <button
            type="button"
            onClick={handleZoomIn}
            disabled={scale >= 4}
            aria-label="بزرگ‌نمایی"
            title="بزرگ‌نمایی (کلید +)"
            className="size-9 rounded-xl flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 active:scale-90 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          >
            <ZoomIn className="size-4" />
          </button>

          <div className="w-px h-5 bg-white/15 mx-0.5" />

          {/* Rotate Button */}
          <button
            type="button"
            onClick={handleRotate}
            aria-label="چرخش ۹۰ درجه تصویر"
            title="چرخش تصویر (کلید R)"
            className="size-9 rounded-xl flex items-center justify-center text-white/80 hover:text-amber-300 hover:bg-white/10 active:scale-90 transition-all cursor-pointer"
          >
            <RotateCw className="size-4" />
          </button>

          {/* Reset / Fit to Screen Button */}
          <button
            type="button"
            onClick={resetTransform}
            aria-label="تنظیم اندازه و بازنشانی"
            title="تنظیم اندازه به حالت اولیه (کلید 0)"
            className={`size-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              scale !== 1 || position.x !== 0 || position.y !== 0 || rotation !== 0
                ? "text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30"
                : "text-white/80 hover:text-white hover:bg-white/10"
            }`}
          >
            <RefreshCw className="size-4" />
          </button>

          {/* Toggle Filmstrip Button */}
          {hasMultiple && (
            <>
              <div className="w-px h-5 bg-white/15 mx-0.5" />
              <button
                type="button"
                onClick={() => setShowThumbnails((prev) => !prev)}
                aria-label={showThumbnails ? "مخفی‌کردن تصاویر بندانگشتی" : "نمایش تصاویر بندانگشتی"}
                title={showThumbnails ? "حالت سینمایی (مخفی‌سازی نوار پایین)" : "نمایش نوار تصاویر"}
                className={`size-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                  showThumbnails
                    ? "text-white/80 hover:text-white hover:bg-white/10"
                    : "text-amber-400 bg-amber-500/10 border border-amber-500/30"
                }`}
              >
                {showThumbnails ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </>
          )}
        </div>

        {/* Filmstrip Thumbnails Strip */}
        {hasMultiple && showThumbnails && (
          <div
            ref={thumbnailStripRef}
            className="flex items-center gap-2.5 overflow-x-auto max-w-[94vw] sm:max-w-2xl px-3 py-1.5 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 no-scrollbar scroll-smooth animate-in slide-in-from-bottom-2 duration-200"
          >
            {images.map((imgSrc, idx) => {
              const isActive = idx === currentIndex
              return (
                <button
                  key={`lightbox-thumb-${idx}`}
                  type="button"
                  onClick={() => goToImage(idx)}
                  aria-label={`انتخاب تصویر ${idx + 1}`}
                  className={`relative size-14 sm:size-16 rounded-xl overflow-hidden shrink-0 transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "border-2 border-primary ring-2 ring-primary/40 shadow-lg shadow-primary/20 scale-105 opacity-100"
                      : "border border-white/20 opacity-50 hover:opacity-100 hover:border-white/50 hover:scale-102"
                  }`}
                >
                  <Image
                    src={imgSrc}
                    alt={`تصویر ${idx + 1} از ${productName}`}
                    fill
                    sizes="64px"
                    draggable={false}
                    className="w-full h-full object-cover"
                  />
                  {isActive && (
                    <div className="absolute inset-0 bg-primary/10 pointer-events-none" />
                  )}
                </button>
              )
            })}
          </div>
        )}
      </footer>
    </div>
  )
}
