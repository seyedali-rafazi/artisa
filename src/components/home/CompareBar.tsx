"use client"

import React, { useState } from "react"
import { useLanguage } from "../LanguageContext"
import { useApp } from "../AppContext"
import { Button } from "../ui/button"
import { X, RefreshCw, Star } from "lucide-react"

export default function CompareBar() {
  const { t } = useLanguage()
  const { compareList, toggleCompare, clearCompare } = useApp()
  const [showModal, setShowModal] = useState(false)

  if (compareList.length === 0) return null

  const formatPrice = (amount: number) => {
    return `${amount.toLocaleString("fa-IR")} تومان`
  }

  return (
    <>
      {/* Floating Bottom Compare Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 border-t border-border/80 shadow-2xl backdrop-blur-md px-4 py-3 md:py-4 flex items-center justify-between gap-4 animate-slide-up">
        <div className="flex items-center gap-3 md:gap-4 overflow-x-auto scrollbar-none flex-1">
          <span className="text-xs font-black text-foreground shrink-0 hidden sm:inline">
            {t("compareTitle")}:
          </span>
          {compareList.map((prod) => (
            <div 
              key={prod.id} 
              className="flex items-center gap-2 border border-border/60 rounded-xl p-1.5 bg-muted/20 shrink-0 relative"
            >
              <img src={prod.image} alt={prod.name} className="size-8 rounded-lg object-cover" />
              <span className="text-[10px] font-extrabold max-w-[80px] truncate text-foreground">
                {prod.name}
              </span>
              <button 
                onClick={() => toggleCompare(prod)}
                className="text-muted-foreground hover:text-primary rounded-full hover:bg-muted p-0.5 cursor-pointer"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearCompare}
            className="rounded-xl cursor-pointer text-xs"
          >
            {t("clearAll")}
          </Button>
          <Button 
            size="sm" 
            onClick={() => setShowModal(true)}
            className="rounded-xl font-extrabold cursor-pointer text-xs flex items-center gap-1.5"
          >
            <RefreshCw className="size-3.5" />
            <span>مقایسه کن</span>
          </Button>
        </div>
      </div>

      {/* Compare Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="relative w-full max-w-4xl max-h-[85vh] rounded-3xl border border-border/40 bg-background p-6 shadow-2xl overflow-y-auto flex flex-col gap-4 animate-scale-up" dir="rtl">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-border pb-4">
              <h2 className="text-sm md:text-base font-black text-foreground flex items-center gap-2">
                <RefreshCw className="size-5 text-primary" />
                {t("compareTitle")}
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-muted-foreground hover:text-primary rounded-full hover:bg-muted p-1 cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Comparison Grid */}
            <div className="grid grid-cols-4 gap-4 divide-x divide-border/40 md:divide-x-reverse min-w-[600px] overflow-x-auto py-4">
              {/* Labels Column */}
              <div className="flex flex-col gap-6 text-xs font-black text-muted-foreground pt-[120px]">
                <div className="h-10 flex items-center">دسته‌بندی</div>
                <div className="h-10 flex items-center">قیمت</div>
                <div className="h-10 flex items-center">امتیاز</div>
                <div className="h-20 flex items-start">توضیحات</div>
              </div>

              {/* Products Columns */}
              {compareList.map((prod) => (
                <div key={prod.id} className="flex flex-col gap-6 px-4 text-xs">
                  {/* Head thumb */}
                  <div className="flex flex-col items-center gap-2 h-[120px] justify-end pb-3 text-center border-b border-border/20">
                    <img src={prod.image} alt={prod.name} className="size-16 rounded-xl object-cover shadow-sm mb-1" />
                    <span className="font-extrabold text-foreground leading-4 line-clamp-2">
                      {prod.name}
                    </span>
                  </div>

                  {/* Category */}
                  <div className="h-10 flex items-center font-bold text-foreground/80">
                    {prod.category}
                  </div>

                  {/* Price */}
                  <div className="h-10 flex items-center font-black text-primary text-sm">
                    {formatPrice(prod.price)}
                  </div>

                  {/* Rating */}
                  <div className="h-10 flex items-center gap-1">
                    <Star className="size-4 fill-amber-400 text-amber-400 shrink-0" />
                    <span className="font-bold text-foreground">{prod.rating}</span>
                  </div>

                  {/* Desc */}
                  <div className="h-20 text-muted-foreground leading-5 line-clamp-4 overflow-y-auto">
                    {prod.description}
                  </div>
                </div>
              ))}

              {/* Placeholder Columns if less than 3 */}
              {[...Array(Math.max(0, 3 - compareList.length))].map((_, idx) => (
                <div key={idx} className="flex flex-col items-center justify-center text-center p-6 border-b border-border/25 border-dashed text-muted-foreground/50 h-[300px]">
                  <span className="text-[10px] font-semibold">خالی</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
