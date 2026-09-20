'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  BannerItem,
  useAdminBanners,
  useToggleBannerActive,
  useReorderBanners,
  useDeleteBanner,
} from '@/hooks/useBanners';
import BannerPreviewModal from '@/components/admin/BannerPreviewModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import BannersTable from '@/components/admin/banners/BannersTable';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/hooks/useDebounce';
import { toPersianDigits } from '@/lib/utils';
import {
  Plus,
  Layers,
  CheckCircle2,
  Power,
  ImageIcon,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminBannersPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const debouncedSearch = useDebounce(search, 350);

  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean;
    banner: BannerItem | null;
  }>({
    isOpen: false,
    banner: null,
  });

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    bannerId: string;
    bannerTitle: string;
  }>({
    isOpen: false,
    bannerId: '',
    bannerTitle: '',
  });

  // Queries & Mutations
  const { data: rawBanners, isLoading } = useAdminBanners({
    search: debouncedSearch || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
  });
  const toggleActiveMutation = useToggleBannerActive();
  const reorderMutation = useReorderBanners();
  const deleteMutation = useDeleteBanner();

  const allBanners = useMemo(() => {
    if (!rawBanners) return [];
    return [...rawBanners].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [rawBanners]);

  // Filtered banners
  const filteredBanners = useMemo(() => {
    return allBanners.filter((b) => {
      const matchesSearch =
        !debouncedSearch.trim() ||
        (b.title && b.title.toLowerCase().includes(debouncedSearch.trim().toLowerCase())) ||
        (b.subtitle && b.subtitle.toLowerCase().includes(debouncedSearch.trim().toLowerCase()));

      const isActive = b.isActive !== false;
      let matchesStatus = true;
      if (statusFilter === 'active') matchesStatus = isActive;
      if (statusFilter === 'inactive') matchesStatus = !isActive;

      return matchesSearch && matchesStatus;
    });
  }, [allBanners, debouncedSearch, statusFilter]);

  // Paginated banners
  const totalCount = filteredBanners.length;
  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const paginatedBanners = useMemo(() => {
    const skip = (page - 1) * pageSize;
    return filteredBanners.slice(skip, skip + pageSize);
  }, [filteredBanners, page, pageSize]);

  // KPI Metrics
  const activeCount = allBanners.filter((b) => b.isActive !== false).length;
  const inactiveCount = allBanners.filter((b) => b.isActive === false).length;

  const handleOpenPreview = (banner: BannerItem) => {
    setPreviewModal({ isOpen: true, banner });
  };

  const handleOpenDelete = (banner: BannerItem) => {
    setDeleteModal({
      isOpen: true,
      bannerId: banner.id,
      bannerTitle: banner.title,
    });
  };

  const handleConfirmDelete = () => {
    if (!deleteModal.bannerId) return;

    deleteMutation.mutate(deleteModal.bannerId, {
      onSuccess: () => {
        toast.success('بنر با موفقیت حذف شد.');
        setDeleteModal({ isOpen: false, bannerId: '', bannerTitle: '' });
      },
      onError: (err: any) => {
        toast.error(err?.message || 'خطا در حذف بنر');
      },
    });
  };

  const handleToggleStatus = (banner: BannerItem) => {
    toggleActiveMutation.mutate(
      { id: banner.id, isActive: !banner.isActive },
      {
        onSuccess: (updated) => {
          const statusStr = updated.isActive ? 'فعال' : 'غیرفعال';
          toast.success(`وضعیت بنر به ${statusStr} تغییر یافت.`);
        },
        onError: (err: any) => {
          toast.error(err?.message || 'خطا در تغییر وضعیت بنر');
        },
      }
    );
  };

  // Reorder single banner up or down
  const handleMoveOrder = (currentIndex: number, direction: 'up' | 'down') => {
    const globalIndex = (page - 1) * pageSize + currentIndex;
    const targetIndex = direction === 'up' ? globalIndex - 1 : globalIndex + 1;
    if (targetIndex < 0 || targetIndex >= filteredBanners.length) return;

    const currentBanner = filteredBanners[globalIndex];
    const targetBanner = filteredBanners[targetIndex];

    const currentOrder = currentBanner.order ?? globalIndex + 1;
    const targetOrder = targetBanner.order ?? targetIndex + 1;

    const newItems = [
      { id: currentBanner.id, order: targetOrder },
      { id: targetBanner.id, order: currentOrder },
    ];

    reorderMutation.mutate(newItems, {
      onSuccess: () => {
        toast.success('ترتیب نمایش بنرها بروزرسانی شد.');
      },
      onError: (err: any) => {
        toast.error(err?.message || 'خطا در تغییر ترتیب بنرها');
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
            <Layers className="size-5 text-primary" />
            <span>مدیریت بنرهای اسلایدر صفحه اصلی</span>
          </h1>
          <p className="text-xs text-muted-foreground font-semibold mt-1">
            مشاهده، تنظیم تایپوگرافی، ترتیب نمایش و فعال‌سازی بنرها بر پایه TanStack Table
          </p>
        </div>

        <Link href="/admin/banners/new">
          <Button className="rounded-2xl font-extrabold text-xs gap-2 cursor-pointer shadow-lg shadow-primary/25">
            <Plus className="size-4" />
            <span>افزودن بنر جدید</span>
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex items-center gap-4 p-4 rounded-3xl bg-background/95 border border-border/60 shadow-xs backdrop-blur-xl">
          <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <ImageIcon className="size-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-muted-foreground">کل بنرهای موجود</span>
            <span className="text-xl font-black text-foreground">
              {toPersianDigits(allBanners.length)} عدد
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 rounded-3xl bg-background/95 border border-border/60 shadow-xs backdrop-blur-xl">
          <div className="size-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="size-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-muted-foreground">بنرهای فعال در اسلایدر</span>
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
              {toPersianDigits(activeCount)} عدد
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 rounded-3xl bg-background/95 border border-border/60 shadow-xs backdrop-blur-xl">
          <div className="size-12 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center shrink-0">
            <Power className="size-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-muted-foreground">بنرهای غیرفعال (پنهان)</span>
            <span className="text-xl font-black text-muted-foreground">
              {toPersianDigits(inactiveCount)} عدد
            </span>
          </div>
        </div>
      </div>

      {/* TanStack Banners Table */}
      <BannersTable
        data={paginatedBanners}
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
        onPreview={handleOpenPreview}
        onDelete={handleOpenDelete}
        onToggleStatus={handleToggleStatus}
        onMoveOrder={handleMoveOrder}
        isReordering={reorderMutation.isPending}
      />

      {/* Preview Modal */}
      <BannerPreviewModal
        isOpen={previewModal.isOpen}
        onClose={() => setPreviewModal({ isOpen: false, banner: null })}
        banner={previewModal.banner}
      />

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, bannerId: '', bannerTitle: '' })}
        onConfirm={handleConfirmDelete}
        title="حذف بنر"
        description={`آیا از حذف بنر «${deleteModal.bannerTitle}» اطمینان دارید؟ این عملیات غیرقابل بازگشت است.`}
        confirmText="حذف دائمی"
        cancelText="انصراف"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
