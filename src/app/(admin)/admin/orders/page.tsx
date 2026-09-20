'use client';

import React, { useState } from 'react';
import { useAdminOrders, useUpdateOrderStatus } from '@/hooks/useAdmin';
import OrdersTable from '@/components/admin/orders/OrdersTable';
import { useDebounce } from '@/hooks/useDebounce';
import { ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminOrdersPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');

  const debouncedSearch = useDebounce(search, 350);

  const { data, isLoading } = useAdminOrders({
    page,
    limit: pageSize,
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
    paymentStatus: paymentStatusFilter || undefined,
  });

  const updateStatusMutation = useUpdateOrderStatus();

  const handleStatusChange = (orderId: string, newStatus: string) => {
    updateStatusMutation.mutate(
      { orderId, status: newStatus },
      {
        onSuccess: () => {
          toast.success('وضعیت سفارش با موفقیت بروزرسانی شد.');
        },
        onError: (err: any) => {
          toast.error(err?.message || 'خطا در تغییر وضعیت سفارش');
        },
      }
    );
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('');
    setPaymentStatusFilter('');
    setPage(1);
  };

  const ordersList = data?.items || [];
  const totalCount = data?.total || 0;
  const totalPages = data?.total_pages || Math.ceil(totalCount / pageSize) || 1;

  return (
    <div className="flex flex-col gap-6 min-w-0 w-full" dir="rtl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-foreground flex items-center gap-2">
          <ShoppingBag className="size-6 text-primary" />
          <span>مدیریت و بررسی پرداخت سفارشات</span>
        </h1>
        <p className="text-xs text-muted-foreground font-semibold mt-1">
          بررسی فیش‌های واریزی، تایید یا رد پرداخت‌ها و پیگیری مرسولات بر پایه TanStack Table
        </p>
      </div>

      {/* TanStack Orders Table */}
      <OrdersTable
        data={ordersList}
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
        paymentStatusFilter={paymentStatusFilter}
        onPaymentStatusFilterChange={(pStatus) => {
          setPaymentStatusFilter(pStatus);
          setPage(1);
        }}
        onResetFilters={handleResetFilters}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
