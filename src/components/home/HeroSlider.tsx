"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "../LanguageContext";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useBanners } from "@/hooks/useBanners";

interface SlideItem {
  title: string;
  subtitle: string;
  image: string;
  buttonText: string;
  badge?: string;
}

export default function HeroSlider() {
  const { t } = useLanguage();
  const { data: banners, isLoading } = useBanners();
  const [currentSlide, setCurrentSlide] = useState(0);

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

  const slides: SlideItem[] = (banners && banners.length > 0)
    ? banners.map(b => ({
        title: b.title,
        subtitle: b.subtitle || "",
        image: b.image,
        buttonText: b.buttonText || t("sliderBtn"),
        badge: b.badge,
      }))
    : fallbackSlides;

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  if (isLoading) {
    return (
      <div className="relative w-full h-[350px] md:h-[500px] rounded-2xl md:rounded-3xl bg-neutral-800 animate-pulse flex items-center justify-center text-white/50">
        <span className="text-sm font-medium">در حال بارگذاری بنرها...</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[350px] md:h-[500px] overflow-hidden rounded-2xl md:rounded-3xl shadow-xl">
      {/* Slides wrapper */}
      <div className="w-full h-full relative">
        {slides.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out ${
              idx === currentSlide
                ? "opacity-100 scale-100 z-10"
                : "opacity-0 scale-105 z-0"
            }`}
            style={{
              backgroundImage: `linear-gradient(to left, rgba(15, 10, 30, 0.92) 20%, rgba(15, 10, 30, 0.5) 60%, rgba(15, 10, 30, 0.15)), url(${slide.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {/* Slide Content */}
            <div className="absolute top-1/2 -translate-y-1/2 max-w-xl px-8 md:px-16 text-white flex flex-col gap-4 right-0 text-right">
              <div className="inline-flex w-fit rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-xs font-semibold tracking-wide">
                🎨 {slide.badge || t("brandName")}
              </div>
              <h1 className="text-3xl md:text-5xl text-white/80 leading-tight drop-shadow-md">
                {slide.title}
              </h1>
              <p className="text-sm md:text-lg text-white/80 font-medium drop-shadow-sm">
                {slide.subtitle}
              </p>
              <div className="mt-4">
                <Button className="rounded-xl px-6 py-3 font-bold hover:scale-105 transition-all text-white bg-primary hover:bg-primary/90 cursor-pointer">
                  {slide.buttonText}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={handleNext}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex size-10 items-center justify-center rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur-sm transition-all cursor-pointer"
            aria-label="Previous slide"
          >
            <ChevronLeft className="size-6" />
          </button>
          <button
            onClick={handlePrev}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex size-10 items-center justify-center rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur-sm transition-all cursor-pointer"
            aria-label="Next slide"
          >
            <ChevronRight className="size-6" />
          </button>

          {/* Slide Indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
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
