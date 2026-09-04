"use client"

import React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useLanguage } from "../LanguageContext"
import { useApp } from "../AppContext"
import { Button } from "../ui/button"
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react"

export default function CartView() {
  const router = useRouter()
  const { t } = useLanguage()
  const { cart, updateCartQty, removeFromCart, user, showToast } = useApp()

  const formatPrice = (amount: number) => {
    return `${amount.toLocaleString("fa-IR")} تومان`
  }

  const handleCheckoutClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!user) {
      showToast("برای ثبت سفارش، ابتدا وارد حساب کاربری شوید", "info")
      router.push("/login?redirect=/checkout")
      return
    }
    router.push("/checkout")
  }

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0)

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
        <div className="flex size-20 items-center justify-center rounded-full bg-primary/10 text-primary mb-6 animate-pulse">
          <ShoppingBag className="size-10" />
        </div>
        <h2 className="text-lg font-black text-foreground mb-2">{t("emptyCart")}</h2>
        <p className="text-xs text-muted-foreground mb-6">
          می‌توانید برای مشاهده محصولات جدید به صفحه اصلی بازگردید.
        </p>
        <Button className="rounded-xl font-bold cursor-pointer">
          <Link href="/">شروع خرید</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-xl md:text-2xl font-black text-foreground mb-8">{t("cartTitle")}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items List Column */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {cart.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 p-4 border border-border/40 rounded-2xl bg-background hover:shadow-sm transition-all"
            >
              {/* Product thumb */}
              <div className="size-20 rounded-xl overflow-hidden bg-muted shrink-0">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>

              {/* Title and price */}
              <div className="flex-1 min-w-0">
                <h3 className="text-xs sm:text-sm font-extrabold text-foreground truncate mb-1">
                  {item.name}
                </h3>
                <span className="text-xs font-black text-primary">
                  {formatPrice(item.price)}
                </span>
              </div>

              {/* Quantity Counter */}
              <div className="flex items-center border border-border/60 rounded-xl bg-muted/20 shrink-0">
                <button
                  onClick={() => updateCartQty(item.id, item.quantity - 1)}
                  className="p-1.5 hover:text-primary transition-colors cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus className="size-3.5" />
                </button>
                <span className="px-2.5 text-xs font-black text-foreground">
                  {item.quantity.toLocaleString("fa-IR")}
                </span>
                <button
                  onClick={() => updateCartQty(item.id, item.quantity + 1)}
                  className="p-1.5 hover:text-primary transition-colors cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus className="size-3.5" />
                </button>
              </div>

              {/* Delete Button */}
              <button
                onClick={() => removeFromCart(item.id)}
                className="p-2 text-muted-foreground hover:text-destructive shrink-0 cursor-pointer transition-colors"
                aria-label="Delete item"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Pricing Summary Column */}
        <div className="flex flex-col">
          <div className="border border-border/40 bg-muted/10 rounded-2xl p-6 flex flex-col gap-6">
            <h3 className="text-sm font-black text-foreground border-b border-border/60 pb-3">
              خلاصه فاکتور خرید
            </h3>

            <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
              <span>جمع اقلام:</span>
              <span>{formatPrice(subtotal)}</span>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
              <span>هزینه ارسال:</span>
              <span className="text-emerald-500 font-bold">بر عهده خریدار</span>
            </div>

            <hr className="border-border/60" />

            <div className="flex items-center justify-between text-sm font-black text-foreground">
              <span>{t("totalPrice")}</span>
              <span className="text-primary">{formatPrice(subtotal)}</span>
            </div>

            <Button
              onClick={handleCheckoutClick}
              className="w-full py-3 rounded-xl font-extrabold cursor-pointer transition-transform hover:scale-[1.02]"
            >
              {t("checkoutBtn")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

