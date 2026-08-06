"use client"

import React, { useState, useEffect } from "react"
import { useLanguage } from "../LanguageContext"
import ProductBox from "./ProductBox"
import { Timer } from "lucide-react"
import { useProducts } from "@/hooks/useProducts"

export default function SpecialOffers() {
  const { t } = useLanguage()
  const { data: apiData, isLoading } = useProducts({ isSpecial: true })
  const [timeLeft, setTimeLeft] = useState({ hrs: 12, mins: 34, secs: 56 })

  useEffect(() => {
    const countdown = setInterval(() => {
      setTimeLeft((prev) => {
        let { hrs, mins, secs } = prev
        if (secs > 0) {
          secs--
        } else {
          secs = 59
          if (mins > 0) {
            mins--
          } else {
            mins = 59
            if (hrs > 0) {
              hrs--
            } else {
              hrs = 23
            }
          }
        }
        return { hrs, mins, secs }
      })
    }, 1000)
    return () => clearInterval(countdown)
  }, [])

  const specialProducts = apiData?.items || []

  const translateNum = (n: number) => {
    return n.toString().padStart(2, "0").replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d)])
  }

  if (!isLoading && specialProducts.length === 0) {
    return null
  }

  return (
    <section className="w-full mt-16 p-6 md:p-8 rounded-3xl bg-primary/5 dark:bg-primary/10 border border-primary/10 relative overflow-hidden">
      {/* Background visual highlight */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 size-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 size-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-primary/10 pb-6">
        <div className="flex flex-col gap-1 text-center md:text-start">
          <h2 className="text-xl md:text-2xl font-black text-primary flex items-center justify-center md:justify-start gap-2">
            <Timer className="size-6 text-primary animate-pulse" />
            {t("specialOffersTitle")}
          </h2>
          <p className="text-xs text-muted-foreground">{t("specialOffersSubtitle")}</p>
        </div>

        {/* Countdown Timer Widget */}
        <div className="flex items-center justify-center gap-2" dir="ltr">
          <span className="text-xs font-extrabold text-muted-foreground mr-1">
            {t("timeLeft")}
          </span>
          <div className="flex items-center gap-1">
            {/* Hours */}
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-sm shadow-md">
              {translateNum(timeLeft.hrs)}
            </div>
            <span className="font-bold text-primary animate-pulse">:</span>
            {/* Minutes */}
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-sm shadow-md">
              {translateNum(timeLeft.mins)}
            </div>
            <span className="font-bold text-primary animate-pulse">:</span>
            {/* Seconds */}
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-sm shadow-md animate-bounce-slow">
              {translateNum(timeLeft.secs)}
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Special Products */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {specialProducts.map((product) => (
            <ProductBox key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  )
}
