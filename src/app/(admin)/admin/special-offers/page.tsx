'use client';

import React, { useState } from 'react';
import {
  SpecialOffer,
  useAdminSpecialOffers,
  useToggleSpecialOfferActive,
  useDeleteSpecialOffer,
} from '@/hooks/useSpecialOffers';
import SpecialOfferDialog from '@/components/admin/SpecialOfferDialog';
import ConfirmModal from '@/components/ui/ConfirmModal';
import SpecialOffersTable from '@/components/admin/special-offers/SpecialOffersTable';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/hooks/useDebounce';
import { Sparkles, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSpecialOffersPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const debouncedSearch = useDebounce(search, 350);

  // Dialog & Modal states
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    offerToEdit: SpecialOffer | null;
  }>({
    isOpen: false,
    offerToEdit: null,
  });

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    offerId: string;
    offerTitle: string;
  }>({
    isOpen: false,
    offerId: '',
    offerTitle: '',
  });

  // Queries & Mutations
  const { data, isLoading } = useAdminSpecialOffers({
    page,
    limit: pageSize,
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
  });

  const toggleActiveMutation = useToggleSpecialOfferActive();
  const deleteMutation = useDeleteSpecialOffer();

  const offers = data?.items || [];
  const totalOffers = data?.total || 0;
  const totalPages = data?.total_pages || Math.ceil(totalOffers / pageSize) || 1;

  const handleOpenCreate = () => {
    setDialogState({ isOpen: true, offerToEdit: null });
  };

  const handleOpenEdit = (offer: SpecialOffer) => {
    setDialogState({ isOpen: true, offerToEdit: offer });
  };

  const handleOpenDelete = (offer: SpecialOffer) => {
    setDeleteModal({
      isOpen: true,
      offerId: offer.id,
      offerTitle: offer.title,
    });
  };

  const handleConfirmDelete = () => {
    if (!deleteModal.offerId) return;
    deleteMutation.mutate(deleteModal.offerId, {
      onSuccess: () => {
        toast.success('پیشنهاد ویژه با موفقیت حذف شد');
        setDeleteModal({ isOpen: false, offerId: '', offerTitle: '' });
      },
      onError: (err: any) => {
        toast.error(err?.message || 'خطا در حذف پیشنهاد ویژه');
      },
    });
  };

  const handleToggleActive = (offer: SpecialOffer) => {
    toggleActiveMutation.mutate(offer.id, {
      onSuccess: () => {
        const nextState = !offer.is_active;
        toast.success(nextState ? 'پیشنهاد ویژه با موفقیت فعال شد' : 'پیشنهاد ویژه با موفقیت غیرفعال شد');
      },
      onError: (err: any) => {
        toast.error(err?.message || 'خطا در تغییر وضعیت پیشنهاد ویژه');
      },
    });
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('');
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-6 min-w-0 w-full" dir="rtl">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-foreground flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            <span>پیشنهادات ویژه و کمپین‌های تخفیف</span>
          </h1>
          <p className="text-xs text-muted-foreground font-semibold mt-1">
            تعریف، زمان‌بندی بر اساس ساعت رسمی تهران و مدیریت کمپین‌ها بر پایه TanStack Table
          </p>
        </div>

        <Button
          onClick={handleOpenCreate}
          className="rounded-2xl font-extrabold text-xs gap-2 cursor-pointer shadow-lg shadow-primary/25"
        >
          <Plus className="size-4" />
          <span>افزودن پیشنهاد ویژه جدید</span>
        </Button>
      </div>

      {/* TanStack Special Offers Table */}
      <SpecialOffersTable
        data={offers}
        isLoading={isLoading}
        totalCount={totalOffers}
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
        isToggling={toggleActiveMutation.isPending}
      />

      {/* Create / Edit Dialog */}
      <SpecialOfferDialog
        isOpen={dialogState.isOpen}
        onClose={() => setDialogState({ isOpen: false, offerToEdit: null })}
        offerToEdit={dialogState.offerToEdit}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, offerId: '', offerTitle: '' })}
        onConfirm={handleConfirmDelete}
        title="حذف پیشنهاد ویژه"
        description={`آیا از حذف پیشنهاد ویژه «${deleteModal.offerTitle}» اطمینان دارید؟ این عمل غیرقابل بازگشت است.`}
        confirmText="حذف دائمی"
        cancelText="انصراف"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
