'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { toPersianDigits, toStandardDigits, formatPersianPrice } from '@/lib/utils';
import { Percent, Sparkles, Tag, ArrowDownRight, RotateCcw, AlertCircle, CheckCircle2 } from 'lucide-react';

interface OfferPriceCalculatorProps {
  oldPrice: string;
  price: string;
  onChangeOldPrice: (value: string) => void;
  onChangePrice: (value: string) => void;
  stockQuantity?: string;
  onChangeStockQuantity?: (value: string) => void;
  showStock?: boolean;
  className?: string;
}

const PRESET_PERCENTAGES = [5, 10, 15, 20, 25, 30, 40, 50];

export default function OfferPriceCalculator({
  oldPrice,
  price,
  onChangeOldPrice,
  onChangePrice,
  stockQuantity,
  onChangeStockQuantity,
  showStock = true,
  className = '',
}: OfferPriceCalculatorProps) {
  const [discountPercent, setDiscountPercent] = useState<string>('');
  const [activePreset, setActivePreset] = useState<number | null>(null);

  // Parse numeric values safely
  const parsedOldPrice = parseFloat(toStandardDigits(oldPrice)) || 0;
  const parsedPrice = parseFloat(toStandardDigits(price)) || 0;
  const parsedPercent = parseFloat(toStandardDigits(discountPercent)) || 0;

  // Sync initial discount percent from existing oldPrice and price
  useEffect(() => {
    if (parsedOldPrice > 0 && parsedPrice > 0) {
      if (parsedOldPrice > parsedPrice) {
        const computed = Math.round(((parsedOldPrice - parsedPrice) / parsedOldPrice) * 100);
        setDiscountPercent(computed.toString());
        setActivePreset(PRESET_PERCENTAGES.includes(computed) ? computed : null);
      } else {
        setDiscountPercent('');
        setActivePreset(null);
      }
    }
  }, []);

  // Handle changes in Old Price
  const handleOldPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = toStandardDigits(e.target.value).replace(/[^0-9]/g, '');
    onChangeOldPrice(raw);

    const newOldPrice = parseFloat(raw) || 0;
    if (newOldPrice > 0 && parsedPercent > 0) {
      const calculated = Math.round(newOldPrice * (1 - parsedPercent / 100));
      onChangePrice(calculated.toString());
    } else if (newOldPrice > 0 && parsedPrice > 0 && !discountPercent) {
      if (newOldPrice > parsedPrice) {
        const computed = Math.round(((newOldPrice - parsedPrice) / newOldPrice) * 100);
        setDiscountPercent(computed.toString());
        setActivePreset(PRESET_PERCENTAGES.includes(computed) ? computed : null);
      }
    }
  };

  // Handle changes in Discount Percentage
  const handlePercentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = toStandardDigits(e.target.value).replace(/[^0-9]/g, '');
    let num = parseInt(raw, 10);
    if (isNaN(num)) {
      setDiscountPercent('');
      setActivePreset(null);
      return;
    }

    // Clamp between 0 and 99
    if (num > 99) num = 99;
    const finalVal = num.toString();
    setDiscountPercent(finalVal);
    setActivePreset(PRESET_PERCENTAGES.includes(num) ? num : null);

    if (parsedOldPrice > 0) {
      if (num > 0) {
        const calculated = Math.round(parsedOldPrice * (1 - num / 100));
        onChangePrice(calculated.toString());
      } else {
        // 0% means selling price = old price
        onChangePrice(parsedOldPrice.toString());
      }
    }
  };

  // Preset button click
  const handleSelectPreset = (percent: number) => {
    if (activePreset === percent) {
      // Toggle off
      setDiscountPercent('');
      setActivePreset(null);
      return;
    }

    setDiscountPercent(percent.toString());
    setActivePreset(percent);

    if (parsedOldPrice > 0) {
      const calculated = Math.round(parsedOldPrice * (1 - percent / 100));
      onChangePrice(calculated.toString());
    }
  };

  // Handle direct changes to New Price (Offer Price)
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = toStandardDigits(e.target.value).replace(/[^0-9]/g, '');
    onChangePrice(raw);

    const newPrice = parseFloat(raw) || 0;
    if (parsedOldPrice > 0 && newPrice > 0) {
      if (parsedOldPrice > newPrice) {
        const computed = Math.round(((parsedOldPrice - newPrice) / parsedOldPrice) * 100);
        setDiscountPercent(computed.toString());
        setActivePreset(PRESET_PERCENTAGES.includes(computed) ? computed : null);
      } else {
        setDiscountPercent('');
        setActivePreset(null);
      }
    } else {
      setDiscountPercent('');
      setActivePreset(null);
    }
  };

  // Reset discount: clear oldPrice & percent, keep current price as normal price
  const handleResetDiscount = () => {
    setDiscountPercent('');
    setActivePreset(null);
    onChangeOldPrice('');
  };

  const hasDiscount = Boolean(parsedOldPrice > 0 && parsedPrice > 0 && parsedOldPrice > parsedPrice);
  const savings = hasDiscount ? parsedOldPrice - parsedPrice : 0;
  const isInverseWarning = Boolean(parsedOldPrice > 0 && parsedPrice > 0 && parsedPrice > parsedOldPrice);

  return (
    <div className={`flex flex-col gap-4 p-5 rounded-3xl bg-muted/25 border border-border/70 ${className}`} dir="rtl">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-border/40">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Percent className="size-4" />
          </div>
          <div>
            <span className="text-xs font-black text-foreground">
              قیمت‌گذاری و محاسبه‌گر درصد پیشنهاد ویژه
            </span>
            <p className="text-[11px] font-semibold text-muted-foreground">
              با ورود قیمت قدیم و درصد تخفیف، قیمت نهایی پیشنهاد خودکار محاسبه می‌شود
            </p>
          </div>
        </div>

        {hasDiscount && (
          <button
            type="button"
            onClick={handleResetDiscount}
            className="text-[11px] font-bold text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors cursor-pointer"
          >
            <RotateCcw className="size-3" />
            <span>حذف تخفیف</span>
          </button>
        )}
      </div>

      {/* Inputs Grid */}
      <div className={`grid grid-cols-1 ${showStock ? 'sm:grid-cols-4' : 'sm:grid-cols-3'} gap-4`}>
        {/* 1. Old Price Input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-black text-foreground flex items-center gap-1">
            <Tag className="size-3.5 text-muted-foreground" />
            <span>قیمت قبلی / اصلی (تومان)</span>
          </label>
          <div className="relative">
            <Input
              type="text"
              placeholder="مثال: ۴۵۰۰۰۰۰"
              value={oldPrice}
              onChange={handleOldPriceChange}
              className="rounded-2xl text-xs sm:text-sm pl-4 pr-3 h-11 bg-background"
              dir="ltr"
            />
          </div>
          {parsedOldPrice > 0 ? (
            <span className="text-[10px] font-extrabold text-muted-foreground pr-1 truncate">
              {formatPersianPrice(parsedOldPrice)}
            </span>
          ) : (
            <span className="text-[10px] text-muted-foreground/60 pr-1">قیمت پیش از تخفیف</span>
          )}
        </div>

        {/* 2. Discount Percentage Input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-black text-primary flex items-center gap-1">
            <Sparkles className="size-3.5 text-primary" />
            <span>درصد پیشنهاد ویژه (٪)</span>
          </label>
          <div className="relative">
            <Input
              type="text"
              placeholder="مثال: ۲۰"
              value={discountPercent}
              onChange={handlePercentChange}
              className="rounded-2xl text-xs sm:text-sm pl-7 pr-3 h-11 bg-background font-bold text-primary border-primary/40 focus:border-primary"
              dir="ltr"
            />
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-black text-primary pointer-events-none">
              ٪
            </span>
          </div>
          {parsedPercent > 0 && parsedOldPrice > 0 ? (
            <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 pr-1 truncate">
              {toPersianDigits(parsedPercent)}٪ تخفیف اعمال شد
            </span>
          ) : (
            <span className="text-[10px] text-muted-foreground/60 pr-1">عددی بین ۱ تا ۹۹</span>
          )}
        </div>

        {/* 3. New Price (Selling Price) Input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-black text-foreground flex items-center gap-1">
            <ArrowDownRight className="size-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>قیمت نهایی پیشنهاد (تومان) *</span>
          </label>
          <div className="relative">
            <Input
              type="text"
              placeholder="مثال: ۳۶۰۰۰۰۰"
              value={price}
              onChange={handlePriceChange}
              required
              className="rounded-2xl text-xs sm:text-sm pl-4 pr-3 h-11 bg-background font-black text-foreground"
              dir="ltr"
            />
          </div>
          {parsedPrice > 0 ? (
            <span className="text-[10px] font-extrabold text-foreground pr-1 truncate">
              {formatPersianPrice(parsedPrice)}
            </span>
          ) : (
            <span className="text-[10px] text-destructive/80 pr-1">ورود قیمت الزامی است</span>
          )}
        </div>

        {/* 4. Stock Quantity (Optional) */}
        {showStock && onChangeStockQuantity && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black text-muted-foreground">
              موجودی اثر (عدد) *
            </label>
            <Input
              type="number"
              placeholder="100"
              value={stockQuantity || ''}
              onChange={(e) => onChangeStockQuantity(e.target.value)}
              required
              className="rounded-2xl text-xs sm:text-sm pl-4 pr-3 h-11 bg-background"
              dir="ltr"
            />
            <span className="text-[10px] text-muted-foreground/60 pr-1">تعداد موجود در انبار</span>
          </div>
        )}
      </div>

      {/* Quick Preset Percentage Chips */}
      <div className="flex items-center gap-1.5 flex-wrap pt-1">
        <span className="text-[11px] font-extrabold text-muted-foreground ml-1">
          درصدهای پرکاربرد:
        </span>
        {PRESET_PERCENTAGES.map((pct) => {
          const isSelected = activePreset === pct;
          return (
            <button
              key={pct}
              type="button"
              onClick={() => handleSelectPreset(pct)}
              className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                isSelected
                  ? 'bg-primary text-primary-foreground border-primary shadow-xs scale-105'
                  : 'bg-background hover:bg-muted/80 text-foreground border-border/80 hover:border-primary/40'
              }`}
            >
              {toPersianDigits(pct)}٪
            </button>
          );
        })}
      </div>

      {/* Live Calculation Feedback Card */}
      {hasDiscount && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-300 font-bold animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>
              پیشنهاد ویژه فعال شد: <strong>{toPersianDigits(Math.round(((parsedOldPrice - parsedPrice) / parsedOldPrice) * 100))}٪ تخفیف</strong> روی این اثر محاسبه گردید.
            </span>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto text-[11px]">
            <span className="text-muted-foreground">میزان سود خریدار:</span>
            <span className="font-black text-emerald-800 dark:text-emerald-200 bg-emerald-500/20 px-2.5 py-0.5 rounded-lg">
              {formatPersianPrice(savings)}
            </span>
          </div>
        </div>
      )}

      {/* Warning if price > oldPrice */}
      {isInverseWarning && (
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400 font-bold">
          <AlertCircle className="size-4 shrink-0" />
          <span>توجه: قیمت فروش وارد شده از قیمت قبلی بیشتر است. در صورت تمایل به اعمال تخفیف، قیمت فروش باید کمتر از قیمت قبل باشد.</span>
        </div>
      )}
    </div>
  );
}
