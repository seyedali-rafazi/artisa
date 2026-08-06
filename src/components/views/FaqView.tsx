"use client"

import React, { useState } from "react"
import { useLanguage } from "../LanguageContext"
import { ChevronDown } from "lucide-react"
import { useFAQs } from "@/hooks/useFaqs"

export default function FaqView() {
  const { t } = useLanguage()
  const { data: apiFaqs, isLoading } = useFAQs()
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const faqs = apiFaqs || []

  const toggleAccordion = (idx: number) => {
    setActiveIndex(activeIndex === idx ? null : idx)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-xl md:text-2xl font-black text-foreground mb-2">{t("faqTitle")}</h1>
        <p className="text-xs text-muted-foreground">{t("faqSubtitle")}</p>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 rounded-2xl bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
          ))}
        </div>
      ) : faqs.length > 0 ? (
        <div className="flex flex-col gap-4">
          {faqs.map((faq, idx) => {
            const isOpen = activeIndex === idx
            return (
              <div 
                key={idx}
                className="border border-border/40 bg-background rounded-2xl overflow-hidden shadow-sm transition-all"
              >
                <button
                  onClick={() => toggleAccordion(idx)}
                  className="w-full p-5 flex items-center justify-between text-start gap-4 font-bold text-xs sm:text-sm text-foreground hover:bg-muted/10 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`size-4 text-primary transition-transform duration-300 shrink-0 ${isOpen ? "rotate-180" : ""}`} />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-muted-foreground leading-7 border-t border-border/20 pt-4 bg-muted/5 animate-slide-down">
                    {faq.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-20 text-xs text-muted-foreground font-semibold border border-border/40 rounded-2xl">
          پرسش و پاسخی ثبت نشده است.
        </div>
      )}
    </div>
  )
}
