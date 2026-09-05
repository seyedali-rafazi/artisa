"use client"

import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { useSubmitContactMessage } from "@/hooks/useContactMessages"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Palette,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from "lucide-react"

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
          گالری آنلاین آرتیسا از سال 1405 با هدف در دسترس قرار دادن آثار هنری اورجینال برای همه علاقه‌مندان هنر شروع به فعالیت کرد. ما باور داریم که هنر باید در زندگی روزمره حضور داشته باشد و هر خانه‌ای لایق زیباترین آثار است.
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

// Contact Form Validation Schema
const contactFormSchema = z.object({
  name: z
    .string()
    .min(1, "نام و نام خانوادگی الزامی است")
    .min(2, "نام باید حداقل ۲ کاراکتر باشد")
    .max(100, "نام نباید بیشتر از ۱۰۰ کاراکتر باشد"),
  email: z
    .string()
    .min(1, "آدرس ایمیل الزامی است")
    .email("فرمت آدرس ایمیل نامعتبر است (مثال: example@gmail.com)"),
  message: z
    .string()
    .min(1, "متن پیام یا درخواست الزامی است")
    .min(5, "متن پیام باید حداقل ۵ کاراکتر باشد")
    .max(4000, "متن پیام نباید بیشتر از ۴۰۰۰ کاراکتر باشد"),
})

type ContactFormData = z.infer<typeof contactFormSchema>

