"use client"

import React from "react"
import Link from "next/link"
import { useLanguage } from "../LanguageContext"
import { useApp } from "../AppContext"
import { 
  Palette,
  Frame,
  Gem,
  Gift,
  Sparkles,
  Layers
} from "lucide-react"

export default function CategoriesGrid() {
  const { t } = useLanguage()
  const { setSearchQuery } = useApp()

  const categories = [
    {
      key: "categoryPainting",
      filter: "تابلو نقاشی",
      icon: Palette,
      bg: "bg-rose-50 dark:bg-rose-950/20",
      text: "text-rose-600 dark:text-rose-400"
    },
    {
      key: "categoryWallArt",
      filter: "هنر دیواری",
      icon: Layers,
      bg: "bg-violet-50 dark:bg-violet-950/20",
      text: "text-violet-600 dark:text-violet-400"
    },
    {
      key: "categorySculpture",
      filter: "مجسمه و دکوری",
      icon: Gem,
      bg: "bg-amber-50 dark:bg-amber-950/20",
      text: "text-amber-600 dark:text-amber-400"
    },
    {
      key: "categoryFrame",
      filter: "قاب و فریم",
      icon: Frame,
      bg: "bg-sky-50 dark:bg-sky-950/20",
      text: "text-sky-600 dark:text-sky-400"
    },
    {
      key: "categoryModernArt",
      filter: "هنر مدرن",
      icon: Sparkles,
      bg: "bg-emerald-50 dark:bg-emerald-950/20",
      text: "text-emerald-600 dark:text-emerald-400"
    },
    {
      key: "categoryGift",
      filter: "هدایای هنری",
      icon: Gift,
      bg: "bg-orange-50 dark:bg-orange-950/20",
      text: "text-orange-600 dark:text-orange-400"
    }
  ]

  const handleCategoryClick = (filter: string) => {
    setSearchQuery(filter)
  }

  return (
    <section className="w-full mt-12 md:mt-16">
      <div className="flex flex-col gap-1 mb-8 text-center sm:text-start">
        <h2 className="text-xl md:text-2xl font-black text-foreground">{t("categoriesTitle")}</h2>
        <div className="h-1 w-12 bg-primary rounded-full mx-auto sm:mx-0" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        {categories.map((cat, idx) => {
          const IconComponent = cat.icon
          return (
            <Link
              key={idx}
              href="/"
              onClick={() => handleCategoryClick(cat.filter)}
              className={`flex flex-col items-center justify-center p-6 rounded-2xl cursor-pointer border border-border/40 hover:border-primary/30 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group bg-background ${cat.bg}`}
            >
              <div className={`p-4 rounded-xl mb-3 transition-transform duration-300 group-hover:scale-110 bg-white dark:bg-neutral-800 ${cat.text} shadow-sm`}>
                <IconComponent className="size-6" />
              </div>
              <span className="text-xs font-extrabold text-foreground text-center line-clamp-1 group-hover:text-primary transition-colors">
                {t(cat.key)}
              </span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
