"use client"

import React, { useState } from "react"
import { useLanguage } from "../LanguageContext"
import { ChevronDown } from "lucide-react"

export default function FaqView() {
  const { t } = useLanguage()
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const faqs = [
    {
      q: "آثار هنری فروشگاه آرتیسا اورجینال هستند؟",
      a: "بله، تمام تابلوهای نقاشی با برچسب «اورجینال» دارای گواهی اصالت (Certificate of Authenticity) با امضای هنرمند هستند. آثار دیجیتال‌آرت و رپرودکشن نیز با کیفیت چاپ حرفه‌ای و با شفافیت کامل برای شما توضیح داده شده‌اند."
    },
    {
      q: "آثار هنری چطور بسته‌بندی و ارسال می‌شوند؟",
      a: "تمام آثار هنری با استانداردهای گالری‌داری بسته‌بندی می‌شوند. تابلوهای نقاشی داخل لوله گالری‌وار یا با محافظ کارتونی ضربه‌خور ارسال می‌شوند. ارسال به سراسر ایران با پیک اختصاصی یا پست پیشتاز انجام می‌شود."
    },
    {
      q: "آیا می‌توانم اثر هنری سفارشی بدهم؟",
      a: "بله، آرتیسا امکان سفارش اثر هنری اختصاصی را فراهم می‌کند. می‌توانید ابعاد، سبک، رنگ‌بندی و موضوع مورد نظر را از طریق فرم تماس با ما یا واتساپ ثبت کنید تا با یکی از هنرمندان ما به توافق برسید."
    },
    {
      q: "شرایط بازگشت یا تعویض اثر هنری چیست؟",
      a: "در صورتی که اثر دریافتی با توضیحات سایت مطابقت نداشته باشد، تا ۷ روز پس از دریافت امکان مرجوعی کامل با هزینه ارسال برعهده آرتیسا وجود دارد. برای آثار اورجینال در صورت آسیب هنگام حمل‌ونقل، تعویض یا بازگشت وجه انجام می‌شود."
    },
    {
      q: "چگونه اثر هنری مناسب فضای خانه‌ام را انتخاب کنم؟",
      a: "تیم مشاوره هنری آرتیسا آماده کمک به شماست! کافی است عکسی از دیوار یا اتاق موردنظرتان را در واتساپ ارسال کنید تا کارشناسان ما بهترین آثار را با توجه به سبک دکوراسیون، رنگ‌بندی و بودجه شما پیشنهاد دهند."
    }
  ]

  const toggleAccordion = (idx: number) => {
    setActiveIndex(activeIndex === idx ? null : idx)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-xl md:text-2xl font-black text-foreground mb-2">{t("faqTitle")}</h1>
        <p className="text-xs text-muted-foreground">{t("faqSubtitle")}</p>
      </div>

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
    </div>
  )
}
