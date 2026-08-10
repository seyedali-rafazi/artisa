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
  ChevronLeft,
  Heart,
  Trash2,
  Lock,
  Loader2,
  AlertCircle
} from "lucide-react"
import { useProductComments, usePostComment, useDeleteComment } from "@/hooks/useComments"
import { useProducts } from "@/hooks/useProducts"

export default function ProductDetailsView() {
  const { t } = useLanguage()
  const { 
    selectedProduct, 
    addToCart, 
    cart, 
    setSelectedProduct, 
    user, 
    setShowLogin,
    showToast,
    isFavorited, 
    toggleFavorite 
  } = useApp()

  const [commentText, setCommentText] = useState("")
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [page, setPage] = useState(1)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

  const productId = selectedProduct?.id || ""
  const { 
    data: commentsResponse, 
    isLoading: isCommentsLoading,
    isError: isCommentsError,
    refetch: refetchComments
  } = useProductComments(productId, { page, limit: 5 })

  const postCommentMutation = usePostComment(productId)
  const deleteCommentMutation = useDeleteComment(productId)

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

  const commentsList = commentsResponse?.items || []
  const totalComments = commentsResponse?.total || 0
  const totalPages = commentsResponse?.total_pages || 1
  const isInCart = !!cart.find((item) => item.id === selectedProduct.id)

  const formatPrice = (amount: number) => {
    return `${amount.toLocaleString("fa-IR")} تومان`
  }

  const handleAddToCart = () => {
    addToCart(selectedProduct)
  }

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      setShowLogin(true)
      showToast("برای ثبت نظر ابتدا باید وارد حساب کاربری شوید.", "info")
      return
    }

    const trimmed = commentText.trim()
    if (!trimmed || trimmed.length < 3) {
      showToast("متن نظر باید حداقل ۳ کاراکتر باشد.", "error")
      return
    }

    postCommentMutation.mutate(
      {
        text: trimmed,
        rating,
        name: user.name,
      },
      {
        onSuccess: () => {
          setCommentText("")
          setRating(5)
          showToast("دیدگاه شما با موفقیت ثبت شد.", "success")
        },
        onError: (err: any) => {
          const errMsg = err?.message || "خطا در ثبت نظر. لطفاً مجدداً تلاش کنید."
          showToast(errMsg, "error")
        },
      }
    )
  }

  const handleDeleteComment = (commentId: string) => {
    deleteCommentMutation.mutate(commentId, {
      onSuccess: () => {
        setDeleteTargetId(null)
        showToast("دیدگاه با موفقیت حذف شد.", "info")
      },
      onError: () => {
        showToast("خطا در حذف دیدگاه.", "error")
      },
    })
  }

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

      {/* Main product details section */}
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
            <span className="text-xs text-muted-foreground">({totalComments} {t("comments")})</span>
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

            <Button
              onClick={() => toggleFavorite(selectedProduct)}
              variant={isFavorited(selectedProduct.id) ? "secondary" : "outline"}
              size="lg"
              aria-label={isFavorited(selectedProduct.id) ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"}
              aria-pressed={isFavorited(selectedProduct.id)}
              className={`gap-2 rounded-2xl font-extrabold cursor-pointer transition-all border-border ${
                isFavorited(selectedProduct.id) ? "text-rose-500 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800" : "hover:text-rose-500"
              }`}
            >
              <Heart
                className={`size-5 transition-all ${
                  isFavorited(selectedProduct.id) ? "fill-rose-500 text-rose-500" : ""
                }`}
              />
              <span className="hidden sm:inline">
                {isFavorited(selectedProduct.id) ? "علاقه‌مندی" : "افزودن به علاقه‌مندی"}
              </span>
            </Button>
          </div>
        </div>
      </div>

      {/* Description & Specifications */}
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

      {/* Reviews & Comments Section */}
      <div className="mb-16" id="comments-section">
        <div className="flex items-center justify-between gap-4 mb-6">
          <h2 className="text-lg font-black text-foreground flex items-center gap-2">
            <MessageSquare className="size-5 text-primary" />
            {t("comments")} ({totalComments})
          </h2>
        </div>

        {/* Comment Form for Authenticated vs Unauthenticated Users */}
        <div className="max-w-2xl mb-10 rounded-2xl border border-border/60 bg-muted/10 p-5 md:p-6 shadow-sm">
          {user ? (
            <form onSubmit={handlePostComment} className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-foreground">
                  ثبت دیدگاه به عنوان <span className="text-primary">{user.name}</span>
                </span>

                {/* Rating selection widget */}
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground ml-2">امتیاز شما:</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 focus:outline-none transition-transform hover:scale-110 cursor-pointer"
                      aria-label={`امتیاز ${star} از ۵`}
                    >
                      <Star
                        className={`size-5 ${
                          star <= (hoverRating || rating)
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted-foreground/40"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <textarea
                  placeholder="تجربه و دیدگاه ارزشمند خود را در مورد این محصول بنویسید..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  maxLength={1000}
                  className="w-full min-h-[110px] p-4 rounded-xl border border-border/40 focus:outline-none focus:border-primary text-xs sm:text-sm bg-background resize-y"
                  required
                  dir="rtl"
                />
                <div className="absolute bottom-3 left-3 text-[10px] text-muted-foreground">
                  {commentText.length} / ۱۰۰۰
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-muted-foreground font-medium">
                  دیدگاه شما پس از بررسی، منتشر خواهد شد.
                </span>
                <Button
                  type="submit"
                  disabled={postCommentMutation.isPending || !commentText.trim()}
                  className="rounded-xl font-bold gap-2 cursor-pointer"
                >
                  {postCommentMutation.isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>در حال ثبت...</span>
                    </>
                  ) : (
                    <span>{t("addComment")}</span>
                  )}
                </Button>
              </div>
            </form>
          ) : (
            /* Unauthenticated user login prompt banner */
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center sm:text-right">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
                  <Lock className="size-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-black text-foreground">
                    برای ثبت نظر ابتدا وارد حساب کاربری خود شوید.
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    تنها کاربران ثبت‌نام شده امکان ارسال نظر و امتیازدهی به محصول را دارند.
                  </span>
                </div>
              </div>

              <Button
                onClick={() => {
                  setShowLogin(true)
                  showToast("لطفاً ابتدا وارد حساب کاربری شوید.", "info")
                }}
                variant="default"
                size="sm"
                className="rounded-xl font-bold shrink-0 cursor-pointer"
              >
                ورود / ثبت‌نام
              </Button>
            </div>
          )}
        </div>

        {/* Comment list */}
        {isCommentsLoading ? (
          <div className="flex flex-col gap-4 max-w-3xl">
            {[1, 2].map((i) => (
              <div key={i} className="h-24 rounded-2xl bg-muted/40 animate-pulse" />
            ))}
          </div>
        ) : isCommentsError ? (
          <div className="p-6 rounded-2xl border border-destructive/20 bg-destructive/10 max-w-3xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-bold text-destructive">
              <AlertCircle className="size-4" />
              <span>خطا در دریافت دیدگاه‌های محصول.</span>
            </div>
            <Button size="sm" variant="outline" onClick={() => refetchComments()} className="rounded-xl text-xs">
              تلاش مجدد
            </Button>
          </div>
        ) : commentsList.length > 0 ? (
          <div className="flex flex-col gap-4 max-w-3xl">
            {commentsList.map((comm) => {
              const isOwner = user?.id && comm.userId === user.id
              const isAdmin = user?.role === "admin" || user?.role === "superadmin" || user?.role === "super_admin" || (user as any)?.is_superuser

              return (
                <div 
                  key={comm.id} 
                  className="p-5 border border-border/40 rounded-2xl bg-muted/10 hover:border-border/80 transition-colors"
                >
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs uppercase shadow-sm">
                        {comm.userName ? comm.userName.charAt(0) : "ک"}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-foreground flex items-center gap-2">
                          {comm.userName}
                          {isOwner && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary/15 text-primary">
                              شما
                            </span>
                          )}
                        </span>
                        {comm.date && (
                          <span className="text-[10px] text-muted-foreground font-semibold">
                            {comm.date}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Rating star display */}
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`size-3.5 ${
                              i < (comm.rating || 5) ? "fill-amber-400" : "text-border"
                            }`}
                          />
                        ))}
                      </div>

                      {/* Delete button for Owner or Admin */}
                      {(isOwner || isAdmin) && (
                        <button
                          onClick={() => setDeleteTargetId(comm.id)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="حذف نظر"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-foreground/90 leading-6 whitespace-pre-line">
                    {comm.text}
                  </p>
                </div>
              )
            })}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 max-w-3xl">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  className="rounded-xl text-xs"
                >
                  صفحه قبل
                </Button>
                <span className="text-xs font-bold text-muted-foreground">
                  صفحه {page} از {totalPages}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= totalPages}
                  onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                  className="rounded-xl text-xs"
                >
                  صفحه بعد
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 rounded-2xl border border-dashed border-border/60 text-center max-w-3xl bg-muted/5">
            <MessageSquare className="size-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground font-semibold">
              هنوز دیدگاهی برای این محصول ثبت نشده است. اولین نفری باشید که دیدگاه خود را ثبت می‌کند!
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-background rounded-3xl p-6 max-w-md w-full border border-border shadow-2xl space-y-4" dir="rtl">
            <h3 className="text-base font-black text-foreground">حذف دیدگاه</h3>
            <p className="text-xs text-muted-foreground leading-6">
              آیا از حذف این دیدگاه اطمینان دارید؟ این عملیات قابل بازگشت نخواهد بود.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteTargetId(null)}
                className="rounded-xl font-bold"
              >
                انصراف
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={deleteCommentMutation.isPending}
                onClick={() => handleDeleteComment(deleteTargetId)}
                className="rounded-xl font-bold gap-2"
              >
                {deleteCommentMutation.isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>در حال حذف...</span>
                  </>
                ) : (
                  <span>حذف دیدگاه</span>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

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