// Contact Us View Component
export function ContactUsView() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const submitMutation = useSubmitContactMessage()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  })

  const onSubmit = (data: ContactFormData) => {
    setErrorMessage(null)
    setIsSuccess(false)

    submitMutation.mutate(
      {
        name: data.name.trim(),
        email: data.email.trim(),
        message: data.message.trim(),
      },
      {
        onSuccess: () => {
          toast.success("پیام شما با موفقیت ثبت شد! به زودی کارشناسان ما با شما تماس خواهند گرفت.")
          setIsSuccess(true)
          reset()
        },
        onError: (err: any) => {
          const msg =
            err?.message ||
            err?.data?.message ||
            "خطایی در ارسال پیام رخ داده است. لطفاً دوباره تلاش کنید."
          setErrorMessage(msg)
          toast.error(msg)
        },
      }
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12" dir="rtl">
      <div className="text-center mb-10">
        <h1 className="text-xl md:text-2xl font-black text-foreground mb-2">
          تماس با گالری آرتیسا
        </h1>
        <div className="h-1 w-16 bg-primary rounded-full mx-auto" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Info Column */}
        <div className="flex flex-col gap-6 border border-border/40 bg-muted/10 p-6 md:p-8 rounded-3xl text-xs sm:text-sm text-muted-foreground leading-7">
          <h3 className="text-base font-black text-foreground mb-2 flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <span>راه‌های ارتباطی با ما</span>
          </h3>

          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Phone className="size-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-foreground">شماره تماس پشتیبانی:</span>
              <a
                href="tel:09194440839"
                dir="ltr"
                className="text-start font-semibold hover:text-primary transition-colors"
              >
                0919-444-0839
              </a>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Mail className="size-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-foreground">پست الکترونیکی (ایمیل):</span>
              <a
                href="mailto:artisaartgallery@gmail.com"
                dir="ltr"
                className="text-start font-semibold hover:text-primary transition-colors"
              >
                artisaartgallery@gmail.com
              </a>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/15 text-xs leading-6 mt-2">
            <p className="font-bold text-foreground mb-1.5 flex items-center gap-1.5">
              <Palette className="size-4 text-primary shrink-0" />
              <span>مشاوره هنری و سفارش اختصاصی</span>
            </p>
            <p className="text-muted-foreground font-medium">
              تیم کارشناسان هنری ما آماده هستند تا در انتخاب ابعاد، ترکیب رنگ و سبک مناسب با دکوراسیون منزلتان به شما کمک کنند. کافیست مشخصات یا تصویر فضای خود را ارسال فرمایید.
            </p>
          </div>
        </div>

        {/* Contact Form Column */}
        <div className="border border-border/40 rounded-3xl p-6 md:p-8 bg-background shadow-sm">
          <h3 className="text-base font-black text-foreground mb-1">ارسال پیام به گالری</h3>
          <p className="text-xs text-muted-foreground font-semibold mb-6">
            نظرات، پیشنهادات یا درخواست‌های خود را با ما در میان بگذارید.
          </p>

          {/* Success Banner */}
          {isSuccess && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
                <span>پیام شما با موفقیت ثبت شد! به زودی از طریق ایمیل پاسخ داده خواهد شد.</span>
              </div>
              <button
                type="button"
                onClick={() => setIsSuccess(false)}
                className="self-start text-[11px] underline font-semibold text-emerald-600 hover:opacity-80 cursor-pointer"
              >
                ارسال پیام جدید
              </button>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold flex items-center gap-2">
              <AlertCircle className="size-5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4.5" noValidate>
            {/* Full Name */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="contact-name" className="text-xs font-bold text-foreground/80">
                نام و نام خانوادگی <span className="text-destructive">*</span>
              </label>
              <Input
                id="contact-name"
                type="text"
                placeholder="مثال: علی محمدی"
                {...register("name")}
                disabled={submitMutation.isPending || isSubmitting}
                className={`rounded-xl h-11 text-xs sm:text-sm ${
                  errors.name ? "border-destructive focus-visible:ring-destructive" : ""
                }`}
                dir="rtl"
              />
              {errors.name && (
                <span className="text-[11px] font-bold text-destructive flex items-center gap-1 mt-0.5">
                  <AlertCircle className="size-3 shrink-0" />
                  {errors.name.message}
                </span>
              )}
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="contact-email" className="text-xs font-bold text-foreground/80">
                آدرس ایمیل / جیمیل <span className="text-destructive">*</span>
              </label>
              <Input
                id="contact-email"
                type="email"
                placeholder="name@example.com"
                {...register("email")}
                disabled={submitMutation.isPending || isSubmitting}
                className={`rounded-xl h-11 text-xs sm:text-sm ${
                  errors.email ? "border-destructive focus-visible:ring-destructive" : ""
                }`}
                dir="ltr"
              />
              {errors.email && (
                <span className="text-[11px] font-bold text-destructive flex items-center gap-1 mt-0.5">
                  <AlertCircle className="size-3 shrink-0" />
                  {errors.email.message}
                </span>
              )}
            </div>

            {/* Message */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="contact-message" className="text-xs font-bold text-foreground/80">
                متن پیام یا درخواست <span className="text-destructive">*</span>
              </label>
              <textarea
                id="contact-message"
                placeholder="سوال، پیشنهاد، انتقاد یا درخواست سفارش اثر اختصاصی خود را شرح دهید..."
                {...register("message")}
                disabled={submitMutation.isPending || isSubmitting}
                rows={4}
                className={`w-full p-3.5 rounded-xl border focus:outline-none focus:border-primary/50 text-xs sm:text-sm bg-background transition-colors leading-relaxed ${
                  errors.message ? "border-destructive focus:border-destructive" : "border-border/40"
                }`}
                dir="rtl"
              />
              {errors.message && (
                <span className="text-[11px] font-bold text-destructive flex items-center gap-1 mt-0.5">
                  <AlertCircle className="size-3 shrink-0" />
                  {errors.message.message}
                </span>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={submitMutation.isPending || isSubmitting}
              className="w-full gap-2 rounded-xl font-bold cursor-pointer h-11 mt-1 shadow-md shadow-primary/20"
            >
              {submitMutation.isPending || isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>در حال ارسال پیام...</span>
                </>
              ) : (
                <>
                  <Send className="size-4" />
                  <span>ارسال پیام</span>
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

