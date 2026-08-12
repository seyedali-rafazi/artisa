"use client"

import React, { useState, useMemo } from "react"
import {
  Star,
  MessageSquare,
  HelpCircle,
  Trash2,
  Loader2,
  AlertCircle,
  Send,
  ShieldCheck
} from "lucide-react"
import { useProductComments, usePostComment, useDeleteComment, CommentItem } from "@/hooks/useComments"
import { Button } from "@/components/ui/button"
import { formatShamsiDate } from "@/lib/utils"

interface ProductCommentsSectionProps {
  productId: string
  user: any
  setShowLogin: (show: boolean) => void
  showToast: (message: string, type: "success" | "error" | "info") => void
  t: (key: string) => string
}

export default function ProductCommentsSection({
  productId,
  user,
  setShowLogin,
  showToast,
  t,
}: ProductCommentsSectionProps) {
  const [commentText, setCommentText] = useState("")
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [entryType, setEntryType] = useState<"comment" | "question">("comment")
  const [page, setPage] = useState(1)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  
  // Tab state: "all" | "comments" | "questions"
  const [activeTab, setActiveTab] = useState<"all" | "comments" | "questions">("all")
  const [showForm, setShowForm] = useState(false)

  const {
    data: commentsResponse,
    isLoading: isCommentsLoading,
    isError: isCommentsError,
    refetch: refetchComments,
  } = useProductComments(productId, { page, limit: 10 })

  const postCommentMutation = usePostComment(productId)
  const deleteCommentMutation = useDeleteComment(productId)

  const commentsList = commentsResponse?.items || []
  const totalComments = commentsResponse?.total || 0
  const totalPages = commentsResponse?.total_pages || 1

  // Filter comments based on selected tab strictly
  const filteredComments = useMemo(() => {
    let list = [...commentsList]

    if (activeTab === "comments") {
      list = list.filter(
        (c) => c.type === "comment" || (!c.type && !c.text.includes("؟") && !c.text.includes("سوال"))
      )
    } else if (activeTab === "questions") {
      list = list.filter(
        (c) =>
          c.type === "question" ||
          (!c.type && (c.text.includes("؟") || c.text.includes("سوال") || c.text.includes("چگونه") || c.text.includes("آیا")))
      )
    }

    return list
  }, [commentsList, activeTab])

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      setShowLogin(true)
      showToast("برای ثبت نظر یا سوال ابتدا باید وارد حساب کاربری شوید.", "info")
      return
    }

    const trimmed = commentText.trim()
    if (!trimmed || trimmed.length < 3) {
      showToast("متن باید حداقل ۳ کاراکتر باشد.", "error")
      return
    }

    postCommentMutation.mutate(
      {
        text: trimmed,
        rating: entryType === "comment" ? rating : 5,
        name: user.name,
        type: entryType,
      },
      {
        onSuccess: () => {
          setCommentText("")
          setRating(5)
          setShowForm(false)
          showToast(
            entryType === "question" ? "سوال شما با موفقیت ثبت شد." : "دیدگاه شما با موفقیت ثبت شد.",
            "success"
          )
        },
        onError: (err: any) => {
          const errMsg = err?.message || "خطا در ثبت. لطفاً مجدداً تلاش کنید."
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

  return (
    <div id="comments-section" className="w-full max-w-3xl mx-auto px-4 py-8 flex flex-col items-center text-right" dir="rtl">
      
      {/* 1. Header Section (Centered Graphic & CTA using Website Brand Palette) */}
      <div className="flex flex-col items-center text-center w-full mb-8">
        
        {/* Overlapping Speech Bubbles Icon using Primary Color Palette */}
        <div className="relative w-28 h-24 mb-4 flex items-center justify-center">
          {/* Light Muted Bubble (Background left) */}
          <svg
            className="absolute top-1 left-2 w-14 h-14 text-muted-foreground/30 fill-current opacity-80"
            viewBox="0 0 24 24"
          >
            <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
          </svg>

          {/* Primary Accent Speech Bubble with Lines (Foreground right) */}
          <div className="relative z-10 -mr-4 mt-2 w-16 h-14 bg-primary text-primary-foreground rounded-2xl rounded-br-none p-2.5 shadow-lg shadow-primary/20 flex flex-col justify-center gap-1.5 border-2 border-background">
            <div className="w-3/4 h-1.5 bg-primary-foreground/90 rounded-full" />
            <div className="w-1/2 h-1.5 bg-primary-foreground/75 rounded-full" />
          </div>
        </div>

        {/* Dynamic Title */}
        <h2 className="text-xl sm:text-2xl font-black text-foreground mb-2 leading-snug">
          {totalComments > 0
            ? `${totalComments.toLocaleString("fa-IR")} دیدگاه ثبت شده، نظر تو چیه‌؟`
            : "دیدگاه ثبت شده، نظر تو چیه‌؟"}
        </h2>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-5">
          {user ? "نظر یا سوال خود را درباره این محصول ثبت کنید" : "برای درج نظر وارد شو یا ثبت‌نام کن"}
        </p>

        {/* Login / Register Pill Button in Primary Theme Styling */}
        {!user ? (
          <button
            onClick={() => {
              setShowLogin(true)
              showToast("لطفاً ابتدا وارد حساب کاربری شوید.", "info")
            }}
            className="bg-primary hover:bg-primary-hover text-primary-foreground font-black text-xs sm:text-sm px-8 py-3 rounded-full transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            ورود / ثبت‌نام
          </button>
        ) : (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-primary hover:bg-primary-hover text-primary-foreground font-black text-xs sm:text-sm px-8 py-3 rounded-full transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Send className="size-4" />
            <span>{showForm ? "بستن فرم" : "ثبت دیدگاه یا سوال جدید"}</span>
          </button>
        )}
      </div>

      {/* 2. Write Comment / Question Form */}
      {user && showForm && (
        <div className="w-full mb-10 p-5 sm:p-6 rounded-3xl border border-border/60 bg-card shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <form onSubmit={handlePostComment} className="flex flex-col gap-4">
            
            {/* Comment Type Selector: Opinion vs Question */}
            <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-border/40">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-foreground">نوع پیام:</span>
                <div className="flex items-center p-1 rounded-2xl bg-muted/60 border border-border/40">
                  <button
                    type="button"
                    onClick={() => setEntryType("comment")}
                    className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                      entryType === "comment"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <MessageSquare className="size-3.5" />
                    <span>دیدگاه</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEntryType("question")}
                    className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                      entryType === "question"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <HelpCircle className="size-3.5" />
                    <span>سوال</span>
                  </button>
                </div>
              </div>

              {/* Rating selection (only for opinion/comment type) */}
              {entryType === "comment" && (
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
                            : "text-muted-foreground/30"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <textarea
                placeholder={
                  entryType === "question"
                    ? "سوال خود را درباره ویژگی‌ها، مشخصات یا نحوه ارسال این محصول بپرسید..."
                    : "تجربه و دیدگاه ارزشمند خود را در مورد این محصول بنویسید..."
                }
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                maxLength={1000}
                className="w-full min-h-[110px] p-4 rounded-2xl border border-border/60 focus:outline-none focus:border-primary text-xs sm:text-sm bg-background resize-y"
                required
                dir="rtl"
              />
              <div className="absolute bottom-3 left-3 text-[10px] text-muted-foreground">
                {commentText.length.toLocaleString("fa-IR")} / ۱۰۰۰
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-muted-foreground font-medium">
                {entryType === "question"
                  ? "سوال شما به همراه پاسخ کارشناسان منتشر خواهد شد."
                  : "دیدگاه شما پس از بررسی، منتشر خواهد شد."}
              </span>
              <Button
                type="submit"
                disabled={postCommentMutation.isPending || !commentText.trim()}
                className="rounded-full px-6 font-black gap-2 cursor-pointer bg-primary text-primary-foreground hover:bg-primary-hover"
              >
                {postCommentMutation.isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>در حال ثبت...</span>
                  </>
                ) : (
                  <span>{entryType === "question" ? "ارسال سوال" : "ارسال دیدگاه"}</span>
                )}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* 3. Navigation Tabs Bar (Sort section removed; styled with website primary color) */}
      <div className="w-full flex items-center justify-center sm:justify-start border-b border-border/40 pb-3 mb-8">
        <div className="flex items-center gap-8 sm:gap-10">
          <button
            onClick={() => setActiveTab("all")}
            className={`text-xs sm:text-sm font-bold pb-1 relative transition-colors cursor-pointer ${
              activeTab === "all"
                ? "text-primary font-black after:absolute after:bottom-[-13px] after:right-0 after:left-0 after:h-[2.5px] after:bg-primary after:rounded-full"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            همه
          </button>
          
          <button
            onClick={() => setActiveTab("comments")}
            className={`text-xs sm:text-sm font-bold pb-1 relative transition-colors cursor-pointer ${
              activeTab === "comments"
                ? "text-primary font-black after:absolute after:bottom-[-13px] after:right-0 after:left-0 after:h-[2.5px] after:bg-primary after:rounded-full"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            دیدگاه‌ها
          </button>

          <button
            onClick={() => setActiveTab("questions")}
            className={`text-xs sm:text-sm font-bold pb-1 relative transition-colors cursor-pointer ${
              activeTab === "questions"
                ? "text-primary font-black after:absolute after:bottom-[-13px] after:right-0 after:left-0 after:h-[2.5px] after:bg-primary after:rounded-full"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            سوالات
          </button>
        </div>
      </div>

      {/* 4. Comments List Section */}
      <div className="w-full flex flex-col items-center">
        {isCommentsLoading ? (
          <div className="w-full flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-2xl bg-muted/30 animate-pulse" />
            ))}
          </div>
        ) : isCommentsError ? (
          <div className="w-full p-6 rounded-2xl border border-destructive/20 bg-destructive/10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-bold text-destructive">
              <AlertCircle className="size-4" />
              <span>خطا در دریافت دیدگاه‌های محصول.</span>
            </div>
            <Button size="sm" variant="outline" onClick={() => refetchComments()} className="rounded-xl text-xs">
              تلاش مجدد
            </Button>
          </div>
        ) : filteredComments.length > 0 ? (
          <div className="w-full flex flex-col gap-4">
            {filteredComments.map((comm) => {
              const isOwner = user?.id && comm.userId === user.id
              const isAdmin =
                user?.role === "admin" ||
                user?.role === "superadmin" ||
                user?.role === "super_admin" ||
                (user as any)?.is_superuser
              const isQuestionItem = comm.type === "question" || (comm.text && (comm.text.includes("؟") || comm.text.includes("سوال")))

              return (
                <div
                  key={comm.id}
                  className="w-full p-5 border border-border/40 rounded-2xl bg-muted/10 hover:border-border/80 transition-colors"
                >
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary font-black text-xs uppercase shadow-sm">
                        {comm.userName ? comm.userName.charAt(0) : "ک"}
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-foreground">
                            {comm.userName}
                          </span>
                          
                          {/* Type Badge: Question vs Opinion */}
                          {isQuestionItem ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                              سوال
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                              دیدگاه
                            </span>
                          )}

                          {isOwner && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary/15 text-primary">
                              شما
                            </span>
                          )}
                        </div>
                        {comm.date && (
                          <span className="text-[10px] text-muted-foreground font-semibold">
                            {formatShamsiDate(comm.date)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Rating stars (displayed for opinions/comments) */}
                      {!isQuestionItem && (
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
                      )}

                      {/* Delete button */}
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

                  {/* Official Admin / Support Reply */}
                  {comm.reply && (
                    <div className="mt-3.5 p-3.5 sm:p-4 rounded-2xl bg-primary/10 border border-primary/20 flex flex-col gap-1.5 text-right" dir="rtl">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-primary flex items-center gap-1.5">
                          <ShieldCheck className="size-4 text-primary" />
                          پاسخ پشتیبانی گالری آرتیسا
                        </span>
                        {comm.replyDate && (
                          <span className="text-[10px] text-muted-foreground font-semibold">
                            {formatShamsiDate(comm.replyDate)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed font-medium whitespace-pre-line">
                        {comm.reply}
                      </p>
                    </div>
                  )}
                </div>
              )
            })}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-6 w-full">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  className="rounded-xl text-xs cursor-pointer"
                >
                  صفحه قبل
                </Button>
                <span className="text-xs font-bold text-muted-foreground">
                  صفحه {page.toLocaleString("fa-IR")} از {totalPages.toLocaleString("fa-IR")}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= totalPages}
                  onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                  className="rounded-xl text-xs cursor-pointer"
                >
                  صفحه بعد
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full p-8 rounded-2xl border border-dashed border-border/60 text-center bg-muted/5 my-2">
            <MessageSquare className="size-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground font-semibold">
              هیچ دیدگاه یا سوالی در این بخش یافت نشد. اولین نفری باشید که دیدگاه یا سوال خود را ثبت می‌کند!
            </p>
          </div>
        )}
      </div>

      {/* 5. Delete Confirmation Modal */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-background rounded-3xl p-6 max-w-md w-full border border-border shadow-2xl space-y-4" dir="rtl">
            <h3 className="text-base font-black text-foreground">حذف دیدگاه</h3>
            <p className="text-xs text-muted-foreground leading-6">
              آیا از حذف این مورد اطمینان دارید؟ این عملیات قابل بازگشت نخواهد بود.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteTargetId(null)}
                className="rounded-xl font-bold cursor-pointer"
              >
                انصراف
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={deleteCommentMutation.isPending}
                onClick={() => handleDeleteComment(deleteTargetId)}
                className="rounded-xl font-bold gap-2 cursor-pointer"
              >
                {deleteCommentMutation.isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>در حال حذف...</span>
                  </>
                ) : (
                  <span>حذف</span>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
