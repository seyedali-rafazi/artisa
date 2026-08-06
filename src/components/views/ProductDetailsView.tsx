"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useLanguage } from "../LanguageContext"
import { useApp } from "../AppContext"
import { Button } from "../ui/button"
import { 
  Star, 
  ShoppingCart, 
  ShieldCheck, 
  Truck, 
  CreditCard,
  MessageSquare,
  ChevronLeft
} from "lucide-react"
import { useProductComments, usePostComment } from "@/hooks/useComments"
import { useProducts } from "@/hooks/useProducts"

export default function ProductDetailsView() {
  const { t } = useLanguage()
  const { selectedProduct, addToCart, cart, setSelectedProduct, user } = useApp()
  const [commentText, setCommentText] = useState("")

  const productId = selectedProduct?.id || ""
  const { data: apiComments, isLoading: isCommentsLoading } = useProductComments(productId)
  const postCommentMutation = usePostComment(productId)

  const { data: categoryProductsData } = useProducts({
    category: selectedProduct?.category,
    limit: 4,
  })

  if (!selectedProduct) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-muted-foreground text-sm font-semibold mb-4">
          هیچ محصولی انتخاب نشده است.
        </p>
        <Button className="rounded-xl">
          <Link href="/">بازگشت به خانه</Link>
        </Button>
      </div>
    )
  }

  const commentsList = (apiComments || []).map(c => ({
    name: c.userName || "کاربر مهمان",
    text: c.text,
    rating: c.rating || 5,
    date: c.date || "",
  }))

  const isInCart = !!cart.find((item) => item.id === selectedProduct.id)

  const formatPrice = (amount: number) => {
    return `${amount.toLocaleString("fa-IR")} تومان`
  }

  const handleAddToCart = () => {
    addToCart(selectedProduct)
  }

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim()) return

    postCommentMutation.mutate(
      {
        text: commentText,
        rating: 5,
        name: user?.name,
      },
      {
        onSuccess: () => {
          setCommentText("")
        },
      }
    )
  }

  // Similar products from same category
  const similarProducts = (categoryProductsData?.items || []).filter(
    (p) => p.id !== selectedProduct.id
  ).slice(0, 3)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-8 font-semibold">
        <Link href="/" className="hover:text-primary cursor-pointer">
          {t("home")}
        </Link>
        <ChevronLeft className="size-3" />
        <span className="hover:text-primary cursor-pointer">
          {selectedProduct.category}
        </span>
        <ChevronLeft className="size-3" />
        <span className="text-foreground font-bold truncate max-w-[200px]">
          {selectedProduct.name}
        </span>
      </div>

      {/* Main product column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-16">
        {/* Gallery column */}
        <div className="flex flex-col gap-4">
          <div className="aspect-square w-full rounded-3xl overflow-hidden border border-border/40 bg-muted/10 shadow-sm">
            <img
              src={selectedProduct.image}
              alt={selectedProduct.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Purchase & Details column */}
        <div className="flex flex-col">
          <span className="text-xs font-bold text-primary mb-2">
            {selectedProduct.category}
          </span>
          <h1 className="text-xl md:text-3xl font-black text-foreground mb-4 leading-normal">
            {selectedProduct.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`size-4 ${i < Math.floor(selectedProduct.rating) ? "fill-amber-400" : "text-border"}`} 
                />
              ))}
            </div>
            <span className="text-xs font-black text-foreground">{selectedProduct.rating}</span>
            <span className="text-xs text-muted-foreground">({commentsList.length} {t("comments")})</span>
          </div>

          <hr className="border-border/60 mb-6" />

          {/* Price */}
          <div className="flex items-baseline gap-4 mb-6">
            {selectedProduct.oldPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(selectedProduct.oldPrice)}
              </span>
            )}
            <span className="text-2xl font-black text-primary">
              {formatPrice(selectedProduct.price)}
            </span>
          </div>

          {/* Vendor info and features */}
          <div className="rounded-2xl border border-border/40 bg-muted/20 p-5 flex flex-col gap-4 mb-8">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-primary shrink-0" />
              <div className="text-xs text-foreground">
                <span className="font-extrabold">{t("vendor")}</span> گالری آرتیسا (بسته‌بندی تخصصی)
              </div>
            </div>

            <div className="flex items-center gap-2">
              <CreditCard className="size-5 text-primary shrink-0" />
              <div className="text-xs text-foreground">
                <span className="font-extrabold">{t("installment")}:</span> {t("installmentDesc")}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Truck className="size-5 text-primary shrink-0" />
              <div className="text-xs text-foreground">
                <span className="font-extrabold">{t("serviceDelivery")}:</span> {t("serviceDeliveryDesc")}
              </div>
            </div>
          </div>

          {/* Buy actions */}
          <div className="flex gap-4">
            <Button
              onClick={handleAddToCart}
              size="lg"
              variant={isInCart ? "outline" : "default"}
              className="flex-1 gap-2 rounded-2xl font-extrabold cursor-pointer"
            >
              <ShoppingCart className="size-5" />
              <span>
                {isInCart ? t("addedToCart") : t("addToCart")}
              </span>
            </Button>
          </div>
        </div>
      </div>

      {/* Description & Specifications Tabs */}
      <div className="mb-16">
        <h2 className="text-lg font-black text-foreground mb-4">{t("productDetails")}</h2>
        <div className="rounded-2xl border border-border/40 p-6 bg-background shadow-sm leading-7 text-xs sm:text-sm text-muted-foreground">
          <p className="mb-6 font-medium text-foreground/80">
            {selectedProduct.description}
          </p>
          
          {selectedProduct.specifications && (
            <div className="flex flex-col border border-border/40 rounded-xl overflow-hidden mt-6">
              {Object.entries(selectedProduct.specifications).map(([key, val], idx) => (
                <div 
                  key={key} 
                  className={`grid grid-cols-2 p-3 text-xs md:text-sm border-b border-border/40 ${
                    idx % 2 === 0 ? "bg-muted/30" : "bg-background"
                  } last:border-b-0`}
                >
                  <span className="font-bold text-foreground/80">{key}</span>
                  <span className="text-muted-foreground">{val}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mb-16">
        <h2 className="text-lg font-black text-foreground mb-6 flex items-center gap-2">
          <MessageSquare className="size-5 text-primary" />
          {t("comments")}
        </h2>

        {/* Comment form */}
        <form onSubmit={handlePostComment} className="flex flex-col gap-3 max-w-xl mb-8">
          <textarea
            placeholder="نظر خود را بنویسید..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="w-full min-h-[100px] p-4 rounded-2xl border border-border/40 focus:outline-none focus:border-primary/50 text-xs sm:text-sm bg-background"
            required
            dir="rtl"
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              size="sm"
              disabled={postCommentMutation.isPending}
              className="rounded-xl font-bold cursor-pointer"
            >
              {postCommentMutation.isPending ? "در حال ثبت..." : t("addComment")}
            </Button>
          </div>
        </form>

        {/* Comment list */}
        {isCommentsLoading ? (
          <div className="flex flex-col gap-4 max-w-3xl">
            <div className="h-20 rounded-2xl bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
          </div>
        ) : commentsList.length > 0 ? (
          <div className="flex flex-col gap-4 max-w-3xl">
            {commentsList.map((comm, idx) => (
              <div key={idx} className="p-5 border border-border/40 rounded-2xl bg-muted/10">
                <div className="flex items-center justify-between gap-4 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs uppercase">
                      {comm.name.charAt(0)}
                    </div>
                    <span className="text-xs font-extrabold text-foreground">
                      {comm.name}
                    </span>
                  </div>
                  {comm.date && <span className="text-[10px] text-muted-foreground font-semibold">{comm.date}</span>}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-6">
                  {comm.text}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground font-semibold">هنوز نظری برای این محصول ثبت نشده است.</p>
        )}
      </div>

      {/* Similar products */}
      {similarProducts.length > 0 && (
        <div>
          <div className="flex flex-col gap-1 mb-8">
            <h2 className="text-lg font-black text-foreground">محصولات مشابه</h2>
            <div className="h-1 w-10 bg-primary rounded-full" />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {similarProducts.map((p) => (
              <div 
                key={p.id}
                onClick={() => { setSelectedProduct(p); window.scrollTo(0, 0); }}
                className="flex items-center gap-3 border border-border/40 rounded-2xl p-3 hover:border-primary/25 cursor-pointer bg-background hover:shadow-md transition-all group"
              >
                <div className="size-16 rounded-xl overflow-hidden bg-muted shrink-0">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <div className="flex flex-col gap-1 overflow-hidden">
                  <h4 className="text-xs font-extrabold text-foreground truncate group-hover:text-primary">
                    {p.name}
                  </h4>
                  <span className="text-xs font-black text-primary">{formatPrice(p.price)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
