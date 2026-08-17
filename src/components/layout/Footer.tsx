"use client"

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useLanguage } from "../LanguageContext"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import {
  Camera,
  MessageCircle,
  Send,
  Phone,
  Mail,
  Clock,
  Info
} from "lucide-react"

export default function Footer() {
  const { t } = useLanguage()
  const [email, setEmail] = useState("")

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      alert("ایمیل شما با موفقیت عضو خبرنامه شد!")
      setEmail("")
    }
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
            placeholder="آدرس ایمیل شما"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-xl border-border bg-background text-sm"
            dir="ltr"
            required
          />
          <Button type="submit" size="sm" className="rounded-xl font-bold cursor-pointer shrink-0">
            {t("subscribeBtn")}
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
            <a href="#" className="flex size-8 items-center justify-center rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-all">
              <Camera className="size-4" />
            </a>
            <a href="#" className="flex size-8 items-center justify-center rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-all">
              <MessageCircle className="size-4" />
            </a>
            <a href="#" className="flex size-8 items-center justify-center rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-all">
              <Send className="size-4" />
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
            <span>info@zihome.ir</span>
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
