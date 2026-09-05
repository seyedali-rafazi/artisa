"use client"

import React from "react"
import Link from "next/link"
import { useApp, Product } from "../AppContext"
import { Button } from "../ui/button"
import ProductImage from "../ui/ProductImage"
import { 
  Star, 
  ShoppingCart, 
  Heart 
} from "lucide-react"

interface ProductBoxProps {
  product: Product
}

export default function ProductBox({ product }: ProductBoxProps) {
  const { 
    addToCart, 
    cart, 
    setSelectedProduct,
    isFavorited,
    toggleFavorite,
  } = useApp()

  const isInCart = !!cart.find((item) => item.id === product.id)
  const favorited = isFavorited(product.id)

  const discountPercent = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0

  const formatPrice = (amount: number) => {
    return `${amount.toLocaleString("fa-IR")} تومان`
  }

  const handleProductClick = () => {
    setSelectedProduct(product)
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    addToCart(product)
  }

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFavorite(product)
  }

  return (
    <Link
      href={`/product/${product.id}`}
      onClick={handleProductClick}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-300 cursor-pointer"
    >
      {/* Product Image and Overlay Tags */}
      <div className="relative aspect-square w-full bg-muted/20 overflow-hidden">
        <ProductImage
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 280px"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Discount Badge */}
        {discountPercent > 0 && (
          <div className="absolute top-3 right-3 z-10 px-2 py-1 text-[10px] font-black text-white bg-primary rounded-lg shadow-md">
            {`${discountPercent}٪ تخفیف`}
          </div>
        )}

        {/* Floating Icons Overlay / Favorite Button */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
          <button
            onClick={handleFavoriteClick}
            type="button"
            aria-label={favorited ? `حذف ${product.name} از علاقه‌مندی‌ها` : `افزودن ${product.name} به علاقه‌مندی‌ها`}
            aria-pressed={favorited}
            className={`flex size-8 items-center justify-center rounded-xl bg-white/90 dark:bg-neutral-800/90 text-foreground hover:scale-110 active:scale-95 shadow-md backdrop-blur-sm transition-all duration-200 cursor-pointer ${
              favorited ? "text-rose-500 bg-rose-50 dark:bg-rose-950/40" : "hover:text-rose-500"
            }`}
            title={favorited ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"}
          >
            <Heart
              className={`size-4 transition-all duration-300 ${
                favorited ? "fill-rose-500 text-rose-500 scale-110" : "text-neutral-600 dark:text-neutral-300"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="flex flex-col flex-1 p-4">
        {/* Category */}
        <span className="text-[10px] font-bold text-muted-foreground uppercase mb-1">
          {product.category}
        </span>

        {/* Title */}
        <h3 className="text-xs md:text-sm font-extrabold text-foreground line-clamp-2 hover:text-primary transition-colors flex-1 mb-2 leading-5">
          {product.name}
        </h3>

        {/* Rating and Stars */}
        <div className="flex items-center gap-1 mb-3">
          <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`size-3.5 ${i < Math.floor(product.rating) ? "fill-amber-400" : "text-border"}`} 
              />
            ))}
          </div>
          <span className="text-[10px] font-extrabold text-muted-foreground">({product.rating.toLocaleString("fa-IR")})</span>
        </div>

        {/* Price Row */}
        <div className="flex flex-col gap-1 mb-4">
          {product.oldPrice && (
            <span className="text-[10px] text-muted-foreground line-through decoration-primary/45">
              {formatPrice(product.oldPrice)}
            </span>
          )}
          <span className="text-xs md:text-sm font-black text-primary">
            {formatPrice(product.price)}
          </span>
        </div>

        {/* Add to Cart Button */}
        <Button
          onClick={handleAddToCart}
          variant={isInCart ? "outline" : "default"}
          size="sm"
          className="w-full gap-1.5 rounded-xl font-bold cursor-pointer transition-all hover:scale-[1.02]"
        >
          <ShoppingCart className="size-4" />
          <span className="text-xs">
            {isInCart ? "موجود در سبد" : "خرید محصول"}
          </span>
        </Button>
      </div>
    </Link>
  )
}
