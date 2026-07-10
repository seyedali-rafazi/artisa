"use client"

import React from "react"
import Link from "next/link"
import { useLanguage } from "../LanguageContext"
import { Calendar, User, ArrowLeft } from "lucide-react"

export default function BlogSection() {
  const { t } = useLanguage()

  const articles = [
    {
      id: "a1",
      title: "راهنمای کامل چیدمان گالری‌وال در منزل",
      desc: "گالری‌وال یا دیوار گالری یکی از جذاب‌ترین روش‌های دکوراسیون دیواری است. در این مقاله نحوه انتخاب آثار، ترکیب قاب‌ها و چیدمان ایده‌آل را بررسی می‌کنیم.",
      date: "۱۴۰۵/۰۴/۱۵",
      author: "آرتا نظری",
      image: "https://images.unsplash.com/photo-1513519245088-0e12902e35ca?auto=format&fit=crop&w=400&q=80"
    },
    {
      id: "a2",
      title: "تفاوت تابلو اورجینال و رپرودکشن: کدام برای شما مناسب است؟",
      desc: "خرید تابلو نقاشی اورجینال یا چاپ با کیفیت؟ در این مقاله مزایا، معایب و تفاوت قیمت هر دو گزینه را به‌صورت کامل بررسی می‌کنیم تا بهترین انتخاب را داشته باشید.",
      date: "۱۴۰۵/۰۴/۱۰",
      author: "سارا رحیمی",
      image: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=400&q=80"
    },
    {
      id: "a3",
      title: "هنر دیواری و تأثیر آن بر روان‌شناسی فضا",
      desc: "رنگ‌ها، فرم‌ها و سبک‌های مختلف هنری چگونه حس متفاوتی در ذهن ایجاد می‌کنند؟ نگاهی به ارتباط هنر دیواری با آرامش، خلاقیت و انرژی فضا داریم.",
      date: "۱۴۰۵/۰۴/۰۵",
      author: "مهسا کریمی",
      image: "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?auto=format&fit=crop&w=400&q=80"
    }
  ]

  return (
    <section className="w-full mt-16">
      <div className="flex items-center justify-between mb-8 border-b border-border pb-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl md:text-2xl font-black text-foreground">{t("blogTitle")}</h2>
          <p className="text-xs text-muted-foreground">{t("blogSubtitle")}</p>
        </div>
        <Link 
          href="/blog"
          className="flex items-center gap-1 text-xs font-bold text-primary hover:underline cursor-pointer"
        >
          <span>{t("viewAll")}</span>
          <ArrowLeft className="size-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {articles.map((art) => (
          <Link 
            key={art.id} 
            href="/blog"
            className="flex flex-col overflow-hidden rounded-2xl border border-border/40 bg-background shadow-sm hover:shadow-md hover:border-primary/10 transition-all duration-300 cursor-pointer group"
          >
            {/* Image */}
            <div className="relative h-48 w-full overflow-hidden bg-muted/20">
              <img
                src={art.image}
                alt={art.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            </div>

            {/* Content */}
            <div className="flex flex-col flex-1 p-5">
              {/* Meta */}
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
                <span>{t("readMore")}</span>
                <ArrowLeft className="size-3.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
