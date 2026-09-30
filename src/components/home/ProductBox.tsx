"use client";

import React from "react";
import Link from "next/link";
import { useApp, Product } from "../AppContext";
import { Button } from "../ui/button";
import ProductImage from "../ui/ProductImage";
import { Star, ShoppingCart, Heart, Sparkles } from "lucide-react";
import { cn, isProductNew } from "@/lib/utils";

interface ProductBoxProps {
  product: Product;
  badgeText?: string;
  className?: string;
}

function ProductBoxComponent({
  product,
  badgeText,
  className,
}: ProductBoxProps) {
  const { addToCart, cart, setSelectedProduct, isFavorited, toggleFavorite } =
    useApp();

  const isInCart = !!cart.find((item) => item.id === product.id);
  const favorited = isFavorited(product.id);

  const isNew = isProductNew(product, 10);
  const hasDiscount = Boolean(
    product.oldPrice && product.oldPrice > product.price,
  );
  const discountPercent = hasDiscount
    ? Math.round(
        ((product.oldPrice! - product.price) / product.oldPrice!) * 100,
      )
    : 0;

  const formatPrice = (amount: number) => {
    return `${Math.round(amount).toLocaleString("fa-IR")} تومان`;
  };

  const handleProductClick = () => {
    setSelectedProduct(product);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(product);
  };

  return (
    <Link
      href={`/product/${product.id}`}
      onClick={handleProductClick}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-xs hover:shadow-md hover:border-primary/40 transition-[border-color,box-shadow] duration-200 cursor-pointer h-full flex-1",
        className,
      )}
    >
      {/* Product Image and Overlay Tags */}
      <div className="relative aspect-square w-full bg-muted/20 overflow-hidden">
        <ProductImage
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 190px, (max-width: 1024px) 240px, 280px"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Top-Right Overlay Badges (Discount and/or New Tag) */}
        <div className="absolute top-3 right-3 z-10 flex flex-col items-end gap-1.5 pointer-events-none">
          {hasDiscount && discountPercent > 0 && (
            <div className="px-2 py-1 text-[10px] font-black text-white bg-primary rounded-lg shadow-xs">
              {`${discountPercent.toLocaleString("fa-IR")}٪ تخفیف`}
            </div>
          )}

          {(isNew || badgeText) && (
            <div className="px-2.5 py-1 text-[10px] font-bold text-white bg-emerald-600 dark:bg-emerald-500 rounded-lg shadow-xs flex items-center gap-1">
              <Sparkles className="size-2.5" />
              <span>{badgeText || "جدید"}</span>
            </div>
          )}
        </div>

        {/* Floating Icons Overlay / Favorite Button */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
          <button
            onClick={handleFavoriteClick}
            type="button"
            aria-label={
              favorited
                ? `حذف ${product.name} از علاقه‌مندی‌ها`
                : `افزودن ${product.name} به علاقه‌مندی‌ها`
            }
            aria-pressed={favorited}
            className={`flex size-8 items-center justify-center rounded-xl bg-card text-foreground hover:scale-110 active:scale-95 shadow-xs border border-border/40 transition-transform duration-150 cursor-pointer ${
              favorited
                ? "text-rose-500 bg-rose-50 dark:bg-rose-950/40"
                : "hover:text-rose-500"
            }`}
            title={
              favorited ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"
            }
          >
            <Heart
              className={`size-4 transition-colors duration-150 ${
                favorited
                  ? "fill-rose-500 text-rose-500 scale-110"
                  : "text-neutral-600 dark:text-neutral-300"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="flex flex-col flex-1 p-4">
        {/* Category */}
        <span className="text-[10px] font-bold text-muted-foreground uppercase mb-1 line-clamp-1 min-h-[15px]">
          {product.category || "\u00A0"}
        </span>

        {/* Title (Fixed height, vertically centered, up to 2 lines with ellipsis) */}
        <div className="h-10 md:h-11 flex flex-col justify-center mb-2">
          <h3
            className="text-xs md:text-sm font-extrabold text-foreground line-clamp-2 hover:text-primary transition-colors leading-5 text-start break-words"
            title={product.name}
          >
            {product.name}
          </h3>
        </div>

        {/* Rating and Stars */}
        <div className="flex items-center gap-1 mb-3">
          <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`size-3.5 ${i < Math.floor(product.rating ?? 5) ? "fill-amber-400" : "text-border"}`}
              />
            ))}
          </div>
          <span className="text-[10px] font-extrabold text-muted-foreground">
            ({(product.rating ?? 5).toLocaleString("fa-IR")})
          </span>
        </div>

        {/* Price Row (Fixed consistent min-height with justify-end so prices and buttons always align) */}
        <div className="mt-auto flex flex-col justify-end min-h-[38px] md:min-h-[42px] gap-0.5 mb-4">
          {hasDiscount && (
            <span className="text-[10px] text-muted-foreground line-through decoration-primary/45 leading-tight">
              {formatPrice(product.oldPrice!)}
            </span>
          )}
          <span className="text-xs md:text-sm font-black text-primary leading-tight">
            {formatPrice(product.price)}
          </span>
        </div>

        {/* Add to Cart Button */}
        <Button
          onClick={handleAddToCart}
          variant={isInCart ? "outline" : "default"}
          size="sm"
          className="w-full gap-1.5 rounded-xl font-bold cursor-pointer transition-transform duration-150 hover:scale-[1.02] active:scale-95"
        >
          <ShoppingCart className="size-4" />
          <span className="text-xs">
            {isInCart ? "موجود در سبد" : "خرید محصول"}
          </span>
        </Button>
      </div>
    </Link>
  );
}

const ProductBox = React.memo(ProductBoxComponent);
export default ProductBox;
