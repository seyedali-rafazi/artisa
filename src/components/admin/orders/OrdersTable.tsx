'use client';

import React, { useMemo, useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  VisibilityState,
  useReactTable,
} from '@tanstack/react-table';
import {
  Search,
  Sparkles,
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft,
  ChevronsRight,
  ChevronsLeft,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  Calendar,
  RotateCcw,
  Eye,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Clock,
  Copy,
  Check,
  User,
} from 'lucide-react';
import { AdminOrder } from '@/hooks/useAdmin';
import { formatShamsiDate, formatPersianPrice, toPersianDigits } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface OrdersTableProps {
  data: AdminOrder[];
  isLoading: boolean;
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  paymentStatusFilter: string;
  onPaymentStatusFilterChange: (status: string) => void;
  onResetFilters: () => void;
  onStatusChange: (orderId: string, newStatus: string) => void;
}

const columnHelper = createColumnHelper<AdminOrder>();

export default function OrdersTable({
  data,
  isLoading,
  totalCount,
  totalPages,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  paymentStatusFilter,
  onPaymentStatusFilterChange,
  onResetFilters,
  onStatusChange,
}: OrdersTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [isColumnMenuOpen, setIsColumnMenuOpen] = useState(false);
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);
  const columnMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (columnMenuRef.current && !columnMenuRef.current.contains(event.target as Node)) {
        setIsColumnMenuOpen(false);
      }
    }
    if (isColumnMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isColumnMenuOpen]);

  const handleCopyOrderId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedOrderId(id);
    setTimeout(() => setCopiedOrderId(null), 2000);
  };

  const getStatusBadge = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'delivered' || s === 'completed') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold text-[10px] border border-emerald-500/20">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          تحویل شده
        </span>
      );
    }
    if (s === 'shipped') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-extrabold text-[10px] border border-blue-500/20">
          <span className="size-1.5 rounded-full bg-blue-500" />
          ارسال شده
        </span>
      );
    }
    if (s === 'processing' || s === 'paid') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-extrabold text-[10px] border border-indigo-500/20">
          <span className="size-1.5 rounded-full bg-indigo-500 animate-pulse" />
          در حال پردازش
        </span>
      );
    }
    if (s === 'cancelled' || s === 'refunded') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-extrabold text-[10px] border border-rose-500/20">
          <span className="size-1.5 rounded-full bg-rose-500" />
          لغو شده
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-extrabold text-[10px] border border-amber-500/20">
        <span className="size-1.5 rounded-full bg-amber-500" />
        در انتظار
      </span>
    );
  };

  const getPaymentStatusBadge = (paymentStatus: string, hasReceipt: boolean) => {
    const p = (paymentStatus || '').toLowerCase();
    if (p === 'payment_approved' || p === 'paid') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold text-[10px] border border-emerald-500/20 whitespace-nowrap">
          <CheckCircle2 className="size-3" />
          پرداخت تایید شد
        </span>
      );
    }
    if (p === 'payment_rejected') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-extrabold text-[10px] border border-rose-500/20 whitespace-nowrap">
          <AlertCircle className="size-3" />
          پرداخت رد شد
        </span>
      );
    }
    if (p === 'payment_pending_review' || hasReceipt) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-extrabold text-[10px] border border-blue-500/20 whitespace-nowrap animate-pulse">
          <FileCheck className="size-3" />
          نیازمند بررسی فیش
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-extrabold text-[10px] border border-amber-500/20 whitespace-nowrap">
        <Clock className="size-3" />
        در انتظار پرداخت
      </span>
    );
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor('orderId', {
        id: 'orderId',
        header: ({ column }) => {
          const isSorted = column.getIsSorted();
          return (
            <button
              type="button"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="flex items-center gap-1.5 font-black hover:text-foreground transition-colors cursor-pointer select-none"
            >
              <span>کد سفارش</span>
              {isSorted === 'asc' ? (
                <ArrowUp className="size-3.5 text-primary" />
              ) : isSorted === 'desc' ? (
                <ArrowDown className="size-3.5 text-primary" />
              ) : (
                <ArrowUpDown className="size-3 text-muted-foreground/50 opacity-60 hover:opacity-100" />
              )}
            </button>
          );
        },
        cell: ({ row }) => {
          const o = row.original;
          const orderCode = o.orderId || o.id;
          const isCopied = copiedOrderId === orderCode;
          return (
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="font-mono font-extrabold text-foreground text-xs">{orderCode}</span>
              <button
                type="button"
                onClick={() => handleCopyOrderId(orderCode)}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                title="کپی کد سفارش"
              >
                {isCopied ? (
                  <Check className="size-3 text-emerald-500" />
                ) : (
                  <Copy className="size-3" />
                )}
              </button>
            </div>
          );
        },
      }),

      columnHelper.display({
        id: 'customer',
        header: () => <span className="font-black">مشتری</span>,
        cell: ({ row }) => {
          const o = row.original;
          const name = o.shippingAddress?.fullName || 'کاربر مهمان';
          const phone = o.shippingAddress?.phone || '';
          return (
            <div className="flex flex-col min-w-[130px] max-w-[200px]">
              <span className="font-extrabold text-foreground text-xs truncate" title={name}>
                {name}
              </span>
              {phone && (
                <span className="text-[10px] text-muted-foreground font-mono dir-ltr text-right">
                  {toPersianDigits(phone)}
                </span>
              )}
            </div>
          );
        },
      }),

      columnHelper.accessor('date', {
        id: 'date',
        header: ({ column }) => {
          const isSorted = column.getIsSorted();
          return (
            <button
              type="button"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="flex items-center gap-1.5 font-black hover:text-foreground transition-colors cursor-pointer select-none"
            >
              <span>تاریخ ثبت</span>
              {isSorted === 'asc' ? (
                <ArrowUp className="size-3.5 text-primary" />
              ) : isSorted === 'desc' ? (
                <ArrowDown className="size-3.5 text-primary" />
              ) : (
                <ArrowUpDown className="size-3 text-muted-foreground/50 opacity-60 hover:opacity-100" />
              )}
            </button>
          );
        },
        cell: ({ row }) => {
          const o = row.original;
          const d = o.date || o.created_at;
          return (
            <div className="flex items-center gap-1.5 text-muted-foreground font-semibold text-xs whitespace-nowrap">
              <Calendar className="size-3.5 text-muted-foreground/60" />
              <span>{d ? formatShamsiDate(d, 'medium') : '—'}</span>
            </div>
          );
        },
      }),

      columnHelper.accessor('totalPrice', {
        id: 'totalPrice',
        header: ({ column }) => {
          const isSorted = column.getIsSorted();
          return (
            <button
              type="button"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="flex items-center gap-1.5 font-black hover:text-foreground transition-colors cursor-pointer select-none"
            >
              <span>مبلغ کل</span>
              {isSorted === 'asc' ? (
                <ArrowUp className="size-3.5 text-primary" />
              ) : isSorted === 'desc' ? (
                <ArrowDown className="size-3.5 text-primary" />
              ) : (
                <ArrowUpDown className="size-3 text-muted-foreground/50 opacity-60 hover:opacity-100" />
              )}
            </button>
          );
        },
        cell: ({ row }) => {
          const price = row.original.totalPrice;
          return (
            <span className="font-black text-foreground text-xs whitespace-nowrap">
              {formatPersianPrice(price)}
            </span>
          );
        },
      }),

      columnHelper.accessor('paymentStatus', {
        id: 'paymentStatus',
        header: () => <span className="font-black">وضعیت پرداخت</span>,
        cell: ({ row }) => {
          const o = row.original;
          const hasReceipt = Boolean((o as any).paymentReceiptUrl || (o as any).paymentReceipt || o.receiptUrl);
          return getPaymentStatusBadge(o.paymentStatus || '', hasReceipt);
        },
      }),

      columnHelper.accessor('status', {
        id: 'status',
        header: ({ column }) => {
          const isSorted = column.getIsSorted();
          return (
            <button
              type="button"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="flex items-center gap-1.5 font-black hover:text-foreground transition-colors cursor-pointer select-none"
            >
              <span>وضعیت سفارش</span>
              {isSorted === 'asc' ? (
                <ArrowUp className="size-3.5 text-primary" />
              ) : isSorted === 'desc' ? (
                <ArrowDown className="size-3.5 text-primary" />
              ) : (
                <ArrowUpDown className="size-3 text-muted-foreground/50 opacity-60 hover:opacity-100" />
              )}
            </button>
          );
        },
        cell: ({ row }) => {
          return getStatusBadge(row.original.status || '');
        },
      }),

      columnHelper.display({
        id: 'quickStatus',
        header: () => <span className="font-black">تغییر وضعیت</span>,
        cell: ({ row }) => {
          const o = row.original;
          return (
            <select
              value={o.status || 'pending'}
              onChange={(e) => onStatusChange(o.orderId || o.id, e.target.value)}
              className="rounded-xl border border-border bg-background px-2.5 py-1 text-[11px] font-bold text-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="pending">در انتظار</option>
              <option value="processing">در حال پردازش</option>
              <option value="shipped">ارسال شده</option>
              <option value="delivered">تحویل شده</option>
              <option value="cancelled">لغو شده</option>
            </select>
          );
        },
      }),

      columnHelper.display({
        id: 'actions',
        header: () => <span className="text-left block font-black">بررسی</span>,
        cell: ({ row }) => {
          const o = row.original;
          const orderCode = o.orderId || o.id;
          return (
            <div className="flex items-center justify-end">
              <Link href={`/admin/orders/${orderCode}`}>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl text-xs gap-1.5 h-8 px-3 border-border hover:bg-muted font-bold cursor-pointer"
                >
                  <Eye className="size-3.5 text-primary" />
                  <span>مشاهده جزئیات</span>
                </Button>
              </Link>
            </div>
          );
        },
      }),
    ],
    [copiedOrderId, onStatusChange]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
  });

  const columnLabels: Record<string, string> = {
    orderId: 'کد سفارش',
    customer: 'مشتری',
    date: 'تاریخ ثبت',
    totalPrice: 'مبلغ کل',
    paymentStatus: 'وضعیت پرداخت',
    status: 'وضعیت سفارش',
    quickStatus: 'تغییر وضعیت',
  };

  const hasActiveFilters =
    searchQuery !== '' || statusFilter !== '' || paymentStatusFilter !== '';

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Table Toolbar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-background/95 border border-border/60 p-4 rounded-3xl backdrop-blur-xl shadow-xs">
        <div className="flex flex-col sm:flex-row items-center gap-3 flex-1">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Input
              type="text"
              placeholder="جستجوی کد سفارش، نام یا شماره تماس مشتری..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="rounded-2xl pr-10 pl-9 text-xs h-10 bg-background/50 border-border/70 focus:border-primary"
            />
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/70 pointer-events-none" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Order Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="rounded-2xl border border-border/70 bg-background/50 px-3.5 h-10 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-full sm:w-40 cursor-pointer"
          >
            <option value="">همه وضعیت‌های سفارش</option>
            <option value="pending">در انتظار</option>
            <option value="processing">در حال پردازش</option>
            <option value="shipped">ارسال شده</option>
            <option value="delivered">تحویل شده</option>
            <option value="cancelled">لغو شده</option>
          </select>

          {/* Payment Status Filter */}
          <select
            value={paymentStatusFilter}
            onChange={(e) => onPaymentStatusFilterChange(e.target.value)}
            className="rounded-2xl border border-border/70 bg-background/50 px-3.5 h-10 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-full sm:w-44 cursor-pointer"
          >
            <option value="">همه وضعیت‌های پرداخت</option>
            <option value="paid">پرداخت شده</option>
            <option value="payment_approved">تایید شده</option>
            <option value="payment_pending_review">نیازمند بررسی فیش</option>
            <option value="payment_rejected">رد شده</option>
            <option value="pending">در انتظار پرداخت</option>
          </select>
        </div>

        {/* Toolbar Secondary Actions */}
        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onResetFilters}
              className="rounded-2xl text-xs gap-1.5 h-10 px-3 border-border/70 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <RotateCcw className="size-3.5" />
              <span>بازنشانی</span>
            </Button>
          )}

          {/* Column Visibility Menu */}
          <div className="relative" ref={columnMenuRef}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsColumnMenuOpen(!isColumnMenuOpen)}
              className="rounded-2xl text-xs gap-1.5 h-10 px-3.5 border-border/70 hover:bg-muted font-bold text-foreground cursor-pointer"
            >
              <SlidersHorizontal className="size-3.5 text-primary" />
              <span>ستون‌ها</span>
            </Button>

            {isColumnMenuOpen && (
              <div className="absolute left-0 top-12 z-30 w-52 bg-background border border-border/80 rounded-2xl shadow-xl p-3 flex flex-col gap-1 animate-fade-in backdrop-blur-xl">
                <span className="text-[11px] font-black text-muted-foreground px-2 py-1 border-b border-border/40">
                  نمایش و پنهان‌سازی ستون‌ها
                </span>
                <div className="flex flex-col gap-1 max-h-56 overflow-y-auto mt-1 pr-1">
                  {table
                    .getAllLeafColumns()
                    .filter((col) => col.id !== 'actions')
                    .map((col) => {
                      const isVisible = col.getIsVisible();
                      return (
                        <label
                          key={col.id}
                          className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-muted/60 text-xs font-semibold cursor-pointer text-foreground select-none"
                        >
                          <input
                            type="checkbox"
                            checked={isVisible}
                            onChange={col.getToggleVisibilityHandler()}
                            className="size-3.5 rounded border-border text-primary focus:ring-primary accent-primary cursor-pointer"
                          />
                          <span>{columnLabels[col.id] || col.id}</span>
                        </label>
                      );
                    })}
                </div>
              </div>
            )}
          </div>

          {/* Total Count Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 h-10 rounded-2xl bg-primary/10 border border-primary/20 text-primary text-xs font-extrabold">
            <Sparkles className="size-3.5" />
            <span>
              {toPersianDigits(totalCount.toLocaleString('fa-IR'))} سفارش
            </span>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="rounded-3xl border border-border/60 bg-background/95 backdrop-blur-xl shadow-sm min-w-0 overflow-hidden">
        {isLoading ? (
          <div className="p-6 flex flex-col gap-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-16 w-full rounded-2xl bg-muted/30 animate-pulse border border-border/30"
              />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center justify-center gap-3">
            <div className="size-16 rounded-3xl bg-muted/40 flex items-center justify-center border border-border/50 text-muted-foreground/50">
              <ShoppingBag className="size-8" />
            </div>
            <h3 className="text-sm font-black text-foreground mt-1">هیچ سفارشی یافت نشد</h3>
            <p className="text-xs font-medium text-muted-foreground max-w-sm">
              سفارشی با فیلترهای جستجوی فعلی مطابقت ندارد. می‌توانید فیلترها را تغییر داده یا بازنشانی کنید.
            </p>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={onResetFilters}
                className="mt-2 rounded-2xl text-xs gap-1.5 border-border hover:bg-muted cursor-pointer"
              >
                <RotateCcw className="size-3.5" />
                <span>پاک کردن تمام فیلترها</span>
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto overscroll-x-contain">
            <table className="w-full min-w-[850px] text-right text-xs">
              <thead className="bg-muted/40 border-b border-border/50 font-black text-muted-foreground">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="p-4 whitespace-nowrap text-xs font-black tracking-wide"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-border/30 font-semibold">
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-muted/25 transition-colors group"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="p-4 whitespace-nowrap">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TanStack Pagination & Footer Bar */}
        {!isLoading && totalCount > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-border/50 bg-muted/15 text-xs text-muted-foreground">
            {/* Left/Start: Rows Per Page & Summary */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold">تعداد در هر صفحه:</span>
                <select
                  value={pageSize}
                  onChange={(e) => onPageSizeChange(Number(e.target.value))}
                  className="rounded-xl border border-border bg-background px-2.5 py-1 text-xs font-bold text-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value={10}>۱۰</option>
                  <option value={20}>۲۰</option>
                  <option value={50}>۵۰</option>
                </select>
              </div>

              <span className="text-[11px] font-bold">
                نمایش{' '}
                <strong className="text-foreground">
                  {toPersianDigits((currentPage - 1) * pageSize + 1)}
                </strong>{' '}
                تا{' '}
                <strong className="text-foreground">
                  {toPersianDigits(Math.min(currentPage * pageSize, totalCount))}
                </strong>{' '}
                از <strong className="text-foreground">{toPersianDigits(totalCount)}</strong> سفارش
              </span>
            </div>

            {/* Right/End: Page Navigator (RTL oriented) */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto justify-center sm:justify-end">
              {/* First Page */}
              <button
                type="button"
                title="صفحه اول"
                onClick={() => onPageChange(1)}
                disabled={currentPage <= 1}
                className="p-1.5 rounded-xl border border-border/60 hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer text-foreground"
              >
                <ChevronsRight className="size-4" />
              </button>

              {/* Prev Page */}
              <button
                type="button"
                title="صفحه قبلی"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="p-1.5 rounded-xl border border-border/60 hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer text-foreground"
              >
                <ChevronRight className="size-4" />
              </button>

              {/* Page Number Pills */}
              <div className="flex items-center gap-1 px-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, idx) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = idx + 1;
                  } else if (currentPage <= 3) {
                    pageNum = idx + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + idx;
                  } else {
                    pageNum = currentPage - 2 + idx;
                  }

                  const isActive = pageNum === currentPage;
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => onPageChange(pageNum)}
                      className={`min-w-8 h-8 px-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-xs'
                          : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {toPersianDigits(pageNum)}
                    </button>
                  );
                })}
              </div>

              {/* Next Page */}
              <button
                type="button"
                title="صفحه بعدی"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="p-1.5 rounded-xl border border-border/60 hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer text-foreground"
              >
                <ChevronLeft className="size-4" />
              </button>

              {/* Last Page */}
              <button
                type="button"
                title="صفحه آخر"
                onClick={() => onPageChange(totalPages)}
                disabled={currentPage >= totalPages}
                className="p-1.5 rounded-xl border border-border/60 hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer text-foreground"
              >
                <ChevronsLeft className="size-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
