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
        setEndAt(offerToEdit.end_at_tehran || offerToEdit.end_at || '');
        setSelectedProductIds(offerToEdit.product_ids || []);
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

    if (!title.trim() || title.trim().length < 2) {
      setFormError('عنوان پیشنهاد باید حداقل ۲ کاراکتر باشد.');
      return;
    }

    if (!startAt || !endAt) {
      setFormError('لطفاً تاریخ و زمان شروع و پایان را مشخص نمایید.');
      return;
    }

    const startDate = new Date(startAt);
    const endDate = new Date(endAt);
    if (endDate <= startDate) {
      setFormError('زمان پایان پیشنهاد باید بعد از زمان شروع باشد.');
      return;
    }

    if (selectedProductIds.length === 0) {
      setFormError('حداقل یک محصول باید برای این پیشنهاد ویژه انتخاب شود.');
      return;
    }

    const payload: SpecialOfferPayload = {
      title: title.trim(),
      description: description.trim() || undefined,
      product_ids: selectedProductIds,
      start_at: startAt,
      end_at: endAt,
      is_active: isActive,
    };

    if (isEditing && offerToEdit) {
      updateMutation.mutate(
        { id: offerToEdit.id, ...payload },
        {
          onSuccess: () => {
            onClose();
          },
          onError: (err: any) => {
            setFormError(err.message || 'خطا در ویرایش پیشنهاد ویژه.');
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
          <DialogHeader className="p-6 border-b border-border/60 bg-muted/20 shrink-0 flex flex-row items-center justify-between gap-4">
            <DialogTitle className="text-base sm:text-lg font-black text-foreground flex items-center gap-2">
              <Sparkles className="size-5 text-primary" />
              <span>{isEditing ? 'ویرایش پیشنهاد ویژه' : 'ایجاد پیشنهاد ویژه جدید'}</span>
            </DialogTitle>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="بستن"
            >
              <X className="size-4" />
            </button>
          </DialogHeader>

          {/* Body */}
          <div className="p-6 flex flex-col gap-6 overflow-y-auto overflow-x-hidden flex-1">
            {formError && (
              <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold animate-in fade-in duration-200">
                <AlertCircle className="size-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Timezone Notice Banner */}
            <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-primary/5 border border-primary/15 text-xs text-muted-foreground font-semibold">
              <Info className="size-4 text-primary shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5">
                <span className="font-extrabold text-foreground">
                  تقویم خورشیدی (شمسی) و ساعت رسمی تهران
                </span>
                <span>
                  کلیه زمان‌های شروع و انقضای کمپین بر اساس تقویم شمسی و ساعت رسمی ایران (Asia/Tehran) محاسبه و به صورت خودکار مدیریت می‌شوند.
                </span>
              </div>
            </div>

            {/* Title & Description */}
            <div className="grid grid-cols-1 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-foreground">
                  عنوان پیشنهاد ویژه / کمپین <span className="text-destructive">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="مثال: جشنواره شگفت‌انگیز تابستانه نقاشی"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="rounded-2xl h-11 text-xs bg-background"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-foreground">
                  توضیحات تکمیلی (اختیاری)
                </label>
                <textarea
                  rows={2}
                  placeholder="توضیحات کوتاه درباره تخفیف‌ها یا شرایط کمپین..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="p-3 rounded-2xl border border-input bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary w-full resize-none"
                />
              </div>
            </div>

            {/* Start and End Date Time Inputs (Shamsi & Asia/Tehran) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-3xl bg-muted/30 border border-border/60">
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

            {/* Active Toggle Switch */}
            <div className="flex items-center justify-between p-4 rounded-3xl bg-card border border-border/80 shadow-xs">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-black text-foreground">
                  وضعیت فعال‌سازی دستی
                </span>
                <span className="text-[11px] text-muted-foreground font-semibold">
                  در صورت غیرفعال بودن، پیشنهاد حتی در بازه زمانی تعیین شده نمایش داده نخواهد شد.
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            {/* Product Selector */}
            <ProductSelector
              selectedIds={selectedProductIds}
              onChange={setSelectedProductIds}
            />
          </div>

          {/* Footer */}
          <DialogFooter className="p-4 border-t border-border/60 bg-muted/20 flex flex-row items-center justify-end gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-2xl text-xs font-bold cursor-pointer"
              disabled={isSubmitting}
            >
              انصراف
            </Button>
            <Button
              type="submit"
              className="rounded-2xl text-xs font-extrabold gap-2 cursor-pointer shadow-md shadow-primary/20"
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
