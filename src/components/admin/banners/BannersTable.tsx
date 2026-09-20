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
  Edit,
  Trash2,
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
  ExternalLink,
  ChevronUp,
  ChevronDown,
  Power,
  Image as ImageIcon,
} from 'lucide-react';
import { BannerItem } from '@/hooks/useBanners';
import { formatShamsiDate, toPersianDigits } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface BannersTableProps {
  data: BannerItem[];
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
  onResetFilters: () => void;
  onPreview: (banner: BannerItem) => void;
  onDelete: (banner: BannerItem) => void;
  onToggleStatus: (banner: BannerItem) => void;
  onMoveOrder: (index: number, direction: 'up' | 'down') => void;
  isReordering?: boolean;
}

const columnHelper = createColumnHelper<BannerItem>();

export default function BannersTable({
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
  onResetFilters,
  onPreview,
  onDelete,
  onToggleStatus,
  onMoveOrder,
  isReordering = false,
}: BannersTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [isColumnMenuOpen, setIsColumnMenuOpen] = useState(false);
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

  const columns = useMemo(
    () => [
      columnHelper.accessor('title', {
        id: 'banner',
        header: ({ column }) => {
          const isSorted = column.getIsSorted();
          return (
            <button
              type="button"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="flex items-center gap-1.5 font-black hover:text-foreground transition-colors cursor-pointer select-none"
            >
              <span>تصویر و مشخصات بنر</span>
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
          const b = row.original;
          return (
            <div className="flex items-center gap-3 min-w-[220px] max-w-[360px]">
              {/* Thumbnail */}
              <div
                onClick={() => onPreview(b)}
                className="relative w-20 h-12 rounded-xl overflow-hidden border border-border/80 bg-muted/40 shrink-0 cursor-pointer group shadow-xs"
                title="کلیک برای پیش‌نمایش بزرگ"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={b.image}
                  alt={b.title}
                  className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Eye className="size-4 text-white" />
                </div>
              </div>

              {/* Title & Metadata */}
              <div className="flex flex-col min-w-0">
                <span className="font-extrabold text-foreground text-xs truncate" title={b.title}>
                  {b.title}
                </span>
                {b.subtitle && (
                  <span className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5" title={b.subtitle}>
                    {b.subtitle}
                  </span>
                )}
                {b.badge && (
                  <span className="inline-flex w-fit text-[9px] font-black px-1.5 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 mt-1">
                    {b.badge}
                  </span>
                )}
              </div>
            </div>
          );
        },
      }),

      columnHelper.accessor('link', {
        id: 'link',
        header: () => <span className="font-black">لینک مقصد</span>,
        cell: ({ row }) => {
          const b = row.original;
          if (!b.link) return <span className="text-muted-foreground/50 text-[11px]">—</span>;
          return (
            <div className="flex items-center gap-1.5 max-w-[160px] text-[11px]">
              <a
                href={b.link}
                target={b.linkOpenInNewTab ? '_blank' : '_self'}
                rel="noreferrer"
                className="text-primary hover:underline truncate dir-ltr text-right font-mono"
                title={b.link}
              >
                {b.link}
              </a>
              {b.linkOpenInNewTab && (
                <ExternalLink className="size-3 text-muted-foreground shrink-0" />
              )}
            </div>
          );
        },
      }),

      columnHelper.accessor('order', {
        id: 'order',
        header: ({ column }) => {
          const isSorted = column.getIsSorted();
          return (
            <button
              type="button"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="flex items-center gap-1.5 font-black hover:text-foreground transition-colors cursor-pointer select-none"
            >
              <span>ترتیب نمایش</span>
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
          const b = row.original;
          const idx = row.index;
          return (
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span className="font-mono font-black text-foreground text-xs min-w-5">
                {toPersianDigits(b.order ?? idx + 1)}
              </span>
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => onMoveOrder(idx, 'up')}
                  disabled={idx === 0 || isReordering}
                  title="انتقال به بالا"
                  className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                >
                  <ChevronUp className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onMoveOrder(idx, 'down')}
                  disabled={idx === data.length - 1 || isReordering}
                  title="انتقال به پایین"
                  className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                >
                  <ChevronDown className="size-3.5" />
                </button>
              </div>
            </div>
          );
        },
      }),

      columnHelper.accessor('isActive', {
        id: 'isActive',
        header: ({ column }) => {
          const isSorted = column.getIsSorted();
          return (
            <button
              type="button"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="flex items-center gap-1.5 font-black hover:text-foreground transition-colors cursor-pointer select-none"
            >
              <span>وضعیت انتشار</span>
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
          const b = row.original;
          const isActive = b.isActive !== false;
          return (
            <button
              type="button"
              onClick={() => onToggleStatus(b)}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black transition-all border cursor-pointer ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                  : 'bg-muted/60 text-muted-foreground border-border/70'
              }`}
            >
              <span
                className={`size-2 rounded-full ${
                  isActive ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground/50'
                }`}
              />
              <span>{isActive ? 'فعال' : 'غیرفعال'}</span>
            </button>
          );
        },
      }),

      columnHelper.accessor('created_at', {
        id: 'created_at',
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
          const d = row.original.created_at;
          return (
            <div className="flex items-center gap-1.5 text-muted-foreground font-semibold text-xs whitespace-nowrap">
              <Calendar className="size-3.5 text-muted-foreground/60" />
              <span>{d ? formatShamsiDate(d, 'medium') : '—'}</span>
            </div>
          );
        },
      }),

      columnHelper.display({
        id: 'actions',
        header: () => <span className="text-left block font-black">عملیات</span>,
        cell: ({ row }) => {
          const b = row.original;
          return (
            <div className="flex items-center justify-end gap-1.5">
              {/* Preview */}
              <button
                type="button"
                onClick={() => onPreview(b)}
                className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-primary transition-colors cursor-pointer border border-transparent hover:border-border/60"
                title="پیش‌نمایش بنر"
              >
                <Eye className="size-4" />
              </button>

              {/* Edit */}
              <Link href={`/admin/banners/${b.id}`}>
                <button
                  type="button"
                  className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-primary transition-colors cursor-pointer border border-transparent hover:border-border/60"
                  title="ویرایش بنر"
                >
                  <Edit className="size-4" />
                </button>
              </Link>

              {/* Delete */}
              <button
                type="button"
                onClick={() => onDelete(b)}
                className="p-2 rounded-xl hover:bg-rose-500/10 text-muted-foreground hover:text-rose-600 transition-colors cursor-pointer border border-transparent hover:border-border/60"
                title="حذف بنر"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          );
        },
      }),
    ],
    [data.length, isReordering, onMoveOrder, onPreview, onDelete, onToggleStatus]
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
    banner: 'تصویر و مشخصات بنر',
    link: 'لینک مقصد',
    order: 'ترتیب نمایش',
    isActive: 'وضعیت انتشار',
    created_at: 'تاریخ ثبت',
  };

  const hasActiveFilters = searchQuery !== '' || statusFilter !== 'all';

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Table Toolbar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-background/95 border border-border/60 p-4 rounded-3xl backdrop-blur-xl shadow-xs">
        <div className="flex flex-col sm:flex-row items-center gap-3 flex-1">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Input
              type="text"
              placeholder="جستجو در عنوان یا زیرعنوان بنر..."
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

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="rounded-2xl border border-border/70 bg-background/50 px-3.5 h-10 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-full sm:w-44 cursor-pointer"
          >
            <option value="all">همه وضعیت‌ها</option>
            <option value="active">فعال</option>
            <option value="inactive">غیرفعال</option>
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
              {toPersianDigits(totalCount.toLocaleString('fa-IR'))} بنر
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
              <ImageIcon className="size-8" />
            </div>
            <h3 className="text-sm font-black text-foreground mt-1">هیچ بنری یافت نشد</h3>
            <p className="text-xs font-medium text-muted-foreground max-w-sm">
              بنری با فیلترهای جستجوی فعلی مطابقت ندارد. می‌توانید فیلترها را بازنشانی کنید.
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
                از <strong className="text-foreground">{toPersianDigits(totalCount)}</strong> بنر
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
