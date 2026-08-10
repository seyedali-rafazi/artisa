"use client"

import React from "react"
import { useLanguage } from "../LanguageContext"
import { useApp } from "../AppContext"
import ProductBox from "../home/ProductBox"
import { Heart } from "lucide-react"

interface Toast {
  message: string
  type: "success" | "error"
}

interface Props {
  onToast?: (toast: Toast) => void
}

export default function WishlistSection({ onToast }: Props) {
  const { t } = useLanguage()
  const { wishlist } = useApp()

  if (!wishlist || wishlist.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center text-muted-foreground border border-dashed border-border/60 rounded-3xl bg-muted/10">
        <div className="flex size-14 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-500">
          <Heart className="size-8 text-rose-500 fill-rose-500/20" />
        </div>
        <p className="text-sm font-bold text-foreground">{t("noWishlist")}</p>
        <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
          محصولات مورد علاقه خود را ذخیره کنید تا بعداً راحت‌تر به آن‌ها دسترسی داشته باشید.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {wishlist.map((product) => (
        <ProductBox key={product.id} product={product} />
      ))}
    </div>
  )
}
