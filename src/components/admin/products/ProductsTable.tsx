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
  Package,
  Edit,
  Copy,
  Archive,
  RotateCcw,
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
  Sparkles,
  ExternalLink,
  Star,
  Flame,
  Award,
} from 'lucide-react';
import { AdminProduct } from '@/hooks/useAdmin';
import { formatShamsiDate, formatPersianPrice, toPersianDigits } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ProductImage from '@/components/ui/ProductImage';

interface ProductsTableProps {
  data: AdminProduct[];
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
  categoryFilter: string;
  onCategoryFilterChange: (category: string) => void;
  availableCategories?: string[];
  onResetFilters: () => void;
  onArchive: (id: string, name: string) => void;
  onDelete: (id: string, name: string) => void;
  onRestore: (id: string) => void;
  onDuplicate: (id: string) => void;
}

const columnHelper = createColumnHelper<AdminProduct>();

export default function ProductsTable({
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
  categoryFilter,
  onCategoryFilterChange,
  availableCategories = [],
  onResetFilters,
  onArchive,
  onDelete,
  onRestore,
  onDuplicate,
}: ProductsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
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

  // Dynamically extract categories if not explicitly passed
  const categoriesList = useMemo(() => {
    if (availableCategories.length > 0) return availableCategories;
    const cats = new Set<string>();
    data.forEach((p) => {
      if (p.category && p.category.trim()) cats.add(p.category.trim());
    });
    return Array.from(cats);
  }, [availableCategories, data]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        id: 'product',
        header: ({ column }) => {
          const isSorted = column.getIsSorted();
          return (
            <button
              type="button"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="flex items-center gap-1.5 font-black hover:text-foreground transition-colors cursor-pointer select-none"
            >
              <span>اطلاعات محصول</span>
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
          const p = row.original;
          return (
            <div className="flex items-center gap-3 min-w-[220px] max-w-[340px]">
              {/* Product Thumbnail */}
              <div className="relative size-12 rounded-2xl overflow-hidden border border-border/70 shrink-0 bg-muted/20 shadow-xs group-hover:border-primary/40 transition-colors">
                <ProductImage
                  src={p.image}
                  alt={p.name}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Title & Meta */}
              <div className="flex flex-col min-w-0">
                <span className="font-extrabold text-foreground truncate text-xs" title={p.name}>
                  {p.name}
                </span>

                <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                  {p.nameEn && (
                    <span
                      title={p.nameEn}
                      className="text-[10px] text-muted-foreground/80 truncate dir-ltr text-right max-w-[140px]"
                    >
                      {p.nameEn}
                    </span>
                  )}

                  {p.sku && (
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground/90 border border-border/40">
                      {p.sku}
                    </span>
                  )}

                  {p.isSpecial && (
                    <span className="inline-flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      <Flame className="size-2.5" />
                      ویژه
                    </span>
                  )}

                  {p.isBestSeller && (
                    <span className="inline-flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.5 rounded-md bg-violet-500/15 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                      <Award className="size-2.5" />
                      پرفروش
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        },
      }),

      columnHelper.accessor('category', {
        id: 'category',
        header: ({ column }) => {
          const isSorted = column.getIsSorted();
          return (
            <button
              type="button"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="flex items-center gap-1.5 font-black hover:text-foreground transition-colors cursor-pointer select-none"
            >
              <span>دسته‌بندی</span>
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
          const cat = row.original.category || 'دسته‌بندی نشده';
          return (
            <span className="inline-flex items-center px-2.5 py-1 rounded-xl bg-muted/70 text-muted-foreground border border-border/50 font-bold text-[11px] whitespace-nowrap">
              {cat}
            </span>
          );
        },
      }),

      columnHelper.accessor('price', {
        id: 'price',
        header: ({ column }) => {
          const isSorted = column.getIsSorted();
          return (
            <button
              type="button"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="flex items-center gap-1.5 font-black hover:text-foreground transition-colors cursor-pointer select-none"
            >
              <span>قیمت فروش</span>
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
          const p = row.original;
          const hasDiscount = Boolean(p.oldPrice && p.oldPrice > p.price);
          const discountPct = hasDiscount
            ? Math.round((((p.oldPrice! - p.price) / p.oldPrice!) * 100))
            : 0;

          return (
            <div className="flex flex-col whitespace-nowrap">
              <span className="font-black text-primary text-xs">
                {formatPersianPrice(p.price)}
              </span>
              {hasDiscount && (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] text-muted-foreground line-through">
                    {toPersianDigits(p.oldPrice!.toLocaleString('fa-IR'))}
                  </span>
                  <span className="text-[9px] font-black px-1 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400">
                    ٪{toPersianDigits(discountPct)}
                  </span>
                </div>
              )}
            </div>
          );
        },
      }),

      columnHelper.accessor('stock_quantity', {
        id: 'stock_quantity',
        header: ({ column }) => {
          const isSorted = column.getIsSorted();
          return (
            <button
              type="button"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="flex items-center gap-1.5 font-black hover:text-foreground transition-colors cursor-pointer select-none"
            >
              <span>موجودی انبار</span>
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
          const stock = row.original.stock_quantity ?? 0;
          if (stock <= 0) {
            return (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-black text-[10px]">
                <span className="size-1.5 rounded-full bg-rose-500" />
                ناموجود
              </span>
            );
          }
          if (stock <= 5) {
            return (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-black text-[10px]">
                <span className="size-1.5 rounded-full bg-amber-500" />
                کمبود ({toPersianDigits(stock)} عدد)
              </span>
            );
          }
          return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-black text-[10px]">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {toPersianDigits(stock)} عدد
            </span>
          );
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
          const status = row.original.status;
          if (status === 'archived') {
            return (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-extrabold text-[10px]">
                <span className="size-1.5 rounded-full bg-rose-500" />
                آرشیو شده
              </span>
            );
          }
          if (status === 'draft') {
            return (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-extrabold text-[10px]">
                <span className="size-1.5 rounded-full bg-amber-500" />
                پیش‌نویس
              </span>
            );
          }
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-extrabold text-[10px]">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              منتشر شده
            </span>
          );
        },
      }),

      columnHelper.accessor('rating', {
        id: 'rating',
        header: ({ column }) => {
          const isSorted = column.getIsSorted();
          return (
            <button
              type="button"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="flex items-center gap-1.5 font-black hover:text-foreground transition-colors cursor-pointer select-none"
            >
              <span>امتیاز</span>
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
          const rating = row.original.rating ?? 5.0;
          return (
            <div className="flex items-center gap-1 text-xs font-bold text-foreground">
              <Star className="size-3 text-amber-500 fill-amber-500" />
              <span>{toPersianDigits(rating.toFixed(1))}</span>
            </div>
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
          const p = row.original;
          const isArchived = p.status === 'archived';

          return (
            <div className="flex items-center justify-end gap-1.5">
              {/* Customer storefront preview */}
              <Link
                href={`/product/${p.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <button
                  type="button"
                  title="مشاهده زنده در فروشگاه"
                  className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-primary transition-colors cursor-pointer border border-transparent hover:border-border/60"
                >
                  <ExternalLink className="size-4" />
                </button>
              </Link>

              {/* Edit Product */}
              <Link href={`/admin/products/${p.id}`}>
                <button
                  type="button"
                  title="ویرایش محصول"
                  className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-primary transition-colors cursor-pointer border border-transparent hover:border-border/60"
                >
                  <Edit className="size-4" />
                </button>
              </Link>

              {/* Duplicate Product */}
              <button
                type="button"
                title="رونوشت (ایجاد کپی)"
                onClick={() => onDuplicate(p.id)}
                className="p-2 rounded-xl hover:bg-indigo-500/10 text-muted-foreground hover:text-indigo-600 transition-colors cursor-pointer border border-transparent hover:border-border/60"
              >
                <Copy className="size-4" />
              </button>

              {/* Archive / Restore */}
              {isArchived ? (
                <button
                  type="button"
                  title="بازیابی محصول"
                  onClick={() => onRestore(p.id)}
                  className="p-2 rounded-xl hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-600 transition-colors cursor-pointer border border-transparent hover:border-border/60"
                >
                  <RotateCcw className="size-4" />
                </button>
              ) : (
                <button
                  type="button"
                  title="آرشیو محصول"
                  onClick={() => onArchive(p.id, p.name)}
                  className="p-2 rounded-xl hover:bg-amber-500/10 text-muted-foreground hover:text-amber-600 transition-colors cursor-pointer border border-transparent hover:border-border/60"
                >
                  <Archive className="size-4" />
                </button>
              )}

              {/* Permanent Delete */}
              <button
                type="button"
                title="حذف دائمی محصول"
                onClick={() => onDelete(p.id, p.name)}
                className="p-2 rounded-xl hover:bg-rose-500/10 text-muted-foreground hover:text-rose-600 transition-colors cursor-pointer border border-transparent hover:border-border/60"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          );
        },
      }),
    ],
    [onArchive, onDelete, onRestore, onDuplicate]
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
    product: 'اطلاعات محصول',
    category: 'دسته‌بندی',
    price: 'قیمت فروش',
    stock_quantity: 'موجودی انبار',
    status: 'وضعیت انتشار',
    rating: 'امتیاز کالا',
    created_at: 'تاریخ ثبت',
  };

  const hasActiveFilters =
    searchQuery !== '' || statusFilter !== '' || categoryFilter !== '';

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Table Toolbar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-background/95 border border-border/60 p-4 rounded-3xl backdrop-blur-xl shadow-xs">
        <div className="flex flex-col sm:flex-row items-center gap-3 flex-1">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Input
              type="text"
              placeholder="جستجوی نام، انگلیسی، دسته‌بندی یا کد SKU..."
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

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryFilterChange(e.target.value)}
            className="rounded-2xl border border-border/70 bg-background/50 px-3.5 h-10 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-full sm:w-44 cursor-pointer"
          >
            <option value="">همه دسته‌بندی‌ها</option>
            {categoriesList.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="rounded-2xl border border-border/70 bg-background/50 px-3.5 h-10 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-full sm:w-36 cursor-pointer"
          >
            <option value="">همه وضعیت‌ها</option>
            <option value="published">منتشر شده</option>
            <option value="draft">پیش‌نویس</option>
            <option value="archived">آرشیو شده</option>
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
              {toPersianDigits(totalCount.toLocaleString('fa-IR'))} محصول
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
              <Package className="size-8" />
            </div>
            <h3 className="text-sm font-black text-foreground mt-1">هیچ محصولی یافت نشد</h3>
            <p className="text-xs font-medium text-muted-foreground max-w-sm">
              محصولی با فیلترهای جستجوی فعلی مطابقت ندارد. می‌توانید فیلترها را تغییر داده یا بازنشانی کنید.
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
            <table className="w-full min-w-[880px] text-right text-xs">
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
                از <strong className="text-foreground">{toPersianDigits(totalCount)}</strong> محصول
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
