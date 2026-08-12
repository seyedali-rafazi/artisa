import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"]
const ENGLISH_DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]

/**
 * Converts standard ASCII digits (0-9) to Persian digits (۰-۹)
 */
export function toPersianDigits(input: string | number | undefined | null): string {
  if (input === undefined || input === null) return ""
  const str = String(input)
  return str.replace(/[0-9]/g, (w) => PERSIAN_DIGITS[parseInt(w, 10)])
}

/**
 * Converts Persian/Arabic digits (۰-۹ / ٠-٩) to standard ASCII digits (0-9)
 */
export function toStandardDigits(input: string | number | undefined | null): string {
  if (input === undefined || input === null) return ""
  let str = String(input)
  for (let i = 0; i < 10; i++) {
    str = str.replace(new RegExp(PERSIAN_DIGITS[i], "g"), String(i))
    str = str.replace(new RegExp(String.fromCharCode(0x0660 + i), "g"), String(i))
  }
  return str
}

/**
 * Formats any ISO date string, YYYY-MM-DD, timestamp, or Date object into Shamsi (Jalali) date string with Persian digits.
 */
export function formatShamsiDate(
  dateInput?: string | Date | number | null,
  style: "short" | "medium" | "long" | "time" = "short"
): string {
  if (!dateInput) return ""

  // If already a Shamsi string formatted (e.g. starting with 14xx or ۱۴xx)
  if (typeof dateInput === "string") {
    const trimmed = dateInput.trim()
    if (/^(13|14|۱۳|۱۴)\d{2}/.test(trimmed)) {
      return toPersianDigits(trimmed)
    }
  }

  const d = typeof dateInput === "object" ? dateInput : new Date(dateInput)
  if (isNaN(d.getTime())) {
    return typeof dateInput === "string" ? toPersianDigits(dateInput) : ""
  }

  try {
    if (style === "long") {
      const formatted = new Intl.DateTimeFormat("fa-IR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(d)
      return toPersianDigits(formatted)
    } else if (style === "time") {
      const formatted = new Intl.DateTimeFormat("fa-IR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).format(d)
      return toPersianDigits(formatted)
    } else if (style === "medium") {
      const formatted = new Intl.DateTimeFormat("fa-IR", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(d)
      return toPersianDigits(formatted)
    } else {
      const formatted = new Intl.DateTimeFormat("fa-IR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(d)
      return toPersianDigits(formatted)
    }
  } catch {
    return typeof dateInput === "string" ? toPersianDigits(dateInput) : ""
  }
}

/**
 * Formats price in Toman with Persian digits
 */
export function formatPersianPrice(amount: number | string | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(Number(amount))) return "۰ تومان"
  const num = Number(amount)
  return `${toPersianDigits(num.toLocaleString("fa-IR"))} تومان`
}

