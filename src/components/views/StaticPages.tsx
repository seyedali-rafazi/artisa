"use client"

import React, { useState } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Mail, Phone, MapPin, Send } from "lucide-react"

// About Us View Component
export function AboutUsView() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-xl md:text-2xl font-black text-foreground mb-2">
          درباره گالری آنلاین آرتیسا
        </h1>
        <div className="h-1 w-16 bg-primary rounded-full mx-auto" />
      </div>

      <div className="border border-border/40 rounded-3xl p-6 md:p-8 bg-background shadow-sm flex flex-col gap-6 text-xs sm:text-sm text-muted-foreground leading-7">
        <p className="font-semibold text-foreground/80 text-center text-sm md:text-base mb-4">
          آرتیسا، پل ارتباطی میان هنرمندان ایرانی و هنردوستان سراسر کشور.
        </p>

        <p>
          گالری آنلاین آرتیسا از سال ۱۴۰۰ با هدف در دسترس قرار دادن آثار هنری اورجینال برای همه علاقه‌مندان هنر شروع به فعالیت کرد. ما باور داریم که هنر باید در زندگی روزمره حضور داشته باشد و هر خانه‌ای لایق زیباترین آثار است.
        </p>

        <p>
          در آرتیسا با هنرمندان نقاشی، گرافیک، سرامیک و هنر دیجیتال ایرانی همکاری می‌کنیم و آثارشان را با گواهی اصالت، بسته‌بندی تخصصی و ارسال مطمئن به دست شما می‌رسانیم.
        </p>

        <p>
          تیم مشاوره هنری آرتیسا آماده است تا در انتخاب بهترین اثر برای فضای خانه یا محل کار شما، با توجه به سبک دکوراسیون و بودجه‌تان راهنمایی کند.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="p-5 border border-border/60 bg-muted/10 rounded-2xl text-center">
            <h3 className="font-extrabold text-foreground text-sm mb-1">+۵۰۰ اثر هنری</h3>
            <span className="text-[10px] text-muted-foreground">از هنرمندان ایرانی</span>
          </div>
          <div className="p-5 border border-border/60 bg-muted/10 rounded-2xl text-center">
            <h3 className="font-extrabold text-foreground text-sm mb-1">۱۰۰٪ اصالت‌ضمانت</h3>
            <span className="text-[10px] text-muted-foreground">گواهی اصالت برای آثار اورجینال</span>
          </div>
          <div className="p-5 border border-border/60 bg-muted/10 rounded-2xl text-center">
            <h3 className="font-extrabold text-foreground text-sm mb-1">۷ روز ضمانت</h3>
            <span className="text-[10px] text-muted-foreground">مرجوعی بدون قید و شرط</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Contact Us View Component
export function ContactUsView() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [msg, setMsg] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name && msg) {
      alert("پیام شما ارسال شد! بزودی کارشناسان هنری ما پاسخ می‌دهند.")
      setName("")
      setEmail("")
      setMsg("")
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-xl md:text-2xl font-black text-foreground mb-2">
          تماس با گالری آرتیسا
        </h1>
        <div className="h-1 w-16 bg-primary rounded-full mx-auto" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Info Column */}
        <div className="flex flex-col gap-6 border border-border/40 bg-muted/10 p-6 md:p-8 rounded-3xl text-xs sm:text-sm text-muted-foreground leading-7">
          <h3 className="text-base font-black text-foreground mb-2">راه‌های ارتباطی</h3>
          
          <div className="flex items-center gap-3">
            <Phone className="size-5 text-primary shrink-0" />
            <div className="flex flex-col">
              <span className="font-bold text-foreground">شماره تماس:</span>
              <span dir="ltr" className="text-start">021-77777777</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Mail className="size-5 text-primary shrink-0" />
            <div className="flex flex-col">
              <span className="font-bold text-foreground">پست الکترونیکی:</span>
              <span>gallery@آرتیسا.ir</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="size-5 text-primary shrink-0 mt-0.5" />
            <div className="flex flex-col">
              <span className="font-bold text-foreground">آدرس گالری:</span>
              <span>تهران، سعادت‌آباد، خیابان ۲۴ متری، پلاک ۸۵</span>
            </div>
          </div>

          <div className="mt-4 p-4 rounded-2xl bg-primary/5 border border-primary/10 text-xs leading-6">
            <p className="font-bold text-foreground mb-1">🎨 مشاوره هنری رایگان</p>
            <p>عکس فضای موردنظر را در واتساپ برایمان بفرستید تا بهترین اثر را پیشنهاد دهیم.</p>
          </div>
        </div>

        {/* Contact Form Column */}
        <div className="border border-border/40 rounded-3xl p-6 bg-background shadow-sm">
          <h3 className="text-base font-black text-foreground mb-6">ارسال پیام به گالری</h3>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-muted-foreground">نام شما *</label>
              <Input
                type="text"
                placeholder="مثال: علی محمدی"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="rounded-xl"
                dir="rtl"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-muted-foreground">آدرس ایمیل</label>
              <Input
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl"
                dir="ltr"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-muted-foreground">پیام یا درخواست شما *</label>
              <textarea
                placeholder="سوال، پیشنهاد یا درخواست سفارش اختصاصی خود را بنویسید..."
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                required
                rows={4}
                className="w-full p-4 rounded-xl border border-border/40 focus:outline-none focus:border-primary/50 text-xs sm:text-sm bg-background"
                dir="rtl"
              />
            </div>

            <Button type="submit" className="w-full gap-2 rounded-xl font-bold cursor-pointer mt-2">
              <Send className="size-4" />
              <span>ارسال پیام</span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
