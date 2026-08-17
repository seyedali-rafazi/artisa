'use client';

import React, { useState, useEffect } from 'react';
import {
  SpecialOffer,
  SpecialOfferPayload,
  useCreateSpecialOffer,
  useUpdateSpecialOffer,
} from '@/hooks/useSpecialOffers';
import ProductSelector from './ProductSelector';
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
  Calendar,
  Clock,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Info,
} from 'lucide-react';

interface SpecialOfferDialogProps {
  isOpen: boolean;
  onClose: () => void;
  offerToEdit?: SpecialOffer | null;
}

/**
 * Converts an ISO string into `YYYY-MM-DDTHH:mm` in Asia/Tehran timezone.
 */
function toTehranInputDatetime(isoString?: string): string {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '';
    // Format to Asia/Tehran parts
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Tehran',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const parts = formatter.formatToParts(d);
    const getPart = (type: string) => parts.find((p) => p.type === type)?.value || '';
    const year = getPart('year');
    const month = getPart('month');
    const day = getPart('day');
    const hour = getPart('hour');
    const minute = getPart('minute');
    return `${year}-${month}-${day}T${hour}:${minute}`;
  } catch {
    return '';
  }
}

/**
 * Formats a local datetime-local string (assumed to be Asia/Tehran) into an ISO string.
 */
function tehranInputToIso(datetimeLocalStr: string): string {
  if (!datetimeLocalStr) return '';
  // Append standard Iran timezone offset or let backend parse with Asia/Tehran context
  return `${datetimeLocalStr}:00+03:30`;
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
        setStartAt(toTehranInputDatetime(offerToEdit.start_at_tehran || offerToEdit.start_at));
        setEndAt(toTehranInputDatetime(offerToEdit.end_at_tehran || offerToEdit.end_at));
        setSelectedProductIds(offerToEdit.product_ids || []);
        setIsActive(offerToEdit.is_active !== undefined ? offerToEdit.is_active : true);
      } else {
        // Defaults for new offer: start now, end in 7 days
        const now = new Date();
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        setTitle('');
        setDescription('');
        setStartAt(toTehranInputDatetime(now.toISOString()));
        setEndAt(toTehranInputDatetime(nextWeek.toISOString()));
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
      start_at: tehranInputToIso(startAt),
      end_at: tehranInputToIso(endAt),
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 rounded-3xl" dir="rtl">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <DialogHeader className="p-6 border-b border-border/60 bg-muted/20">
            <DialogTitle className="text-lg font-black text-foreground flex items-center gap-2">
              <Sparkles className="size-5 text-primary" />
              <span>{isEditing ? 'ویرایش پیشنهاد ویژه' : 'ایجاد پیشنهاد ویژه جدید'}</span>
            </DialogTitle>
          </DialogHeader>

          {/* Body */}
          <div className="p-6 flex flex-col gap-6">
            {formError && (
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold animate-in fade-in duration-200">
                <AlertCircle className="size-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Timezone Notice Banner */}
            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-primary/5 border border-primary/15 text-xs text-muted-foreground font-semibold">
              <Info className="size-4 text-primary shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold text-foreground block">
                  منطقه زمانی تهران (Asia/Tehran)
                </span>
                <span>
                  کلیه زمان‌های شروع و پایان بر اساس ساعت رسمی تهران محاسبه می‌شوند و انقضای پیشنهاد به صورت خودکار اعمال خواهد شد.
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
                  className="rounded-xl h-11 text-xs bg-background"
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
                  className="p-3 rounded-xl border border-input bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary w-full resize-none"
                />
              </div>
            </div>

            {/* Start and End Date Time Inputs (Asia/Tehran) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-muted/30 border border-border/60">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-foreground flex items-center gap-1.5">
                  <Calendar className="size-3.5 text-primary" />
                  <span>زمان شروع (به وقت تهران)</span>
                  <span className="text-destructive">*</span>
                </label>
                <Input
                  type="datetime-local"
                  value={startAt}
                  onChange={(e) => setStartAt(e.target.value)}
                  className="rounded-xl h-11 text-xs bg-background"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-foreground flex items-center gap-1.5">
                  <Clock className="size-3.5 text-primary" />
                  <span>زمان پایان (به وقت تهران)</span>
                  <span className="text-destructive">*</span>
                </label>
                <Input
                  type="datetime-local"
                  value={endAt}
                  onChange={(e) => setEndAt(e.target.value)}
                  className="rounded-xl h-11 text-xs bg-background"
                  required
                />
              </div>
            </div>

            {/* Active Toggle Switch */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-card border border-border">
              <div className="flex flex-col">
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
          <DialogFooter className="p-4 border-t border-border/60 bg-muted/20 flex flex-row items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl text-xs font-bold cursor-pointer"
              disabled={isSubmitting}
            >
              انصراف
            </Button>
            <Button
              type="submit"
              className="rounded-xl text-xs font-extrabold gap-2 cursor-pointer shadow-md shadow-primary/20"
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
