'use client';

import React, { useState } from 'react';
import {
  NewsletterSubscriberItem,
  useAdminNewsletterSubscribers,
  useToggleNewsletterSubscriberActive,
  useDeleteNewsletterSubscriber,
} from '@/hooks/useNewsletter';
import { useDebounce } from '@/hooks/useDebounce';
import NewsletterTable from '@/components/admin/newsletter/NewsletterTable';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { Button } from '@/components/ui/button';
import { toPersianDigits } from '@/lib/utils';
import {
  Newspaper,
  RefreshCw,
  Copy,
  Check,
  Users,
  UserCheck,
  UserX,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminNewsletterPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 350);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<string>('');

  // Copy states
  const [copiedAll, setCopiedAll] = useState(false);

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    subscriber: NewsletterSubscriberItem | null;
  }>({
    isOpen: false,
    subscriber: null,
  });

  // Queries & Mutations
  const is_active_param =
    statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined;

  const { data, isLoading, isError, refetch, isFetching } = useAdminNewsletterSubscribers({
    page,
    limit: pageSize,
    search: debouncedSearch.trim() || undefined,
    is_active: is_active_param,
    sort_by: sortBy || undefined,
    sort_order: sortOrder || undefined,
  });

  const toggleActiveMutation = useToggleNewsletterSubscriberActive();
  const deleteMutation = useDeleteNewsletterSubscriber();

  const subscribers: NewsletterSubscriberItem[] = data?.items || [];
  const total = data?.total || 0;
  const totalPages = data?.total_pages || 1;
  const activeCount = data?.active_count || 0;
  const inactiveCount = Math.max(0, total - activeCount);

  // Toggle active status
  const handleToggleActive = (sub: NewsletterSubscriberItem) => {
    toggleActiveMutation.mutate(sub.id, {
      onSuccess: () => {
        toast.success(
          sub.is_active
            ? 'وضعیت عضویت به غیرفعال تغییر یافت'
            : 'وضعیت عضویت با موفقیت فعال شد'
        );
      },
      onError: (err: any) => {
        toast.error(err?.message || 'خطا در تغییر وضعیت عضویت');
      },
    });
  };

  // Open delete modal
  const handleOpenDelete = (sub: NewsletterSubscriberItem) => {
    setDeleteModal({ isOpen: true, subscriber: sub });
  };

  // Confirm delete
  const handleConfirmDelete = () => {
    if (!deleteModal.subscriber) return;

    deleteMutation.mutate(deleteModal.subscriber.id, {
      onSuccess: () => {
        toast.success('عضو خبرنامه با موفقیت حذف شد');
        setDeleteModal({ isOpen: false, subscriber: null });
      },
      onError: (err: any) => {
        toast.error(err?.message || 'خطا در حذف عضو خبرنامه');
      },
    });
  };

  // Copy all visible active emails
  const handleCopyAllActive = () => {
    const activeEmails = subscribers
      .filter((s) => s.is_active)
      .map((s) => s.email)
      .join(', ');

    if (!activeEmails) {
      toast.error('هیچ ایمیل فعالی در این صفحه برای کپی وجود ندارد');
      return;
    }

    navigator.clipboard.writeText(activeEmails);
    setCopiedAll(true);
    toast.success('ایمیل‌های فعال با موفقیت در کلیپ‌بورد کپی شدند');
    setTimeout(() => setCopiedAll(false), 2500);
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setSortBy('');
    setSortOrder('');
    setPage(1);
  };

  const handleSortChange = (newSortBy: string, newSortOrder: string) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-6 min-w-0 w-full" dir="rtl">
      {/* ─── Header & Actions ─── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-foreground flex items-center gap-2.5">
            <div className="size-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Newspaper className="size-5" />
            </div>
            <span>مدیریت اعضای خبرنامه</span>
          </h1>
          <p className="text-xs text-muted-foreground font-semibold mt-1">
            مشاهده، مرتب‌سازی، مدیریت ستون‌ها، فیلتر وضعیت عضویت و استخراج ایمیل‌های کاربران
          </p>
        </div>

        <div className="flex items-center gap-2">
          {subscribers.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyAllActive}
              className="rounded-2xl text-xs font-bold gap-2 cursor-pointer h-10 border-border/60 hover:border-primary/40"
            >
              {copiedAll ? (
                <>
                  <Check className="size-3.5 text-emerald-600" />
                  <span className="text-emerald-600">کپی شد!</span>
                </>
              ) : (
                <>
                  <Copy className="size-3.5 text-primary" />
                  <span>کپی ایمیل‌های فعال</span>
                </>
              )}
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="rounded-2xl text-xs font-bold gap-2 cursor-pointer h-10 border-border/60 hover:border-primary/40"
          >
            <RefreshCw className={`size-3.5 ${isFetching ? 'animate-spin text-primary' : ''}`} />
            <span>بروزرسانی</span>
          </Button>
        </div>
      </div>

      {/* ─── Metric Stat Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Subscribers */}
        <div className="rounded-3xl border border-border/60 bg-background/95 backdrop-blur-xl p-4 flex items-center gap-4 shadow-xs">
          <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Users className="size-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground font-bold">کل مشترکین خبرنامه</span>
            <span className="text-xl font-black text-foreground">
              {toPersianDigits(total)} ایمیل
            </span>
          </div>
        </div>

        {/* Active Subscribers */}
        <div className="rounded-3xl border border-border/60 bg-background/95 backdrop-blur-xl p-4 flex items-center gap-4 shadow-xs">
          <div className="size-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <UserCheck className="size-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground font-bold">مشترکین فعال و دریافت‌کننده</span>
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
              {toPersianDigits(activeCount)} عضو فعال
            </span>
          </div>
        </div>

        {/* Inactive Subscribers */}
        <div className="rounded-3xl border border-border/60 bg-background/95 backdrop-blur-xl p-4 flex items-center gap-4 shadow-xs">
          <div className="size-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <UserX className="size-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground font-bold">مشترکین غیرفعال‌شده</span>
            <span className="text-xl font-black text-foreground">
              {toPersianDigits(inactiveCount)} عضو
            </span>
          </div>
        </div>
      </div>

      {/* ─── Newsletter Table Component ─── */}
      <NewsletterTable
        data={subscribers}
        isLoading={isLoading}
        totalCount={total}
        totalPages={totalPages}
        currentPage={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        searchQuery={search}
        onSearchChange={(q) => {
          setSearch(q);
          setPage(1);
        }}
        statusFilter={statusFilter}
        onStatusFilterChange={(status) => {
          setStatusFilter(status);
          setPage(1);
        }}
        onResetFilters={handleResetFilters}
        onSortChange={handleSortChange}
        onToggleActive={handleToggleActive}
        onDeleteSubscriber={handleOpenDelete}
        onCopyAllActive={handleCopyAllActive}
        hasCopiedAll={copiedAll}
      />

      {/* ─── Confirm Delete Modal ─── */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, subscriber: null })}
        onConfirm={handleConfirmDelete}
        title="حذف عضو خبرنامه"
        description={
          deleteModal.subscriber ? (
            <span>
              آیا از حذف دائم ایمیل «<strong className="text-foreground" dir="ltr">{deleteModal.subscriber.email}</strong>» از لیست خبرنامه اطمینان دارید؟
            </span>
          ) : (
            'آیا از حذف این عضو خبرنامه اطمینان دارید؟'
          )
        }
        confirmText="بله، حذف کن"
        cancelText="انصراف"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
