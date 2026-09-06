'use client';

import React, { useState } from 'react';
import { useAdminProducts, AdminProduct } from '@/hooks/useAdmin';
import { useDebounce } from '@/hooks/useDebounce';
import ProductImage from '@/components/ui/ProductImage';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { formatPersianPrice, toPersianDigits } from '@/lib/utils';
import {
  Search,
  Check,
  Plus,
  X,
  Package,
  Loader2,
  Trash2,
  AlertCircle,
} from 'lucide-react';

interface ProductSelectorProps {
  selectedIds: string[];
  onChange: (selectedIds: string[]) => void;
  existingProducts?: (AdminProduct | { id: string; name: string; image: string; price: number; oldPrice?: number | null; category?: string })[];
  error?: string;
}

export default function ProductSelector({
  selectedIds,
  onChange,
  existingProducts,
  error,
}: ProductSelectorProps) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  // Fetch available products from admin API
  const { data, isLoading } = useAdminProducts({
    page: 1,
    limit: 50,
    search: debouncedSearch,
    category: category || undefined,
  });

  const availableProducts: AdminProduct[] = data?.items || [];

  // Toggle selection
  const handleToggleProduct = (productId: string) => {
    const idStr = String(productId);
    if (selectedIds.some((id) => String(id) === idStr)) {
      onChange(selectedIds.filter((id) => String(id) !== idStr));
    } else {
      onChange([...selectedIds, idStr]);
    }
  };

  const handleRemoveProduct = (productId: string) => {
    const idStr = String(productId);
    onChange(selectedIds.filter((id) => String(id) !== idStr));
  };

  const handleClearAll = () => {
    onChange([]);
  };

  // Selected products details lookup
  const selectedProductsMap = new Map<string, { id: string; name?: string; image?: string; price?: number; oldPrice?: number | null; category?: string }>();
  if (existingProducts) {
    existingProducts.forEach((p) => {
      if (selectedIds.some((id) => String(id) === String(p.id))) {
        selectedProductsMap.set(String(p.id), p);
      }
    });
  }
  availableProducts.forEach((p) => {
    if (selectedIds.some((id) => String(id) === String(p.id))) {
      selectedProductsMap.set(String(p.id), p);
    }
  });

  return (
    <div className="flex flex-col gap-4 w-full min-w-0" dir="rtl">
      <div className="flex items-center justify-between">
        <label className="text-xs font-black text-foreground flex items-center gap-1.5">
          <Package className="size-4 text-primary" />
          <span>انتخاب آثار و محصولات متصل به پیشنهاد</span>
          <span className="text-destructive">*</span>
          <span className="text-[11px] font-semibold text-muted-foreground mr-1">
            ({toPersianDigits(selectedIds.length)} مورد انتخاب شده)
          </span>
        </label>

        {selectedIds.length > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            className="text-[11px] font-bold text-destructive hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="size-3" />
            <span>پاک کردن همه</span>
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold">
          <AlertCircle className="size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Selected Products Tray */}
      {selectedIds.length > 0 && (
        <div className="p-3.5 rounded-3xl bg-muted/40 border border-border/60 flex flex-col gap-2.5 min-w-0">
          <span className="text-[11px] font-extrabold text-muted-foreground">
            لیست آثار انتخاب شده:
          </span>
          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1 min-w-0">
            {selectedIds.map((id) => {
              const product = selectedProductsMap.get(String(id));
              return (
                <div
                  key={id}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-2xl bg-background border border-primary/20 shadow-xs text-xs font-bold text-foreground animate-in fade-in zoom-in-95 duration-150 max-w-full"
                >
                  {product?.image ? (
                    <div className="size-6 rounded-lg overflow-hidden shrink-0 border border-border">
                      <ProductImage
                        src={product.image}
                        alt={product.name || 'محصول'}
                        width={24}
                        height={24}
                        className="size-full object-cover"
                      />
                    </div>
                  ) : (
                    <Package className="size-4 text-primary shrink-0" />
                  )}
                  <span className="truncate max-w-[140px] sm:max-w-[220px]">
                    {product?.name || `شناسه: ${String(id).slice(-6)}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveProduct(id)}
                    className="p-1 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors cursor-pointer shrink-0"
                    title="حذف از پیشنهاد"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Product Search & Category Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-2.5 min-w-0">
        <div className="relative flex-1 w-full min-w-0">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="جستجوی نام اثر، سبک یا هنرمند..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10 h-11 rounded-2xl text-xs bg-background"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-11 px-3.5 rounded-2xl border border-input bg-background text-xs font-black text-foreground focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-48 cursor-pointer shrink-0"
        >
          <option value="">همه دسته‌بندی‌ها</option>
          <option value="تابلو نقاشی">تابلو نقاشی</option>
          <option value="هنر دیواری">هنر دیواری</option>
          <option value="مجسمه و دکوری">مجسمه و دکوری</option>
          <option value="قاب و فریم">قاب و فریم</option>
          <option value="هنر مدرن">هنر مدرن</option>
        </select>
      </div>

      {/* Product Items Picker List */}
      <div className="border border-border/80 rounded-3xl bg-card overflow-hidden min-w-0 shadow-xs">
        <div className="max-h-64 overflow-y-auto divide-y divide-border/40 min-w-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
              <Loader2 className="size-6 animate-spin text-primary" />
              <span className="text-xs font-bold">در حال بارگذاری آثار...</span>
            </div>
          ) : availableProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
              <Package className="size-8 stroke-[1.5] text-muted-foreground/60" />
              <span className="text-xs font-bold">هیچ محصولی با این مشخصات یافت نشد</span>
            </div>
          ) : (
            availableProducts.map((product) => {
              const isSelected = selectedIds.some((id) => String(id) === String(product.id));
              return (
                <div
                  key={product.id}
                  onClick={() => handleToggleProduct(product.id)}
                  className={`flex items-center justify-between p-3.5 transition-colors cursor-pointer select-none gap-3 min-w-0 ${
                    isSelected
                      ? 'bg-primary/10 hover:bg-primary/15'
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className={`size-5 rounded-lg flex items-center justify-center border transition-all shrink-0 ${
                        isSelected
                          ? 'bg-primary border-primary text-primary-foreground'
                          : 'border-muted-foreground/40 bg-background'
                      }`}
                    >
                      {isSelected && <Check className="size-3.5 stroke-[3]" />}
                    </div>

                    <div className="size-11 rounded-2xl overflow-hidden shrink-0 border border-border bg-muted">
                      <ProductImage
                        src={product.image}
                        alt={product.name}
                        width={44}
                        height={44}
                        className="size-full object-cover"
                      />
                    </div>

                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-xs font-extrabold text-foreground truncate">
                        {product.name}
                      </span>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-semibold mt-0.5 flex-wrap">
                        <span>{product.category}</span>
                        <span>•</span>
                        <span className="text-primary font-bold">
                          {formatPersianPrice(product.price)}
                        </span>
                        {Boolean(product.oldPrice && product.oldPrice > product.price) && (
                          <span className="line-through text-muted-foreground/70">
                            {formatPersianPrice(product.oldPrice!)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    variant={isSelected ? 'default' : 'outline'}
                    className={`h-8 px-3 text-[11px] font-black rounded-xl transition-all cursor-pointer shrink-0 ${
                      isSelected
                        ? 'bg-primary text-primary-foreground'
                        : 'border-border hover:border-primary text-foreground'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleProduct(product.id);
                    }}
                  >
                    {isSelected ? (
                      <span className="flex items-center gap-1">
                        <Check className="size-3" /> انتخاب شده
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Plus className="size-3" /> افزودن
                      </span>
                    )}
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
