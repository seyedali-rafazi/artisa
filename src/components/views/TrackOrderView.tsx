"use client"

import React, { useState } from "react"
import { useLanguage } from "../LanguageContext"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { 
  FileCheck, 
  Settings, 
  Truck, 
  Home, 
  CheckCircle2, 
  CircleDot,
  AlertCircle
} from "lucide-react"
import { useTrackOrder } from "@/hooks/useOrders"
import { formatShamsiDate } from "@/lib/utils"

export default function TrackOrderView() {
  const { t } = useLanguage()
  const [orderIdInput, setOrderIdInput] = useState("")
  const [searchedOrder, setSearchedOrder] = useState<string>("")
  
  const { data: trackData, isLoading, isError, error } = useTrackOrder(searchedOrder)

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (orderIdInput.trim()) {
      let formattedId = orderIdInput.trim()
      if (!formattedId.startsWith("ORD-") && !formattedId.startsWith("ord-")) {
        formattedId = `ORD-${formattedId}`
      }
      setSearchedOrder(formattedId)
    }
  }

  const iconMap: Record<string, any> = {
    statusReceived: FileCheck,
    statusProcessing: Settings,
    statusShipped: Truck,
    statusDelivered: Home,
  }

  const defaultSteps = [
    { title: "statusReceived", desc: "سفارش در سیستم ثبت شده است", icon: FileCheck, completed: true },
    { title: "statusProcessing", desc: "اثر هنری با بسته‌بندی تخصصی گالری در حال آماده‌سازی", icon: Settings, completed: true },
    { title: "statusShipped", desc: "تحویل به پست پیشتاز یا پیک اختصاصی گالری", icon: Truck, completed: false },
    { title: "statusDelivered", desc: "اثر هنری درب منزل تحویل داده شده است", icon: Home, completed: false }
  ]

  const trackingSteps = trackData?.steps
    ? trackData.steps.map(step => ({
        title: step.title,
        desc: step.desc,
        icon: iconMap[step.title] || FileCheck,
        completed: step.completed
      }))
    : defaultSteps

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-xl md:text-2xl font-black text-foreground mb-2">{t("trackOrderTitle")}</h1>
        <p className="text-xs text-muted-foreground">
          شماره سفارش (مانند ORD-10042 یا کد ۶ رقمی) دریافتی را جهت رهگیری وارد کنید.
        </p>
      </div>

      {/* Input Form */}
      <form onSubmit={handleTrackSubmit} className="flex gap-2 mb-10">
        <Input
          type="text"
          placeholder={t("trackInputPlaceholder")}
          value={orderIdInput}
          onChange={(e) => setOrderIdInput(e.target.value)}
          className="rounded-xl pr-4 pl-4 text-xs sm:text-sm font-bold text-center tracking-widest bg-muted/20 border-border"
          dir="ltr"
          required
        />
        <Button type="submit" disabled={isLoading} className="rounded-xl font-bold cursor-pointer shrink-0">
          {isLoading ? "در حال جستجو..." : t("trackSubmit")}
        </Button>
      </form>

      {isError && (
        <div className="flex items-center gap-2 p-4 rounded-2xl bg-destructive/10 text-destructive text-xs font-bold mb-6">
          <AlertCircle className="size-5 shrink-0" />
          <span>{(error as any)?.message || "سفارشی با این کد یافت نشد"}</span>
        </div>
      )}

      {/* Tracking results view */}
      {searchedOrder && !isError && (
        <div className="border border-border/40 bg-muted/10 rounded-3xl p-6 md:p-8 animate-fade-in shadow-sm">
          <div className="flex justify-between items-center border-b border-border pb-4 mb-6">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-muted-foreground">{t("orderId")}</span>
              {trackData?.date && (
                <span className="text-[10px] text-muted-foreground mt-0.5">تاریخ ثبت: {formatShamsiDate(trackData.date)}</span>
              )}
            </div>
            <span className="text-sm font-black text-foreground tracking-widest">{trackData?.orderId || searchedOrder}</span>
          </div>

          {/* Vertical Timeline */}
          <div className="flex flex-col gap-8 relative pl-2 pr-2">
            {/* Timeline connector bar */}
            <div className="absolute top-4 bottom-4 left-6 w-[2px] bg-border/80 -translate-x-1/2 z-0" />

            {trackingSteps.map((step, idx) => {
              const IconComponent = step.icon
              const isCurrent = step.completed && !trackingSteps[idx + 1]?.completed
              
              return (
                <div key={idx} className="flex items-start gap-4 relative z-10">
                  {/* Step status indicator bubble */}
                  <div className={`flex size-12 items-center justify-center rounded-2xl shrink-0 transition-all ${
                    step.completed 
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                      : "bg-muted text-muted-foreground border border-border"
                  }`}>
                    <IconComponent className="size-5" />
                  </div>

                  {/* Step text */}
                  <div className="flex flex-col gap-1 mt-0.5">
                    <span className={`text-xs md:text-sm font-black ${
                      step.completed ? "text-foreground" : "text-muted-foreground"
                    }`}>
                      {t(step.title) || step.title}
                    </span>
                    <span className="text-[10px] md:text-xs text-muted-foreground">
                      {step.desc}
                    </span>
                  </div>

                  {/* Right side check / progress icon */}
                  <div className="ms-auto flex items-center">
                    {step.completed ? (
                      <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                    ) : isCurrent ? (
                      <CircleDot className="size-4 text-primary animate-ping shrink-0" />
                    ) : null}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
