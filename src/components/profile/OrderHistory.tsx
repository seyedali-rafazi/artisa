"use client"

import React, { useState } from "react"
import { useLanguage } from "../LanguageContext"
import { Order } from "../AppContext"
import { Package, ChevronDown, ChevronUp } from "lucide-react"
import { useUserOrders } from "@/hooks/useOrders"

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  processing: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  shipped: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  delivered: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
}

const PAYMENT_STYLES: Record<string, string> = {
  paid: "text-emerald-600 dark:text-emerald-400",
  unpaid: "text-destructive",
  refunded: "text-amber-600 dark:text-amber-400",
}

export default function OrderHistory() {
  const { t } = useLanguage()
  const { data: apiOrders, isLoading } = useUserOrders()
  const [expanded, setExpanded] = useState<string | null>(null)

  const orders = (apiOrders || []).map(o => ({
    id: o.id,
    date: o.date,
    status: (o.status || "processing") as Order["status"],
    totalPrice: o.totalPrice,
    paymentStatus: (o.paymentStatus || "paid") as Order["paymentStatus"],
    items: o.items || [],
  }))

  const formatPrice = (amount: number) =>
    `${amount.toLocaleString("fa-IR")} تومان`

  const statusLabel = (s: string) => {
    const map: Record<string, string> = {
      pending: t("statusPending") || "در انتظار",
      processing: t("statusProcessing") || "در حال پردازش",
      shipped: t("statusShipped") || "ارسال شده",
      delivered: t("statusDelivered") || "تحویل شده",
      cancelled: t("statusCancelled") || "لغو شده",
    }
    return map[s] || s
  }

  const paymentLabel = (s: string) => {
    const map: Record<string, string> = {
      paid: t("paymentPaid") || "پرداخت شده",
      unpaid: t("paymentUnpaid") || "پرداخت نشده",
      refunded: t("paymentRefunded") || "استرداد شده",
    }
    return map[s] || s
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

  if (orders.length === 0) {
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
      {orders.map((order) => {
        const isOpen = expanded === order.id
        return (
          <div
            key={order.id}
            className="rounded-2xl border border-border/40 bg-background overflow-hidden transition-all"
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
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLES[order.status] || STATUS_STYLES.processing}`}>
                  {statusLabel(order.status)}
                </span>
                <span className={`text-[10px] font-bold ${PAYMENT_STYLES[order.paymentStatus] || PAYMENT_STYLES.paid}`}>
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

            {/* Order Items Detail */}
            {isOpen && (
              <div className="border-t border-border/40 px-4 pb-4 pt-3 flex flex-col gap-2">
                <p className="text-[10px] font-bold text-muted-foreground mb-1">{t("orderDetails")}</p>
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
