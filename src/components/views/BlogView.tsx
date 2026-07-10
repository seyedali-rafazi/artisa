"use client"

import React from "react"
import { useLanguage } from "../LanguageContext"
import { Calendar, User, ArrowLeft } from "lucide-react"

export default function BlogView() {
  const { t } = useLanguage()

  const articles = [
    {
      id: "a1",
      title: "راهنمای کامل چیدمان گالری‌وال در منزل",
      desc: "گالری‌وال یا دیوار گالری یکی از جذاب‌ترین روش‌های دکوراسیون دیواری است. در این مقاله نحوه انتخاب آثار، ترکیب قاب‌ها، فاصله‌گذاری مناسب و چیدمان ایده‌آل برای انواع دیوارها را بررسی می‌کنیم. از دیوارهای کوچک تا دیوارهای بزرگ، برای همه راه‌حل داریم.",
      date: "۱۴۰۵/۰۴/۱۵",
      author: "آرتا نظری",
      image: "https://images.unsplash.com/photo-1513519245088-0e12902e35ca?auto=format&fit=crop&w=400&q=80"
    },
    {
      id: "a2",
      title: "تفاوت تابلو اورجینال و رپرودکشن: کدام برای شما مناسب است؟",
      desc: "خرید تابلو نقاشی اورجینال یا چاپ با کیفیت؟ در این مقاله مزایا، معایب، تفاوت قیمت و نحوه تشخیص هر دو گزینه را به‌صورت کامل بررسی می‌کنیم. همچنین روش‌های نگهداری و مراقبت از هر نوع اثر هنری را توضیح می‌دهیم.",
      date: "۱۴۰۵/۰۴/۱۰",
      author: "سارا رحیمی",
      image: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=400&q=80"
    },
    {
      id: "a3",
      title: "هنر دیواری و تأثیر آن بر روان‌شناسی فضا",
      desc: "رنگ‌ها، فرم‌ها و سبک‌های مختلف هنری چگونه حس متفاوتی در ذهن ایجاد می‌کنند؟ نگاهی علمی به ارتباط هنر دیواری با آرامش روحی، تقویت خلاقیت و انرژی مثبت در محیط‌های زندگی و کار داریم.",
      date: "۱۴۰۵/۰۴/۰۵",
      author: "مهسا کریمی",
      image: "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?auto=format&fit=crop&w=400&q=80"
    }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-xl md:text-2xl font-black text-foreground mb-2">{t("blogTitle")}</h1>
        <p className="text-xs text-muted-foreground">{t("blogSubtitle")}</p>
      </div>

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
    </div>
  )
}
