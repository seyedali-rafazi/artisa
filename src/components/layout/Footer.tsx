"use client"

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useLanguage } from "../LanguageContext"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import {
  Phone,
  Mail,
  Clock,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"
import { useSubscribeNewsletter } from "@/hooks/useNewsletter"

function InstagramIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

function TelegramIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="m20.665 3.717-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l-.313 4.693c.46 0 .663-.211.921-.46l2.211-2.15 4.6 3.398c.848.467 1.457.227 1.668-.785l3.019-14.228c.309-1.239-.473-1.8-1.282-1.434z" />
    </svg>
  )
}

function BaleIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg
      viewBox="-100 -100 1200 1200"
      className={className}
      fill="currentColor"
    >
      <g transform="translate(-12, -12.14)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M1010.36,547.36c-.73,17.77-2.6,36-6.85,53.41-1.54,16.48-6.36,32.54-10.76,48.52-5.14,19.5-12.48,38.33-19.9,57.17-6.77,15.66-14.35,30.91-22.26,46.08C942.92,766,934.93,779.2,926.29,792q-14.32,21-30.5,40.45c-11.18,13.13-22.68,26.09-35.15,37.92a503.68,503.68,0,0,1-51.3,43.55,453.44,453.44,0,0,1-48.44,31.56C742.06,956.74,722.16,966,702,974.6a548,548,0,0,1-65.89,21.86c-19.49,4.32-39,9.21-58.88,10.76-37,5.71-74.86,5.79-112.13,2.2-33.6-2.61-66.87-9.78-99.25-19.32l-.08-.58C210.19,944.18,82.32,816.07,34.94,661.2c-10.36-33.35-17.62-67.93-20.31-102.83-3.83-33.85-2-68-2.2-102q-.37-40.74-.08-81.64-.26-41.83,0-83.83c-.17-24-.08-47.95-.08-71.93s-.17-48.19.16-72.25c-.33-23.82-.08-47.63-.16-71.44-1.64-17.94,4.24-36.7,17.86-48.85C44.48,13.44,65.68,8.55,84,14.91c11.09,3.75,20.71,10.6,30.58,16.72,36,23.4,70.54,48.85,104.71,74.78a86.74,86.74,0,0,0,10.68-6.77A426.86,426.86,0,0,1,272.58,73.3a483.59,483.59,0,0,1,45.75-22.1c16.39-6.85,33.19-12.8,50.15-18.1,18.1-5,36.29-10.11,55-12.72a392.65,392.65,0,0,1,61.82-7.26,451.46,451.46,0,0,1,76.41,1.71A413.36,413.36,0,0,1,619,24c128.53,27,244.08,108.3,314.46,219a493,493,0,0,1,66.47,159.76c4.73,20.95,8.48,42.32,9.7,63.77A411.89,411.89,0,0,1,1010.36,547.36ZM705.69,273.2a107.59,107.59,0,0,1,62.37,1.3c25.62,9.82,46.29,29.94,57.5,54.9,8.34,22.86,9.31,48.42.91,71.44-6.06,16.2-16.76,30.09-29.4,41.74q-16.7,16.49-33.21,33.14c-11.79,11.79-23.64,23.5-35.33,35.35-11.3,11.28-22.62,22.49-33.85,33.81-12.32,12.34-24.68,24.61-36.95,37-14,14-28.06,27.94-42,42-13.24,13.29-26.55,26.49-39.8,39.78s-26.77,26.71-40.1,40.11c-12.27,11.85-23.51,24.94-37.35,35.06a106.69,106.69,0,0,1-57.95,16C417,753.28,393.79,744,376.87,727.33q-78.53-78.44-157-156.94c-12.82-12.66-21.38-29.07-26-46.38-4.75-23.86-1.94-49.51,10.31-70.75,9.37-16.54,23.79-29.65,40.19-39a107.52,107.52,0,0,1,57.86-9.73c21.38,3.21,42,13,56.91,28.76Q401.7,476,444.37,518.5c8.63-8.18,16.9-16.73,25.19-25.27q18-17.31,35.24-35.35c11.36-10.68,22.33-21.82,33.07-33.12,7.74-6.88,14.75-14.51,22.07-21.8,12-11.68,23.75-23.59,35.49-35.51,11.21-10.83,22.11-21.95,33.07-33,11.79-11.5,23.28-23.28,35-34.87a105.75,105.75,0,0,1,42.21-26.37Z"
        />
      </g>
    </svg>
  )
}

