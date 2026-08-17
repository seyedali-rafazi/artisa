"use client"

import React, { useState, useEffect } from "react"
import { useLanguage } from "../LanguageContext"
import ProductBox from "./ProductBox"
import { Timer, Sparkles } from "lucide-react"
import { useActiveSpecialOffers } from "@/hooks/useSpecialOffers"
import { toPersianDigits } from "@/lib/utils"

export default function SpecialOffers() {
  const { t } = useLanguage()
  const { data: activeOffers, isLoading, refetch } = useActiveSpecialOffers()

  // Get active offer and associated products
  const primaryOffer = activeOffers && activeOffers.length > 0 ? activeOffers[0] : null

  // Aggregate products from active offer(s)
  const specialProducts = primaryOffer?.products || []

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState<{
    days: number
    hrs: number
    mins: number
    secs: number
    isExpired: boolean
  }>({
    days: 0,
    hrs: 0,
    mins: 0,
    secs: 0,
    isExpired: false,
  })

  useEffect(() => {
    if (!primaryOffer?.end_at) return

    const targetTime = new Date(primaryOffer.end_at).getTime()

    const updateTimer = () => {
      const now = Date.now()
      const diffInSeconds = Math.max(0, Math.floor((targetTime - now) / 1000))

      if (diffInSeconds <= 0) {
        setTimeLeft({ days: 0, hrs: 0, mins: 0, secs: 0, isExpired: true })
        refetch() // Refetch active offers when offer expires
        return
      }

      const days = Math.floor(diffInSeconds / 86400)
      const hrs = Math.floor((diffInSeconds % 86400) / 3600)
      const mins = Math.floor((diffInSeconds % 3600) / 60)
      const secs = diffInSeconds % 60

      setTimeLeft({ days, hrs, mins, secs, isExpired: false })
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [primaryOffer?.end_at, refetch])

  const formatDigit = (n: number) => {
    return toPersianDigits(n.toString().padStart(2, "0"))
  }

  // If loading finished and no active offer exists, hide section
  if (!isLoading && (!primaryOffer || specialProducts.length === 0 || timeLeft.isExpired)) {
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
            {primaryOffer?.title || t("specialOffersTitle")}
          </h2>
          <p className="text-xs text-muted-foreground">
            {primaryOffer?.description || t("specialOffersSubtitle")}
          </p>
        </div>

        {/* Countdown Timer Widget */}
        <div className="flex items-center justify-center gap-2" dir="ltr">
          <span className="text-xs font-extrabold text-muted-foreground mr-1">
            {t("timeLeft")}
          </span>
          <div className="flex items-center gap-1">
            {/* Days if > 0 */}
            {timeLeft.days > 0 && (
              <>
                <div className="flex flex-col items-center justify-center min-w-10 h-10 px-1.5 rounded-xl bg-primary text-primary-foreground font-black text-xs shadow-md">
                  <span>{toPersianDigits(timeLeft.days)}</span>
                </div>
                <span className="font-bold text-primary animate-pulse">:</span>
              </>
            )}

            {/* Hours */}
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-sm shadow-md">
              {formatDigit(timeLeft.hrs)}
            </div>
            <span className="font-bold text-primary animate-pulse">:</span>

            {/* Minutes */}
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-sm shadow-md">
              {formatDigit(timeLeft.mins)}
            </div>
            <span className="font-bold text-primary animate-pulse">:</span>

            {/* Seconds */}
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-sm shadow-md animate-bounce-slow">
              {formatDigit(timeLeft.secs)}
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
          {specialProducts.map((product: any) => (
            <ProductBox key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  )
}
