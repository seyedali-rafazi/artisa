'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  useAdminProducts,
  useArchiveProduct,
  useDeleteProduct,
  useRestoreProduct,
  useDuplicateProduct,
} from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/hooks/useDebounce';
import ConfirmModal from '@/components/ui/ConfirmModal';
import ProductSpecificationModal from '@/components/admin/ProductSpecificationModal';
import ProductsTable from '@/components/admin/products/ProductsTable';
import { Plus, SlidersHorizontal } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminProductsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [isSpecsModalOpen, setIsSpecsModalOpen] = useState(false);

  const debouncedSearch = useDebounce(search, 350);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'archive' | 'delete' | null;
    productId: string;
    productName: string;
  }>({
    isOpen: false,
    type: null,
    productId: '',
    productName: '',
  });

  const { data, isLoading } = useAdminProducts({
    page,
    limit: pageSize,
    search: debouncedSearch,
    status: statusFilter || undefined,
    category: categoryFilter || undefined,
  });

  const archiveMutation = useArchiveProduct();
  const deleteMutation = useDeleteProduct();
  const restoreMutation = useRestoreProduct();
  const duplicateMutation = useDuplicateProduct();

  const handleArchive = (id: string, name: string) => {
    setConfirmModal({ isOpen: true, type: 'archive', productId: id, productName: name });
  };

  const handleDelete = (id: string, name: string) => {
    setConfirmModal({ isOpen: true, type: 'delete', productId: id, productName: name });
  };

  const handleConfirmModalAction = () => {
    if (!confirmModal.productId) return;
    if (confirmModal.type === 'archive') {
      archiveMutation.mutate(confirmModal.productId, {
        onSuccess: () => {
          toast.success(`محصول «${confirmModal.productName}» به آرشیو منتقل شد.`);
          setConfirmModal({ isOpen: false, type: null, productId: '', productName: '' });
        },
        onError: (err: unknown) => {
          const message =
            err && typeof err === 'object' && 'response' in err
              ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
              : undefined;
          toast.error(message || 'خطا در آرشیو کردن محصول');
        },
      });
    } else if (confirmModal.type === 'delete') {
      deleteMutation.mutate(confirmModal.productId, {
        onSuccess: () => {
          toast.success(`محصول «${confirmModal.productName}» برای همیشه حذف شد.`);
          setConfirmModal({ isOpen: false, type: null, productId: '', productName: '' });
        },
        onError: (err: unknown) => {
          const message =
            err && typeof err === 'object' && 'response' in err
              ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
              : undefined;
          toast.error(message || 'خطا در حذف دائمی محصول');
        },
      });
    }
  };

  const handleRestore = (id: string) => {
    restoreMutation.mutate(id, {
      onSuccess: () => {
        toast.success('محصول با موفقیت از آرشیو بازیابی گردید.');
      },
      onError: (err: unknown) => {
        const message =
          err && typeof err === 'object' && 'response' in err
            ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
            : undefined;
        toast.error(message || 'خطا در بازیابی محصول');
      },
    });
  };

  const handleDuplicate = (id: string) => {
    duplicateMutation.mutate(id, {
      onSuccess: () => {
        toast.success('رونوشت جدید از محصول با موفقیت ایجاد گردید.');
      },
      onError: (err: unknown) => {
        const message =
          err && typeof err === 'object' && 'response' in err
            ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
            : undefined;
        toast.error(message || 'خطا در ایجاد رونوشت محصول');
      },
    });
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('');
    setCategoryFilter('');
    setPage(1);
  };

  const productsList = data?.items || [];
  const totalCount = data?.total || 0;
  const totalPages = data?.total_pages || Math.ceil(totalCount / pageSize) || 1;

  return (
    <div className="flex flex-col gap-6 min-w-0 w-full" dir="rtl">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-foreground">مدیریت محصولات</h1>
          <p className="text-xs text-muted-foreground font-semibold mt-1">
            مشاهده لیست محصولات، وضعیت انتشار، موجودی انبار و مدیریت کالاها بر پایه TanStack Table
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsSpecsModalOpen(true)}
            className="rounded-2xl font-bold text-xs gap-2 cursor-pointer border-border/80 hover:bg-muted/50"
          >
            <SlidersHorizontal className="size-4 text-primary" />
            <span>تنظیمات مشخصات فنی</span>
          </Button>

          <Link href="/admin/products/new">
            <Button className="rounded-2xl font-extrabold text-xs gap-2 cursor-pointer shadow-lg shadow-primary/25">
              <Plus className="size-4" />
              <span>افزودن محصول جدید</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* TanStack Products Table */}
      <ProductsTable
        data={productsList}
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
        categoryFilter={categoryFilter}
        onCategoryFilterChange={(category) => {
          setCategoryFilter(category);
          setPage(1);
        }}
        onResetFilters={handleResetFilters}
        onArchive={handleArchive}
        onDelete={handleDelete}
        onRestore={handleRestore}
        onDuplicate={handleDuplicate}
      />

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, type: null, productId: '', productName: '' })}
        onConfirm={handleConfirmModalAction}
        title={confirmModal.type === 'delete' ? 'حذف دائمی محصول' : 'آرشیو کردن محصول'}
        variant={confirmModal.type === 'delete' ? 'danger' : 'warning'}
        confirmText={confirmModal.type === 'delete' ? 'حذف دائمی' : 'آرشیو محصول'}
        isLoading={archiveMutation.isPending || deleteMutation.isPending}
        description={
          confirmModal.type === 'delete' ? (
            <span>
              آیا از حذف دائمی محصول <strong className="text-foreground font-black">«{confirmModal.productName}»</strong> اطمینان دارید؟ این عملیات غیرقابل بازگشت است و تمام تصاویر مرتبط نیز پاک خواهند شد.
            </span>
          ) : (
            <span>
              آیا از انتقال محصول <strong className="text-foreground font-black">«{confirmModal.productName}»</strong> به بایگانی (آرشیو) اطمینان دارید؟
            </span>
          )
        }
      />

      {/* Product Specification Settings Modal */}
      <ProductSpecificationModal
        isOpen={isSpecsModalOpen}
        onClose={() => setIsSpecsModalOpen(false)}
        defaultTab="manage"
      />
    </div>
  );
}
