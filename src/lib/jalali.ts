/**
 * Comprehensive Jalali (Shamsi / Persian) Calendar Utilities & Asia/Tehran Timezone Converter
 * Zero external dependencies.
 */

// Month names in Persian
export const JALALI_MONTH_NAMES = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
] as const;

// Weekday headers in Persian (Saturday first)
export const JALALI_WEEKDAYS = [
  { full: 'شنبه', short: 'ش', index: 0, isWeekend: false },
  { full: 'یکشنبه', short: 'ی', index: 1, isWeekend: false },
  { full: 'دوشنبه', short: 'د', index: 2, isWeekend: false },
  { full: 'سه‌شنبه', short: 'س', index: 3, isWeekend: false },
  { full: 'چهارشنبه', short: 'چ', index: 4, isWeekend: false },
  { full: 'پنج‌شنبه', short: 'پ', index: 5, isWeekend: false },
  { full: 'جمعه', short: 'ج', index: 6, isWeekend: true },
] as const;

export interface JalaliDate {
  jy: number; // e.g. 1403
  jm: number; // 1-12
  jd: number; // 1-31
}

export interface JalaliDateTime extends JalaliDate {
  hour: number; // 0-23
  minute: number; // 0-59
}

/**
 * Extracts Asia/Tehran date and time from an ISO string, Date, or timestamp into JalaliDateTime.
 */
export function toTehranJalali(dateInput?: string | Date | number | null): JalaliDateTime {
  const d = !dateInput
    ? new Date()
    : typeof dateInput === 'string' || typeof dateInput === 'number'
    ? new Date(dateInput)
    : dateInput;

  const validDate = isNaN(d.getTime()) ? new Date() : d;

  try {
    const formatter = new Intl.DateTimeFormat('en-u-ca-persian', {
      timeZone: 'Asia/Tehran',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    });

    const parts = formatter.formatToParts(validDate);
    const getVal = (type: string) => {
      const p = parts.find((part) => part.type === type);
      return p ? parseInt(p.value, 10) : 0;
    };

    let hour = getVal('hour');
    if (hour === 24) hour = 0;

    return {
      jy: getVal('year'),
      jm: getVal('month'),
      jd: getVal('day'),
      hour: isNaN(hour) ? 0 : hour,
      minute: getVal('minute') || 0,
    };
  } catch {
    return {
      jy: 1405,
      jm: 1,
      jd: 1,
      hour: 0,
      minute: 0,
    };
  }
}

/**
 * Determines the number of days in a given Jalali month.
 */
export function getJalaliMonthDays(jy: number, jm: number): number {
  if (jm < 1 || jm > 12) return 30;
  if (jm <= 6) return 31;
  if (jm <= 11) return 30;

  // Check if year is a leap year using standard 33-year cycle
  // In Jalali calendar, year % 33 in [1, 5, 9, 13, 17, 22, 26, 30] are leap years
  const remainder = ((jy % 33) + 33) % 33;
  const isLeap = [1, 5, 9, 13, 17, 22, 26, 30].includes(remainder);
  return isLeap ? 30 : 29;
}

/**
 * Converts a Jalali date and time in Asia/Tehran timezone into an ISO string (+03:30).
 */
export function jalaliToTehranIso(
  jy: number,
  jm: number,
  jd: number,
  hour: number = 0,
  minute: number = 0
): string {
  const approxGy = jy + 621;
  let dayOffset = 0;
  if (jm <= 6) {
    dayOffset = (jm - 1) * 31 + jd;
  } else {
    dayOffset = 6 * 31 + (jm - 7) * 30 + jd;
  }

  // Base estimate around March 20
  const baseDate = new Date(Date.UTC(approxGy, 2, 20 + dayOffset - 1, 12, 0, 0));

  // Search window for exact Tehran Jalali match
  for (let offset = -4; offset <= 4; offset++) {
    const candidate = new Date(baseDate.getTime() + offset * 86400000);
    const j = toTehranJalali(candidate);
    if (j.jy === jy && j.jm === jm && j.jd === jd) {
      const gFormatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Tehran',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
      const gParts = gFormatter.formatToParts(candidate);
      const gy = gParts.find((p) => p.type === 'year')?.value || String(approxGy);
      const gm = gParts.find((p) => p.type === 'month')?.value || '01';
      const gd = gParts.find((p) => p.type === 'day')?.value || '01';

      const pad = (n: number) => String(n).padStart(2, '0');
      return `${gy}-${gm}-${gd}T${pad(hour)}:${pad(minute)}:00+03:30`;
    }
  }

  // Fallback
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${approxGy}-01-01T${pad(hour)}:${pad(minute)}:00+03:30`;
}

/**
 * Returns the Persian weekday index (0 = شنبه, 1 = یکشنبه, ..., 6 = جمعه) for a given Jalali date.
 */
export function getJalaliDayOfWeek(jy: number, jm: number, jd: number): number {
  try {
    const iso = jalaliToTehranIso(jy, jm, jd, 12, 0);
    const d = new Date(iso);
    const gDay = d.getUTCDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
    return (gDay + 1) % 7; // Convert to Saturday-first index (0 = Sat .. 6 = Fri)
  } catch {
    return 0;
  }
}

/**
 * Formats a Jalali date/time or ISO string into a human-readable Persian string.
 * Example: "دوشنبه ۲۷ مرداد ۱۴۰۵ - ساعت ۱۴:۳۰"
 */
export function formatJalaliReadable(
  input: JalaliDateTime | string | Date,
  options?: { showWeekday?: boolean; showTime?: boolean }
): string {
  const dt: JalaliDateTime =
    typeof input === 'object' && 'jy' in input
      ? (input as JalaliDateTime)
      : toTehranJalali(input as string | Date);

  const { showWeekday = true, showTime = true } = options || {};
  const monthName = JALALI_MONTH_NAMES[dt.jm - 1] || '';
  const dayOfWeekIndex = getJalaliDayOfWeek(dt.jy, dt.jm, dt.jd);
  const weekdayName = JALALI_WEEKDAYS[dayOfWeekIndex]?.full || '';

  const pad = (n: number) => String(n).padStart(2, '0');
  const toFa = (s: string | number) => {
    const pDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return String(s).replace(/[0-9]/g, (w) => pDigits[parseInt(w, 10)]);
  };

  let result = '';
  if (showWeekday) {
    result += `${weekdayName} `;
  }
  result += `${toFa(dt.jd)} ${monthName} ${toFa(dt.jy)}`;

  if (showTime) {
    result += ` - ساعت ${toFa(pad(dt.hour))}:${toFa(pad(dt.minute))}`;
  }

  return result;
}
