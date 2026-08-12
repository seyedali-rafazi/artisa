"use client"

import React, { useState } from "react"
import { useLanguage } from "../LanguageContext"
import { Package, ChevronDown, ChevronUp, AlertTriangle, Upload, CheckCircle2, Clock, XCircle, Loader2 } from "lucide-react"
import { useUserOrders, useSubmitPaymentReceipt } from "@/hooks/useOrders"
import { useApp } from "../AppContext"
import { Button } from "../ui/button"

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  processing: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  shipped: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  delivered: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
}

const PAYMENT_STYLES: Record<string, string> = {
  pending_payment: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
  payment_pending_review: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
  payment_approved: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  payment_rejected: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
  paid: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  unpaid: "bg-red-500/10 text-destructive",
}

export default function OrderHistory() {
  const { t } = useLanguage()
  const { showToast } = useApp()
  const { data: apiOrders, isLoading } = useUserOrders()
  const submitReceiptMutation = useSubmitPaymentReceipt()

  const [expanded, setExpanded] = useState<string | null>(null)
  
  // Re-upload receipt modal state
  const [reUploadOrderId, setReUploadOrderId] = useState<string | null>(null)
  const [reUploadFile, setReUploadFile] = useState<File | null>(null)
  const [reUploadPreview, setReUploadPreview] = useState<string | null>(null)

  const formatPrice = (amount: number) =>
    `${amount.toLocaleString("fa-IR")} تومان`

  const statusLabel = (s: string) => {
    const map: Record<string, string> = {
      pending: "در انتظار",
      processing: "در حال پردازش",
      shipped: "ارسال شده",
      delivered: "تحویل شده",
      completed: "تکمیل شده",
      cancelled: "لغو شده",
    }
    return map[s] || s
  }

  const paymentLabel = (s: string) => {
    const map: Record<string, string> = {
      pending_payment: "در انتظار پرداخت",
      payment_pending_review: "در انتظار بررسی فیش",
      payment_approved: "پرداخت تایید شد",
      payment_rejected: "پرداخت رد شد",
      paid: "پرداخت شده",
      unpaid: "پرداخت نشده",
    }
    return map[s] || s
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setReUploadFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setReUploadPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleReUploadSubmit = (orderId: string) => {
    if (!reUploadFile) {
      showToast("لطفاً تصویر جدید فیش واریز را انتخاب کنید", "error")
      return
    }

    submitReceiptMutation.mutate(
      { orderId, file: reUploadFile },
      {
        onSuccess: () => {
          showToast("فیش واریز جدید با موفقیت ارسال شد و در انتظار بررسی قرار گرفت", "success")
          setReUploadOrderId(null)
          setReUploadFile(null)
          setReUploadPreview(null)
        },
        onError: (err: any) => {
          showToast(err?.message || "خطا در ارسال فیش واریز", "error")
        },
      }
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {[1, 2].map((i) => (
          <div key={i} className="h-16 rounded-2xl bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
        ))}
      </div>
    )
  }

  if (!apiOrders || apiOrders.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center text-muted-foreground">
        <div className="flex size-14 items-center justify-center rounded-full bg-muted/40">
          <Package className="size-8" />
        </div>
        <p className="text-xs font-semibold">{t("noOrders")}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {apiOrders.map((order) => {
        const isOpen = expanded === order.id
        const isRejected = order.paymentStatus === "payment_rejected"

        return (
          <div
            key={order.id}
            className={`rounded-2xl border bg-background overflow-hidden transition-all ${
              isRejected ? "border-rose-500/50 bg-rose-500/5" : "border-border/40"
            }`}
          >
            {/* Order Summary Row */}
            <button
              type="button"
              onClick={() => setExpanded(isOpen ? null : order.id)}
              className="w-full flex flex-col sm:flex-row sm:items-center gap-3 p-4 text-start cursor-pointer hover:bg-muted/20 transition-colors"
              aria-expanded={isOpen}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Package className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-xs font-extrabold text-foreground">
                    {t("orderId")} {order.id}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {t("orderDate")} {order.date}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${STATUS_STYLES[order.status] || STATUS_STYLES.pending}`}>
                  {statusLabel(order.status)}
                </span>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${PAYMENT_STYLES[order.paymentStatus] || PAYMENT_STYLES.paid}`}>
                  {paymentLabel(order.paymentStatus)}
                </span>
                <span className="text-xs font-extrabold text-primary">
                  {formatPrice(order.totalPrice)}
                </span>
                <span className="text-muted-foreground">
                  {isOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                </span>
              </div>
            </button>

            {/* Rejection Alert Box */}
            {isRejected && (
              <div className="mx-4 mb-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <XCircle className="size-5 shrink-0 text-rose-500" />
                  <div>
                    <span className="font-bold block">دلیل رد فیش واریزی:</span>
                    <span>{order.rejectionReason || "فیش واریزی نامعتبر است. لطفاً فیش جدید بارگذاری کنید."}</span>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    setReUploadOrderId(order.id)
                    setReUploadFile(null)
                    setReUploadPreview(null)
                  }}
                  className="rounded-xl text-xs font-extrabold shrink-0 cursor-pointer bg-rose-600 hover:bg-rose-700 text-white"
                >
                  ارسال فیش جدید
                </Button>
              </div>
            )}

            {/* Re-upload Modal for this specific order */}
            {reUploadOrderId === order.id && (
              <div className="mx-4 mb-4 p-4 rounded-2xl border border-primary/40 bg-card flex flex-col gap-4">
                <h4 className="text-xs font-black text-foreground flex items-center gap-2">
                  <Upload className="size-4 text-primary" />
                  <span>بارگذاری فیش جدید برای سفارش {order.id}</span>
                </h4>

                {!reUploadPreview ? (
                  <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-border/80 rounded-xl cursor-pointer hover:bg-muted/10 transition-all text-center">
                    <Upload className="size-6 text-primary mb-1" />
                    <span className="text-xs font-bold text-foreground">انتخاب عکس فیش جدید</span>
                    <span className="text-[10px] text-muted-foreground">JPG, PNG (حداکثر ۵ مگابایت)</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="flex items-center gap-4">
                    <img src={reUploadPreview} alt="پیش‌نمایش فیش" className="size-16 rounded-xl object-cover border border-border" />
                    <div className="flex-1">
                      <span className="text-xs font-bold text-foreground block truncate">{reUploadFile?.name}</span>
                      <button
                        type="button"
                        onClick={() => { setReUploadFile(null); setReUploadPreview(null); }}
                        className="text-[10px] text-destructive hover:underline cursor-pointer"
                      >
                        حذف عکس
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setReUploadOrderId(null)}
                    className="rounded-xl text-xs"
                  >
                    انصراف
                  </Button>
                  <Button
                    size="sm"
                    disabled={!reUploadFile || submitReceiptMutation.isPending}
                    onClick={() => handleReUploadSubmit(order.id)}
                    className="rounded-xl text-xs font-bold gap-1 cursor-pointer"
                  >
                    {submitReceiptMutation.isPending ? <Loader2 className="size-3 animate-spin" /> : null}
                    <span>ارسال فیش جدید</span>
                  </Button>
                </div>
              </div>
            )}

            {/* Order Items Detail */}
            {isOpen && (
              <div className="border-t border-border/40 px-4 pb-4 pt-3 flex flex-col gap-2">
                <p className="text-[10px] font-bold text-muted-foreground mb-1">{t("orderDetails")}</p>
                
                {order.receiptUrl && (
                  <div className="mb-2 p-2 rounded-xl bg-muted/20 border border-border/40 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-semibold">تصویر فیش بارگذاری شده:</span>
                    <a
                      href={order.receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary font-bold hover:underline"
                    >
                      مشاهده تصویر فیش
                    </a>
                  </div>
                )}

                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="size-10 rounded-xl overflow-hidden bg-muted shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{item.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {item.quantity.toLocaleString("fa-IR")} {t("items")} × {formatPrice(item.price)}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-primary shrink-0">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

