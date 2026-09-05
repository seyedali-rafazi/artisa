import React from "react"
import Link from "next/link"
import Image from "next/image"
import { Calendar, User, ArrowLeft } from "lucide-react"
import type { ArticleItem } from "@/hooks/useBlog"
import { formatShamsiDate } from "@/lib/utils"

interface BlogSectionProps {
  initialArticles?: ArticleItem[];
}

export default function BlogSection({ initialArticles }: BlogSectionProps = {}) {
  const articles = (initialArticles || []).slice(0, 3)

  if (articles.length === 0) {
    return null
  }

  return (
    <section className="w-full mt-16">
      <div className="flex items-center justify-between mb-8 border-b border-border pb-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl md:text-2xl font-black text-foreground">مجله هنر آرتیسا</h2>
          <p className="text-xs text-muted-foreground">مقالات، ایده‌ها و راهنمای چیدمان هنری برای خانه شما</p>
        </div>
        <Link 
          href="/blog"
          className="flex items-center gap-1 text-xs font-bold text-primary hover:underline cursor-pointer"
        >
          <span>مشاهده همه</span>
          <ArrowLeft className="size-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {articles.map((art) => {
          const articleId = art.id || art.articleId;
          return (
            <Link 
              key={articleId} 
              href={`/blog/${articleId}`}
              className="flex flex-col overflow-hidden rounded-2xl border border-border/40 bg-background shadow-sm hover:shadow-md hover:border-primary/10 transition-all duration-300 cursor-pointer group"
            >
              {/* Image */}
              <div className="relative h-48 w-full overflow-hidden bg-muted/20">
                <Image
                  src={art.image}
                  alt={art.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Content */}
              <div className="flex flex-col flex-1 p-5">
                {/* Meta */}
                <div className="flex items-center gap-4 text-[10px] text-muted-foreground mb-3 font-semibold">
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3.5 text-primary" />
                    <span>{formatShamsiDate(art.date)}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="size-3.5 text-primary" />
                    <span>{art.author || "تیم تحریریه آرتیسا"}</span>
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-sm font-black text-foreground leading-6 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  {art.title}
                </h3>

                {/* Desc */}
                <p className="text-xs text-muted-foreground leading-5 line-clamp-3 flex-1 mb-4">
                  {art.desc}
                </p>

                {/* Link button */}
                <span className="inline-flex items-center gap-1 text-xs font-bold text-primary group-hover:underline">
                  <span>ادامه مطلب</span>
                  <ArrowLeft className="size-3.5" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  )
}
