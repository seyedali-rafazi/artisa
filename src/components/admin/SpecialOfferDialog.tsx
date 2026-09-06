'use client';

import React, { useState, useEffect } from 'react';
import {
  SpecialOffer,
  SpecialOfferPayload,
  useCreateSpecialOffer,
  useUpdateSpecialOffer,
} from '@/hooks/useSpecialOffers';
import ProductSelector from './ProductSelector';
import ShamsiDateTimePicker from './ShamsiDateTimePicker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Sparkles,
  Save,
  Loader2,
  AlertCircle,
  Info,
  X,
} from 'lucide-react';

interface SpecialOfferDialogProps {
  isOpen: boolean;
  onClose: () => void;
  offerToEdit?: SpecialOffer | null;
}

export default function SpecialOfferDialog({
  isOpen,
  onClose,
  offerToEdit,
}: SpecialOfferDialogProps) {
  const isEditing = Boolean(offerToEdit);
  const createMutation = useCreateSpecialOffer();
  const updateMutation = useUpdateSpecialOffer();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  // Initialize or reset form values
  useEffect(() => {
    if (isOpen) {
      if (offerToEdit) {
        setTitle(offerToEdit.title || '');
        setDescription(offerToEdit.description || '');
        setStartAt(offerToEdit.start_at_tehran || offerToEdit.start_at || '');
        const initialIds =
          offerToEdit.product_ids && offerToEdit.product_ids.length > 0
            ? offerToEdit.product_ids.map(String)
            : (offerToEdit.products?.map((p) => String(p.id)) || []);
        setSelectedProductIds(initialIds);
        setIsActive(offerToEdit.is_active !== undefined ? offerToEdit.is_active : true);
      } else {
        // Defaults for new offer: start now, end in 7 days
        const now = new Date();
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        setTitle('');
        setDescription('');
        setStartAt(now.toISOString());
        setEndAt(nextWeek.toISOString());
        setSelectedProductIds([]);
        setIsActive(true);
      }
      setFormError(null);
    }
  }, [isOpen, offerToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Basic Validation
    if (!title.trim()) {
      setFormError('لطفاً عنوان پیشنهاد ویژه را وارد کنید.');
      return;
    }
    if (!startAt) {
      setFormError('لطفاً زمان شروع پیشنهاد را مشخص کنید.');
      return;
    }
    if (!endAt) {
      setFormError('لطفاً زمان پایان پیشنهاد را مشخص کنید.');
      return;
    }
    if (new Date(endAt) <= new Date(startAt)) {
      setFormError('زمان پایان پیشنهاد باید پس از زمان شروع باشد.');
      return;
    }
    if (selectedProductIds.length === 0) {
      setFormError('لطفاً حداقل یک محصول را برای این پیشنهاد ویژه انتخاب کنید.');
      return;
    }

    const payload: SpecialOfferPayload = {
      title: title.trim(),
      description: description.trim() || undefined,
      start_at: startAt,
      end_at: endAt,
      product_ids: selectedProductIds,
      is_active: isActive,
    };

    if (isEditing && offerToEdit?.id) {
      updateMutation.mutate(
        { id: offerToEdit.id, ...payload },
        {
          onSuccess: () => {
            onClose();
          },
          onError: (err: any) => {
            setFormError(err.message || 'خطا در بروزرسانی پیشنهاد ویژه.');
          },
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          onClose();
        },
        onError: (err: any) => {
          setFormError(err.message || 'خطا در ایجاد پیشنهاد ویژه.');
        },
      });
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="w-[95vw] sm:max-w-3xl md:max-w-4xl lg:max-w-5xl max-h-[90vh] p-0 rounded-3xl overflow-hidden flex flex-col gap-0 border border-border/80 shadow-2xl bg-background"
        dir="rtl"
        showCloseButton={false}
      >
        <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <DialogHeader className="p-6 sm:p-7 border-b border-border/60 bg-muted/20 shrink-0 flex flex-row items-center justify-between gap-4">
            <DialogTitle className="text-base sm:text-lg font-black text-foreground flex items-center gap-3">
              <div className="size-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Sparkles className="size-5" />
              </div>
              <div className="flex flex-col text-start">
                <span>{isEditing ? 'ویرایش پیشنهاد ویژه' : 'ایجاد پیشنهاد ویژه جدید'}</span>
                <span className="text-xs font-normal text-muted-foreground mt-0.5">
                  تنظیم بازه زمانی، محصولات متصل و وضعیت فعال‌سازی کمپین تخفیف
                </span>
              </div>
            </DialogTitle>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
              title="بستن"
            >
              <X className="size-5" />
            </button>
          </DialogHeader>

          {/* Body */}
          <div className="p-6 sm:p-8 flex flex-col gap-6 overflow-y-auto overflow-x-hidden flex-1">
            {formError && (
              <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold animate-in fade-in duration-200">
                <AlertCircle className="size-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Timezone Notice Banner */}
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/15 text-xs text-muted-foreground font-semibold">
              <Info className="size-5 text-primary shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5">
                <span className="font-extrabold text-foreground">
                  تقویم خورشیدی (شمسی) و ساعت رسمی تهران
                </span>
                <span className="leading-relaxed">
                  کلیه زمان‌های شروع و انقضای کمپین بر اساس تقویم شمسی و ساعت رسمی ایران (Asia/Tehran) محاسبه و به صورت خودکار مدیریت می‌شوند.
                </span>
              </div>
            </div>

            {/* Title & Description */}
            <div className="grid grid-cols-1 gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-foreground">
                  عنوان پیشنهاد ویژه / کمپین <span className="text-destructive">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="مثال: جشنواره شگفت‌انگیز تابستانه نقاشی"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="rounded-2xl h-12 text-xs sm:text-sm px-4 bg-background"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-foreground">
                  توضیحات تکمیلی (اختیاری)
                </label>
                <textarea
                  rows={3}
                  placeholder="توضیحات کوتاه درباره تخفیف‌ها یا شرایط کمپین..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="p-4 rounded-2xl border border-input bg-background text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary w-full resize-none leading-relaxed"
                />
              </div>
            </div>

            {/* Start and End Date Time Inputs (Shamsi & Asia/Tehran) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-3xl bg-muted/30 border border-border/60">
              <ShamsiDateTimePicker
                label="زمان شروع پیشنهاد (شمسی)"
                value={startAt}
                onChange={setStartAt}
                required
              />

              <ShamsiDateTimePicker
                label="زمان پایان پیشنهاد (شمسی)"
                value={endAt}
                onChange={setEndAt}
                minDate={startAt}
                required
              />
            </div>

            {/* Active Status Segmented Selector */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-3xl bg-card border border-border/80 shadow-xs gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-black text-foreground">
                  وضعیت فعال‌سازی دستی
                </span>
                <span className="text-[11px] text-muted-foreground font-semibold">
                  در صورت غیرفعال بودن، این پیشنهاد حتی در بازه زمانی تعیین شده در سایت نمایش داده نخواهد شد.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 w-full sm:w-auto shrink-0">
                <button
                  type="button"
                  onClick={() => setIsActive(true)}
                  className={`flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl text-xs font-extrabold transition-all border cursor-pointer ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 shadow-xs'
                      : 'bg-background text-muted-foreground border-border/60 hover:bg-muted/40'
                  }`}
                >
                  <span
                    className={`size-2 rounded-full ${
                      isActive ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground/30'
                    }`}
                  />
                  <span>فعال</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsActive(false)}
                  className={`flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl text-xs font-extrabold transition-all border cursor-pointer ${
                    !isActive
                      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 shadow-xs'
                      : 'bg-background text-muted-foreground border-border/60 hover:bg-muted/40'
                  }`}
                >
                  <span
                    className={`size-2 rounded-full ${
                      !isActive ? 'bg-amber-500' : 'bg-muted-foreground/30'
                    }`}
                  />
                  <span>غیرفعال</span>
                </button>
              </div>
            </div>

            {/* Product Selector */}
            <ProductSelector
              selectedIds={selectedProductIds}
              onChange={setSelectedProductIds}
              existingProducts={offerToEdit?.products}
            />
          </div>

          {/* Footer */}
          <DialogFooter className="p-5 sm:p-6 border-t border-border/60 bg-muted/20 flex flex-row items-center justify-end gap-3 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-2xl text-xs font-bold px-5 h-11 cursor-pointer"
              disabled={isSubmitting}
            >
              انصراف
            </Button>
            <Button
              type="submit"
              className="rounded-2xl text-xs font-extrabold gap-2 px-6 h-11 cursor-pointer shadow-md shadow-primary/20"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>در حال ذخیره...</span>
                </>
              ) : (
                <>
                  <Save className="size-4" />
                  <span>{isEditing ? 'ذخیره تغییرات' : 'ایجاد پیشنهاد ویژه'}</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
