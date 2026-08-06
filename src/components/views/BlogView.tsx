"use client"

import React from "react"
import { useLanguage } from "../LanguageContext"
import { Calendar, User, ArrowLeft } from "lucide-react"
import { useBlogPosts } from "@/hooks/useBlog"

export default function BlogView() {
  const { t } = useLanguage()
  const { data: apiArticles, isLoading } = useBlogPosts()

  const articles = apiArticles || []

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-xl md:text-2xl font-black text-foreground mb-2">{t("blogTitle")}</h1>
        <p className="text-xs text-muted-foreground">{t("blogSubtitle")}</p>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-3xl bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
          ))}
        </div>
      ) : articles.length > 0 ? (
        <div className="flex flex-col gap-10">
          {articles.map((art) => (
            <div 
              key={art.id}
              className="flex flex-col md:flex-row gap-6 md:gap-8 border border-border/40 bg-background rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all p-5"
            >
              {/* Image */}
              <div className="h-56 md:h-auto w-full md:w-80 rounded-2xl overflow-hidden bg-muted/20 shrink-0">
                <img
                  src={art.image}
                  alt={art.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="flex flex-col flex-1 py-2">
                <div className="flex items-center gap-4 text-[10px] text-muted-foreground mb-3 font-semibold">
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3.5 text-primary" />
                    <span>{art.date}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="size-3.5 text-primary" />
                    <span>{art.author}</span>
                  </span>
                </div>

                <h2 className="text-base md:text-lg font-black text-foreground mb-3 hover:text-primary transition-colors leading-7">
                  {art.title}
                </h2>

                <p className="text-xs sm:text-sm text-muted-foreground leading-6 mb-6">
                  {art.desc}
                </p>

                <div className="mt-auto">
                  <button className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline cursor-pointer">
                    <span>{t("readMore")}</span>
                    <ArrowLeft className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-xs text-muted-foreground font-semibold border border-border/40 rounded-2xl">
          هنوز مقاله‌ای ثبت نشده است.
        </div>
      )}
    </div>
  )
}
