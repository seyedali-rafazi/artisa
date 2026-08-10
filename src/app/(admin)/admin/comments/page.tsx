'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
  Star,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  Loader2,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { toast } from 'sonner';

export default function AdminCommentsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    comment: AdminComment | null;
  }>({
    isOpen: false,
    comment: null,
  });

  const { data, isLoading, refetch } = useAdminComments({
    page,
    limit: 10,
    search,
    status: statusFilter || undefined,
  });

  const updateStatusMutation = useUpdateAdminComment();
  const deleteMutation = useDeleteAdminComment();

  const handleUpdateStatus = (commentId: string, newStatus: string) => {
    updateStatusMutation.mutate(
      { commentId, status: newStatus },
      {
        onSuccess: () => {
          toast.success('وضعیت نظر با موفقیت بروزرسانی شد');
        },
        onError: () => {
          toast.error('خطا در تغییر وضعیت نظر');
        },
      }
    );
  };

  const handleDeleteConfirm = () => {
    if (!confirmDelete.comment) return;
    deleteMutation.mutate(confirmDelete.comment.id, {
      onSuccess: () => {
        toast.success('نظر با موفقیت حذف شد');
        setConfirmDelete({ isOpen: false, comment: null });
      },
      onError: () => {
        toast.error('خطا در حذف نظر');
      },
    });
  };

  const comments = data?.items || [];
  const totalComments = data?.total || 0;
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
            مدیریت نظرات و دیدگاه‌ها
          </h1>
          <p className="text-xs text-muted-foreground font-semibold mt-1">
            دیدگاه‌ها و امتیازهای ثبت شده توسط کاربران بر روی محصولات را بررسی و مدیریت کنید.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-muted border border-border/60 text-muted-foreground">
            مجموع نظرات: <strong className="text-foreground font-black">{totalComments}</strong>
          </span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="rounded-3xl border border-border/60 bg-background p-4 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-3 justify-between">
          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="جستجو در متن نظر، کاربر یا محصول..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pr-9 rounded-2xl text-xs bg-muted/20 border-border/40 focus:border-primary"
            />
          </div>

          {/* Status Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {[
              { label: 'همه نظرات', value: '' },
              { label: 'تایید شده', value: 'approved' },
              { label: 'در انتظار', value: 'pending' },
              { label: 'رد شده', value: 'rejected' },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => {
                  setStatusFilter(tab.value);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all shrink-0 cursor-pointer ${
                  statusFilter === tab.value
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Comments Table */}
      <div className="rounded-3xl border border-border/60 bg-background overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3 text-center">
            <Loader2 className="size-8 text-primary animate-spin" />
            <span className="text-xs font-bold text-muted-foreground">در حال دریافت نظرات...</span>
          </div>
        ) : comments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30 text-muted-foreground font-extrabold uppercase">
                  <th className="p-4">محصول</th>
                  <th className="p-4">نویسنده</th>
                  <th className="p-4">دیدگاه و امتیاز</th>
                  <th className="p-4">وضعیت</th>
                  <th className="p-4">تاریخ ثبت</th>
                  <th className="p-4 text-center">عملیات مدیریت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {comments.map((comment) => (
                  <tr key={comment.id} className="hover:bg-muted/20 transition-colors">
                    {/* Product */}
                    <td className="p-4 font-bold text-foreground max-w-[180px]">
                      <div className="flex flex-col gap-0.5">
                        <span className="truncate" title={comment.productName}>
                          {comment.productName || 'محصول'}
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

                    {/* Comment text & rating */}
                    <td className="p-4 max-w-md">
                      <div className="flex flex-col gap-1.5">
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
                        <p className="text-muted-foreground text-xs leading-relaxed line-clamp-2" title={comment.text}>
                          {comment.text}
                        </p>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-4">{getStatusBadge(comment.status)}</td>

                    {/* Date */}
                    <td className="p-4 text-muted-foreground font-semibold whitespace-nowrap">
                      {comment.date || (comment.created_at ? new Date(comment.created_at).toLocaleDateString('fa-IR') : '-')}
                    </td>

                    {/* Moderation Actions */}
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
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
                          title="حذف نظر"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-2">
            <MessageSquare className="size-10 text-muted-foreground/30" />
            <h3 className="text-sm font-bold text-foreground">هیچ نظری یافت نشد</h3>
            <p className="text-xs text-muted-foreground">
              با فیلترها یا عبارت جستجوی فعلی هیچ نظري پیدا نشد.
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

      {/* Delete Confirmation Modal */}
      {confirmDelete.comment && (
        <ConfirmModal
          isOpen={confirmDelete.isOpen}
          onClose={() => setConfirmDelete({ isOpen: false, comment: null })}
          onConfirm={handleDeleteConfirm}
          title="حذف نظر"
          description={
            <div className="space-y-2">
              <p>آیا از حذف این نظر اطمینان دارید؟</p>
              <div className="p-3 rounded-xl bg-muted/40 text-[11px] space-y-1">
                <div>
                  <strong className="text-foreground">نویسنده:</strong> {confirmDelete.comment.userName}
                </div>
                <div>
                  <strong className="text-foreground">محصول:</strong> {confirmDelete.comment.productName}
                </div>
                <div className="truncate">
                  <strong className="text-foreground">متن نظر:</strong> "{confirmDelete.comment.text}"
                </div>
              </div>
            </div>
          }
          confirmText="حذف نظر"
          cancelText="انصراف"
          variant="danger"
          isLoading={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
