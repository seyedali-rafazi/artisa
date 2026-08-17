'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  JALALI_MONTH_NAMES,
  JALALI_WEEKDAYS,
  toTehranJalali,
  jalaliToTehranIso,
  getJalaliMonthDays,
  getJalaliDayOfWeek,
  formatJalaliReadable,
  JalaliDateTime,
} from '@/lib/jalali';
import { toPersianDigits } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Calendar as CalendarIcon,
  Clock,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Check,
  X,
  RotateCcw,
  Sun,
  Moon,
  AlertCircle,
} from 'lucide-react';

interface ShamsiDateTimePickerProps {
  value?: string; // ISO string in Asia/Tehran timezone
  onChange: (isoString: string) => void;
  label?: string;
  required?: boolean;
  minDate?: string; // ISO string for minimum allowed date/time
  disabled?: boolean;
  error?: string;
  placeholder?: string;
  className?: string;
}

export default function ShamsiDateTimePicker({
  value,
  onChange,
  label,
  required,
  minDate,
  disabled,
  error,
  placeholder = 'انتخاب تاریخ و زمان (شمسی)...',
  className = '',
}: ShamsiDateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse current value or fallback to now
  const parsedValue: JalaliDateTime = toTehranJalali(value || undefined);
  const todayJalali = toTehranJalali(new Date());

  // View state for browsing calendar (Month / Year)
  const [viewYear, setViewYear] = useState(parsedValue.jy);
  const [viewMonth, setViewMonth] = useState(parsedValue.jm);

  // Temporary selected state while picker is open
  const [tempDate, setTempDate] = useState<JalaliDateTime>(parsedValue);

  // View mode: 'days' | 'months' | 'years'
  const [viewMode, setViewMode] = useState<'days' | 'months' | 'years'>('days');

  // Sync internal view when `value` changes externally
  useEffect(() => {
    if (value) {
      const parsed = toTehranJalali(value);
      setTempDate(parsed);
      setViewYear(parsed.jy);
      setViewMonth(parsed.jm);
    }
  }, [value]);

  // Handle click outside to close popover
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setViewMode('days');
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Calculate calendar grid
  const daysInMonth = getJalaliMonthDays(viewYear, viewMonth);
  const firstDayWeekdayIndex = getJalaliDayOfWeek(viewYear, viewMonth, 1); // 0=Sat, ..., 6=Fri

  // Parse minDate if provided
  const minJalali = minDate ? toTehranJalali(minDate) : null;

  const isDayDisabled = (day: number): boolean => {
    if (!minJalali) return false;
    if (viewYear < minJalali.jy) return true;
    if (viewYear === minJalali.jy && viewMonth < minJalali.jm) return true;
    if (
      viewYear === minJalali.jy &&
      viewMonth === minJalali.jm &&
      day < minJalali.jd
    ) {
      return true;
    }
    return false;
  };

  // Month navigation
  const handlePrevMonth = () => {
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // Select day
  const handleSelectDay = (day: number) => {
    if (isDayDisabled(day)) return;
    const updated: JalaliDateTime = {
      ...tempDate,
      jy: viewYear,
      jm: viewMonth,
      jd: day,
    };
    setTempDate(updated);
  };

  // Time changes
  const handleHourChange = (newHour: number) => {
    const hour = Math.max(0, Math.min(23, newHour));
    setTempDate((prev) => ({ ...prev, hour }));
  };

  const handleMinuteChange = (newMinute: number) => {
    const minute = Math.max(0, Math.min(59, newMinute));
    setTempDate((prev) => ({ ...prev, minute }));
  };

  // Apply selection and close
  const handleApply = () => {
    const isoString = jalaliToTehranIso(
      tempDate.jy,
      tempDate.jm,
      tempDate.jd,
      tempDate.hour,
      tempDate.minute
    );
    onChange(isoString);
    setIsOpen(false);
    setViewMode('days');
  };

  // Quick Preset Handlers
  const handlePresetNow = () => {
    const nowJ = toTehranJalali(new Date());
    setTempDate(nowJ);
    setViewYear(nowJ.jy);
    setViewMonth(nowJ.jm);
  };

  const handlePresetAddDays = (days: number) => {
    const base = value ? new Date(value) : new Date();
    const future = new Date(base.getTime() + days * 24 * 60 * 60 * 1000);
    const j = toTehranJalali(future);
    setTempDate(j);
    setViewYear(j.jy);
    setViewMonth(j.jm);
  };

  const handlePresetEndOfMonth = () => {
    const lastDay = getJalaliMonthDays(viewYear, viewMonth);
    setTempDate((prev) => ({
      ...prev,
      jy: viewYear,
      jm: viewMonth,
      jd: lastDay,
      hour: 23,
      minute: 59,
    }));
  };

  // Generate Year range (1400 - 1415)
  const availableYears = Array.from({ length: 16 }, (_, i) => 1400 + i);

  return (
    <div
      ref={containerRef}
      className={`flex flex-col gap-1.5 w-full relative ${className}`}
      dir="rtl"
    >
      {/* Label */}
      {label && (
        <label className="text-xs font-black text-foreground flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <CalendarIcon className="size-3.5 text-primary" />
            <span>{label}</span>
            {required && <span className="text-destructive">*</span>}
          </span>
          <span className="text-[10px] font-semibold text-muted-foreground">
            (ساعت رسمی تهران)
          </span>
        </label>
      )}

      {/* Input Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setIsOpen((prev) => !prev);
            setViewMode('days');
          }
        }}
        className={`w-full min-h-[44px] px-3.5 py-2 rounded-2xl border text-right transition-all flex items-center justify-between gap-2 cursor-pointer select-none ${
          isOpen
            ? 'border-primary ring-2 ring-primary/20 bg-background shadow-sm'
            : 'border-input bg-background hover:border-primary/50'
        } ${disabled ? 'opacity-50 cursor-not-allowed bg-muted' : ''}`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="size-7 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <CalendarIcon className="size-3.5" />
          </div>
          <div className="flex flex-col min-w-0">
            {value ? (
              <span className="text-xs font-extrabold text-foreground truncate">
                {formatJalaliReadable(value, {
                  showWeekday: true,
                  showTime: true,
                })}
              </span>
            ) : (
              <span className="text-xs text-muted-foreground font-semibold">
                {placeholder}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] px-2 py-0.5 rounded-lg bg-muted text-muted-foreground font-bold border border-border">
            شمسی
          </span>
          <ChevronLeft
            className={`size-4 text-muted-foreground transition-transform duration-200 ${
              isOpen ? '-rotate-90 text-primary' : ''
            }`}
          />
        </div>
      </button>

      {/* Error Message */}
      {error && (
        <span className="text-[11px] text-destructive font-bold flex items-center gap-1 mt-0.5">
          <AlertCircle className="size-3" />
          <span>{error}</span>
        </span>
      )}

      {/* Popover Calendar & Time Picker Panel */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 z-50 w-full sm:w-[380px] max-w-[calc(100vw-2rem)] rounded-3xl bg-popover border border-border shadow-2xl p-4 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
          {/* Calendar Header / Month & Year Selectors */}
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-border">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="ماه قبل"
            >
              <ChevronRight className="size-4" />
            </button>

            <div className="flex items-center gap-1.5">
              {/* Month Selector Button */}
              <button
                type="button"
                onClick={() =>
                  setViewMode((m) => (m === 'months' ? 'days' : 'months'))
                }
                className={`px-2.5 py-1 rounded-xl text-xs font-black transition-colors cursor-pointer ${
                  viewMode === 'months'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-muted/60 text-foreground hover:bg-muted'
                }`}
              >
                {JALALI_MONTH_NAMES[viewMonth - 1]}
              </button>

              {/* Year Selector Button */}
              <button
                type="button"
                onClick={() =>
                  setViewMode((m) => (m === 'years' ? 'days' : 'years'))
                }
                className={`px-2.5 py-1 rounded-xl text-xs font-black transition-colors cursor-pointer ${
                  viewMode === 'years'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-muted/60 text-foreground hover:bg-muted'
                }`}
              >
                {toPersianDigits(viewYear)}
              </button>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="ماه بعد"
            >
              <ChevronLeft className="size-4" />
            </button>
          </div>

          {/* Months View Grid */}
          {viewMode === 'months' && (
            <div className="grid grid-cols-3 gap-2 py-2">
              {JALALI_MONTH_NAMES.map((name, idx) => {
                const monthNum = idx + 1;
                const isSelectedMonth = monthNum === viewMonth;
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => {
                      setViewMonth(monthNum);
                      setViewMode('days');
                    }}
                    className={`py-2 px-1 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                      isSelectedMonth
                        ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                        : 'bg-muted/30 text-foreground hover:bg-muted'
                    }`}
                  >
                    {name}
                  </button>
                );
              })}
            </div>
          )}

          {/* Years View Grid */}
          {viewMode === 'years' && (
            <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto py-2">
              {availableYears.map((yr) => {
                const isSelectedYear = yr === viewYear;
                return (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => {
                      setViewYear(yr);
                      setViewMode('days');
                    }}
                    className={`py-2 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                      isSelectedYear
                        ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                        : 'bg-muted/30 text-foreground hover:bg-muted'
                    }`}
                  >
                    {toPersianDigits(yr)}
                  </button>
                );
              })}
            </div>
          )}

          {/* Days Calendar Matrix */}
          {viewMode === 'days' && (
            <div className="flex flex-col gap-2">
              {/* Weekday Names Header */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {JALALI_WEEKDAYS.map((wd) => (
                  <span
                    key={wd.full}
                    className={`text-[11px] font-black py-1 select-none ${
                      wd.isWeekend ? 'text-destructive' : 'text-muted-foreground'
                    }`}
                  >
                    {wd.short}
                  </span>
                ))}
              </div>

              {/* Day Cells */}
              <div className="grid grid-cols-7 gap-1">
                {/* Empty slots before first day */}
                {Array.from({ length: firstDayWeekdayIndex }).map((_, idx) => (
                  <div key={`empty-${idx}`} className="size-8" />
                ))}

                {/* Day Buttons */}
                {Array.from({ length: daysInMonth }).map((_, idx) => {
                  const day = idx + 1;
                  const isSelected =
                    tempDate.jy === viewYear &&
                    tempDate.jm === viewMonth &&
                    tempDate.jd === day;
                  const isToday =
                    todayJalali.jy === viewYear &&
                    todayJalali.jm === viewMonth &&
                    todayJalali.jd === day;
                  const disabled = isDayDisabled(day);

                  return (
                    <button
                      key={day}
                      type="button"
                      disabled={disabled}
                      onClick={() => handleSelectDay(day)}
                      className={`size-8 rounded-xl text-xs font-black flex items-center justify-center transition-all cursor-pointer relative ${
                        isSelected
                          ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25 scale-105 z-10'
                          : isToday
                          ? 'border border-primary text-primary hover:bg-primary/10'
                          : 'text-foreground hover:bg-muted'
                      } ${
                        disabled
                          ? 'opacity-30 cursor-not-allowed hover:bg-transparent text-muted-foreground'
                          : ''
                      }`}
                    >
                      <span>{toPersianDigits(day)}</span>
                      {isToday && !isSelected && (
                        <span className="absolute bottom-0.5 size-1 rounded-full bg-primary" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Time Picker Section */}
          <div className="pt-3 border-t border-border flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-foreground flex items-center gap-1.5">
                <Clock className="size-3.5 text-primary" />
                <span>ساعت و دقیقه</span>
              </span>
              <span className="text-xs font-black px-2 py-0.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
                {toPersianDigits(String(tempDate.hour).padStart(2, '0'))}:
                {toPersianDigits(String(tempDate.minute).padStart(2, '0'))}
              </span>
            </div>

            {/* Hour & Minute Pickers */}
            <div className="grid grid-cols-2 gap-2">
              {/* Hour Selector */}
              <div className="flex items-center gap-1.5 bg-muted/40 p-1.5 rounded-2xl border border-border">
                <span className="text-[11px] font-bold text-muted-foreground px-1">
                  ساعت:
                </span>
                <select
                  value={tempDate.hour}
                  onChange={(e) => handleHourChange(parseInt(e.target.value, 10))}
                  className="bg-background text-foreground text-xs font-black rounded-xl p-1.5 flex-1 border border-input focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer text-center"
                >
                  {Array.from({ length: 24 }).map((_, h) => (
                    <option key={h} value={h}>
                      {toPersianDigits(String(h).padStart(2, '0'))} ({h < 12 ? 'صبح' : 'عصر'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Minute Selector */}
              <div className="flex items-center gap-1.5 bg-muted/40 p-1.5 rounded-2xl border border-border">
                <span className="text-[11px] font-bold text-muted-foreground px-1">
                  دقیقه:
                </span>
                <select
                  value={tempDate.minute}
                  onChange={(e) => handleMinuteChange(parseInt(e.target.value, 10))}
                  className="bg-background text-foreground text-xs font-black rounded-xl p-1.5 flex-1 border border-input focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer text-center"
                >
                  {Array.from({ length: 60 }).map((_, m) => (
                    <option key={m} value={m}>
                      {toPersianDigits(String(m).padStart(2, '0'))}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Minute Shortcuts */}
            <div className="flex items-center justify-between gap-1">
              {[0, 15, 30, 45, 59].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => handleMinuteChange(m)}
                  className={`px-2 py-1 rounded-xl text-[10px] font-black transition-colors cursor-pointer flex-1 text-center ${
                    tempDate.minute === m
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {toPersianDigits(String(m).padStart(2, '0'))}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Presets Bar */}
          <div className="pt-2 border-t border-border flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={handlePresetNow}
              className="px-2 py-1 rounded-xl bg-muted/60 hover:bg-primary/10 text-muted-foreground hover:text-primary text-[10px] font-extrabold transition-colors cursor-pointer"
            >
              هم‌اکنون
            </button>
            <button
              type="button"
              onClick={() => handlePresetAddDays(1)}
              className="px-2 py-1 rounded-xl bg-muted/60 hover:bg-primary/10 text-muted-foreground hover:text-primary text-[10px] font-extrabold transition-colors cursor-pointer"
            >
              +۲۴ ساعت
            </button>
            <button
              type="button"
              onClick={() => handlePresetAddDays(3)}
              className="px-2 py-1 rounded-xl bg-muted/60 hover:bg-primary/10 text-muted-foreground hover:text-primary text-[10px] font-extrabold transition-colors cursor-pointer"
            >
              +۳ روز
            </button>
            <button
              type="button"
              onClick={() => handlePresetAddDays(7)}
              className="px-2 py-1 rounded-xl bg-muted/60 hover:bg-primary/10 text-muted-foreground hover:text-primary text-[10px] font-extrabold transition-colors cursor-pointer"
            >
              +۱ هفته
            </button>
            <button
              type="button"
              onClick={() => handlePresetAddDays(30)}
              className="px-2 py-1 rounded-xl bg-muted/60 hover:bg-primary/10 text-muted-foreground hover:text-primary text-[10px] font-extrabold transition-colors cursor-pointer"
            >
              +۱ ماه
            </button>
            <button
              type="button"
              onClick={handlePresetEndOfMonth}
              className="px-2 py-1 rounded-xl bg-muted/60 hover:bg-primary/10 text-muted-foreground hover:text-primary text-[10px] font-extrabold transition-colors cursor-pointer"
            >
              پایان ماه
            </button>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setIsOpen(false);
                setViewMode('days');
              }}
              className="rounded-xl text-xs font-bold cursor-pointer"
            >
              انصراف
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleApply}
              className="rounded-xl text-xs font-extrabold gap-1.5 cursor-pointer shadow-md shadow-primary/20 flex-1"
            >
              <Check className="size-3.5" />
              <span>تأیید و اعمال تاریخ</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
