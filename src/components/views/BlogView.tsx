"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "../LanguageContext";
import {
  Calendar,
  User,
  ArrowLeft,
  Search,
  Sparkles,
  BookOpen,
  Clock,
  ChevronLeft,
  Layers,
} from "lucide-react";
import { useBlogPosts, ArticleItem } from "@/hooks/useBlog";
import { formatShamsiDate } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function BlogView() {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const { data: apiArticles, isLoading, isError, refetch } = useBlogPosts();

  const allArticles = useMemo(() => apiArticles || [], [apiArticles]);

  const filteredArticles = useMemo(() => {
    if (!searchTerm.trim()) return allArticles;
    const term = searchTerm.toLowerCase();
    return allArticles.filter(
      (art) =>
        art.title?.toLowerCase().includes(term) ||
        art.desc?.toLowerCase().includes(term) ||
        art.author?.toLowerCase().includes(term)
    );
  }, [allArticles, searchTerm]);

  // Estimate reading time based on word count
  const getReadTime = (text?: string) => {
    if (!text) return "۳ دقیقه مطالعه";
    const words = text.replace(/<[^>]+>/g, " ").trim().split(/\s+/).length;
    const minutes = Math.max(1, Math.round(words / 150));
    return `${minutes} دقیقه مطالعه`;
  };

  const featuredArticle = filteredArticles.length > 0 ? filteredArticles[0] : null;
  const standardArticles = filteredArticles.length > 1 ? filteredArticles.slice(1) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12 min-h-screen" dir="rtl">
      {/* ─── Hero Header & Editorial Banner ─── */}
      <div className="relative rounded-3xl bg-gradient-to-b from-primary/10 via-background to-background border border-border/60 p-8 sm:p-12 mb-12 text-center overflow-hidden">
        <div className="absolute -top-24 -right-24 size-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 size-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-black mb-4">
            <Sparkles className="size-3.5" />
            <span>مجله تخصصی هنر، دکوراسیون و گالری</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-foreground mb-3 tracking-tight">
            {t("blogTitle") || "مجله هنر آرتیسا"}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground font-semibold leading-relaxed max-w-lg mb-8">
            {t("blogSubtitle") ||
              "جدیدترین مقالات، راهنماهای چیدمان دیوار، معرفی سبک‌های نقاشی و دانستنی‌های گالری‌داری"}
          </p>

          {/* Search Box */}
          <div className="relative w-full max-w-md">
            <Input
              type="text"
              placeholder="جستجو در مقالات، سبک‌های هنری و راهنماها..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-11 pr-10 rounded-2xl bg-background/95 border-border/80 text-xs shadow-sm focus:ring-2 focus:ring-primary/20"
            />
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground cursor-pointer font-bold"
              >
                پاک کردن
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ─── Content Area ─── */}
      {isLoading ? (
        <div className="flex flex-col gap-8">
          {/* Hero Skeleton */}
          <div className="h-96 rounded-3xl bg-neutral-200 dark:bg-neutral-800/60 animate-pulse" />
          {/* Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-80 rounded-3xl bg-neutral-200 dark:bg-neutral-800/60 animate-pulse"
              />
            ))}
          </div>
        </div>
      ) : isError ? (
        <div className="text-center py-20 border border-border/60 rounded-3xl bg-background p-8">
          <BookOpen className="size-12 text-destructive mx-auto mb-3" />
          <h3 className="text-sm font-black text-foreground mb-2">خطا در بارگذاری مقالات</h3>
          <p className="text-xs text-muted-foreground mb-4">
            ارتباط با سرور برقرار نشد. لطفاً اتصال اینترنت خود را بررسی کرده و مجدداً امتحان نمایید.
          </p>
          <Button onClick={() => refetch()} variant="outline" className="rounded-xl text-xs">
            تلاش مجدد
          </Button>
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border/60 rounded-3xl bg-background p-8 flex flex-col items-center">
          <BookOpen className="size-12 text-muted-foreground/60 mb-3" />
          <h3 className="text-sm font-black text-foreground mb-1">مقاله‌ای یافت نشد</h3>
          <p className="text-xs text-muted-foreground mb-4">
            {searchTerm
              ? `هیچ مقاله‌ای با عبارت «${searchTerm}» مطابقت نداشت.`
              : "هنوز مقاله‌ای در این بخش منتشر نشده است."}
          </p>
          {searchTerm && (
            <Button
              onClick={() => setSearchTerm("")}
              variant="outline"
              className="rounded-xl text-xs font-bold"
            >
              نمایش همه مقالات
            </Button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-12">
          {/* ─── Featured Article (Latest) ─── */}
          {featuredArticle && !searchTerm && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs font-black text-foreground">
                <span className="size-2 rounded-full bg-primary" />
                <span>مقاله برگزیده هفته</span>
              </div>

              <Link
                href={`/blog/${featuredArticle.id || featuredArticle.articleId}`}
                className="group flex flex-col lg:flex-row gap-6 lg:gap-8 rounded-3xl border border-border/60 bg-background hover:border-primary/40 hover:shadow-xl transition-all duration-300 p-5 sm:p-7 overflow-hidden cursor-pointer"
              >
                {/* Banner Image */}
                <div className="relative h-64 sm:h-80 lg:h-auto lg:w-1/2 rounded-2xl overflow-hidden bg-muted/20 shrink-0">
                  <Image
                    src={featuredArticle.image}
                    alt={featuredArticle.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-black flex items-center gap-1.5">
                    <Clock className="size-3 text-amber-400" />
                    <span>{getReadTime(featuredArticle.content || featuredArticle.desc)}</span>
                  </div>
                </div>

                {/* Article Info */}
                <div className="flex flex-col justify-center flex-1 py-2">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3 font-semibold">
                    <span className="flex items-center gap-1.5 bg-muted/40 px-2.5 py-1 rounded-lg">
                      <Calendar className="size-3.5 text-primary" />
                      <span>{formatShamsiDate(featuredArticle.date)}</span>
                    </span>
                    <span className="flex items-center gap-1.5 bg-muted/40 px-2.5 py-1 rounded-lg">
                      <User className="size-3.5 text-primary" />
                      <span>{featuredArticle.author || "تیم تحریریه آرتیسا"}</span>
                    </span>
                  </div>

                  <h2 className="text-lg sm:text-2xl font-black text-foreground mb-4 group-hover:text-primary transition-colors leading-relaxed">
                    {featuredArticle.title}
                  </h2>

                  <p className="text-xs sm:text-sm text-muted-foreground leading-7 mb-6 line-clamp-3 font-medium">
                    {featuredArticle.desc}
                  </p>

                  <div className="mt-auto pt-4 flex items-center justify-between border-t border-border/40">
                    <span className="inline-flex items-center gap-2 text-xs font-black text-primary group-hover:gap-3 transition-all">
                      <span>مطالعه کامل مقاله</span>
                      <ArrowLeft className="size-4" />
                    </span>
                    <span className="text-[11px] text-muted-foreground font-bold">
                      مجله هنر آرتیسا
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          )}

          {/* ─── Articles Grid ─── */}
          <div>
            {!searchTerm && standardArticles.length > 0 && (
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-black text-foreground flex items-center gap-2">
                  <Layers className="size-4 text-primary" />
                  <span>سایر مقالات و آموزش‌ها</span>
                </h3>
                <span className="text-xs text-muted-foreground font-semibold">
                  {standardArticles.length} مقاله
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(searchTerm ? filteredArticles : standardArticles).map((art) => {
                const targetId = art.id || art.articleId;
                return (
                  <Link
                    key={targetId}
                    href={`/blog/${targetId}`}
                    className="group flex flex-col rounded-3xl border border-border/60 bg-background hover:border-primary/40 hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer"
                  >
                    {/* Card Cover Image */}
                    <div className="relative h-52 w-full bg-muted/20 overflow-hidden">
                      <Image
                        src={art.image}
                        alt={art.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                      <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1">
                        <Clock className="size-3 text-amber-400" />
                        <span>{getReadTime(art.content || art.desc)}</span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground mb-2.5 font-semibold">
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3 text-primary" />
                          <span>{formatShamsiDate(art.date)}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <User className="size-3 text-primary" />
                          <span>{art.author || "آرتیسا"}</span>
                        </span>
                      </div>

                      <h3 className="text-sm font-black text-foreground mb-2 group-hover:text-primary transition-colors leading-6 line-clamp-2">
                        {art.title}
                      </h3>

                      <p className="text-xs text-muted-foreground leading-6 mb-6 line-clamp-2 font-medium">
                        {art.desc}
                      </p>

                      <div className="mt-auto pt-3 border-t border-border/40 flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 text-xs font-black text-primary group-hover:gap-2.5 transition-all">
                          <span>{t("readMore") || "مطالعه مقاله"}</span>
                          <ChevronLeft className="size-4" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
