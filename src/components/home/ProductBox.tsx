"use client"

import React from "react"
import Link from "next/link"
import { useApp, Product } from "../AppContext"
import { Button } from "../ui/button"
import { 
  Star, 
  ShoppingCart, 
  RefreshCw, 
  Check, 
  Heart 
} from "lucide-react"

interface ProductBoxProps {
  product: Product
}

export default function ProductBox({ product }: ProductBoxProps) {
  const { 
    addToCart, 
    toggleCompare, 
    compareList, 
    cart, 
    setSelectedProduct 
  } = useApp()

  const isInCompare = !!compareList.find((p) => p.id === product.id)
  const isInCart = !!cart.find((item) => item.id === product.id)

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

  const handleCompareClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleCompare(product)
  }

  return (
    <Link
      href={`/product/${product.id}`}
      onClick={handleProductClick}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/40 bg-background shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300 cursor-pointer"
    >
      {/* Product Image and Overlay Tags */}
      <div className="relative aspect-square w-full bg-muted/20 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Discount Badge */}
        {discountPercent > 0 && (
          <div className="absolute top-3 right-3 z-10 px-2 py-1 text-[10px] font-black text-white bg-primary rounded-lg shadow-md">
            {`${discountPercent}٪ تخفیف`}
          </div>
        )}

        {/* Floating Icons Overlay */}
        <div className="absolute bottom-3 left-3 z-10 flex flex-col gap-2 transition-all duration-300 opacity-0 group-hover:opacity-100">
          {/* Compare Button */}
          <button
            onClick={handleCompareClick}
            className={`flex size-8 items-center justify-center rounded-xl bg-white/95 dark:bg-neutral-800/95 text-foreground hover:bg-primary hover:text-primary-foreground shadow-md transition-all ${
              isInCompare ? "bg-primary text-primary-foreground" : ""
            }`}
            title="مقایسه"
          >
            {isInCompare ? <Check className="size-4" /> : <RefreshCw className="size-4" />}
          </button>
          
          {/* Wishlist Button */}
          <button
            onClick={(e) => { e.stopPropagation(); alert("به علاقه‌مندی‌ها اضافه شد"); }}
            className="flex size-8 items-center justify-center rounded-xl bg-white/95 dark:bg-neutral-800/95 text-foreground hover:bg-primary hover:text-primary-foreground shadow-md transition-all"
            title="افزودن به علاقه‌مندی‌ها"
          >
            <Heart className="size-4" />
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
