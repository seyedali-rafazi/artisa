'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCreateProduct } from '@/hooks/useAdmin';
import ImageUploader from '@/components/admin/ImageUploader';
import ProductDescriptionInput from '@/components/admin/ProductDescriptionInput';
import OfferPriceCalculator from '@/components/admin/OfferPriceCalculator';
import ProductSpecificationModal from '@/components/admin/ProductSpecificationModal';
import { useCreateSpecificationSetting } from '@/hooks/useSpecificationSettings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Save, Loader2, Plus, Trash2, SlidersHorizontal, BookmarkPlus } from 'lucide-react';
import { toast } from 'sonner';


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
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([]);
  const [isSpecsModalOpen, setIsSpecsModalOpen] = useState(false);

  const createSpecSettingMutation = useCreateSpecificationSetting();

  const handleAddSpec = () => {
    setSpecs([...specs, { key: '', value: '' }]);
  };

  const handleRemoveSpec = (idx: number) => {
    const updated = [...specs];
    updated.splice(idx, 1);
    setSpecs(updated);
  };

  const handleAddSpecsFromModal = (newItems: { key: string; value: string }[]) => {
    setSpecs((prev) => {
      const existingKeys = new Set(
        prev.map((s) => s.key.trim().toLowerCase()).filter((k) => k.length > 0)
      );
      const toAdd = newItems.filter(
        (item) => !existingKeys.has(item.key.trim().toLowerCase())
      );
      // Remove placeholder empty rows if any
      const cleaned = prev.filter((s) => s.key.trim() || s.value.trim());
      return [...cleaned, ...toAdd];
    });
  };

  const handleSaveRowToSettings = (key: string, value: string) => {
    if (!key.trim()) {
      toast.error('لطفاً عنوان ویژگی را وارد نمایید.');
      return;
    }
    createSpecSettingMutation.mutate(
      {
        title: key.trim(),
        default_value: value.trim(),
        category: category || undefined,
      },
      {
        onSuccess: () => {
          toast.success(`ویژگی «${key.trim()}» با موفقیت در لیست تنظیمات ذخیره شد.`);
        },
        onError: () => {
          toast.error('خطا در ذخیره ویژگی در تنظیمات.');
        },
      }
    );
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

    const parsedOldPrice = oldPrice ? parseFloat(oldPrice) : undefined;
    const finalOldPrice =
      parsedOldPrice !== undefined && !isNaN(parsedOldPrice) && parsedOldPrice > 0 ? parsedOldPrice : undefined;

    createMutation.mutate(
      {
        name,
        nameEn,
        price: parseFloat(price),
        oldPrice: finalOldPrice,
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
          router.refresh();
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

          {/* Price & Offer Calculator */}
          <OfferPriceCalculator
            price={price}
            oldPrice={oldPrice}
            onChangePrice={setPrice}
            onChangeOldPrice={setOldPrice}
            stockQuantity={stockQuantity}
            onChangeStockQuantity={setStockQuantity}
            showStock={true}
          />

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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border/40 pb-3">
            <div>
              <h2 className="text-sm font-black text-foreground">مشخصات فنی محصول</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                ویژگی‌های ساختاری اثر (امکان انتخاب از مشخصات ذخیره‌شده پیش‌فرض یا افزودن ردیف دستی)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsSpecsModalOpen(true)}
                className="rounded-xl text-xs gap-1.5 border-primary/30 text-primary hover:bg-primary/10 transition-colors cursor-pointer"
              >
                <SlidersHorizontal className="size-3.5" />
                <span>انتخاب از مشخصات ذخیره شده</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddSpec}
                className="rounded-xl text-xs gap-1 cursor-pointer"
              >
                <Plus className="size-3.5" />
                <span>افزودن ردیف دستی</span>
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            {specs.length === 0 ? (
              <div className="py-6 text-center text-xs text-muted-foreground border border-dashed border-border/60 rounded-2xl">
                هیچ مشخصه فنی ثبت نشده است. از دکمه «انتخاب از مشخصات ذخیره شده» یا «افزودن ردیف دستی» استفاده کنید.
              </div>
            ) : (
              specs.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 sm:gap-3">
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
                    onClick={() => handleSaveRowToSettings(item.key, item.value)}
                    className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-colors cursor-pointer shrink-0"
                    title="ذخیره این ویژگی در لیست تنظیمات مشخصات"
                  >
                    <BookmarkPlus className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveSpec(idx)}
                    className="p-2 text-destructive hover:bg-destructive/10 rounded-xl transition-colors cursor-pointer shrink-0"
                    title="حذف ردیف"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </form>

      {/* Specifications Selection & Management Modal */}
      <ProductSpecificationModal
        isOpen={isSpecsModalOpen}
        onClose={() => setIsSpecsModalOpen(false)}
        onSelectSpecs={handleAddSpecsFromModal}
        currentSpecs={specs}
      />
    </div>
  );
}

