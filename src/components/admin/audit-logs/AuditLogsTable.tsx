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
  Clock,
  User,
  Activity,
  Copy,
  Check,
  Eye,
  FileCode,
  Globe,
  FileText,
} from 'lucide-react';
import { AuditLog } from '@/hooks/useAdmin';
import { formatShamsiDate, toPersianDigits } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface AuditLogsTableProps {
  data: AuditLog[];
  isLoading: boolean;
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  actionFilter: string;
  onActionFilterChange: (action: string) => void;
  onResetFilters: () => void;
  onSortChange?: (sortBy: string, sortOrder: string) => void;
}

const columnHelper = createColumnHelper<AuditLog>();

export default function AuditLogsTable({
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
  actionFilter,
  onActionFilterChange,
  onResetFilters,
  onSortChange,
}: AuditLogsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [isColumnMenuOpen, setIsColumnMenuOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
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

  const handleCopy = (text: string, id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('در کلیپ‌بورد کپی شد');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getActionBadge = (action: string) => {
    const act = (action || '').toUpperCase();
    if (act.includes('CREATE') || act.includes('ADD')) {
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
          {action}
        </span>
      );
    }
    if (act.includes('DELETE') || act.includes('REMOVE')) {
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 whitespace-nowrap">
          {action}
        </span>
      );
    }
    if (act.includes('UPDATE') || act.includes('EDIT') || act.includes('STATUS')) {
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 whitespace-nowrap">
          {action}
        </span>
      );
    }
    if (act.includes('LOGIN') || act.includes('AUTH')) {
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 whitespace-nowrap">
          {action}
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-primary/10 text-primary border border-primary/20 whitespace-nowrap">
        {action}
      </span>
    );
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor('created_at', {
        id: 'created_at',
        header: ({ column }) => {
          const isSorted = column.getIsSorted();
          return (
            <button
              onClick={() => column.toggleSorting(isSorted === 'asc')}
              className="flex items-center gap-1.5 font-bold hover:text-primary transition-colors cursor-pointer"
            >
              <span>زمان ثبت</span>
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
      columnHelper.accessor('user_email', {
        id: 'user_email',
        header: ({ column }) => {
          const isSorted = column.getIsSorted();
          return (
            <button
              onClick={() => column.toggleSorting(isSorted === 'asc')}
              className="flex items-center gap-1.5 font-bold hover:text-primary transition-colors cursor-pointer"
            >
              <span>مدیر مجری</span>
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
          const log = info.row.original;
          const isCopied = copiedId === `email-${log.id}`;
          return (
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <User className="size-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5" dir="ltr">
                  <span className="font-bold text-xs text-foreground truncate max-w-[170px]">
                    {email}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => handleCopy(email, `email-${log.id}`, e)}
                    className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer shrink-0"
                    title="کپی ایمیل"
                  >
                    {isCopied ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
                  </button>
                </div>
                <span className="text-[10px] text-primary font-bold">
                  {log.user_role || 'admin'}
                </span>
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor('action', {
        id: 'action',
        header: ({ column }) => {
          const isSorted = column.getIsSorted();
          return (
            <button
              onClick={() => column.toggleSorting(isSorted === 'asc')}
              className="flex items-center gap-1.5 font-bold hover:text-primary transition-colors cursor-pointer"
            >
              <span>نوع عملیات</span>
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
        cell: (info) => getActionBadge(info.getValue()),
      }),
      columnHelper.accessor('resource', {
        id: 'resource',
        header: 'منبع / شناسه',
        cell: (info) => {
          const res = info.getValue() || '-';
          return (
            <span className="font-mono text-xs text-muted-foreground bg-muted/40 px-2 py-1 rounded-xl whitespace-nowrap">
              {res}
            </span>
          );
        },
      }),
      columnHelper.accessor('details', {
        id: 'details',
        header: 'جزئیات تغییرات',
        cell: (info) => {
          const details = info.getValue();
          const jsonStr = typeof details === 'object' ? JSON.stringify(details) : String(details || '{}');
          return (
            <div className="flex items-center gap-2 max-w-[240px]">
              <pre
                className="text-[10px] font-mono text-muted-foreground bg-muted/30 px-2 py-1.5 rounded-xl truncate flex-1 cursor-pointer hover:bg-muted/60 transition-colors"
                onClick={() => setSelectedLog(info.row.original)}
                title="کلیک برای مشاهده تمام جزئیات"
              >
                {jsonStr}
              </pre>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedLog(info.row.original)}
                title="مشاهده کامل جزئیات"
                className="size-7 rounded-xl text-primary hover:bg-primary/10 shrink-0 cursor-pointer"
              >
                <Eye className="size-3.5" />
              </Button>
            </div>
          );
        },
      }),
      columnHelper.accessor('ip_address', {
        id: 'ip_address',
        header: 'آدرس IP',
        cell: (info) => {
          const ip = info.getValue() || '127.0.0.1';
          return (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono" dir="ltr">
              <Globe className="size-3 text-muted-foreground/60" />
              <span>{ip}</span>
            </div>
          );
        },
      }),
    ],
    [copiedId]
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
    created_at: 'زمان ثبت',
    user_email: 'مدیر مجری',
    action: 'نوع عملیات',
    resource: 'منبع / شناسه',
    details: 'جزئیات تغییرات',
    ip_address: 'آدرس IP',
  };

  const hasActiveFilters = searchQuery !== '' || actionFilter !== 'all';

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* ─── Filter & Search Toolbar ─── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-background/95 border border-border/60 p-4 rounded-3xl backdrop-blur-xl shadow-xs">
        {/* Search */}
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="جستجوی ایمیل مدیر، نوع عملیات، منبع یا آدرس IP..."
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
          {/* Action Filter Select */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-muted-foreground">عملیات:</span>
            <select
              value={actionFilter}
              onChange={(e) => onActionFilterChange(e.target.value)}
              className="h-11 rounded-2xl border border-border/60 bg-background px-3 text-xs font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              <option value="all">همه رخدادها</option>
              <option value="CREATE">ایجاد (CREATE)</option>
              <option value="UPDATE">ویرایش (UPDATE)</option>
              <option value="DELETE">حذف (DELETE)</option>
              <option value="APPROVE">تایید (APPROVE)</option>
              <option value="REJECT">رد (REJECT)</option>
              <option value="LOGIN">ورود (LOGIN)</option>
            </select>
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
                        <Activity className="size-7" />
                      </div>
                      <div className="flex flex-col gap-1 max-w-sm">
                        <span className="text-sm font-black text-foreground">
                          {hasActiveFilters
                            ? 'رخدادی با شرایط جستجوی شما یافت نشد'
                            : 'هنوز هیچ لاگ امنیتی ثبت نشده است'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {hasActiveFilters
                            ? 'لطفاً عبارت جستجو را پاک کرده یا فیلتر عملیات را تغییر دهید.'
                            : 'فعالیت‌های مدیران در سیستم به صورت خودکار در این جدول ثبت و نگهداری می‌شوند.'}
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
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-primary/[0.03] transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="py-3.5 px-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
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
              {toPersianDigits(totalCount)} رخداد
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

      {/* ─── Detail Modal Dialog ─── */}
      {selectedLog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in"
          dir="rtl"
          onClick={() => setSelectedLog(null)}
        >
          <div
            className="bg-background border border-border/60 rounded-3xl p-6 max-w-xl w-full shadow-2xl flex flex-col gap-5 text-right transform transition-all max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-border/40 pb-4">
              <div className="flex items-center gap-3">
                <div className="size-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <FileCode className="size-5" />
                </div>
                <div className="flex flex-col">
                  <h2 className="text-base font-black text-foreground">
                    جزئیات لاگ امنیتی و عملیاتی
                  </h2>
                  <span className="text-xs text-muted-foreground font-mono">
                    ID: {selectedLog.id}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedLog(null)}
                className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Meta Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-muted/20 border border-border/50 text-xs">
              <div className="flex items-center gap-2">
                <User className="size-4 text-muted-foreground shrink-0" />
                <span className="font-bold text-muted-foreground">مدیر مجری:</span>
                <span className="font-bold text-foreground truncate" dir="ltr">
                  {selectedLog.user_email}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="size-4 text-muted-foreground shrink-0" />
                <span className="font-bold text-muted-foreground">زمان ثبت:</span>
                <span className="font-bold text-foreground">
                  {formatShamsiDate(selectedLog.created_at, 'time')}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Activity className="size-4 text-muted-foreground shrink-0" />
                <span className="font-bold text-muted-foreground">عملیات:</span>
                {getActionBadge(selectedLog.action)}
              </div>

              <div className="flex items-center gap-2">
                <Globe className="size-4 text-muted-foreground shrink-0" />
                <span className="font-bold text-muted-foreground">IP آدرس:</span>
                <span className="font-mono font-bold text-foreground" dir="ltr">
                  {selectedLog.ip_address || '127.0.0.1'}
                </span>
              </div>

              <div className="flex items-center gap-2 sm:col-span-2">
                <FileText className="size-4 text-muted-foreground shrink-0" />
                <span className="font-bold text-muted-foreground">منبع / شناسه:</span>
                <span className="font-mono font-bold text-foreground">
                  {selectedLog.resource}
                </span>
              </div>
            </div>

            {/* Full JSON Details */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-foreground">داده‌های ذخیره شده (JSON Payload):</label>
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(
                      JSON.stringify(selectedLog.details, null, 2),
                      `json-${selectedLog.id}`
                    )
                  }
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {copiedId === `json-${selectedLog.id}` ? (
                    <>
                      <Check className="size-3 text-emerald-600" />
                      <span className="text-emerald-600">کپی شد</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-3" />
                      <span>کپی JSON</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-4 rounded-2xl bg-neutral-900 text-neutral-100 dark:bg-neutral-950 font-mono text-xs leading-relaxed max-h-72 overflow-auto" dir="ltr">
                {JSON.stringify(selectedLog.details, null, 2)}
              </pre>
            </div>

            {/* Close Button */}
            <div className="flex justify-end pt-3 border-t border-border/40">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedLog(null)}
                className="rounded-xl text-xs font-bold cursor-pointer"
              >
                بستن
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
