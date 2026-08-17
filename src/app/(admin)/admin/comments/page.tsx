'use client';

import React, { useState } from 'react';
import {
  useAdminComments,
  useUpdateAdminComment,
  useDeleteAdminComment,
  AdminComment,
} from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  MessageSquare,
  HelpCircle,
  Star,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  Loader2,
  Reply,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Check,
} from 'lucide-react';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { toast } from 'sonner';
import { formatShamsiDate } from '@/lib/utils';

export default function AdminCommentsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'comment' | 'question'>('all');
  const [answeredFilter, setAnsweredFilter] = useState<'all' | 'answered' | 'unanswered'>('all');

  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    comment: AdminComment | null;
  }>({
    isOpen: false,
    comment: null,
  });

  const [replyTarget, setReplyTarget] = useState<AdminComment | null>(null);
  const [replyText, setReplyText] = useState('');

  const { data, isLoading } = useAdminComments({
    page,
    limit: 10,
    search,
    status: statusFilter || undefined,
    type: typeFilter === 'all' ? undefined : typeFilter,
  });

  const updateStatusMutation = useUpdateAdminComment();
  const deleteMutation = useDeleteAdminComment();

  const handleUpdateStatus = (commentId: string, newStatus: string) => {
    updateStatusMutation.mutate(
      { commentId, status: newStatus },
      {
        onSuccess: () => {
          toast.success('وضعیت با موفقیت بروزرسانی شد');
        },
        onError: () => {
          toast.error('خطا در تغییر وضعیت');
        },
      }
    );
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyTarget) return;

    const trimmed = replyText.trim();
    if (!trimmed) {
      toast.error('لطفاً متن پاسخ را وارد کنید');
      return;
    }

    updateStatusMutation.mutate(
      {
        commentId: replyTarget.id,
        reply: trimmed,
        status: 'approved',
      },
      {
        onSuccess: () => {
          toast.success('پاسخ شما با موفقیت ثبت و روی محصول منتشر شد');
          setReplyTarget(null);
          setReplyText('');
        },
        onError: () => {
          toast.error('خطا در ثبت پاسخ');
        },
      }
    );
  };

  const handleDeleteConfirm = () => {
    if (!confirmDelete.comment) return;
    deleteMutation.mutate(confirmDelete.comment.id, {
      onSuccess: () => {
        toast.success('مورد با موفقیت حذف شد');
        setConfirmDelete({ isOpen: false, comment: null });
      },
      onError: () => {
        toast.error('خطا در حذف');
      },
    });
  };

  const rawComments: AdminComment[] = data?.items || [];
  
  // Filter by type & answer status client-side
  const comments = rawComments.filter((c) => {
    if (typeFilter === 'comment') {
      if (c.type === 'question' || (c.text && c.text.includes('؟'))) return false;
    }
    if (typeFilter === 'question') {
      if (c.type !== 'question' && (!c.text || !c.text.includes('؟'))) return false;
    }
    if (answeredFilter === 'answered') {
      if (!c.reply) return false;
    }
    if (answeredFilter === 'unanswered') {
      if (c.reply) return false;
    }
    return true;
  });

  const totalComments = data?.total || comments.length;
  const totalPages = data?.total_pages || 1;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="size-3" />
            تایید شده
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <XCircle className="size-3" />
            رد شده
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Clock className="size-3" />
            در انتظار بررسی
          </span>
        );
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6" dir="rtl">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
            <MessageSquare className="size-6 text-primary" />
            مدیریت نظرات و سوالات کاربران
          </h1>
          <p className="text-xs text-muted-foreground font-semibold mt-1">
            دیدگاه‌ها و سوالات کاربران را مشاهده کنید و پاسخ رسمی فروشگاه را روی محصولات ثبت نمایید.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-muted border border-border/60 text-muted-foreground">
            مجموع آیتم‌ها: <strong className="text-foreground font-black">{totalComments}</strong>
          </span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="rounded-3xl border border-border/60 bg-background p-4 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-4 justify-between">
          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="جستجو در متن نظر، سوال، کاربر یا محصول..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pr-9 rounded-2xl text-xs bg-muted/20 border-border/40 focus:border-primary"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Category / Type Tabs */}
            <div className="flex items-center p-1 rounded-2xl bg-muted/60 border border-border/40">
              <button
                onClick={() => setTypeFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  typeFilter === 'all'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                همه نوع
              </button>
              <button
                onClick={() => setTypeFilter('comment')}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1 ${
                  typeFilter === 'comment'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <MessageSquare className="size-3" />
                دیدگاه‌ها
              </button>
              <button
                onClick={() => setTypeFilter('question')}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1 ${
                  typeFilter === 'question'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <HelpCircle className="size-3" />
                سوالات
              </button>
            </div>

            {/* Answered Status Filters */}
            <div className="flex items-center p-1 rounded-2xl bg-muted/60 border border-border/40">
              <button
                onClick={() => setAnsweredFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  answeredFilter === 'all'
                    ? 'bg-secondary text-secondary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                همه پاسخ‌ها
              </button>
              <button
                onClick={() => setAnsweredFilter('answered')}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1 ${
                  answeredFilter === 'answered'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Check className="size-3" />
                پاسخ داده شده
              </button>
              <button
                onClick={() => setAnsweredFilter('unanswered')}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1 ${
                  answeredFilter === 'unanswered'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Clock className="size-3" />
                در انتظار پاسخ
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Comments & Questions Table */}
      <div className="rounded-3xl border border-border/60 bg-background overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3 text-center">
            <Loader2 className="size-8 text-primary animate-spin" />
            <span className="text-xs font-bold text-muted-foreground">در حال دریافت...</span>
          </div>
        ) : comments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30 text-muted-foreground font-extrabold uppercase">
                  <th className="p-4">نوع</th>
                  <th className="p-4">محصول</th>
                  <th className="p-4">نویسنده</th>
                  <th className="p-4">متن پیام و پاسخ ثبت‌شده مدیریت</th>
                  <th className="p-4">وضعیت</th>
                  <th className="p-4 text-center">عملیات پاسخ و مدیریت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {comments.map((comment) => {
                  const isQuestion = comment.type === 'question' || (comment.text && comment.text.includes('؟'));

                  return (
                    <tr key={comment.id} className="hover:bg-muted/20 transition-colors">
                      {/* Type Badge */}
                      <td className="p-4 whitespace-nowrap">
                        {isQuestion ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            <HelpCircle className="size-3" />
                            سوال
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-primary/10 text-primary border border-primary/20">
                            <MessageSquare className="size-3" />
                            دیدگاه
                          </span>
                        )}
                      </td>

                      {/* Product */}
                      <td className="p-4 font-bold text-foreground max-w-[160px]">
                        <div className="flex flex-col gap-0.5">
                          <span className="truncate" title={comment.productName}>
                            {comment.productName || 'محصول آرتیسا'}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-semibold">
                            کد: {comment.productId.slice(-6)}
                          </span>
                        </div>
                      </td>

                      {/* Author */}
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-extrabold text-foreground">{comment.userName}</span>
                          {comment.userEmail && (
                            <span className="text-[10px] text-muted-foreground">{comment.userEmail}</span>
                          )}
                        </div>
                      </td>

                      {/* Comment text & admin answer box */}
                      <td className="p-4 max-w-md">
                        <div className="flex flex-col gap-2">
                          {!isQuestion && (
                            <div className="flex items-center gap-1 text-amber-400">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`size-3 ${
                                    i < (comment.rating || 5) ? 'fill-amber-400' : 'text-border'
                                  }`}
                                />
                              ))}
                              <span className="text-[10px] font-black text-foreground mr-1">
                                ({comment.rating})
                              </span>
                            </div>
                          )}
                          
                          <p className="text-foreground/90 font-medium text-xs leading-relaxed bg-muted/20 p-2.5 rounded-xl border border-border/30">
                            "{comment.text}"
                          </p>

                          {/* Dedicated Admin Response Card inside row */}
                          {comment.reply ? (
                            <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 flex flex-col gap-1 text-primary">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-black flex items-center gap-1 text-primary">
                                  <ShieldCheck className="size-3.5 text-primary" />
                                  پاسخ ثبت شده پشتیبانی
                                </span>
                                {comment.replyDate && (
                                  <span className="text-[9px] text-muted-foreground font-semibold">
                                    {formatShamsiDate(comment.replyDate)}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-foreground font-medium leading-relaxed whitespace-pre-line">
                                {comment.reply}
                              </p>
                            </div>
                          ) : (
                            <div className="text-[10px] text-amber-600 dark:text-amber-400 font-extrabold flex items-center gap-1 pt-0.5">
                              <Clock className="size-3" />
                              <span>هنوز پاسخی برای این مورد ثبت نشده است.</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-4">{getStatusBadge(comment.status)}</td>

                      {/* Moderation & Reply Actions */}
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              setReplyTarget(comment);
                              setReplyText(comment.reply || '');
                            }}
                            className="rounded-xl text-[11px] font-bold gap-1 cursor-pointer bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
                          >
                            <Reply className="size-3.5 text-primary" />
                            {comment.reply ? 'ویرایش پاسخ' : 'پاسخ دادن'}
                          </Button>

                          {comment.status !== 'approved' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateStatus(comment.id, 'approved')}
                              disabled={updateStatusMutation.isPending}
                              className="rounded-xl text-[11px] font-bold text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer"
                            >
                              تایید
                            </Button>
                          )}

                          {comment.status !== 'rejected' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateStatus(comment.id, 'rejected')}
                              disabled={updateStatusMutation.isPending}
                              className="rounded-xl text-[11px] font-bold text-rose-600 border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                            >
                              رد
                            </Button>
                          )}

                          <button
                            onClick={() => setConfirmDelete({ isOpen: true, comment })}
                            className="p-1.5 rounded-xl text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="حذف"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-2">
            <MessageSquare className="size-10 text-muted-foreground/30" />
            <h3 className="text-sm font-bold text-foreground">هیچ موردی یافت نشد</h3>
            <p className="text-xs text-muted-foreground">
              با فیلترها یا عبارت جستجوی فعلی هیچ نظري یا سوالی پیدا نشد.
            </p>
          </div>
        )}

        {/* Footer Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-border/40 flex items-center justify-between bg-muted/10">
            <Button
              size="sm"
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              className="rounded-xl text-xs font-bold gap-1 cursor-pointer"
            >
              <ChevronRight className="size-4" />
              قبلی
            </Button>

            <span className="text-xs font-bold text-muted-foreground">
              صفحه {page} از {totalPages}
            </span>

            <Button
              size="sm"
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              className="rounded-xl text-xs font-bold gap-1 cursor-pointer"
            >
              بعدی
              <ChevronLeft className="size-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Admin Reply Modal */}
      {replyTarget && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => { setReplyTarget(null); setReplyText(''); }}
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="bg-background rounded-3xl p-6 max-w-lg w-full border border-border shadow-2xl space-y-4 animate-scale-up" 
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="text-base font-black text-foreground flex items-center gap-2">
                <Reply className="size-5 text-primary" />
                ارسال پاسخ مدیریت به {replyTarget.type === 'question' ? 'سوال' : 'دیدگاه'}
              </h3>
            </div>

            <div className="p-3.5 rounded-2xl bg-muted/40 text-xs space-y-1.5 border border-border/40">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="font-extrabold text-foreground">{replyTarget.userName}</span>
                <span className="font-bold text-primary">{replyTarget.productName || 'محصول'}</span>
              </div>
              <p className="text-foreground/90 font-medium leading-relaxed bg-background p-3 rounded-xl border border-border/40">
                "{replyTarget.text}"
              </p>
            </div>

            <form onSubmit={handleSendReply} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">متن پاسخ پشتیبانی / مدیریت:</label>
                <textarea
                  rows={4}
                  placeholder="پاسخ رسمی فروشگاه را جهت نمایش تحت سوال کاربر بنویسید..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full p-3.5 rounded-2xl border border-border/60 focus:outline-none focus:border-primary text-xs bg-background resize-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setReplyTarget(null);
                    setReplyText('');
                  }}
                  className="rounded-xl font-bold cursor-pointer"
                >
                  انصراف
                </Button>
                <Button
                  type="submit"
                  disabled={updateStatusMutation.isPending}
                  className="rounded-xl font-bold gap-2 cursor-pointer bg-primary text-primary-foreground hover:bg-primary-hover shadow-md"
                >
                  {updateStatusMutation.isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>در حال ثبت...</span>
                    </>
                  ) : (
                    <span>ثبت و انتشار پاسخ</span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete.comment && (
        <ConfirmModal
          isOpen={confirmDelete.isOpen}
          onClose={() => setConfirmDelete({ isOpen: false, comment: null })}
          onConfirm={handleDeleteConfirm}
          title="حذف نظر یا سوال"
          description={
            <div className="space-y-2">
              <p>آیا از حذف این مورد اطمینان دارید؟</p>
              <div className="p-3 rounded-xl bg-muted/40 text-[11px] space-y-1">
                <div>
                  <strong className="text-foreground">نویسنده:</strong> {confirmDelete.comment.userName}
                </div>
                <div>
                  <strong className="text-foreground">محصول:</strong> {confirmDelete.comment.productName}
                </div>
                <div className="truncate">
                  <strong className="text-foreground">متن:</strong> "{confirmDelete.comment.text}"
                </div>
              </div>
            </div>
          }
          confirmText="حذف"
          cancelText="انصراف"
          variant="danger"
          isLoading={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
