'use client';

import React, { useState, useMemo } from 'react';
import {
  FAQItem,
  useAdminFAQs,
  useToggleFAQActive,
  useReorderFAQs,
  useDeleteFAQ,
} from '@/hooks/useFaqs';
import FaqDialog from '@/components/admin/FaqDialog';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toPersianDigits } from '@/lib/utils';
import {
  HelpCircle,
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  CheckCircle2,
  Power,
  ChevronUp,
  ChevronDown,
  FileQuestion,
  Filter,
  Sparkles,
  ArrowUpDown,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminFaqsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Dialog & Modal states
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    faqToEdit: FAQItem | null;
  }>({
    isOpen: false,
    faqToEdit: null,
  });

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    faqId: string;
    faqQuestion: string;
  }>({
    isOpen: false,
    faqId: '',
    faqQuestion: '',
  });

  // Queries & Mutations
  const { data: rawFaqs, isLoading, isError, refetch } = useAdminFAQs();
  const toggleActiveMutation = useToggleFAQActive();
  const reorderMutation = useReorderFAQs();
  const deleteMutation = useDeleteFAQ();

  const allFaqs = useMemo(() => {
    if (!rawFaqs) return [];
    return [...rawFaqs].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [rawFaqs]);

  // Filtered FAQs based on search and status
  const filteredFaqs = useMemo(() => {
    return allFaqs.filter((faq) => {
      const q = (faq.question || faq.q || '').toLowerCase();
      const a = (faq.answer || faq.a || '').toLowerCase();
      const s = search.trim().toLowerCase();

      const matchesSearch = !s || q.includes(s) || a.includes(s);

      const isActive = faq.is_active !== false;
      let matchesStatus = true;
      if (statusFilter === 'active') matchesStatus = isActive;
      if (statusFilter === 'inactive') matchesStatus = !isActive;

      return matchesSearch && matchesStatus;
    });
  }, [allFaqs, search, statusFilter]);

  // Statistics
  const totalCount = allFaqs.length;
  const activeCount = allFaqs.filter((f) => f.is_active !== false).length;
  const inactiveCount = allFaqs.filter((f) => f.is_active === false).length;

  const nextOrder = allFaqs.length > 0 ? Math.max(...allFaqs.map((f) => f.order ?? 0)) + 1 : 1;

  // Handlers
  const handleOpenCreate = () => {
    setDialogState({ isOpen: true, faqToEdit: null });
  };

  const handleOpenEdit = (faq: FAQItem) => {
    setDialogState({ isOpen: true, faqToEdit: faq });
  };

  const handleOpenDelete = (faq: FAQItem) => {
    setDeleteModal({
      isOpen: true,
      faqId: faq.id,
      faqQuestion: faq.question || faq.q || 'این سوال',
    });
  };

  const handleConfirmDelete = () => {
    if (!deleteModal.faqId) return;
    deleteMutation.mutate(deleteModal.faqId, {
      onSuccess: () => {
        toast.success('سوال متداول با موفقیت حذف شد');
        setDeleteModal({ isOpen: false, faqId: '', faqQuestion: '' });
      },
      onError: (err: any) => {
        toast.error(err?.message || 'خطا در حذف سوال متداول');
      },
    });
  };

  const handleToggleActive = (faq: FAQItem) => {
    toggleActiveMutation.mutate(faq.id, {
      onSuccess: () => {
        const nextState = faq.is_active === false;
        toast.success(nextState ? 'سوال متداول فعال شد' : 'سوال متداول غیرفعال شد');
      },
      onError: (err: any) => {
        toast.error(err?.message || 'خطا در تغییر وضعیت');
      },
    });
  };

  // Move FAQ up or down in order
  const handleMoveOrder = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= allFaqs.length) return;

    const currentItem = allFaqs[index];
    const targetItem = allFaqs[targetIndex];

    const currentOrder = currentItem.order ?? index + 1;
    const targetOrder = targetItem.order ?? targetIndex + 1;

    // Swap order numbers
    const newItems = [
      { id: currentItem.id, order: targetOrder },
      { id: targetItem.id, order: currentOrder === targetOrder ? targetOrder + (direction === 'up' ? 1 : -1) : currentOrder },
    ];

    reorderMutation.mutate(newItems, {
      onSuccess: () => {
        toast.success('ترتیب نمایش سوالات متداول با موفقیت بروزرسانی شد');
      },
      onError: (err: any) => {
        toast.error(err?.message || 'خطا در جابجایی ترتیب سوالات');
      },
    });
  };

  return (
    <div className="flex flex-col gap-6 min-w-0 w-full" dir="rtl">
      {/* ─── Header & Actions ─── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-foreground flex items-center gap-2">
            <HelpCircle className="size-6 text-primary" />
            <span>مدیریت سوالات متداول (FAQ)</span>
          </h1>
          <p className="text-xs text-muted-foreground font-semibold mt-1">
            ایجاد، ویرایش، مرتب‌سازی و مدیریت وضعیت انتشار سوالات و پاسخ‌های متداول کاربران
          </p>
        </div>

        <Button
          onClick={handleOpenCreate}
          className="rounded-2xl font-extrabold text-xs gap-2 cursor-pointer shadow-lg shadow-primary/25"
        >
          <Plus className="size-4" />
          <span>افزودن سوال جدید</span>
        </Button>
      </div>

      {/* ─── Metric Stat Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total FAQs */}
        <div className="rounded-3xl border border-border/60 bg-background/95 backdrop-blur-xl p-4 flex items-center gap-4 shadow-sm">
          <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <FileQuestion className="size-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground font-bold">کل سوالات ثبت‌شده</span>
            <span className="text-xl font-black text-foreground">
              {toPersianDigits(totalCount)} مورد
            </span>
          </div>
        </div>

        {/* Active FAQs */}
        <div className="rounded-3xl border border-border/60 bg-background/95 backdrop-blur-xl p-4 flex items-center gap-4 shadow-sm">
          <div className="size-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="size-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground font-bold">منتشر شده و فعال</span>
            <span className="text-xl font-black text-emerald-600">
              {toPersianDigits(activeCount)} سوال فعال
            </span>
          </div>
        </div>

        {/* Inactive FAQs */}
        <div className="rounded-3xl border border-border/60 bg-background/95 backdrop-blur-xl p-4 flex items-center gap-4 shadow-sm">
          <div className="size-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
            <Power className="size-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground font-bold">پیش‌نویس / غیرفعال</span>
            <span className="text-xl font-black text-foreground">
              {toPersianDigits(inactiveCount)} مورد
            </span>
          </div>
        </div>
      </div>

      {/* ─── Filters & Search Bar ─── */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-background/95 border border-border/60 p-4 rounded-3xl backdrop-blur-xl shadow-sm">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Input
            type="text"
            placeholder="جستجو در پرسش‌ها و پاسخ‌ها..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-2xl pr-9 text-xs h-11"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-muted/30 border border-border/60 self-stretch sm:self-auto shrink-0">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            همه ({toPersianDigits(totalCount)})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'active'
                ? 'bg-background text-emerald-600 shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            فعال ({toPersianDigits(activeCount)})
          </button>
          <button
            onClick={() => setStatusFilter('inactive')}
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

      {/* ─── FAQ Items List ─── */}
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-28 rounded-3xl bg-neutral-200 dark:bg-neutral-800 animate-pulse border border-border/40"
            />
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-16 rounded-3xl border border-destructive/20 bg-destructive/5 p-6 flex flex-col items-center gap-3">
          <span className="text-xs font-bold text-destructive">خطا در دریافت لیست سوالات متداول از سرور.</span>
          <Button onClick={() => refetch()} variant="outline" className="rounded-2xl text-xs">
            تلاش مجدد
          </Button>
        </div>
      ) : filteredFaqs.length > 0 ? (
        <div className="flex flex-col gap-3">
          {filteredFaqs.map((faq, idx) => {
            const isFirst = idx === 0;
            const isLast = idx === filteredFaqs.length - 1;
            const isActive = faq.is_active !== false;

            return (
              <div
                key={faq.id}
                className="group rounded-3xl border border-border/60 bg-background/95 hover:border-primary/40 transition-all duration-300 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs hover:shadow-md"
              >
                {/* Left side: Order controls + Question/Answer */}
                <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                  {/* Order & Move buttons */}
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleMoveOrder(idx, 'up')}
                      disabled={isFirst || reorderMutation.isPending}
                      title="حرکت به بالا (افزایش اولویت)"
                      className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 disabled:opacity-20 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      <ChevronUp className="size-4" />
                    </button>

                    <div
                      className="size-7 rounded-xl bg-muted/60 border border-border/80 flex items-center justify-center text-[11px] font-black text-foreground"
                      title={`ترتیب نمایش: ${faq.order ?? idx + 1}`}
                    >
                      {toPersianDigits(faq.order ?? idx + 1)}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleMoveOrder(idx, 'down')}
                      disabled={isLast || reorderMutation.isPending}
                      title="حرکت به پایین (کاهش اولویت)"
                      className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 disabled:opacity-20 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      <ChevronDown className="size-4" />
                    </button>
                  </div>

                  {/* Content Preview */}
                  <div className="flex flex-col gap-1.5 flex-1 min-w-0 pr-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-black text-xs sm:text-sm text-foreground">
                        {faq.question || faq.q}
                      </h3>

                      {/* Status Badge */}
                      {isActive ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black border border-emerald-500/20">
                          <span className="size-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                          <span>فعال</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xl bg-muted text-muted-foreground text-[10px] font-black border border-border">
                          <span>غیرفعال</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed font-medium">
                      {faq.answer || faq.a}
                    </p>
                  </div>
                </div>

                {/* Right side: Quick Switch and Action Buttons */}
                <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-border/40 shrink-0">
                  {/* Status Toggle Button */}
                  <button
                    type="button"
                    onClick={() => handleToggleActive(faq)}
                    disabled={toggleActiveMutation.isPending}
                    title={isActive ? 'کلیک برای غیرفعال‌سازی' : 'کلیک برای انتشار و فعال‌سازی'}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all border cursor-pointer ${
                      isActive
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 border-emerald-500/30'
                        : 'bg-muted/60 text-muted-foreground hover:bg-muted border-border/80'
                    }`}
                  >
                    <span
                      className={`size-2 rounded-full ${
                        isActive ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground/40'
                      }`}
                    />
                    <span>{isActive ? 'منتشر شده' : 'پیش‌نویس'}</span>
                  </button>

                  {/* Edit Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenEdit(faq)}
                    className="rounded-xl text-xs font-bold gap-1.5 h-9 cursor-pointer hover:border-primary/50"
                  >
                    <Edit className="size-3.5 text-primary" />
                    <span>ویرایش</span>
                  </Button>

                  {/* Delete Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDelete(faq)}
                    className="rounded-xl text-xs font-bold gap-1.5 h-9 text-destructive hover:bg-destructive/10 hover:border-destructive/30 cursor-pointer"
                  >
                    <Trash2 className="size-3.5" />
                    <span>حذف</span>
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
            <HelpCircle className="size-8" />
          </div>
          <div className="flex flex-col gap-1 max-w-sm">
            <span className="text-sm font-black text-foreground">
              {search || statusFilter !== 'all'
                ? 'موردی با شرایط جستجوی شما یافت نشد'
                : 'هنوز هیچ سوال متداولی ثبت نشده است'}
            </span>
            <span className="text-xs text-muted-foreground">
              {search || statusFilter !== 'all'
                ? 'لطفاً عبارت جستجو را پاک کنید یا فیلتر وضعیت را روی «همه» قرار دهید.'
                : 'با افزودن سوالات پرتکرار کاربران، تجربه خرید و اعتماد مشتریان را ارتقا دهید.'}
            </span>
          </div>
          {search || statusFilter !== 'all' ? (
            <Button
              variant="outline"
              onClick={() => {
                setSearch('');
                setStatusFilter('all');
              }}
              className="rounded-2xl text-xs mt-2"
            >
              پاک کردن فیلترها
            </Button>
          ) : (
            <Button
              onClick={handleOpenCreate}
              className="rounded-2xl text-xs font-extrabold gap-2 cursor-pointer shadow-md shadow-primary/20 mt-2"
            >
              <Plus className="size-4" />
              <span>افزودن اولین سوال متداول</span>
            </Button>
          )}
        </div>
      )}

      {/* ─── Add / Edit Modal Dialog ─── */}
      <FaqDialog
        isOpen={dialogState.isOpen}
        onClose={() => setDialogState({ isOpen: false, faqToEdit: null })}
        faqToEdit={dialogState.faqToEdit}
        nextOrder={nextOrder}
      />

      {/* ─── Confirm Delete Modal ─── */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, faqId: '', faqQuestion: '' })}
        onConfirm={handleConfirmDelete}
        title="حذف سوال متداول"
        description={`آیا از حذف دائم سوال «${deleteModal.faqQuestion}» اطمینان دارید؟ این عملیات قابل بازگشت نخواهد بود.`}
        confirmText="بله، حذف کن"
        cancelText="انصراف"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
