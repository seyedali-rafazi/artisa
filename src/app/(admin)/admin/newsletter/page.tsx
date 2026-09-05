'use client';

import React, { useState } from 'react';
import {
  NewsletterSubscriberItem,
  useAdminNewsletterSubscribers,
  useToggleNewsletterSubscriberActive,
  useDeleteNewsletterSubscriber,
} from '@/hooks/useNewsletter';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatShamsiDate, toPersianDigits } from '@/lib/utils';
import {
  Newspaper,
  Search,
  Trash2,
  CheckCircle2,
  Clock,
  RefreshCw,
  Copy,
  Check,
  Power,
  Users,
  UserCheck,
  UserX,
  X,
  ChevronRight,
  ChevronLeft,
  Mail,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminNewsletterPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Copy states
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
    limit: 10,
    search: search.trim() || undefined,
    is_active: is_active_param,
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

  // Copy single email
  const handleCopySingle = (email: string, id: string) => {
    navigator.clipboard.writeText(email);
    setCopiedId(id);
    toast.success('آدرس ایمیل کپی شد');
    setTimeout(() => setCopiedId(null), 2000);
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
            مشاهده، جستجو، مدیریت وضعیت عضویت و استخراج ایمیل‌های عضو خبرنامه فروشگاه
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

      {/* ─── Search & Status Filters ─── */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-background/95 border border-border/60 p-4 rounded-3xl backdrop-blur-xl shadow-xs">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Input
            type="text"
            placeholder="جستجو بر اساس آدرس ایمیل..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="rounded-2xl pr-9 text-xs h-11 border-border/50"
            dir="ltr"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          {search && (
            <button
              onClick={() => {
                setSearch('');
                setPage(1);
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-muted/30 border border-border/60 self-stretch sm:self-auto shrink-0">
          <button
            onClick={() => {
              setStatusFilter('all');
              setPage(1);
            }}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            همه ({toPersianDigits(total)})
          </button>
          <button
            onClick={() => {
              setStatusFilter('active');
              setPage(1);
            }}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'active'
                ? 'bg-background text-emerald-600 shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            فعال ({toPersianDigits(activeCount)})
          </button>
          <button
            onClick={() => {
              setStatusFilter('inactive');
              setPage(1);
            }}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'inactive'
                ? 'bg-background text-amber-600 shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            غیرفعال ({toPersianDigits(inactiveCount)})
          </button>
        </div>
      </div>

      {/* ─── Subscribers List ─── */}
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-20 rounded-3xl bg-neutral-200 dark:bg-neutral-800/60 animate-pulse border border-border/40"
            />
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-16 rounded-3xl border border-destructive/20 bg-destructive/5 p-6 flex flex-col items-center gap-3">
          <span className="text-xs font-bold text-destructive">خطا در دریافت لیست اعضای خبرنامه از سرور.</span>
          <Button onClick={() => refetch()} variant="outline" className="rounded-2xl text-xs">
            تلاش مجدد
          </Button>
        </div>
      ) : subscribers.length > 0 ? (
        <div className="flex flex-col gap-3">
          {subscribers.map((sub) => {
            const isActive = sub.is_active !== false;

            return (
              <div
                key={sub.id}
                className="group rounded-3xl border border-border/60 bg-background/95 hover:border-primary/40 transition-all duration-200 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs hover:shadow-md"
              >
                {/* Left side: Icon, Email, Status badge, Date */}
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <div
                    className={`size-11 rounded-2xl flex items-center justify-center shrink-0 ${
                      isActive
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <Mail className="size-5" />
                  </div>

                  <div className="flex flex-col gap-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <a
                        href={`mailto:${sub.email}`}
                        dir="ltr"
                        className="font-black text-xs sm:text-sm text-foreground hover:text-primary transition-colors"
                      >
                        {sub.email}
                      </a>

                      {/* Status Badge */}
                      {isActive ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black border border-emerald-500/20">
                          <span className="size-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                          <span>فعال</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xl bg-muted text-muted-foreground text-[10px] font-bold border border-border/60">
                          <span>غیرفعال</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <Clock className="size-3" />
                      <span>تاریخ عضویت: {formatShamsiDate(sub.created_at, 'time')}</span>
                    </div>
                  </div>
                </div>

                {/* Right side: Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-border/40 shrink-0">
                  {/* Copy Email Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopySingle(sub.email, sub.id)}
                    className="rounded-xl text-xs font-bold gap-1.5 h-9 cursor-pointer hover:border-primary/50"
                  >
                    {copiedId === sub.id ? (
                      <>
                        <Check className="size-3.5 text-emerald-600" />
                        <span className="text-emerald-600">کپی شد</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3.5 text-muted-foreground" />
                        <span className="hidden md:inline">کپی ایمیل</span>
                      </>
                    )}
                  </Button>

                  {/* Toggle Status Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleActive(sub)}
                    disabled={toggleActiveMutation.isPending}
                    title={isActive ? 'غیرفعال‌سازی دریافت خبرنامه' : 'فعال‌سازی مجدد'}
                    className={`rounded-xl text-xs font-bold gap-1.5 h-9 cursor-pointer ${
                      isActive
                        ? 'text-amber-600 hover:bg-amber-500/10 hover:border-amber-500/30'
                        : 'text-emerald-600 hover:bg-emerald-500/10 hover:border-emerald-500/30'
                    }`}
                  >
                    <Power className="size-3.5" />
                    <span>{isActive ? 'غیرفعال‌سازی' : 'فعال‌سازی'}</span>
                  </Button>

                  {/* Delete Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDelete(sub)}
                    className="rounded-xl text-xs font-bold gap-1.5 h-9 text-destructive hover:bg-destructive/10 hover:border-destructive/30 cursor-pointer"
                  >
                    <Trash2 className="size-3.5" />
                    <span className="hidden md:inline">حذف</span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-3xl border border-dashed border-border/80 bg-background/50 p-12 text-center flex flex-col items-center justify-center gap-4">
          <div className="size-16 rounded-3xl bg-muted/60 flex items-center justify-center text-muted-foreground">
            <Newspaper className="size-8" />
          </div>
          <div className="flex flex-col gap-1 max-w-sm">
            <span className="text-sm font-black text-foreground">
              {search || statusFilter !== 'all'
                ? 'عضوی با شرایط جستجوی شما یافت نشد'
                : 'هنوز هیچ ایمیلی در خبرنامه ثبت نشده است'}
            </span>
            <span className="text-xs text-muted-foreground">
              {search || statusFilter !== 'all'
                ? 'لطفاً عبارت جستجو را پاک کرده یا فیلتر وضعیت را روی «همه» قرار دهید.'
                : 'ایمیل‌های وارد شده در نوار خبرنامه فوتر سایت در این بخش ذخیره و مدیریت خواهند شد.'}
            </span>
          </div>
          {(search || statusFilter !== 'all') && (
            <Button
              variant="outline"
              onClick={() => {
                setSearch('');
                setStatusFilter('all');
                setPage(1);
              }}
              className="rounded-2xl text-xs mt-2"
            >
              پاک کردن فیلترها
            </Button>
          )}
        </div>
      )}

      {/* ─── Pagination Controls ─── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-4 p-4 rounded-3xl bg-background/95 border border-border/60 shadow-xs">
          <span className="text-xs text-muted-foreground font-semibold">
            صفحه {toPersianDigits(page)} از {toPersianDigits(totalPages)} (مجموع{' '}
            {toPersianDigits(total)} مشترک)
          </span>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || isLoading}
              className="rounded-xl text-xs font-bold gap-1 cursor-pointer h-9"
            >
              <ChevronRight className="size-4" />
              <span>قبلی</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || isLoading}
              className="rounded-xl text-xs font-bold gap-1 cursor-pointer h-9"
            >
              <span>بعدی</span>
              <ChevronLeft className="size-4" />
            </Button>
          </div>
        </div>
      )}

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
