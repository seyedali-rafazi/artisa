'use client';

import React, { useState } from 'react';
import {
  useAdminComments,
  useUpdateAdminComment,
  useDeleteAdminComment,
  AdminComment,
} from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import ConfirmModal from '@/components/ui/ConfirmModal';
import CommentsTable from '@/components/admin/comments/CommentsTable';
import { useDebounce } from '@/hooks/useDebounce';
import {
  MessageSquare,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Reply,
  ShieldCheck,
  Send,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminCommentsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const debouncedSearch = useDebounce(search, 350);

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
    limit: pageSize,
    search: debouncedSearch || undefined,
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
          toast.success('وضعیت دیدگاه با موفقیت بروزرسانی شد.');
        },
        onError: () => {
          toast.error('خطا در تغییر وضعیت دیدگاه');
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
          toast.success('پاسخ با موفقیت ثبت و دیدگاه تایید گردید.');
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
        toast.success('دیدگاه با موفقیت حذف شد.');
        setConfirmDelete({ isOpen: false, comment: null });
      },
      onError: () => {
        toast.error('خطا در حذف دیدگاه');
      },
    });
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('');
    setTypeFilter('all');
    setPage(1);
  };

  const commentsList = data?.items || [];
  const totalCount = data?.total || 0;
  const totalPages = data?.total_pages || Math.ceil(totalCount / pageSize) || 1;

  return (
    <div className="flex flex-col gap-6 min-w-0 w-full" dir="rtl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-foreground flex items-center gap-2">
          <MessageSquare className="size-6 text-primary" />
          <span>مدیریت نظرات و پرسش‌های کاربران</span>
        </h1>
        <p className="text-xs text-muted-foreground font-semibold mt-1">
          بررسی، تایید، پاسخ‌گویی رسمی و نظارت بر دیدگاه‌ها بر پایه TanStack Table
        </p>
      </div>

      {/* TanStack Comments Table */}
      <CommentsTable
        data={commentsList}
        isLoading={isLoading}
        totalCount={totalCount}
        totalPages={totalPages}
        currentPage={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setPage(1);
        }}
        searchQuery={search}
        onSearchChange={(query) => {
          setSearch(query);
          setPage(1);
        }}
        statusFilter={statusFilter}
        onStatusFilterChange={(status) => {
          setStatusFilter(status);
          setPage(1);
        }}
        typeFilter={typeFilter}
        onTypeFilterChange={(type) => {
          setTypeFilter(type);
          setPage(1);
        }}
        onResetFilters={handleResetFilters}
        onUpdateStatus={handleUpdateStatus}
        onOpenReply={(comment) => {
          setReplyTarget(comment);
          setReplyText(comment.reply || '');
        }}
        onDelete={(comment) => {
          setConfirmDelete({ isOpen: true, comment });
        }}
      />

      {/* Reply Modal */}
      {replyTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl border border-border/80 bg-background p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="text-base font-black text-foreground flex items-center gap-2">
                <Reply className="size-4 text-primary" />
                <span>پاسخ رسمی به {replyTarget.userName || 'کاربر'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setReplyTarget(null)}
                className="p-1 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/50 text-xs text-muted-foreground space-y-1">
              <span className="font-extrabold text-foreground block">متن پیام کاربر:</span>
              <p className="line-clamp-4 leading-relaxed">{replyTarget.text}</p>
            </div>

            <form onSubmit={handleSendReply} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-foreground mb-1.5">
                  متن پاسخ کارشناس آرتیسا:
                </label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={4}
                  placeholder="پاسخ خود را اینجا بنویسید..."
                  className="w-full rounded-2xl border border-border/80 bg-background p-3.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setReplyTarget(null)}
                  className="rounded-xl text-xs font-bold"
                >
                  انصراف
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={updateStatusMutation.isPending}
                  className="rounded-xl text-xs font-extrabold gap-1.5 shadow-md shadow-primary/20"
                >
                  <Send className="size-3.5" />
                  <span>ثبت پاسخ و تایید</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, comment: null })}
        onConfirm={handleDeleteConfirm}
        title="حذف دیدگاه"
        description="آیا از حذف این دیدگاه اطمینان دارید؟ این عمل قابل بازگشت نیست."
        confirmText="حذف دائمی"
        cancelText="انصراف"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
