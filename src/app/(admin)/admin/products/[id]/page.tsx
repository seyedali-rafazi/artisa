'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useAdminProducts, useUpdateProduct } from '@/hooks/useAdmin';
import ImageUploader from '@/components/admin/ImageUploader';
import ProductDescriptionInput from '@/components/admin/ProductDescriptionInput';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Save, Loader2, Plus, Trash2 } from 'lucide-react';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const { data, isLoading } = useAdminProducts({ limit: 100 });
  const updateMutation = useUpdateProduct();

  const product = data?.items?.find((p) => p.id === productId);

  const [name, setName] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [price, setPrice] = useState('');
  const [oldPrice, setOldPrice] = useState('');
  const [category, setCategory] = useState('');
  const [stockQuantity, setStockQuantity] = useState('100');
  const [status, setStatus] = useState('published');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [gallery, setGallery] = useState<string[]>([]);
  const [isSpecial, setIsSpecial] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([]);

  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setNameEn(product.nameEn || '');
      setPrice(product.price ? product.price.toString() : '');
      setOldPrice(product.oldPrice ? product.oldPrice.toString() : '');
      setCategory(product.category || '');
      setStockQuantity(product.stock_quantity ? product.stock_quantity.toString() : '0');
      setStatus(product.status || 'published');
      setDescription(product.description || '');
      setImage(product.image || '');
      setGallery(product.gallery || []);
      setIsSpecial(Boolean(product.isSpecial));
      setIsBestSeller(Boolean(product.isBestSeller));

      if (product.specifications) {
        const specArr = Object.entries(product.specifications).map(([key, value]) => ({ key, value }));
        setSpecs(specArr);
      }
    }
  }, [product]);

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

    updateMutation.mutate(
      {
        id: productId,
        name,
        nameEn,
        price: parseFloat(price),
        oldPrice: oldPrice ? parseFloat(oldPrice) : undefined,
        image,
        gallery,
        category,
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

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="size-6 text-primary animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-8 text-center text-xs font-bold text-destructive" dir="rtl">
        محصول مورد نظر پیدا نشد.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto" dir="rtl">
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary transition-colors cursor-pointer"
      >
        <ArrowRight className="size-4" />
        <span>بازگشت به لیست محصولات</span>
      </Link>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-black text-foreground">ویرایش محصول</h1>
          <Button
            type="submit"
            disabled={updateMutation.isPending}
            className="rounded-2xl font-extrabold text-xs gap-2 cursor-pointer shadow-lg shadow-primary/25"
          >
            {updateMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            <span>بروزرسانی تغییرات</span>
          </Button>
        </div>

        {/* Basic Info */}
        <div className="rounded-3xl border border-border/60 bg-background/95 backdrop-blur-xl p-6 shadow-sm flex flex-col gap-4">
          <h2 className="text-sm font-black text-foreground border-b border-border/40 pb-3">اطلاعات اصلی محصول</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-muted-foreground">نام فارسی محصول *</label>
              <Input
                type="text"
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
            placeholder="توضیحات جامع درباره محصول..."
          />
        </div>

        {/* Media */}
        <div className="rounded-3xl border border-border/60 bg-background/95 backdrop-blur-xl p-6 shadow-sm flex flex-col gap-4">
          <h2 className="text-sm font-black text-foreground border-b border-border/40 pb-3">تصاویر محصول</h2>
          <ImageUploader
            featuredImage={image}
            galleryImages={gallery}
            onFeaturedChange={(url) => setImage(url)}
            onGalleryChange={(urls) => setGallery(urls)}
          />
        </div>

        {/* Specs Builder */}
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
                  placeholder="ویژگی"
                  value={item.key}
                  onChange={(e) => {
                    const copy = [...specs];
                    copy[idx].key = e.target.value;
                    setSpecs(copy);
                  }}
                  className="rounded-xl text-xs flex-1"
                />
                <Input
                  placeholder="مقدار"
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
