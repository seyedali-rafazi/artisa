"use client"

import React, { useState, useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useLanguage } from "../LanguageContext"
import { useApp } from "../AppContext"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import ProductImage from "../ui/ProductImage"
import {
  FileCheck,
  CreditCard,
  Package,
  Truck,
  Home,
  CheckCircle2,
  CircleDot,
  AlertCircle,
  XCircle,
  Copy,
  Check,
  RotateCcw,
  Upload,
  Clock,
  Search,
  MapPin,
  User,
  ShoppingBag,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Loader2,
  ShieldCheck,
  HelpCircle,
  X,
} from "lucide-react"
import { useTrackOrder, useSubmitPaymentReceipt, OrderTrackingData } from "@/hooks/useOrders"
import { formatShamsiDate, formatPersianPrice, toStandardDigits, toPersianDigits, cn } from "@/lib/utils"

const DEMO_ORDERS: Record<string, OrderTrackingData> = {
  "ORD-10042": {
    orderId: "ORD-10042",
    status: "delivered",
    paymentStatus: "payment_approved",
    paymentMethod: "card",
    date: "۱۴۰۵/۰۳/۱۵",
    totalPrice: 5050000,
    receiptUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80",
    rejectionReason: undefined,
    items: [
      {
        id: "p1",
        name: "تابلو نقاشی رنگ‌روغن «افق طلایی»",
        price: 3200000,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=400&q=80",
      },
      {
        id: "p2",
        name: "تابلو آبرنگ «باغ در سپیده‌دم»",
        price: 1850000,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1549887534-1541e9326642?auto=format&fit=crop&w=400&q=80",
      },
    ],
    shippingAddress: {
      fullName: "کاربر نمونه",
      phone: "09121234567",
      postalCode: "1234567890",
      address: "تهران، خیابان ولیعصر، کوچه گلستان، پلاک ۱۲",
    },
    steps: [
      { title: "statusReceived", desc: "سفارش شما در سیستم با موفقیت ثبت شد", completed: true },
      { title: "statusPaymentReview", desc: "فیش واریز کارت به کارت بررسی و تایید گردید", completed: true },
      { title: "statusProcessing", desc: "اثر هنری با بسته‌بندی نفیس و تخصصی گالری آماده‌سازی شد", completed: true },
      { title: "statusShipped", desc: "تحویل به پست پیشتاز یا پیک اختصاصی گالری همراه با بارنامه", completed: true },
      { title: "statusDelivered", desc: "اثر هنری با سلامت کامل تحویل خریدار محترم گردید", completed: true },
    ],
  },
  "ORD-10038": {
    orderId: "ORD-10038",
    status: "processing",
    paymentStatus: "payment_approved",
    paymentMethod: "card",
    date: "۱۴۰۵/۰۴/۰۲",
    totalPrice: 7500000,
    receiptUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80",
    rejectionReason: undefined,
    items: [
      {
        id: "p3",
        name: "مجسمه دکوراتیو دم وال | اکسسوری خاص و مدرن",
        price: 7500000,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80",
      },
    ],
    shippingAddress: {
      fullName: "سارا محمدی",
      phone: "09129876543",
      postalCode: "1983948571",
      address: "تهران، نیاوران، خیابان یاسر، کوچه مریم، پلاک ۸",
    },
    steps: [
      { title: "statusReceived", desc: "سفارش شما در سیستم با موفقیت ثبت شد", completed: true },
      { title: "statusPaymentReview", desc: "فیش واریز بررسی و تایید گردید", completed: true },
      { title: "statusProcessing", desc: "اثر هنری با بسته‌بندی تخصصی گالری در حال آماده‌سازی است", completed: true },
      { title: "statusShipped", desc: "تحویل به شرکت پست پیشتاز یا پیک اختصاصی گالری", completed: false },
      { title: "statusDelivered", desc: "اثر هنری درب منزل تحویل داده خواهد شد", completed: false },
    ],
  },
}