export default function Footer() {
  const { t } = useLanguage()
  const [email, setEmail] = useState("")
  const subscribeMutation = useSubscribeNewsletter()

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed) {
      toast.error("لطفاً آدرس ایمیل خود را وارد کنید")
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmed)) {
      toast.error("فرمت آدرس ایمیل نامعتبر است (مثال: name@gmail.com)")
      return
    }

    subscribeMutation.mutate(trimmed, {
      onSuccess: (res: any) => {
        const msg = res?.message || "ایمیل شما با موفقیت در خبرنامه گالری آرتیسا ثبت شد!"
        toast.success(msg)
        setEmail("")
      },
      onError: (err: any) => {
        toast.error(err?.message || "خطا در ثبت ایمیل در خبرنامه")
      },
    })
  }

  return (
    <footer className="w-full bg-muted/30 border-t border-border mt-16">
      {/* Newsletter bar */}
      <div className="max-w-7xl mx-auto px-4 py-8 border-b border-border/80 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col gap-1 text-center md:text-start">
          <h3 className="text-base font-extrabold text-foreground">{t("newsletterTitle")}</h3>
          <p className="text-xs text-muted-foreground">{t("newsletterDesc")}</p>
        </div>

        <form onSubmit={handleSubscribe} className="flex w-full max-w-md items-center gap-2">
          <Input
            type="email"
            placeholder="آدرس ایمیل شما (name@gmail.com)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={subscribeMutation.isPending}
            className="rounded-xl border-border bg-background text-sm h-10"
            dir="ltr"
            required
          />
          <Button
            type="submit"
            size="sm"
            disabled={subscribeMutation.isPending}
            className="rounded-xl font-bold cursor-pointer shrink-0 gap-1.5 h-10 px-4 shadow-sm"
          >
            {subscribeMutation.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>در حال عضویت...</span>
              </>
            ) : (
              t("subscribeBtn")
            )}
          </Button>
        </form>
      </div>

      {/* Main Links Area */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {/* Brand details */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2.5">
            <Image
              src="/logo.png"
              alt={t("brandName")}
              width={120}
              height={120}
              className="h-12 w-auto object-contain"
            />
            <span className="text-lg font-black text-foreground">{t("brandName")}</span>
          </div>
          <p className="text-xs text-muted-foreground leading-5">
            {t("footerAbout")}
          </p>

          <div className="flex items-center gap-3 mt-2">
            <a
              href="https://www.instagram.com/galleryartisa?igsi=MXJsNmZoZGEwM3IxNA=="
              target="_blank"
              rel="noopener noreferrer"
              aria-label="اینستاگرام"
              className="flex size-8 items-center justify-center rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-all"
            >
              <InstagramIcon className="size-4" />
            </a>
            <a
              href="https://t.me/galleryartisa"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="تلگرام"
              className="flex size-8 items-center justify-center rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-all"
            >
              <TelegramIcon className="size-4" />
            </a>
            <a
              href="https://ble.ir/galleryartisa"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="بله"
              className="flex size-8 items-center justify-center rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-all"
            >
              <BaleIcon className="size-4" />
            </a>
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-bold text-foreground">{t("quickLinks")}</h4>
          <ul className="flex flex-col gap-2.5 text-xs text-muted-foreground">
            <li>
              <Link href="/" className="hover:text-primary cursor-pointer transition-colors text-start">
                {t("home")}
              </Link>
            </li>
            <li>
              <Link href="/blog" className="hover:text-primary cursor-pointer transition-colors text-start">
                {t("blog")}
              </Link>
            </li>
            <li>
              <Link href="/faq" className="hover:text-primary cursor-pointer transition-colors text-start">
                {t("faqTitle")}
              </Link>
            </li>
            <li>
              <Link href="/track-order" className="hover:text-primary cursor-pointer transition-colors text-start">
                {t("trackOrder")}
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Customer Service */}
        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-bold text-foreground">{t("customerService")}</h4>
          <ul className="flex flex-col gap-2.5 text-xs text-muted-foreground">
            <li>
              <Link href="/about-us" className="hover:text-primary cursor-pointer transition-colors text-start">
                {t("aboutUs")}
              </Link>
            </li>
            <li>
              <Link href="/contact-us" className="hover:text-primary cursor-pointer transition-colors text-start">
                {t("contactUs")}
              </Link>
            </li>
            <li>
              <a href="#" className="hover:text-primary transition-colors text-start">
                شرایط و قوانین
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-primary transition-colors text-start">
                حریم خصوصی
              </a>
            </li>
          </ul>
        </div>

        {/* Column 4: Contact Info */}
        <div className="flex flex-col gap-4 text-xs text-muted-foreground">
          <h4 className="text-sm font-bold text-foreground">اطلاعات تماس</h4>

          <div className="flex items-center gap-2">
            <Phone className="size-4 text-primary shrink-0" />
            <span dir="ltr">0919-444-0839</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="size-4 text-primary shrink-0" />
            <span>artisaartgallery@gmail.com</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-primary shrink-0" />
            <span>شنبه تا جمعه ۸:۰۰ الی ۲۰:۰۰</span>
          </div>
        </div>
      </div>

      {/* Copyright row */}
      <div className="w-full bg-muted/60 py-4 px-4 border-t border-border/60 text-center text-[10px] text-muted-foreground">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>{t("copyright")}</span>
        </div>
      </div>
    </footer>
  )
}
