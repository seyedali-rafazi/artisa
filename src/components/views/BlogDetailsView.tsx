"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "../LanguageContext";
import { useApp } from "../AppContext";
import {
  Calendar,
  User,
  Clock,
  Share2,
  ChevronRight,
  ArrowRight,
  Sparkles,
  BookOpen,
  Check,
  Eye,
  Layers,
} from "lucide-react";
import { ArticleItem, useBlogPosts } from "@/hooks/useBlog";
import { formatShamsiDate } from "@/lib/utils";
import ProductCommentsSection from "@/components/comments/ProductCommentsSection";
import { Button } from "@/components/ui/button";

interface BlogDetailsViewProps {
  article: ArticleItem;
}

export default function BlogDetailsView({ article }: BlogDetailsViewProps) {
  const { t } = useLanguage();
  const { user, setShowLogin, showToast } = useApp();
  const [copied, setCopied] = useState(false);

  // Fetch all articles for recommended reading at bottom
  const { data: allArticles } = useBlogPosts();

  const otherArticles = (allArticles || [])
    .filter((a) => (a.id || a.articleId) !== (article.id || article.articleId))
    .slice(0, 3);

  // Estimate reading time
  const getReadTime = (text?: string) => {
    if (!text) return "۴ دقیقه مطالعه";
    const words = text.replace(/<[^>]+>/g, " ").trim().split(/\s+/).length;
    const minutes = Math.max(1, Math.round(words / 150));
    return `${minutes} دقیقه مطالعه`;
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      showToast("لینک مقاله در حافظه کپی شد.", "success");
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const targetId = article.id || article.articleId || "";

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-10 min-h-screen" dir="rtl">
      {/* ─── 1. Breadcrumbs ─── */}
      <nav className="flex items-center gap-2 text-xs font-bold text-muted-foreground mb-6 overflow-x-auto whitespace-nowrap py-1">
        <Link href="/" className="hover:text-primary transition-colors">
          خانه
        </Link>
        <ChevronRight className="size-3.5 rotate-180 text-muted-foreground/60 shrink-0" />
        <Link href="/blog" className="hover:text-primary transition-colors">
          مجله هنر
        </Link>
        <ChevronRight className="size-3.5 rotate-180 text-muted-foreground/60 shrink-0" />
        <span className="text-foreground truncate max-w-xs sm:max-w-md">
          {article.title}
        </span>
      </nav>

      {/* ─── 2. Article Header ─── */}
      <header className="flex flex-col gap-4 mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-black w-fit">
          <Sparkles className="size-3.5" />
          <span>مجله تخصصی آرتیسا</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-foreground leading-snug tracking-tight">
          {article.title}
        </h1>

        {article.desc && (
          <p className="text-sm sm:text-base text-muted-foreground font-semibold leading-relaxed">
            {article.desc}
          </p>
        )}

        {/* Metadata Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border/40 text-xs text-muted-foreground font-semibold">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <span className="flex items-center gap-2">
              <div className="size-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-xs">
                {article.author ? article.author.charAt(0) : "آ"}
              </div>
              <span className="text-foreground font-bold">
                {article.author || "تیم تحریریه آرتیسا"}
              </span>
            </span>

            <span className="flex items-center gap-1.5">
              <Calendar className="size-4 text-primary" />
              <span>{formatShamsiDate(article.date)}</span>
            </span>

            <span className="flex items-center gap-1.5">
              <Clock className="size-4 text-amber-500" />
              <span>{getReadTime(article.content || article.desc)}</span>
            </span>
          </div>

          {/* Share Button */}
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border/80 bg-background hover:bg-muted text-foreground transition-colors cursor-pointer text-xs font-bold"
          >
            {copied ? (
              <>
                <Check className="size-3.5 text-emerald-500" />
                <span className="text-emerald-500">کپی شد</span>
              </>
            ) : (
              <>
                <Share2 className="size-3.5 text-muted-foreground" />
                <span>اشتراک‌گذاری</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* ─── 3. Cover Banner Image ─── */}
      {article.image && (
        <div className="relative w-full h-72 sm:h-[450px] rounded-3xl overflow-hidden mb-10 shadow-lg border border-border/60 bg-muted/20">
          <Image
            src={article.image}
            alt={article.title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 1200px"
            className="object-cover"
          />
        </div>
      )}

      {/* ─── 4. Article Rich Content ─── */}
      <article className="rounded-3xl border border-border/40 bg-background p-6 sm:p-10 shadow-sm mb-16">
        <div
          dir="rtl"
          className="prose prose-neutral dark:prose-invert max-w-none text-foreground text-sm sm:text-base leading-loose font-medium
            prose-headings:font-black prose-headings:tracking-tight prose-headings:text-foreground
            prose-h1:text-2xl prose-h1:mt-8 prose-h1:mb-4
            prose-h2:text-xl prose-h2:mt-7 prose-h2:mb-3 prose-h2:border-b prose-h2:border-border/40 prose-h2:pb-2
            prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-2
            prose-p:my-4 prose-p:leading-8
            prose-blockquote:border-r-4 prose-blockquote:border-primary prose-blockquote:bg-muted/30 prose-blockquote:p-4 prose-blockquote:rounded-xl prose-blockquote:italic prose-blockquote:my-6
            prose-ul:list-disc prose-ul:pr-6 prose-ul:my-4
            prose-ol:list-decimal prose-ol:pr-6 prose-ol:my-4
            prose-li:my-1
            prose-a:text-primary prose-a:underline hover:prose-a:opacity-80
            prose-hr:border-border/60 prose-hr:my-8"
          dangerouslySetInnerHTML={{
            __html:
              article.content ||
              `<p>${article.desc || "متن این مقاله به زودی تکمیل خواهد شد."}</p>`,
          }}
        />

        {/* Article End Note */}
        <div className="mt-10 pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/blog">
            <Button variant="outline" className="rounded-2xl text-xs font-bold gap-2 cursor-pointer">
              <ArrowRight className="size-4" />
              <span>بازگشت به مقالات مجله</span>
            </Button>
          </Link>

          <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
            <span>منتشر شده در مجله تخصصی آنلاین آرتـیسـا</span>
          </div>
        </div>
      </article>

      {/* ─── 5. Common / Shared Section (ProductCommentsSection) ─── */}
      {/* Reused from /product page for article comments, ratings & reviews */}
      <div className="mb-16 border-t border-border/60 pt-10">
        <ProductCommentsSection
          productId={targetId}
          user={user}
          setShowLogin={setShowLogin}
          showToast={showToast}
          t={t}
          contextType="article"
        />
      </div>

      {/* ─── 6. Recommended Reading (Similar Articles) ─── */}
      {otherArticles.length > 0 && (
        <div className="border-t border-border/60 pt-10">
          <div className="flex flex-col gap-1 mb-6">
            <h3 className="text-lg font-black text-foreground flex items-center gap-2">
              <Layers className="size-4 text-primary" />
              <span>سایر مقالات خواندنی</span>
            </h3>
            <div className="h-1 w-12 bg-primary rounded-full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {otherArticles.map((other) => {
              const otherId = other.id || other.articleId;
              return (
                <Link
                  key={otherId}
                  href={`/blog/${otherId}`}
                  className="group flex flex-col rounded-2xl border border-border/60 bg-background hover:border-primary/40 hover:shadow-md transition-all overflow-hidden cursor-pointer"
                >
                  <div className="relative h-40 w-full bg-muted overflow-hidden">
                    <Image
                      src={other.image}
                      alt={other.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <span className="text-[10px] text-muted-foreground font-semibold mb-1">
                      {formatShamsiDate(other.date)}
                    </span>
                    <h4 className="text-xs font-black text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-5">
                      {other.title}
                    </h4>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
