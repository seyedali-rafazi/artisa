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
import FaqsTable from '@/components/admin/faqs/FaqsTable';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/hooks/useDebounce';
import { toPersianDigits } from '@/lib/utils';
import {
  HelpCircle,
  Plus,
  CheckCircle2,
  Power,
  FileQuestion,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminFaqsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const debouncedSearch = useDebounce(search, 350);

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
  const { data: rawFaqs, isLoading } = useAdminFAQs({
    search: debouncedSearch || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
  });
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
      const s = debouncedSearch.trim().toLowerCase();

      const matchesSearch = !s || q.includes(s) || a.includes(s);

      const isActive = faq.is_active !== false;
      let matchesStatus = true;
      if (statusFilter === 'active') matchesStatus = isActive;
      if (statusFilter === 'inactive') matchesStatus = !isActive;

      return matchesSearch && matchesStatus;
    });
  }, [allFaqs, debouncedSearch, statusFilter]);

  const totalCount = filteredFaqs.length;
  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const paginatedFaqs = useMemo(() => {
    const skip = (page - 1) * pageSize;
    return filteredFaqs.slice(skip, skip + pageSize);
  }, [filteredFaqs, page, pageSize]);

  // Statistics
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
  const handleMoveOrder = (currentIndex: number, direction: 'up' | 'down') => {
    const globalIndex = (page - 1) * pageSize + currentIndex;
    const targetIndex = direction === 'up' ? globalIndex - 1 : globalIndex + 1;
    if (targetIndex < 0 || targetIndex >= filteredFaqs.length) return;

    const currentItem = filteredFaqs[globalIndex];
    const targetItem = filteredFaqs[targetIndex];

    const currentOrder = currentItem.order ?? globalIndex + 1;
    const targetOrder = targetItem.order ?? targetIndex + 1;

    const newItems = [
      { id: currentItem.id, order: targetOrder },
      { id: targetItem.id, order: currentOrder === targetOrder ? targetOrder + (direction === 'up' ? 1 : -1) : currentOrder },
    ];

    reorderMutation.mutate(newItems, {
      onSuccess: () => {
        toast.success('ترتیب نمایش سوالات بروزرسانی شد');
      },
      onError: (err: any) => {
        toast.error(err?.message || 'خطا در تغییر ترتیب سوالات');
      },
    });
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-6 min-w-0 w-full" dir="rtl">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-foreground flex items-center gap-2">
            <HelpCircle className="size-6 text-primary" />
            <span>مدیریت سوالات متداول (FAQ)</span>
          </h1>
          <p className="text-xs text-muted-foreground font-semibold mt-1">
            ایجاد، ویرایش، تغییر ترتیب و مدیریت سوالات متداول کاربران بر پایه TanStack Table
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

      {/* Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-3xl bg-background/95 border border-border/60 shadow-xs backdrop-blur-xl flex items-center gap-4">
          <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <FileQuestion className="size-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-muted-foreground">کل سوالات ثبت شده</span>
            <span className="text-xl font-black text-foreground">
              {toPersianDigits(allFaqs.length)} مورد
            </span>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-background/95 border border-border/60 shadow-xs backdrop-blur-xl flex items-center gap-4">
          <div className="size-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="size-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-muted-foreground">سوالات فعال در سایت</span>
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
              {toPersianDigits(activeCount)} مورد
            </span>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-background/95 border border-border/60 shadow-xs backdrop-blur-xl flex items-center gap-4">
          <div className="size-12 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center shrink-0">
            <Power className="size-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-muted-foreground">سوالات غیرفعال</span>
            <span className="text-xl font-black text-muted-foreground">
              {toPersianDigits(inactiveCount)} مورد
            </span>
          </div>
        </div>
      </div>

      {/* TanStack FAQs Table */}
      <FaqsTable
        data={paginatedFaqs}
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
        onResetFilters={handleResetFilters}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        onToggleActive={handleToggleActive}
        onMoveOrder={handleMoveOrder}
        isReordering={reorderMutation.isPending}
      />

      {/* Create / Edit Dialog */}
      <FaqDialog
        isOpen={dialogState.isOpen}
        onClose={() => setDialogState({ isOpen: false, faqToEdit: null })}
        faqToEdit={dialogState.faqToEdit}
        nextOrder={nextOrder}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, faqId: '', faqQuestion: '' })}
        onConfirm={handleConfirmDelete}
        title="حذف سوال متداول"
        description={`آیا از حذف سوال «${deleteModal.faqQuestion}» اطمینان دارید؟`}
        confirmText="حذف دائمی"
        cancelText="انصراف"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
