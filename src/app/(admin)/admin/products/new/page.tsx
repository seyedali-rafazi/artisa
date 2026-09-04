'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCreateProduct } from '@/hooks/useAdmin';
import ImageUploader from '@/components/admin/ImageUploader';
import ProductDescriptionInput from '@/components/admin/ProductDescriptionInput';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Save, Loader2, Plus, Trash2 } from 'lucide-react';

export default function NewProductPage() {
  const router = useRouter();
  const createMutation = useCreateProduct();

  const [name, setName] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [price, setPrice] = useState('');
  const [oldPrice, setOldPrice] = useState('');
  const [category, setCategory] = useState('تابلو نقاشی');
  const [categoryEn, setCategoryEn] = useState('Painting');
  const [stockQuantity, setStockQuantity] = useState('100');
  const [status, setStatus] = useState('published');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [gallery, setGallery] = useState<string[]>([]);
  const [isSpecial, setIsSpecial] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);

  // Specifications key-value builder
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([
    { key: 'تکنیک', value: 'رنگ‌روغن روی بوم' },
    { key: 'ابعاد', value: '۸۰ × ۶۰ سانتی‌متر' },
  ]);

  const handleAddSpec = () => {
    setSpecs([...specs, { key: '', value: '' }]);
  };

  const handleRemoveSpec = (idx: number) => {
    const updated = [...specs];
    updated.splice(idx, 1);
    setSpecs(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !image) {
      alert('لطفاً نام، قیمت و تصویر اصلی محصول را وارد کنید.');
      return;
    }

    const specificationsObj: Record<string, string> = {};
    specs.forEach((s) => {
      if (s.key.trim() && s.value.trim()) {
        specificationsObj[s.key.trim()] = s.value.trim();
      }
    });

    createMutation.mutate(
      {
        name,
        nameEn,
        price: parseFloat(price),
        oldPrice: oldPrice ? parseFloat(oldPrice) : undefined,
        image,
        gallery,
        category,
        categoryEn,
        stock_quantity: parseInt(stockQuantity) || 0,
        status,
        description,
        isSpecial,
        isBestSeller,
        specifications: specificationsObj,
      },
      {
        onSuccess: () => {
          router.push('/admin/products');
        },
      }
    );
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto" dir="rtl">
      {/* Back Link */}
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary transition-colors cursor-pointer"
      >
        <ArrowRight className="size-4" />
        <span>بازگشت به لیست محصولات</span>
      </Link>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Title */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-black text-foreground">افزودن محصول جدید</h1>
          <Button
            type="submit"
            disabled={createMutation.isPending}
            className="rounded-2xl font-extrabold text-xs gap-2 cursor-pointer shadow-lg shadow-primary/25"
          >
            {createMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            <span>ذخیره محصول</span>
          </Button>
        </div>

        {/* Basic Info Card */}
        <div className="rounded-3xl border border-border/60 bg-background/95 backdrop-blur-xl p-6 shadow-sm flex flex-col gap-4">
          <h2 className="text-sm font-black text-foreground border-b border-border/40 pb-3">اطلاعات اصلی محصول</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-muted-foreground">نام فارسی محصول *</label>
              <Input
                type="text"
                placeholder="مثال: تابلو نقاشی افق طلایی"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="rounded-xl text-xs"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-muted-foreground">نام انگلیسی محصول</label>
              <Input
                type="text"
                placeholder="Golden Horizon Painting"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                className="rounded-xl text-xs"
                dir="ltr"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-muted-foreground">قیمت (تومان) *</label>
              <Input
                type="number"
                placeholder="3200000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className="rounded-xl text-xs"
                dir="ltr"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-muted-foreground">قیمت قبلی / تخفیف (تومان)</label>
              <Input
                type="number"
                placeholder="4500000"
                value={oldPrice}
                onChange={(e) => setOldPrice(e.target.value)}
                className="rounded-xl text-xs"
                dir="ltr"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-muted-foreground">موجودی (عدد) *</label>
              <Input
                type="number"
                placeholder="100"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                required
                className="rounded-xl text-xs"
                dir="ltr"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-muted-foreground">دسته‌بندی محصول</label>
              <Input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="rounded-xl text-xs"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-muted-foreground">وضعیت انتشار</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="rounded-xl border border-border bg-background px-3 py-2 text-xs font-bold text-foreground cursor-pointer"
              >
                <option value="published">منتشر شده</option>
                <option value="draft">پیش‌نویس</option>
                <option value="archived">آرشیو شده</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
              <input
                type="checkbox"
                checked={isSpecial}
                onChange={(e) => setIsSpecial(e.target.checked)}
                className="rounded text-primary size-4"
              />
              <span>محصول ویژه (Special)</span>
            </label>
            <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
              <input
                type="checkbox"
                checked={isBestSeller}
                onChange={(e) => setIsBestSeller(e.target.checked)}
                className="rounded text-primary size-4"
              />
              <span>پرفروش‌ترین (Best Seller)</span>
            </label>
          </div>

          <ProductDescriptionInput
            value={description}
            onChange={setDescription}
            placeholder="توضیحات جامع درباره سبک، متریال، نحوه ساخت و ویژگی‌های تابلو..."
          />
        </div>

        {/* Media Card */}
        <div className="rounded-3xl border border-border/60 bg-background/95 backdrop-blur-xl p-6 shadow-sm flex flex-col gap-4">
          <h2 className="text-sm font-black text-foreground border-b border-border/40 pb-3">تصاویر محصول</h2>
          <ImageUploader
            featuredImage={image}
            galleryImages={gallery}
            onFeaturedChange={(url) => setImage(url)}
            onGalleryChange={(urls) => setGallery(urls)}
          />
        </div>

        {/* Specifications Builder */}
        <div className="rounded-3xl border border-border/60 bg-background/95 backdrop-blur-xl p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <h2 className="text-sm font-black text-foreground">مشخصات فنی محصول</h2>
            <Button type="button" variant="outline" size="sm" onClick={handleAddSpec} className="rounded-xl text-xs gap-1">
              <Plus className="size-3.5" />
              <span>افزودن ردیف</span>
            </Button>
          </div>

          <div className="flex flex-col gap-2">
            {specs.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <Input
                  placeholder="ویژگی (مثال: ابعاد)"
                  value={item.key}
                  onChange={(e) => {
                    const copy = [...specs];
                    copy[idx].key = e.target.value;
                    setSpecs(copy);
                  }}
                  className="rounded-xl text-xs flex-1"
                />
                <Input
                  placeholder="مقدار (مثال: ۸۰ × ۶۰)"
                  value={item.value}
                  onChange={(e) => {
                    const copy = [...specs];
                    copy[idx].value = e.target.value;
                    setSpecs(copy);
                  }}
                  className="rounded-xl text-xs flex-1"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveSpec(idx)}
                  className="p-2 text-destructive hover:bg-destructive/10 rounded-xl transition-colors cursor-pointer"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}
