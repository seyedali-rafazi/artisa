'use client';

import React, { useMemo, useState, useRef, useEffect } from 'react';
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
  CheckCircle2,
  Clock,
  Trash2,
  Eye,
  Mail,
  MailOpen,
  Check,
  User,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { ContactMessageItem } from '@/hooks/useContactMessages';
import { formatShamsiDate, toPersianDigits } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface ContactMessagesTableProps {
  data: ContactMessageItem[];
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
  onStatusFilterChange: (status: 'all' | 'unread' | 'read') => void;
  onResetFilters: () => void;
  onSortChange?: (sortBy: string, sortOrder: string) => void;
  onViewMessage: (message: ContactMessageItem) => void;
  onToggleStatus: (message: ContactMessageItem) => void;
  onDeleteMessage: (message: ContactMessageItem) => void;
}

const columnHelper = createColumnHelper<ContactMessageItem>();

export default function ContactMessagesTable({
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
  onSortChange,
  onViewMessage,
  onToggleStatus,
  onDeleteMessage,
}: ContactMessagesTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [isColumnMenuOpen, setIsColumnMenuOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
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

  const handleCopyEmail = (email: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(email);
    setCopiedId(id);
    toast.success('ایمیل در کلیپ‌بورد کپی شد');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        id: 'name',
        header: ({ column }) => {
          const isSorted = column.getIsSorted();
          return (
            <button
              onClick={() => column.toggleSorting(isSorted === 'asc')}
              className="flex items-center gap-1.5 font-bold hover:text-primary transition-colors cursor-pointer"
            >
              <span>نام فرستنده</span>
              {isSorted === 'asc' ? (
                <ArrowUp className="size-3.5 text-primary" />
              ) : isSorted === 'desc' ? (
                <ArrowDown className="size-3.5 text-primary" />
              ) : (
                <ArrowUpDown className="size-3.5 text-muted-foreground/60" />
              )}
            </button>
          );
        },
        cell: (info) => {
          const msg = info.row.original;
          const isUnread = msg.status === 'unread';
          return (
            <div className="flex items-center gap-3">
              <div
                className={`size-10 rounded-2xl flex items-center justify-center shrink-0 ${
                  isUnread
                    ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                    : 'bg-primary/10 text-primary'
                }`}
              >
                {isUnread ? <Mail className="size-5" /> : <User className="size-5" />}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-black text-xs sm:text-sm text-foreground truncate">
                  {info.getValue() || 'کاربر ناشناس'}
                </span>
                <span className="text-[11px] text-muted-foreground font-mono truncate" dir="ltr">
                  {msg.email}
                </span>
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor('email', {
        id: 'email',
        header: ({ column }) => {
          const isSorted = column.getIsSorted();
          return (
            <button
              onClick={() => column.toggleSorting(isSorted === 'asc')}
              className="flex items-center gap-1.5 font-bold hover:text-primary transition-colors cursor-pointer"
            >
              <span>ایمیل</span>
              {isSorted === 'asc' ? (
                <ArrowUp className="size-3.5 text-primary" />
              ) : isSorted === 'desc' ? (
                <ArrowDown className="size-3.5 text-primary" />
              ) : (
                <ArrowUpDown className="size-3.5 text-muted-foreground/60" />
              )}
            </button>
          );
        },
        cell: (info) => {
          const email = info.getValue();
          const rowId = info.row.original.id;
          const isCopied = copiedId === rowId;
          return (
            <div className="flex items-center gap-2" dir="ltr">
              <a
                href={`mailto:${email}`}
                className="text-xs font-semibold text-primary hover:underline truncate max-w-[180px]"
                onClick={(e) => e.stopPropagation()}
              >
                {email}
              </a>
              <button
                type="button"
                onClick={(e) => handleCopyEmail(email, rowId, e)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer shrink-0"
                title="کپی ایمیل"
              >
                {isCopied ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
              </button>
            </div>
          );
        },
      }),
      columnHelper.accessor('message', {
        id: 'message',
        header: 'متن پیام',
        cell: (info) => {
          const text = info.getValue();
          return (
            <p
              className="text-xs text-muted-foreground line-clamp-2 max-w-sm sm:max-w-md font-medium leading-relaxed"
              title={text}
            >
              {text}
            </p>
          );
        },
      }),
      columnHelper.accessor('created_at', {
        id: 'created_at',
        header: ({ column }) => {
          const isSorted = column.getIsSorted();
          return (
            <button
              onClick={() => column.toggleSorting(isSorted === 'asc')}
              className="flex items-center gap-1.5 font-bold hover:text-primary transition-colors cursor-pointer"
            >
              <span>تاریخ ارسال</span>
              {isSorted === 'asc' ? (
                <ArrowUp className="size-3.5 text-primary" />
              ) : isSorted === 'desc' ? (
                <ArrowDown className="size-3.5 text-primary" />
              ) : (
                <ArrowUpDown className="size-3.5 text-muted-foreground/60" />
              )}
            </button>
          );
        },
        cell: (info) => {
          const date = info.getValue();
          if (!date) return <span className="text-xs text-muted-foreground">-</span>;
          return (
            <div className="flex flex-col gap-0.5 text-xs text-muted-foreground font-medium">
              <div className="flex items-center gap-1.5">
                <Calendar className="size-3 text-muted-foreground/70" />
                <span>{formatShamsiDate(date, 'short')}</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground/60">
                <Clock className="size-2.5" />
                <span>{formatShamsiDate(date, 'time')}</span>
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor('status', {
        id: 'status',
        header: ({ column }) => {
          const isSorted = column.getIsSorted();
          return (
            <button
              onClick={() => column.toggleSorting(isSorted === 'asc')}
              className="flex items-center gap-1.5 font-bold hover:text-primary transition-colors cursor-pointer"
            >
              <span>وضعیت</span>
              {isSorted === 'asc' ? (
                <ArrowUp className="size-3.5 text-primary" />
              ) : isSorted === 'desc' ? (
                <ArrowDown className="size-3.5 text-primary" />
              ) : (
                <ArrowUpDown className="size-3.5 text-muted-foreground/60" />
              )}
            </button>
          );
        },
        cell: (info) => {
          const isUnread = info.getValue() === 'unread';
          if (isUnread) {
            return (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 whitespace-nowrap">
                <span className="size-1.5 rounded-full bg-rose-500 inline-block animate-pulse" />
                خوانده نشده
              </span>
            );
          }
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
              <CheckCircle2 className="size-3" />
              خوانده شده
            </span>
          );
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: 'عملیات',
        cell: ({ row }) => {
          const msg = row.original;
          const isUnread = msg.status === 'unread';
          return (
            <div
              className="flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onViewMessage(msg)}
                title="مشاهده کامل پیام"
                className="size-8 rounded-xl text-primary hover:bg-primary/10 transition-colors cursor-pointer"
              >
                <Eye className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onToggleStatus(msg)}
                title={isUnread ? 'علامت به عنوان خوانده‌شده' : 'علامت به عنوان خوانده‌نشده'}
                className={`size-8 rounded-xl transition-colors cursor-pointer ${
                  isUnread
                    ? 'text-emerald-600 hover:bg-emerald-500/10'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                {isUnread ? <Check className="size-4" /> : <Mail className="size-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDeleteMessage(msg)}
                title="حذف پیام"
                className="size-8 rounded-xl text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          );
        },
      }),
    ],
    [copiedId, onViewMessage, onToggleStatus, onDeleteMessage]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
    },
    onSortingChange: (updater) => {
      const nextSorting = typeof updater === 'function' ? updater(sorting) : updater;
      setSorting(nextSorting);
      if (onSortChange && nextSorting.length > 0) {
        onSortChange(nextSorting[0].id, nextSorting[0].desc ? 'desc' : 'asc');
      } else if (onSortChange) {
        onSortChange('', '');
      }
    },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualSorting: true,
  });

  const columnLabels: Record<string, string> = {
    name: 'نام فرستنده',
    email: 'ایمیل',
    message: 'متن پیام',
    created_at: 'تاریخ ارسال',
    status: 'وضعیت',
    actions: 'عملیات',
  };

  const hasActiveFilters = searchQuery !== '' || statusFilter !== 'all';

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* ─── Filter & Search Toolbar ─── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-background/95 border border-border/60 p-4 rounded-3xl backdrop-blur-xl shadow-xs">
        {/* Search */}
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="جستجو در نام، ایمیل، یا متن پیام..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="rounded-2xl pr-9 text-xs h-11 border-border/50"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-muted/30 border border-border/60">
            <button
              onClick={() => onStatusFilterChange('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              همه
            </button>
            <button
              onClick={() => onStatusFilterChange('unread')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'unread'
                  ? 'bg-background text-rose-600 shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              خوانده نشده
            </button>
            <button
              onClick={() => onStatusFilterChange('read')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'read'
                  ? 'bg-background text-emerald-600 shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              خوانده شده
            </button>
          </div>

          {/* Column Visibility Menu */}
          <div className="relative" ref={columnMenuRef}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsColumnMenuOpen(!isColumnMenuOpen)}
              className="h-11 rounded-2xl gap-2 text-xs font-bold border-border/60 hover:border-primary/40 cursor-pointer"
            >
              <SlidersHorizontal className="size-3.5 text-muted-foreground" />
              <span>ستون‌ها</span>
            </Button>

            {isColumnMenuOpen && (
              <div className="absolute left-0 mt-2 w-48 rounded-2xl bg-background/95 backdrop-blur-xl border border-border/60 shadow-xl p-2.5 z-40 flex flex-col gap-1 text-right">
                <span className="text-[11px] font-black text-muted-foreground px-2 py-1">
                  نمایش ستون‌ها
                </span>
                {table
                  .getAllColumns()
                  .filter((col) => col.getCanHide())
                  .map((col) => {
                    const isVisible = col.getIsVisible();
                    return (
                      <label
                        key={col.id}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-muted/50 text-xs font-bold cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={isVisible}
                          onChange={col.getToggleVisibilityHandler()}
                          className="rounded text-primary focus:ring-primary size-3.5 accent-primary cursor-pointer"
                        />
                        <span>{columnLabels[col.id] || col.id}</span>
                      </label>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onResetFilters}
              className="h-11 rounded-2xl gap-1.5 text-xs font-bold text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
            >
              <RotateCcw className="size-3.5" />
              <span>حذف فیلترها</span>
            </Button>
          )}
        </div>
      </div>

      {/* ─── Table Body Container ─── */}
      <div className="rounded-3xl border border-border/60 bg-background/95 backdrop-blur-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-right text-xs">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className="border-b border-border/50 bg-muted/20 text-muted-foreground font-black"
                >
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="py-4 px-4 whitespace-nowrap text-right">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-border/40 font-medium">
              {isLoading ? (
                Array.from({ length: Math.min(pageSize, 6) }).map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    {table.getVisibleLeafColumns().map((col) => (
                      <td key={col.id} className="py-4 px-4">
                        <div className="h-5 rounded-xl bg-muted/60" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td
                    colSpan={table.getVisibleLeafColumns().length}
                    className="py-16 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="size-14 rounded-3xl bg-muted/60 flex items-center justify-center text-muted-foreground">
                        <Mail className="size-7" />
                      </div>
                      <div className="flex flex-col gap-1 max-w-sm">
                        <span className="text-sm font-black text-foreground">
                          {hasActiveFilters
                            ? 'پیامی با شرایط جستجوی شما یافت نشد'
                            : 'هنوز هیچ پیام تماسی ثبت نشده است'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {hasActiveFilters
                            ? 'لطفاً عبارت جستجو را پاک کرده یا فیلتر را روی «همه» قرار دهید.'
                            : 'پیام‌های ارسال شده از طریق صفحه تماس با ما در اینجا نمایش داده می‌شوند.'}
                        </span>
                      </div>
                      {hasActiveFilters && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={onResetFilters}
                          className="rounded-2xl text-xs mt-1 cursor-pointer"
                        >
                          پاک کردن فیلترها
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => {
                  const isUnread = row.original.status === 'unread';
                  return (
                    <tr
                      key={row.id}
                      onClick={() => onViewMessage(row.original)}
                      className={`hover:bg-primary/[0.03] transition-colors cursor-pointer ${
                        isUnread ? 'bg-rose-500/[0.02] dark:bg-rose-500/[0.04]' : ''
                      }`}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="py-3.5 px-4">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ─── Pagination Footer ─── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-border/50 bg-muted/10">
          <div className="flex items-center gap-3 text-xs text-muted-foreground font-semibold">
            <span>
              نمایش {toPersianDigits(data.length > 0 ? (currentPage - 1) * pageSize + 1 : 0)} تا{' '}
              {toPersianDigits(Math.min(currentPage * pageSize, totalCount))} از مجموع{' '}
              {toPersianDigits(totalCount)} پیام
            </span>

            <div className="flex items-center gap-1.5 mr-2">
              <span className="text-[11px]">تعداد:</span>
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="rounded-xl border border-border/60 bg-background px-2 py-1 text-xs font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                {[10, 20, 50, 100].map((size) => (
                  <option key={size} value={size}>
                    {toPersianDigits(size)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(1)}
              disabled={currentPage <= 1 || isLoading}
              className="size-8 rounded-xl cursor-pointer"
              title="صفحه اول"
            >
              <ChevronsRight className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1 || isLoading}
              className="size-8 rounded-xl cursor-pointer"
              title="صفحه قبلی"
            >
              <ChevronRight className="size-4" />
            </Button>

            <div className="flex items-center gap-1 px-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => {
                  if (totalPages <= 5) return true;
                  return p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1;
                })
                .map((pageNumber, idx, arr) => {
                  const showEllipsis = idx > 0 && pageNumber - arr[idx - 1] > 1;
                  return (
                    <React.Fragment key={pageNumber}>
                      {showEllipsis && (
                        <span className="text-muted-foreground text-xs px-1">...</span>
                      )}
                      <button
                        onClick={() => onPageChange(pageNumber)}
                        className={`size-8 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                          currentPage === pageNumber
                            ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/30'
                            : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {toPersianDigits(pageNumber)}
                      </button>
                    </React.Fragment>
                  );
                })}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages || isLoading}
              className="size-8 rounded-xl cursor-pointer"
              title="صفحه بعدی"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage >= totalPages || isLoading}
              className="size-8 rounded-xl cursor-pointer"
              title="صفحه آخر"
            >
              <ChevronsLeft className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
