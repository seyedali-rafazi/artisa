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
  CircleDot
} from "lucide-react"

export default function TrackOrderView() {
  const { t } = useLanguage()
  const [orderIdInput, setOrderIdInput] = useState("")
  const [searchedOrder, setSearchedOrder] = useState<string | null>(null)
  
  // Fake tracking steps state
  const trackingSteps = [
    { title: "statusReceived", desc: "سفارش در سیستم ثبت شده است", icon: FileCheck, completed: true },
    { title: "statusProcessing", desc: "اثر هنری با بسته‌بندی تخصصی گالری در حال آماده‌سازی", icon: Settings, completed: true },
    { title: "statusShipped", desc: "تحویل به پست پیشتاز یا پیک اختصاصی گالری", icon: Truck, completed: false },
    { title: "statusDelivered", desc: "اثر هنری درب منزل تحویل داده شده است", icon: Home, completed: false }
  ]

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (orderIdInput.trim()) {
      setSearchedOrder(orderIdInput.trim())
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-xl md:text-2xl font-black text-foreground mb-2">{t("trackOrderTitle")}</h1>
        <p className="text-xs text-muted-foreground">
          شماره سفارش ۶ رقمی دریافتی پیامک شده را جهت رهگیری وارد کنید.
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
        <Button type="submit" className="rounded-xl font-bold cursor-pointer shrink-0">
          {t("trackSubmit")}
        </Button>
      </form>

      {/* Tracking results view */}
      {searchedOrder && (
        <div className="border border-border/40 bg-muted/10 rounded-3xl p-6 md:p-8 animate-fade-in shadow-sm">
          <div className="flex justify-between items-center border-b border-border pb-4 mb-6">
            <span className="text-xs font-bold text-muted-foreground">{t("orderId")}</span>
            <span className="text-sm font-black text-foreground tracking-widest">{searchedOrder}</span>
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
                      {t(step.title)}
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
