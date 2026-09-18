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
  Users,
  Eye,
  ShieldCheck,
  Shield,
  UserCheck,
  UserX,
  User as UserIcon,
  ShoppingBag,
  CheckCircle2,
  Copy,
  Check,
  SlidersHorizontal,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  ChevronsRight,
  ChevronsLeft,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { AdminUser } from '@/hooks/useAdmin';
import { formatShamsiDate, formatPersianPrice, toPersianDigits } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface UsersTableProps {
  data: AdminUser[];
  isLoading: boolean;
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  roleFilter: string;
  onRoleFilterChange: (role: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  onResetFilters: () => void;
  isSuperAdmin: boolean;
  onToggleStatus: (userId: string, userName: string, currentStatus: boolean) => void;
  onEditRole: (userId: string, userName: string, currentRole: string) => void;
}

const columnHelper = createColumnHelper<AdminUser>();

export default function UsersTable({
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
  roleFilter,
  onRoleFilterChange,
  statusFilter,
  onStatusFilterChange,
  onResetFilters,
  isSuperAdmin,
  onToggleStatus,
  onEditRole,
}: UsersTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [copiedEmailId, setCopiedEmailId] = useState<string | null>(null);
  const [isColumnMenuOpen, setIsColumnMenuOpen] = useState(false);
  const columnMenuRef = useRef<HTMLDivElement>(null);

  // Close column menu when clicking outside
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

  const handleCopyEmail = (email: string, id: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmailId(id);
    setTimeout(() => {
      setCopiedEmailId(null);
    }, 2000);
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        id: 'user',
        header: ({ column }) => {
          const isSorted = column.getIsSorted();
          return (
            <button
              type="button"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="flex items-center gap-1.5 font-black hover:text-foreground transition-colors cursor-pointer select-none"
            >
              <span>کاربر</span>
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
          const u = row.original;
          const initials = (u.name || 'ک')
            .trim()
            .split(' ')
            .slice(0, 2)
            .map((n) => n[0])
            .join('');

          return (
            <div className="flex items-center gap-3 min-w-[170px]">
              <div className="relative flex size-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/20 text-primary font-black text-xs shadow-xs">
                {initials}
                {u.is_verified && (
                  <span
                    title="حساب تایید شده"
                    className="absolute -bottom-1 -right-1 flex size-4 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xs"
                  >
                    <CheckCircle2 className="size-2.5 stroke-[3]" />
                  </span>
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-extrabold text-foreground truncate text-xs">{u.name}</span>
                {u.phone ? (
                  <span className="text-[10px] text-muted-foreground/80 dir-ltr text-right font-mono tracking-wider">
                    {toPersianDigits(u.phone)}
                  </span>
                ) : (
                  <span className="text-[10px] text-muted-foreground/50">بدون شماره تماس</span>
                )}
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor('email', {
        header: ({ column }) => {
          const isSorted = column.getIsSorted();
          return (
            <button
              type="button"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="flex items-center gap-1.5 font-black hover:text-foreground transition-colors cursor-pointer select-none"
            >
              <span>آدرس ایمیل</span>
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
          const email = row.original.email;
          const isCopied = copiedEmailId === row.original.id;

          return (
            <div className="flex items-center gap-1.5 group max-w-[200px]">
              <span
                title={email}
                className="font-mono text-xs text-muted-foreground truncate dir-ltr text-right select-all"
              >
                {email}
              </span>
              <button
                type="button"
                title={isCopied ? 'کپی شد!' : 'کپی ایمیل'}
                onClick={() => handleCopyEmail(email, row.original.id)}
                className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary transition-all cursor-pointer"
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
      columnHelper.accessor('role', {
        header: ({ column }) => {
          const isSorted = column.getIsSorted();
          return (
            <button
              type="button"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="flex items-center gap-1.5 font-black hover:text-foreground transition-colors cursor-pointer select-none"
            >
              <span>نقش کاربری</span>
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
          const role = (row.original.role || '').toLowerCase();
          if (role === 'superadmin' || role === 'super_admin' || role === 'مدیر ارشد') {
            return (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-500 border border-violet-500/20 font-extrabold text-[10px]">
                <ShieldCheck className="size-3" />
                مدیر ارشد
              </span>
            );
          }
          if (role === 'admin' || role === 'مدیر سیستم') {
            return (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 font-extrabold text-[10px]">
                <Shield className="size-3" />
                مدیر سیستم
              </span>
            );
          }
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/80 text-muted-foreground border border-border/50 font-bold text-[10px]">
              <UserIcon className="size-3" />
              مشتری
            </span>
          );
        },
      }),
      columnHelper.accessor('total_orders', {
        header: ({ column }) => {
          const isSorted = column.getIsSorted();
          return (
            <button
              type="button"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="flex items-center gap-1.5 font-black hover:text-foreground transition-colors cursor-pointer select-none"
            >
              <span>سفارشات</span>
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
          const count = row.original.total_orders || 0;
          return (
            <div className="flex items-center gap-1.5 font-bold text-foreground">
              <ShoppingBag className="size-3.5 text-muted-foreground/70" />
              <span>{toPersianDigits(count.toLocaleString('fa-IR'))} سفارش</span>
            </div>
          );
        },
      }),
      columnHelper.accessor('total_spent', {
        header: ({ column }) => {
          const isSorted = column.getIsSorted();
          return (
            <button
              type="button"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="flex items-center gap-1.5 font-black hover:text-foreground transition-colors cursor-pointer select-none"
            >
              <span>مجموع خرید</span>
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
          const amount = row.original.total_spent || 0;
          return (
            <span className="font-extrabold text-primary whitespace-nowrap">
              {formatPersianPrice(amount)}
            </span>
          );
        },
      }),
      columnHelper.accessor('is_active', {
        header: ({ column }) => {
          const isSorted = column.getIsSorted();
          return (
            <button
              type="button"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="flex items-center gap-1.5 font-black hover:text-foreground transition-colors cursor-pointer select-none"
            >
              <span>وضعیت حساب</span>
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
          const isActive = row.original.is_active;
          return (
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-[10px] border ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
              }`}
            >
              <span
                className={`size-1.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}
              />
              {isActive ? 'فعال' : 'غیرفعال'}
            </span>
          );
        },
      }),
      columnHelper.accessor('created_at', {
        header: ({ column }) => {
          const isSorted = column.getIsSorted();
          return (
            <button
              type="button"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="flex items-center gap-1.5 font-black hover:text-foreground transition-colors cursor-pointer select-none"
            >
              <span>تاریخ ثبت‌نام</span>
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
          const dateStr = row.original.created_at;
          return (
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-semibold whitespace-nowrap">
              <Calendar className="size-3 text-muted-foreground/60" />
              <span>{dateStr ? formatShamsiDate(dateStr, 'medium') : '—'}</span>
            </div>
          );
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: () => <span className="text-left block font-black">عملیات</span>,
        cell: ({ row }) => {
          const u = row.original;
          return (
            <div className="flex items-center justify-end gap-1.5">
              <Link href={`/admin/users/${u.id}`}>
                <button
                  type="button"
                  title="جزئیات کاربر"
                  className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-primary transition-colors cursor-pointer border border-transparent hover:border-border/60"
                >
                  <Eye className="size-4" />
                </button>
              </Link>

              <button
                type="button"
                title={u.is_active ? 'غیرفعال‌سازی کاربر' : 'فعال‌سازی کاربر'}
                onClick={() => onToggleStatus(u.id, u.name, u.is_active)}
                className={`p-2 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-border/60 ${
                  u.is_active
                    ? 'hover:bg-rose-500/10 text-muted-foreground hover:text-rose-600'
                    : 'hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-600'
                }`}
              >
                {u.is_active ? <UserX className="size-4" /> : <UserCheck className="size-4" />}
              </button>

              {isSuperAdmin && (
                <button
                  type="button"
                  title="تغییر نقش کاربری"
                  onClick={() => onEditRole(u.id, u.name, u.role)}
                  className="p-2 rounded-xl hover:bg-violet-500/10 text-muted-foreground hover:text-violet-600 transition-colors cursor-pointer border border-transparent hover:border-border/60"
                >
                  <ShieldCheck className="size-4" />
                </button>
              )}
            </div>
          );
        },
      }),
    ],
    [copiedEmailId, isSuperAdmin, onToggleStatus, onEditRole]
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
    user: 'اطلاعات کاربر',
    email: 'آدرس ایمیل',
    role: 'نقش کاربری',
    total_orders: 'تعداد سفارشات',
    total_spent: 'مجموع خرید',
    is_active: 'وضعیت حساب',
    created_at: 'تاریخ ثبت‌نام',
  };

  const hasActiveFilters = searchQuery !== '' || roleFilter !== '' || statusFilter !== '';

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Table Toolbar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-background/95 border border-border/60 p-4 rounded-3xl backdrop-blur-xl shadow-xs">
        <div className="flex flex-col sm:flex-row items-center gap-3 flex-1">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Input
              type="text"
              placeholder="جستجوی نام، ایمیل، تلفن..."
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

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => onRoleFilterChange(e.target.value)}
            className="rounded-2xl border border-border/70 bg-background/50 px-3.5 h-10 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-full sm:w-44 cursor-pointer"
          >
            <option value="">همه نقش‌ها</option>
            <option value="user">مشتری (User)</option>
            <option value="admin">مدیر سیستم (Admin)</option>
            <option value="superadmin">مدیر ارشد (Super Admin)</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="rounded-2xl border border-border/70 bg-background/50 px-3.5 h-10 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-full sm:w-36 cursor-pointer"
          >
            <option value="">همه وضعیت‌ها</option>
            <option value="active">فقط فعال</option>
            <option value="inactive">فقط غیرفعال</option>
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
              {toPersianDigits(totalCount.toLocaleString('fa-IR'))} کاربر
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
                className="h-14 w-full rounded-2xl bg-muted/30 animate-pulse border border-border/30"
              />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center justify-center gap-3">
            <div className="size-16 rounded-3xl bg-muted/40 flex items-center justify-center border border-border/50 text-muted-foreground/50">
              <Users className="size-8" />
            </div>
            <h3 className="text-sm font-black text-foreground mt-1">هیچ کاربری یافت نشد</h3>
            <p className="text-xs font-medium text-muted-foreground max-w-sm">
              کاربری با فیلترهای جستجوی فعلی مطابقت ندارد. می‌توانید فیلترها را تغییر داده یا بازنشانی کنید.
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
            <table className="w-full min-w-[860px] text-right text-xs">
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
                از <strong className="text-foreground">{toPersianDigits(totalCount)}</strong> کاربر
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
