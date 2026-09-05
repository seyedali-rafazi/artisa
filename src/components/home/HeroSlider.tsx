"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "../LanguageContext";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight, Palette } from "lucide-react";
import { useBanners, BannerItem, BannerTextElement } from "@/hooks/useBanners";

interface SlideItem {
  id?: string;
  title: string;
  subtitle: string;
  image: string;
  buttonText: string;
  badge?: string;
  texts?: BannerTextElement[];
  link?: string;
  linkOpenInNewTab?: boolean;
}

interface HeroSliderProps {
  initialBanners?: BannerItem[];
}

export default function HeroSlider({ initialBanners }: HeroSliderProps = {}) {
  const { t } = useLanguage();
  const { data: banners, isLoading } = useBanners(
    initialBanners ? { initialData: initialBanners } : undefined
  );
  const [currentSlide, setCurrentSlide] = useState(0);

  // Touch gesture coordinates
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  // Mouse drag coordinates
  const [isMouseDown, setIsMouseDown] = useState<boolean>(false);
  const [mouseStartX, setMouseStartX] = useState<number | null>(null);
  const [mouseEndX, setMouseEndX] = useState<number | null>(null);
  const [draggedFar, setDraggedFar] = useState(false);

  const wheelTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fallbackSlides: SlideItem[] = [
    {
      title: t("sliderTitle1"),
      subtitle: t("sliderDesc1"),
      image: "/First_baner.webp",
      buttonText: t("sliderBtn"),
    },
    {
      title: t("sliderTitle2"),
      subtitle: t("sliderDesc2"),
      image: "/Second-baner.webp",
      buttonText: t("sliderBtn"),
    },
  ];

  const slides: SlideItem[] =
    banners && banners.length > 0
      ? banners.map((b) => ({
          id: b.id,
          title: b.title,
          subtitle: b.subtitle || "",
          image: b.image,
          buttonText: b.buttonText || t("sliderBtn"),
          badge: b.badge,
          texts: b.texts || [],
          link: b.link || "",
          linkOpenInNewTab: b.linkOpenInNewTab,
        }))
      : fallbackSlides;

  const handlePrev = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const handleNext = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      handleNext();
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length, handleNext]);

  // ─── Touch gesture handlers ───
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchEndX(null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return;
    const diff = touchStartX - touchEndX;

    // Swipe RIGHT -> LEFT (diff > 40): Next slide in RTL
    // Swipe LEFT -> RIGHT (diff < -40): Prev slide in RTL
    if (diff > 40) {
      handleNext();
    } else if (diff < -40) {
      handlePrev();
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  // ─── Mouse drag handlers ───
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsMouseDown(true);
    setMouseStartX(e.clientX);
    setMouseEndX(null);
    setDraggedFar(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown) return;
    setMouseEndX(e.clientX);
    if (mouseStartX !== null && Math.abs(mouseStartX - e.clientX) > 10) {
      setDraggedFar(true);
    }
  };

  const handleMouseUp = () => {
    if (isMouseDown && mouseStartX !== null && mouseEndX !== null) {
      const diff = mouseStartX - mouseEndX;
      if (diff > 40) {
        handleNext();
      } else if (diff < -40) {
        handlePrev();
      }
    }
    setIsMouseDown(false);
    setMouseStartX(null);
    setMouseEndX(null);
    setTimeout(() => setDraggedFar(false), 50);
  };

  const handleMouseLeave = () => {
    if (isMouseDown && mouseStartX !== null && mouseEndX !== null) {
      const diff = mouseStartX - mouseEndX;
      if (diff > 40) {
        handleNext();
      } else if (diff < -40) {
        handlePrev();
      }
    }
    setIsMouseDown(false);
    setMouseStartX(null);
    setMouseEndX(null);
    setTimeout(() => setDraggedFar(false), 50);
  };

  // ─── Horizontal wheel / trackpad scroll handler ───
  const handleWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaX) > 25 && Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      if (wheelTimeoutRef.current) return;
      if (e.deltaX > 25) {
        handleNext();
      } else if (e.deltaX < -25) {
        handlePrev();
      }
      wheelTimeoutRef.current = setTimeout(() => {
        wheelTimeoutRef.current = null;
      }, 300);
    }
  };

  if (isLoading) {
    return (
      <div className="relative w-full h-[350px] md:h-[500px] rounded-2xl md:rounded-3xl bg-neutral-800 animate-pulse flex items-center justify-center text-white/50">
        <span className="text-sm font-medium">در حال بارگذاری بنرها...</span>
      </div>
    );
  }

  return (
    <div
      className="relative w-full h-[350px] md:h-[500px] overflow-hidden rounded-2xl md:rounded-3xl shadow-xl select-none cursor-grab active:cursor-grabbing"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onWheel={handleWheel}
    >
      {/* Slides wrapper */}
      <div className="w-full h-full relative">
        {slides.map((slide, idx) => {
          const isCurrent = idx === currentSlide;
          const hasCustomTexts = slide.texts && slide.texts.length > 0;

          // Slide click navigation helper
          const handleSlideClick = (e: React.MouseEvent) => {
            if (draggedFar) {
              e.preventDefault();
              return;
            }
            if (slide.link) {
              if (slide.linkOpenInNewTab) {
                window.open(slide.link, '_blank', 'noopener,noreferrer');
              } else {
                window.location.href = slide.link;
              }
            }
          };

          return (
            <div
              key={idx}
              onClick={slide.link ? handleSlideClick : undefined}
              className={`absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out overflow-hidden ${
                isCurrent
                  ? "opacity-100 scale-100 z-10"
                  : "opacity-0 scale-105 z-0 pointer-events-none"
              } ${slide.link ? "cursor-pointer" : ""}`}
            >
              {/* Native Next.js Image for LCP & high-performance edge delivery */}
              <Image
                src={slide.image}
                alt={slide.title || t("brandName")}
                fill
                priority={idx === 0}
                loading={idx === 0 ? "eager" : "lazy"}
                sizes="(max-width: 768px) 100vw, 1280px"
                quality={85}
                className="object-cover"
              />

              {!hasCustomTexts && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(to left, rgba(15, 10, 30, 0.92) 20%, rgba(15, 10, 30, 0.5) 60%, rgba(15, 10, 30, 0.15))",
                  }}
                />
              )}
              {/* If banner has configured text elements, render overlays */}
              {hasCustomTexts ? (
                <>
                  {/* Subtle dark ambient veil for readability */}
                  <div className="absolute inset-0 bg-black/20 pointer-events-none" />

                  {slide.texts!.map((elem) => {
                    const posX = elem.position?.x ?? 50;
                    const posY = elem.position?.y ?? 50;

                    // Responsive clamp: scales nicely from mobile (min) up to desktop (elem.fontSize)
                    const minSize = Math.max(11, Math.round(elem.fontSize * 0.6));
                    const responsiveClamp = `clamp(${minSize}px, calc(${elem.fontSize} * 0.08vw + 10px), ${elem.fontSize}px)`;

                    return (
                      <div
                        key={elem.id}
                        className="absolute pointer-events-none transition-all duration-150"
                        style={{
                          left: `${posX}%`,
                          top: `${posY}%`,
                          transform: `translate(-50%, -50%) scale(${elem.scaleX ?? 1}, ${elem.scaleY ?? 1})`,
                          transformOrigin: "center center",
                          width: "max-content",
                          maxWidth: "none",
                          fontFamily:
                            elem.fontFamily === "inherit"
                              ? "var(--font-vazirmatn), sans-serif"
                              : elem.fontFamily,
                          fontSize: responsiveClamp,
                          fontWeight: elem.fontWeight || "normal",
                          color: elem.color || "#FFFFFF",
                          textAlign: elem.textAlign || "center",
                          lineHeight: elem.lineHeight || 1.3,
                          letterSpacing: elem.letterSpacing
                            ? `${elem.letterSpacing}px`
                            : undefined,
                          textShadow:
                            elem.textShadow || "0 2px 10px rgba(0,0,0,0.7)",
                          whiteSpace: "pre",
                        }}
                      >
                        {elem.text}
                      </div>
                    );
                  })}
                </>
              ) : (
                /* Legacy Layout (badge, title, subtitle, CTA button) */
                <div className="absolute top-1/2 -translate-y-1/2 max-w-xl px-8 md:px-16 text-white flex flex-col gap-4 right-0 text-right">
                  <div className="inline-flex items-center gap-1.5 w-fit rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-xs font-semibold tracking-wide">
                    <Palette className="size-3.5 shrink-0" />
                    <span>{slide.badge || t("brandName")}</span>
                  </div>
                  <h2 className="text-3xl md:text-5xl text-white/80 leading-tight drop-shadow-md">
                    {slide.title}
                  </h2>
                  <p className="text-sm md:text-lg text-white/80 font-medium drop-shadow-sm">
                    {slide.subtitle}
                  </p>
                  <div className="mt-4">
                    <Link
                      href={slide.link || "/products"}
                      target={slide.linkOpenInNewTab ? "_blank" : "_self"}
                      onClick={(e) => {
                        if (draggedFar) {
                          e.preventDefault();
                        }
                      }}
                    >
                      <Button className="rounded-xl px-6 py-3 font-bold hover:scale-105 transition-all text-white bg-primary hover:bg-primary/90 cursor-pointer shadow-lg shadow-primary/25">
                        {slide.buttonText}
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          {/* Right Arrow (Previous in RTL) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex size-10 items-center justify-center rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur-sm transition-all hover:scale-110 active:scale-95 cursor-pointer"
            aria-label="Previous slide"
          >
            <ChevronRight className="size-6" />
          </button>

          {/* Left Arrow (Next in RTL) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex size-10 items-center justify-center rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur-sm transition-all hover:scale-110 active:scale-95 cursor-pointer"
            aria-label="Next slide"
          >
            <ChevronLeft className="size-6" />
          </button>

          {/* Slide Indicators (RTL flow) */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentSlide(idx);
                }}
                className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === currentSlide
                    ? "w-8 bg-primary"
                    : "w-2.5 bg-white/50 hover:bg-white"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
