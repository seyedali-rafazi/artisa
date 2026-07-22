"use client"

import React from "react"
import Link from "next/link"
import { useLanguage } from "../LanguageContext"
import { useApp } from "../AppContext"
import { Button } from "../ui/button"
import { ShoppingBag, Trash2, Plus, Minus } from "lucide-react"

export default function ProfileCart() {
  const { t } = useLanguage()
  const { cart, updateCartQty, removeFromCart } = useApp()

  const formatPrice = (amount: number) =>
    `${amount.toLocaleString("fa-IR")} تومان`

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0)

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center text-muted-foreground">
        <div className="flex size-14 items-center justify-center rounded-full bg-muted/40">
          <ShoppingBag className="size-8" />
        </div>
        <p className="text-xs font-semibold">{t("emptyCart")}</p>
        <Button size="sm" className="rounded-xl cursor-pointer mt-2">
          <Link href="/">{t("home")}</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {cart.map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-4 p-3 border border-border/40 rounded-2xl bg-background"
        >
          <div className="size-14 rounded-xl overflow-hidden bg-muted shrink-0">
            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-xs font-extrabold text-foreground truncate">{item.name}</h3>
            <span className="text-xs font-black text-primary">{formatPrice(item.price)}</span>
          </div>

          <div className="flex items-center border border-border/60 rounded-xl bg-muted/20 shrink-0">
            <button
              onClick={() => updateCartQty(item.id, item.quantity - 1)}
              className="p-1.5 hover:text-primary transition-colors cursor-pointer"
              aria-label="کاهش تعداد"
            >
              <Minus className="size-3" />
            </button>
            <span className="px-2 text-xs font-black">{item.quantity.toLocaleString("fa-IR")}</span>
            <button
              onClick={() => updateCartQty(item.id, item.quantity + 1)}
              className="p-1.5 hover:text-primary transition-colors cursor-pointer"
              aria-label="افزایش تعداد"
            >
              <Plus className="size-3" />
            </button>
          </div>

          <button
            onClick={() => removeFromCart(item.id)}
            className="p-1.5 text-muted-foreground hover:text-destructive cursor-pointer transition-colors"
            aria-label="حذف"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      ))}

      {/* Summary */}
      <div className="flex items-center justify-between border-t border-border/40 pt-3">
        <span className="text-xs font-bold text-muted-foreground">{t("totalPrice")}</span>
        <span className="text-sm font-extrabold text-primary">{formatPrice(subtotal)}</span>
      </div>

      <Button className="w-full rounded-xl font-extrabold cursor-pointer">
        <Link href="/checkout">{t("checkoutBtn")}</Link>
      </Button>
    </div>
  )
}
