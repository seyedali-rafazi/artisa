'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import ProductImage from '@/components/ui/ProductImage';
import {
  useAdminProducts,
  useArchiveProduct,
  useRestoreProduct,
  useDuplicateProduct,
} from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Plus,
  Search,
  Edit,
  Copy,
  Archive,
  RotateCcw,
  Loader2,
  Package,
} from 'lucide-react';

export default function AdminProductsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useAdminProducts({ page, limit: 10, search, status: statusFilter });
  const archiveMutation = useArchiveProduct();
  const restoreMutation = useRestoreProduct();
  const duplicateMutation = useDuplicateProduct();

  const handleArchive = (id: string) => {
    if (confirm('آیا از آرشیو کردن این محصول اطمینان دارید؟')) {
      archiveMutation.mutate(id);
    }
  };

  const handleRestore = (id: string) => {
    restoreMutation.mutate(id);
  };

  const handleDuplicate = (id: string) => {
    duplicateMutation.mutate(id);
  };

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-foreground">مدیریت محصولات</h1>
          <p className="text-xs text-muted-foreground font-semibold mt-1">
            مشاهده، افزودن، ویرایش و مدیریت موجودی کالاها
          </p>
        </div>

        <Link href="/admin/products/new">
          <Button className="rounded-2xl font-extrabold text-xs gap-2 cursor-pointer shadow-lg shadow-primary/25">
            <Plus className="size-4" />
            <span>افزودن محصول جدید</span>
          </Button>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-background/95 border border-border/60 p-4 rounded-3xl backdrop-blur-xl">
        <div className="relative flex-1 w-full">
          <Input
            type="text"
            placeholder="جستجوی نام یا کد SKU محصول..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="rounded-xl pr-9 text-xs"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-xl border border-border bg-background px-3 py-2 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-48 cursor-pointer"
        >
          <option value="">همه وضعیت‌ها</option>
          <option value="published">منتشر شده</option>
          <option value="draft">پیش‌نویس</option>
          <option value="archived">آرشیو شده</option>
        </select>
      </div>

      {/* Products Table */}
      <div className="rounded-3xl border border-border/60 bg-background/95 backdrop-blur-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="size-6 text-primary animate-spin" />
          </div>
        ) : !data || data.items.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center gap-2">
            <Package className="size-10 text-muted-foreground/40" />
            <span className="text-xs font-bold text-muted-foreground">هیچ محصولی یافت نشد.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-muted/40 border-b border-border/40 font-extrabold text-muted-foreground">
                <tr>
                  <th className="p-4">تصویر</th>
                  <th className="p-4">نام محصول</th>
                  <th className="p-4">دسته‌بندی</th>
                  <th className="p-4">قیمت</th>
                  <th className="p-4">موجودی</th>
                  <th className="p-4">وضعیت</th>
                  <th className="p-4 text-left">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-semibold">
                {data.items.map((product) => (
                  <tr key={product.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-3">
                      <div className="relative size-12 rounded-xl overflow-hidden border border-border shrink-0">
                        <ProductImage src={product.image} alt={product.name} fill className="object-cover" />
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-col">
                        <span className="font-extrabold text-foreground">{product.name}</span>
                        {product.nameEn && <span className="text-[10px] text-muted-foreground dir-ltr text-right">{product.nameEn}</span>}
                      </div>
                    </td>
                    <td className="p-3 text-muted-foreground">{product.category}</td>
                    <td className="p-3 font-extrabold text-primary">
                      {product.price.toLocaleString('fa-IR')} تومان
                    </td>
                    <td className="p-3">
                      <span className={`font-bold ${product.stock_quantity <= 5 ? 'text-rose-500' : 'text-foreground'}`}>
                        {product.stock_quantity.toLocaleString('fa-IR')} عدد
                      </span>
                    </td>
                    <td className="p-3">
                      {product.status === 'archived' ? (
                        <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-500 font-bold text-[10px]">
                          آرشیو شده
                        </span>
                      ) : product.status === 'draft' ? (
                        <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 font-bold text-[10px]">
                          پیش‌نویس
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 font-bold text-[10px]">
                          منتشر شده
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-left">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link href={`/admin/products/${product.id}`}>
                          <button
                            title="ویرایش محصول"
                            className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                          >
                            <Edit className="size-4" />
                          </button>
                        </Link>
                        <button
                          title="رونوشت (ایجاد کپی)"
                          onClick={() => handleDuplicate(product.id)}
                          className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-indigo-500 transition-colors cursor-pointer"
                        >
                          <Copy className="size-4" />
                        </button>
                        {product.status === 'archived' ? (
                          <button
                            title="بازیابی محصول"
                            onClick={() => handleRestore(product.id)}
                            className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-emerald-500 transition-colors cursor-pointer"
                          >
                            <RotateCcw className="size-4" />
                          </button>
                        ) : (
                          <button
                            title="آرشیو محصول"
                            onClick={() => handleArchive(product.id)}
                            className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-rose-500 transition-colors cursor-pointer"
                          >
                            <Archive className="size-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