function normalizeOrderInput(input: string): string {
  const cleaned = toStandardDigits(input).trim().replace(/^#+/, "").trim()
  if (!cleaned) return ""
  let upper = cleaned.toUpperCase()
  if (!upper.startsWith("ORD-")) {
    if (upper.startsWith("ORD")) {
      upper = `ORD-${upper.slice(3).replace(/^-+/, "")}`
    } else if (/^\d+$/.test(upper)) {
      upper = `ORD-${upper}`
    }
  }
  return upper
}

export default function TrackOrderView() {
  const { t } = useLanguage()
  const { showToast } = useApp()
  const searchParams = useSearchParams()
  const router = useRouter()

  const [orderIdInput, setOrderIdInput] = useState("")
  const [searchedOrder, setSearchedOrder] = useState<string>("")
  const [copied, setCopied] = useState(false)
  const [isItemsOpen, setIsItemsOpen] = useState(true)

  // Receipt upload state
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: trackData, isLoading, isError, error, refetch } = useTrackOrder(searchedOrder)
  const submitReceiptMutation = useSubmitPaymentReceipt()

  // Read initial query parameter (?code=... or ?orderId=...)
  useEffect(() => {
    const codeParam = searchParams.get("code") || searchParams.get("orderId") || searchParams.get("id") || searchParams.get("track")
    if (codeParam && codeParam.trim()) {
      const normalized = normalizeOrderInput(codeParam)
      setOrderIdInput(normalized)
      setSearchedOrder(normalized)
    }
  }, [searchParams])

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!orderIdInput.trim()) return

    const normalized = normalizeOrderInput(orderIdInput)
    setSearchedOrder(normalized)
    router.replace(`/track-order?code=${encodeURIComponent(normalized)}`, { scroll: false })
  }

  const handleQuickDemo = (code: string) => {
    setOrderIdInput(code)
    setSearchedOrder(code)
    router.replace(`/track-order?code=${encodeURIComponent(code)}`, { scroll: false })
  }

  const handleCopyOrderId = (id: string) => {
    navigator.clipboard.writeText(id)
    setCopied(true)
    showToast("کد سفارش کپی شد", "success")
    setTimeout(() => setCopied(false), 2000)
  }

  const handleClear = () => {
    setOrderIdInput("")
    setSearchedOrder("")
    router.replace("/track-order", { scroll: false })
  }

  // Handle Receipt Upload Selection
  const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"]
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      showToast("فرمت فایل باید JPG, JPEG یا PNG باشد", "error")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast("حجم فایل نباید بیشتر از ۵ مگابایت باشد", "error")
      return
    }

    setReceiptFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setReceiptPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmitReceipt = async (orderId: string) => {
    if (!receiptFile) {
      showToast("لطفاً ابتدا تصویر فیش واریز را انتخاب کنید", "error")
      return
    }

    try {
      await submitReceiptMutation.mutateAsync({
        orderId,
        file: receiptFile,
      })
      showToast("تصویر فیش واریز با موفقیت ارسال شد و در انتظار بررسی قرار گرفت", "success")
      setReceiptFile(null)
      setReceiptPreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      refetch()
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || "خطا در بارگذاری فیش واریز. لطفاً مجدداً تلاش کنید."
      showToast(msg, "error")
    }
  }

  // Determine active data (Backend live data or demo order fallback)
  const isDemo = searchedOrder in DEMO_ORDERS
  const activeOrder: OrderTrackingData | null =
    trackData || (isDemo ? DEMO_ORDERS[searchedOrder] : null)
  const showNotFoundError = isError && !isDemo

  const iconMap: Record<string, any> = {
    statusReceived: FileCheck,
    statusPaymentReview: CreditCard,
    statusProcessing: Package,
    statusShipped: Truck,
    statusDelivered: Home,
    statusCancelled: XCircle,
  }

  interface TimelineStepItem {
    title: string
    desc: string
    icon: any
    completed: boolean
  }

  const defaultSteps: TimelineStepItem[] = [
    { title: "statusReceived", desc: "سفارش در سیستم ثبت شده است", icon: FileCheck, completed: true },
    { title: "statusPaymentReview", desc: "بررسی فیش واریز کارت به کارت", icon: CreditCard, completed: true },
    { title: "statusProcessing", desc: "اثر هنری با بسته‌بندی تخصصی گالری در حال آماده‌سازی", icon: Package, completed: true },
    { title: "statusShipped", desc: "تحویل به پست پیشتاز یا پیک اختصاصی گالری", icon: Truck, completed: false },
    { title: "statusDelivered", desc: "اثر هنری درب منزل تحویل داده خواهد شد", icon: Home, completed: false },
  ]

  const trackingSteps: TimelineStepItem[] = activeOrder?.steps?.length
    ? activeOrder.steps.map((step) => ({
        title: step.title,
        desc: step.desc,
        icon: iconMap[step.title] || FileCheck,
        completed: step.completed,
      }))
    : defaultSteps


  // Map order statuses to localized badges
  const getStatusBadge = (status?: string, paymentStatus?: string) => {
    if (status === "cancelled") {
      return {
        label: "لغو شده",
        className: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30",
        icon: XCircle,
      }
    }
    if (status === "delivered" || status === "completed") {
      return {
        label: "تحویل داده شده",
        className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
        icon: CheckCircle2,
      }
    }
    if (status === "shipped") {
      return {
        label: "ارسال شده (در مسیر)",
        className: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30",
        icon: Truck,
      }
    }
    if (status === "processing") {
      return {
        label: "در حال بسته‌بندی و آماده‌سازی",
        className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
        icon: Package,
      }
    }
    if (paymentStatus === "payment_rejected") {
      return {
        label: "فیش واریز رد شده",
        className: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
        icon: AlertCircle,
      }
    }
    if (paymentStatus === "payment_pending_review") {
      return {
        label: "در انتظار تایید فیش واریز",
        className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
        icon: Clock,
      }
    }
    return {
      label: "در انتظار پرداخت",
      className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
      icon: Clock,
    }
  }

  const statusBadge = getStatusBadge(activeOrder?.status, activeOrder?.paymentStatus)

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 md:py-16">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4 shadow-sm">
          <Truck className="size-7" />
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-foreground mb-3 tracking-tight">
          {t("trackOrderTitle")}
        </h1>
        <p className="text-xs md:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
          شماره سفارش (مانند ORD-10042 یا کد ۶ رقمی) دریافتی را وارد کنید تا از آخرین وضعیت اثر هنری خود مطلع شوید.
        </p>
      </div>

      {/* Input Form Card */}
      <div className="bg-card border border-border/60 rounded-3xl p-4 md:p-6 shadow-sm mb-6">
        <form onSubmit={handleTrackSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder={t("trackInputPlaceholder")}
              value={orderIdInput}
              onChange={(e) => setOrderIdInput(e.target.value)}
              className="h-12 rounded-2xl pr-10 pl-10 text-sm font-bold text-center sm:text-left tracking-widest bg-muted/20 border-border focus:ring-2 focus:ring-primary/20"
              dir="ltr"
              required
            />
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            {orderIdInput && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute left-3 top-1/2 -translate-y-1/2 size-6 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
                title="پاک کردن"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
          <Button
            type="submit"
            disabled={isLoading || !orderIdInput.trim()}
            className="h-12 px-6 rounded-2xl font-bold cursor-pointer shrink-0 shadow-sm"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                در حال جستجو...
              </span>
            ) : (
              t("trackSubmit")
            )}
          </Button>
        </form>

        {/* Demo Quick Chips */}
        <div className="mt-4 pt-4 border-t border-border/40 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-muted-foreground font-medium flex items-center gap-1.5">
            <HelpCircle className="size-3.5" />
            کدهای نمونه جهت آزمایش:
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo("ORD-10042")}
              className="px-2.5 py-1 rounded-xl bg-muted/40 hover:bg-muted text-foreground border border-border/60 transition-colors cursor-pointer font-bold dir-ltr"
            >
              ORD-10042 (تحویل شده)
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo("ORD-10038")}
              className="px-2.5 py-1 rounded-xl bg-muted/40 hover:bg-muted text-foreground border border-border/60 transition-colors cursor-pointer font-bold dir-ltr"
            >
              ORD-10038 (در حال بسته‌بندی)
            </button>
          </div>
        </div>
      </div>

      {/* Error state */}
      {showNotFoundError && (
        <div className="flex flex-col items-center justify-center p-8 rounded-3xl bg-destructive/5 border border-destructive/20 text-center mb-6 animate-fade-in">
          <div className="size-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-3">
            <AlertCircle className="size-6" />
          </div>
          <h3 className="text-sm font-bold text-destructive mb-1">
            {(error as any)?.message || "سفارشی با این کد پیگیری یافت نشد"}
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mb-4 leading-relaxed">
            لطفاً از صحت کد وارد شده اطمینان حاصل فرمایید یا پیشوند ORD- را بررسی نمایید.
          </p>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              className="rounded-xl cursor-pointer text-xs"
            >
              جستجوی مجدد
            </Button>
            <Button
              size="sm"
              onClick={() => handleQuickDemo("ORD-10042")}
              className="rounded-xl cursor-pointer text-xs"
            >
              مشاهده سفارش نمونه
            </Button>
          </div>
        </div>
      )}

      {/* Tracking Results View */}
      {activeOrder && !showNotFoundError && (
        <div className="flex flex-col gap-6 animate-fade-in">
          {/* Main Status & Order Card */}
          <div className="border border-border/60 bg-card rounded-3xl p-6 md:p-8 shadow-sm">
            {/* Top row with Order ID, Copy button, and Status Badge */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 pb-5 mb-6">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground mb-1">{t("orderId")}</span>
                <div className="flex items-center gap-2">
                  <span className="text-base md:text-lg font-black text-foreground tracking-wider dir-ltr">
                    {activeOrder.orderId}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyOrderId(activeOrder.orderId)}
                    className="size-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
                    title="کپی شماره سفارش"
                  >
                    {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "px-3 py-1.5 rounded-full border text-xs font-black flex items-center gap-1.5",
                    statusBadge.className
                  )}
                >
                  <statusBadge.icon className="size-3.5 shrink-0" />
                  {statusBadge.label}
                </span>

                <button
                  type="button"
                  onClick={() => refetch()}
                  disabled={isLoading}
                  className="size-8 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
                  title="بروزرسانی وضعیت"
                >
                  <RotateCcw className={cn("size-3.5", isLoading && "animate-spin")} />
                </button>
              </div>
            </div>

            {/* Quick Metadata Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8 bg-muted/20 rounded-2xl p-4 border border-border/40 text-xs">
              <div>
                <span className="text-muted-foreground block mb-0.5">تاریخ ثبت سفارش</span>
                <span className="font-bold text-foreground">
                  {formatShamsiDate(activeOrder.date, "medium")}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-0.5">مبلغ کل فاکتور</span>
                <span className="font-black text-primary">
                  {formatPersianPrice(activeOrder.totalPrice)}
                </span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-muted-foreground block mb-0.5">روش پرداخت</span>
                <span className="font-bold text-foreground">
                  {activeOrder.paymentMethod === "online" ? "پرداخت آنلاین شاپرک" : "کارت به کارت بانکی"}
                </span>
              </div>
            </div>

            {/* Rejection Alert if payment was rejected */}
            {activeOrder.paymentStatus === "payment_rejected" && (
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs mb-8">
                <AlertCircle className="size-5 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <span className="font-bold">فیش واریزی شما تایید نشد</span>
                  <span>
                    علت: {activeOrder.rejectionReason || "اطلاعات فیش با مبلغ فاکتور یا شماره حساب همخوانی ندارد."}
                  </span>
                  <span className="text-[11px] opacity-80 mt-1">
                    لطفاً در بخش زیر تصویر جدید و واضح فیش را جهت بررسی مجدد ارسال فرمایید.
                  </span>
                </div>
              </div>
            )}

            {/* Cancelled Order Notice */}
            {activeOrder.status === "cancelled" && (
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400 text-xs mb-8">
                <XCircle className="size-5 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <span className="font-bold">این سفارش لغو گردیده است</span>
                  <span>
                    در صورتی که مبلغی کسر شده باشد، تا ۷۲ ساعت کاری به حساب مبدا عودت داده خواهد شد. جهت اطلاعات بیشتر با پشتیبانی تماس حاصل فرمایید.
                  </span>
                </div>
              </div>
            )}

            {/* Vertical Timeline */}
            <div className="flex flex-col gap-8 relative px-2 mb-4">
              {/* Timeline Connector Bar */}
              <div className="absolute top-4 bottom-4 right-8 w-[2px] bg-border/80 -translate-x-1/2 z-0" />

              {trackingSteps.map((step, idx) => {
                const IconComponent = step.icon
                const isCurrent = step.completed && !trackingSteps[idx + 1]?.completed

                return (
                  <div key={idx} className="flex items-start gap-4 relative z-10">
                    {/* Step indicator bubble */}
                    <div
                      className={cn(
                        "flex size-12 items-center justify-center rounded-2xl shrink-0 transition-all shadow-sm",
                        step.completed
                          ? "bg-primary text-primary-foreground shadow-primary/25"
                          : "bg-muted/80 text-muted-foreground border border-border/80"
                      )}
                    >
                      <IconComponent className="size-5" />
                    </div>

                    {/* Step Content */}
                    <div className="flex flex-col gap-1 mt-0.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "text-xs md:text-sm font-black",
                            step.completed ? "text-foreground" : "text-muted-foreground"
                          )}
                        >
                          {t(step.title) || step.title}
                        </span>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                            مرحله جاری
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] md:text-xs text-muted-foreground leading-relaxed">
                        {step.desc}
                      </p>
                    </div>

                    {/* Check / Status Icon on the left */}
                    <div className="shrink-0 flex items-center pt-1">
                      {step.completed ? (
                        <CheckCircle2 className="size-4 text-emerald-500" />
                      ) : isCurrent ? (
                        <CircleDot className="size-4 text-primary animate-pulse" />
                      ) : (
                        <div className="size-3.5 rounded-full border border-border" />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Payment Receipt Upload Section (if pending payment or rejected) */}
          {(activeOrder.paymentStatus === "pending_payment" || activeOrder.paymentStatus === "payment_rejected") && (
            <div className="border border-amber-500/30 bg-amber-500/5 rounded-3xl p-6 md:p-8 shadow-sm">
              <div className="flex items-center gap-2.5 mb-3 text-amber-600 dark:text-amber-400">
                <CreditCard className="size-5 shrink-0" />
                <h3 className="text-sm md:text-base font-black">بارگذاری فیش واریز کارت به کارت</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                لطفاً مبلغ فاکتور را به شماره کارت زیر واریز نموده و تصویر فیش یا اسکرین‌شات تراکنش را جهت تایید و آغاز بسته‌بندی بارگذاری کنید:
              </p>

              {/* Card info banner */}
              <div className="bg-background border border-border/60 rounded-2xl p-4 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[11px]">شماره کارت گالری آرتیسا:</span>
                  <span className="font-black text-foreground text-sm tracking-wider dir-ltr block mt-0.5">
                    ۶۰۳۷ - ۹۹۷۵ - ۹۸۷۶ - ۵۴۳۲
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">به نام:</span>
                  <span className="font-bold text-foreground">گالری هنری آرتیسا</span>
                </div>
              </div>

              {/* Upload Drop Area */}
              <div className="flex flex-col gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handleReceiptChange}
                  className="hidden"
                  id="receipt-file-input"
                />

                {!receiptPreview ? (
                  <label
                    htmlFor="receipt-file-input"
                    className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border/80 hover:border-primary/60 rounded-2xl cursor-pointer bg-background/50 hover:bg-background transition-colors text-center"
                  >
                    <Upload className="size-8 text-muted-foreground mb-2" />
                    <span className="text-xs font-bold text-foreground mb-1">
                      انتخاب تصویر فیش واریز
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      فرمت‌های مجاز: JPG, PNG (حداکثر ۵ مگابایت)
                    </span>
                  </label>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center gap-4 p-4 border border-border rounded-2xl bg-background">
                    <img
                      src={receiptPreview}
                      alt="پیش‌نمایش فیش واریز"
                      className="size-20 rounded-xl object-cover border border-border shrink-0"
                    />
                    <div className="flex-1 text-center sm:text-right">
                      <span className="text-xs font-bold text-foreground block truncate">
                        {receiptFile?.name}
                      </span>
                      <span className="text-[11px] text-muted-foreground block mt-0.5">
                        {receiptFile ? `${(receiptFile.size / 1024).toFixed(0)} کیلوبایت` : ""}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setReceiptFile(null)
                          setReceiptPreview(null)
                          if (fileInputRef.current) fileInputRef.current.value = ""
                        }}
                        className="rounded-xl cursor-pointer text-xs"
                      >
                        حذف
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        disabled={submitReceiptMutation.isPending}
                        onClick={() => handleSubmitReceipt(activeOrder.orderId)}
                        className="rounded-xl cursor-pointer font-bold text-xs"
                      >
                        {submitReceiptMutation.isPending ? (
                          <span className="flex items-center gap-1.5">
                            <Loader2 className="size-3.5 animate-spin" />
                            در حال ارسال...
                          </span>
                        ) : (
                          "تایید و ارسال فیش"
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Uploaded Receipt Preview if exists and not rejected */}
          {activeOrder.receiptUrl && activeOrder.paymentStatus !== "payment_rejected" && (
            <div className="border border-border/60 bg-card rounded-3xl p-5 shadow-sm flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <img
                  src={activeOrder.receiptUrl}
                  alt="فیش پرداخت"
                  className="size-12 rounded-xl object-cover border border-border shrink-0"
                />
                <div>
                  <span className="font-bold text-foreground block">تصویر فیش واریز ارسالی</span>
                  <span className="text-muted-foreground text-[11px] block mt-0.5">
                    {activeOrder.paymentStatus === "payment_approved"
                      ? "تایید شده توسط بخش مالی"
                      : "در صف بررسی توسط پشتیبانی گالری"}
                  </span>
                </div>
              </div>
              <a
                href={activeOrder.receiptUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl border border-border/60 hover:bg-muted/40 text-foreground transition-colors flex items-center gap-1 text-xs font-bold"
              >
                <span>مشاهده فیش</span>
                <ExternalLink className="size-3" />
              </a>
            </div>
          )}

          {/* Purchased Items Collapsible Card */}
          {activeOrder.items && activeOrder.items.length > 0 && (
            <div className="border border-border/60 bg-card rounded-3xl p-6 shadow-sm">
              <button
                type="button"
                onClick={() => setIsItemsOpen(!isItemsOpen)}
                className="w-full flex items-center justify-between text-start cursor-pointer font-bold text-sm text-foreground"
              >
                <div className="flex items-center gap-2">
                  <ShoppingBag className="size-4 text-primary" />
                  <span>آثار هنری موجود در این سفارش</span>
                  <span className="text-xs text-muted-foreground font-normal">
                    ({toPersianDigits(activeOrder.items.length)} قلم)
                  </span>
                </div>
                {isItemsOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
              </button>

              {isItemsOpen && (
                <div className="mt-4 pt-4 border-t border-border/40 flex flex-col gap-3">
                  {activeOrder.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-muted/20 border border-border/40"
                    >
                      <div className="size-14 rounded-xl overflow-hidden shrink-0 border border-border/60 relative">
                        <ProductImage
                          src={item.image}
                          alt={item.name}
                          className="size-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-foreground truncate">{item.name}</h4>
                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-1">
                          <span>تعداد: {toPersianDigits(item.quantity)}</span>
                          <span>•</span>
                          <span>قیمت واحد: {formatPersianPrice(item.price)}</span>
                        </div>
                      </div>
                      <div className="text-xs font-black text-primary shrink-0">
                        {formatPersianPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Delivery Address Card (if available) */}
          {activeOrder.shippingAddress && (
            <div className="border border-border/60 bg-card rounded-3xl p-6 shadow-sm text-xs">
              <div className="flex items-center gap-2 font-bold text-sm text-foreground mb-3">
                <MapPin className="size-4 text-primary" />
                <span>اطلاعات ارسال و تحویل</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-muted-foreground bg-muted/20 rounded-2xl p-4 border border-border/40">
                <div className="flex items-center gap-2">
                  <User className="size-3.5 text-foreground shrink-0" />
                  <span>تحویل‌گیرنده:</span>
                  <span className="font-bold text-foreground">
                    {activeOrder.shippingAddress.fullName}
                  </span>
                </div>
                <div>
                  <span>تلفن تماس:</span>{" "}
                  <span className="font-bold text-foreground dir-ltr inline-block">
                    {toPersianDigits(activeOrder.shippingAddress.phone)}
                  </span>
                </div>
                <div className="sm:col-span-2">
                  <span>نشانی مقصد:</span>{" "}
                  <span className="font-bold text-foreground">
                    {activeOrder.shippingAddress.address}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Help & Support Card */}
          <div className="border border-border/40 bg-muted/10 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="size-5 text-emerald-500 shrink-0" />
              <span>کلیه مرسولات گالری دارای بسته‌بندی ضدضربه و بیمه سلامت حمل هستند.</span>
            </div>
            <Link
              href="/contact-us"
              className="px-4 py-2 rounded-xl bg-card hover:bg-muted border border-border text-foreground font-bold transition-colors shrink-0 text-center"
            >
              نیاز به پشتیبانی دارید؟
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
