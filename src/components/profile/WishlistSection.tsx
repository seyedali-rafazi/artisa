"use client"

import React from "react"
import { useLanguage } from "../LanguageContext"
import { useApp } from "../AppContext"
import { Button } from "../ui/button"
import { Heart, ShoppingCart, Trash2, Star } from "lucide-react"

interface Toast {
  message: string
  type: "success" | "error"
}

interface Props {
  onToast: (toast: Toast) => void
}

export default function WishlistSection({ onToast }: Props) {
  const { t } = useLanguage()
  const { wishlist, toggleWishlist, addToCart } = useApp()

  const formatPrice = (amount: number) =>
    `${amount.toLocaleString("fa-IR")} تومان`

  if (wishlist.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center text-muted-foreground">
        <div className="flex size-14 items-center justify-center rounded-full bg-muted/40">
          <Heart className="size-8" />
        </div>
        <p className="text-xs font-semibold">{t("noWishlist")}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {wishlist.map((product) => (
        <div
          key={product.id}
          className="flex flex-col gap-0 border border-border/40 rounded-2xl overflow-hidden bg-background"
        >
          <div className="relative h-40 overflow-hidden bg-muted">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.isSpecial && (
              <span className="absolute top-2 right-2 bg-primary text-primary-foreground text-[9px] font-bold px-2 py-0.5 rounded-full">
                ویژه
              </span>
            )}
          </div>
          <div className="p-3 flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-xs font-extrabold text-foreground leading-snug line-clamp-2">
                {product.name}
              </h3>
              <div className="flex items-center gap-0.5 shrink-0">
                <Star className="size-3 text-amber-400 fill-amber-400" />
                <span className="text-[10px] font-bold text-muted-foreground">{product.rating}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-sm font-extrabold text-primary">{formatPrice(product.price)}</span>
              {product.oldPrice && (
                <span className="text-[10px] text-muted-foreground line-through">
                  {formatPrice(product.oldPrice)}
                </span>
              )}
            </div>
            <div className="flex gap-2 mt-1">
              <Button
                size="sm"
                onClick={() => {
                  addToCart(product)
                  onToast({ message: t("addedToCart"), type: "success" })
                }}
                className="flex-1 gap-1 rounded-xl text-[10px] cursor-pointer"
              >
                <ShoppingCart className="size-3" />
                {t("addToCartFromWishlist")}
              </Button>
              <button
                onClick={() => toggleWishlist(product)}
                className="p-1.5 text-muted-foreground hover:text-destructive cursor-pointer transition-colors border border-border/40 rounded-xl"
                aria-label={t("removeFromWishlist")}
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
