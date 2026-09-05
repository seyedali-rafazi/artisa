"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useProducts, ProductsQueryParams, ProductsPaginatedResponse } from "@/hooks/useProducts";
import ProductBox from "@/components/home/ProductBox";
import { useLanguage } from "@/components/LanguageContext";
import { useScrollLock } from "@/hooks/useScrollLock";
import {
  SlidersHorizontal,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Flame,
  Tag,
  Layers,
  RotateCcw,
  Check,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toStandardDigits, toPersianDigits } from "@/lib/utils";

// Helper to parse price input: converts Persian/Arabic digits, strips non-digits (commas, spaces)
function parsePriceInput(val: string | number | null | undefined): number | undefined {
  if (val === null || val === undefined || val === "") return undefined;
  const standard = toStandardDigits(String(val)).replace(/[^0-9]/g, "");
  if (!standard) return undefined;
  const num = Number(standard);
  return isNaN(num) || num < 0 ? undefined : num;
}

// Helper to format price for input display with thousands separator in Persian digits
function formatPriceInput(val: number | string | undefined | null): string {
  if (val === null || val === undefined || val === "") return "";
  const num = typeof val === "number" ? val : parsePriceInput(val);
  if (num === undefined) return "";
  return toPersianDigits(num.toLocaleString("en-US"));
}

// Helper to describe price in words (e.g. 5,000,000 -> ۵ میلیون تومان)
function describePrice(val: number | undefined): string | null {
  if (val === undefined || isNaN(val)) return null;
  if (val === 0) return "۰ تومان";
  if (val >= 1_000_000) {
    const millions = val / 1_000_000;
    const formatted = millions % 1 === 0 ? String(millions) : millions.toFixed(1);
    return `${toPersianDigits(formatted)} میلیون تومان`;
  }
  if (val >= 1_000) {
    const thousands = Math.round(val / 1_000);
    return `${toPersianDigits(thousands)} هزار تومان`;
  }
  return `${toPersianDigits(val)} تومان`;
}

const PRICE_PRESETS = [
  { label: "زیر ۱ میلیون", min: undefined, max: 1000000 },
  { label: "۱ تا ۳ میلیون", min: 1000000, max: 3000000 },
  { label: "۳ تا ۵ میلیون", min: 3000000, max: 5000000 },
  { label: "۵ تا ۸ میلیون", min: 5000000, max: 8000000 },
  { label: "بالای ۸ میلیون", min: 8000000, max: undefined },
];

const CATEGORIES = [
  { id: "all", label: "همه محصولات", value: "" },
  { id: "painting", label: "تابلو نقاشی", value: "تابلو نقاشی" },
  { id: "wallArt", label: "هنر دیواری", value: "هنر دیواری" },
  { id: "sculpture", label: "مجسمه و دکوری", value: "مجسمه و دکوری" },
  { id: "frame", label: "قاب و فریم", value: "قاب و فریم" },
  { id: "modernArt", label: "هنر مدرن", value: "هنر مدرن" },
  { id: "gift", label: "هدایای هنری", value: "هدایای هنری" },
];

const SORT_OPTIONS = [
  { id: "newest", label: "جدیدترین", sort_by: "created_at", sort_order: "desc" },
  { id: "popular", label: "محبوب‌ترین", sort_by: "rating", sort_order: "desc" },
  { id: "cheapest", label: "ارزان‌ترین", sort_by: "price", sort_order: "asc" },
  { id: "expensive", label: "گران‌ترین", sort_by: "price", sort_order: "desc" },
];

const PAGE_SIZE = 12;

interface ProductsViewProps {
  initialData?: ProductsPaginatedResponse;
}

export default function ProductsView({ initialData }: ProductsViewProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  // Read URL query parameters
  const initialCategory = searchParams.get("category") || "";
  const initialSearch = searchParams.get("search") || "";
  const initialSortBy = searchParams.get("sort_by") || "created_at";
  const initialSortOrder = searchParams.get("sort_order") || "desc";
  const initialSpecial = searchParams.get("isSpecial") === "true";
  const initialBestSeller = searchParams.get("isBestSeller") === "true";
  const initialMinPrice = parsePriceInput(searchParams.get("minPrice"));
  const initialMaxPrice = parsePriceInput(searchParams.get("maxPrice"));
  const initialPage = searchParams.get("page") ? Math.max(1, Number(searchParams.get("page"))) : 1;

  // Local state
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchTerm, setSearchTerm] = useState<string>(initialSearch);
  const [searchInputVal, setSearchInputVal] = useState<string>(initialSearch);
  const [sortBy, setSortBy] = useState<string>(initialSortBy);
  const [sortOrder, setSortOrder] = useState<string>(initialSortOrder);
  const [isSpecial, setIsSpecial] = useState<boolean>(initialSpecial);
  const [isBestSeller, setIsBestSeller] = useState<boolean>(initialBestSeller);
  const [minPrice, setMinPrice] = useState<number | undefined>(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(initialMaxPrice);
  const [minPriceInput, setMinPriceInput] = useState<string>(initialMinPrice !== undefined ? formatPriceInput(initialMinPrice) : "");
  const [maxPriceInput, setMaxPriceInput] = useState<string>(initialMaxPrice !== undefined ? formatPriceInput(initialMaxPrice) : "");
  const [currentPage, setCurrentPage] = useState<number>(initialPage);

  // Mobile filter drawer state
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  useScrollLock(mobileFilterOpen);

  // Sync state when URL search params change externally (e.g. browser back/forward or navbar link)
  useEffect(() => {
    const cat = searchParams.get("category") || "";
    const s = searchParams.get("search") || "";
    const sb = searchParams.get("sort_by") || "created_at";
    const so = searchParams.get("sort_order") || "desc";
    const sp = searchParams.get("isSpecial") === "true";
    const bs = searchParams.get("isBestSeller") === "true";
    const mn = parsePriceInput(searchParams.get("minPrice"));
    const mx = parsePriceInput(searchParams.get("maxPrice"));
    const p = searchParams.get("page") ? Math.max(1, Number(searchParams.get("page"))) : 1;

    setSelectedCategory(cat);
    setSearchTerm(s);
    setSearchInputVal(s);
    setSortBy(sb);
    setSortOrder(so);
    setIsSpecial(sp);
    setIsBestSeller(bs);
    setMinPrice(mn);
    setMaxPrice(mx);
    setMinPriceInput(mn !== undefined ? formatPriceInput(mn) : "");
    setMaxPriceInput(mx !== undefined ? formatPriceInput(mx) : "");
    setCurrentPage(p);
  }, [searchParams]);

  // Update URL helper
  const updateUrlParams = (newParams: Record<string, string | null | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, val]) => {
      if (val === null || val === undefined || val === "" || val === "false") {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });

    const newQuery = params.toString();
    const targetUrl = newQuery ? `/products?${newQuery}` : "/products";
    router.push(targetUrl, { scroll: false });
  };

  // Handlers for user interactions
  const handleCategorySelect = (categoryVal: string) => {
    setSelectedCategory(categoryVal);
    setCurrentPage(1);
    updateUrlParams({
      category: categoryVal || null,
      page: "1",
    });
  };

  const handleSortChange = (newSortBy: string, newSortOrder: string) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setCurrentPage(1);
    updateUrlParams({
      sort_by: newSortBy,
      sort_order: newSortOrder,
      page: "1",
    });
  };

  const handleSpecialToggle = () => {
    const nextVal = !isSpecial;
    setIsSpecial(nextVal);
    setCurrentPage(1);
    updateUrlParams({
      isSpecial: nextVal ? "true" : null,
      page: "1",
    });
  };

  const handleBestSellerToggle = () => {
    const nextVal = !isBestSeller;
    setIsBestSeller(nextVal);
    setCurrentPage(1);
    updateUrlParams({
      isBestSeller: nextVal ? "true" : null,
      page: "1",
    });
  };

  const handleApplyPriceFilter = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    let min = parsePriceInput(minPriceInput);
    let max = parsePriceInput(maxPriceInput);

    // Swap min and max if entered inversely
    if (min !== undefined && max !== undefined && min > max) {
      const temp = min;
      min = max;
      max = temp;
    }

    setMinPrice(min);
    setMaxPrice(max);
    setMinPriceInput(min !== undefined ? formatPriceInput(min) : "");
    setMaxPriceInput(max !== undefined ? formatPriceInput(max) : "");
    setCurrentPage(1);
    updateUrlParams({
      minPrice: min !== undefined ? String(min) : null,
      maxPrice: max !== undefined ? String(max) : null,
      page: "1",
    });
  };

  const handleClearPriceFilter = () => {
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setMinPriceInput("");
    setMaxPriceInput("");
    setCurrentPage(1);
    updateUrlParams({
      minPrice: null,
      maxPrice: null,
      page: "1",
    });
  };

  const handlePresetClick = (presetMin?: number, presetMax?: number) => {
    setMinPrice(presetMin);
    setMaxPrice(presetMax);
    setMinPriceInput(presetMin !== undefined ? formatPriceInput(presetMin) : "");
    setMaxPriceInput(presetMax !== undefined ? formatPriceInput(presetMax) : "");
    setCurrentPage(1);
    updateUrlParams({
      minPrice: presetMin !== undefined ? String(presetMin) : null,
      maxPrice: presetMax !== undefined ? String(presetMax) : null,
      page: "1",
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(searchInputVal.trim());
    setCurrentPage(1);
    updateUrlParams({
      search: searchInputVal.trim() || null,
      page: "1",
    });
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setSearchInputVal("");
    setCurrentPage(1);
    updateUrlParams({
      search: null,
      page: "1",
    });
  };

  const handleResetAllFilters = () => {
    setSelectedCategory("");
    setSearchTerm("");
    setSearchInputVal("");
    setIsSpecial(false);
    setIsBestSeller(false);
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setMinPriceInput("");
    setMaxPriceInput("");
    setCurrentPage(1);
    setSortBy("created_at");
    setSortOrder("desc");
    router.push("/products", { scroll: false });
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    updateUrlParams({ page: String(newPage) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Build query params for backend API
  const queryParams: ProductsQueryParams = useMemo(() => {
    const params: ProductsQueryParams = {
      page: currentPage,
      limit: PAGE_SIZE,
      sort_by: sortBy,
      sort_order: sortOrder,
    };
    if (selectedCategory) params.category = selectedCategory;
    if (searchTerm) params.search = searchTerm;
    if (isSpecial) params.isSpecial = true;
    if (isBestSeller) params.isBestSeller = true;
    if (minPrice !== undefined) params.minPrice = minPrice;
    if (maxPrice !== undefined) params.maxPrice = maxPrice;
    return params;
  }, [
    currentPage,
    sortBy,
    sortOrder,
    selectedCategory,
    searchTerm,
    isSpecial,
    isBestSeller,
    minPrice,
    maxPrice,
  ]);

  // Fetch products from backend
  const { data, isLoading, isError, refetch } = useProducts(queryParams, initialData ? { initialData } : undefined);

  const products = data?.items || [];
  const totalCount = data?.total || 0;
  const totalPages = data?.total_pages || 1;

  // Active filters count for mobile trigger badge
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory) count++;
    if (searchTerm) count++;
    if (isSpecial) count++;
    if (isBestSeller) count++;
    if (minPrice !== undefined || maxPrice !== undefined) count++;
    return count;
  }, [selectedCategory, searchTerm, isSpecial, isBestSeller, minPrice, maxPrice]);

  return (
    <div className="min-h-screen py-4 md:py-8" dir="rtl">
      {/* Breadcrumb */}
      {/* Breadcrumb Navigation */}
      <nav aria-label="راهنمای مسیر" className="mb-6 text-xs text-muted-foreground">
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/" className="hover:text-primary transition-colors">
              {t("home")}
            </Link>
          </li>
          <li className="text-muted-foreground/60">•</li>
          <li className="font-bold text-foreground">
            {isSpecial
              ? "پیشنهادات شگفت‌انگیز و ویژه"
              : selectedCategory
              ? `محصولات / ${selectedCategory}`
              : "همه محصولات"}
          </li>
        </ol>
      </nav>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-foreground flex items-center gap-2.5">
            {isSpecial ? (
              <>
                <div className="size-8 rounded-xl bg-[#ef394e] text-white flex items-center justify-center shadow-xs">
                  <Tag className="size-4" />
                </div>
                <span>پیشنهادات شگفت‌انگیز و تخفیف‌های ویژه</span>
              </>
            ) : (
              <>
                <Package className="size-7 text-primary" />
                <span>فروشگاه و گالری محصولات</span>
              </>
            )}
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1 font-medium">
            {isSpecial
              ? "مجموعه برگزیده آثار هنری و دکوراتیو با تخفیف‌های ویژه و شگفت‌انگیز آرتیسا"
              : "مجموعه کامل آثار هنری، تابلوهای نقاشی و دکوراتیو آرتیسا"}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground bg-muted/40 px-3.5 py-2 rounded-xl border border-border/70 self-start sm:self-auto">
          <span>تعداد آثار:</span>
          <span className="text-primary font-black">
            {isLoading ? "..." : `${totalCount.toLocaleString("fa-IR")} اثر`}
          </span>
        </div>
      </div>

      {/* Main Container: Sidebar (Right) + Product Grid (Left) in RTL */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* ─── Desktop Filter Sidebar ─── */}
        <aside
          id="products-filter-sidebar"
          aria-label="فیلترهای محصولات"
          className="hidden lg:block w-72 shrink-0 sticky top-36 z-30 max-h-[calc(100vh-10rem)] overflow-y-auto overscroll-contain bg-card border border-border rounded-3xl p-5 shadow-xs space-y-6 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border/80 hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/40"
        >
          <div className="sticky -top-5 -mt-5 pt-5 pb-4 mb-2 bg-card/95 backdrop-blur-xs z-10 flex items-center justify-between border-b border-border/80">
            <div className="flex items-center gap-2 font-black text-sm text-foreground">
              <SlidersHorizontal className="size-4 text-primary" />
              <span>فیلترها</span>
            </div>
            {activeFiltersCount > 0 && (
              <button
                onClick={handleResetAllFilters}
                className="flex items-center gap-1 text-[11px] font-bold text-destructive hover:opacity-80 transition-opacity cursor-pointer"
              >
                <RotateCcw className="size-3" />
                <span>حذف همه</span>
              </button>
            )}
          </div>

          {/* Categories List */}
          <div>
            <span className="text-xs font-extrabold text-foreground mb-3 flex items-center gap-1.5">
              <Layers className="size-4 text-primary" />
              <span>دسته‌بندی آثار</span>
            </span>
            <div className="flex flex-col gap-1">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.value;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat.value)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-primary text-primary-foreground font-black shadow-sm"
                        : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                    }`}
                  >
                    <span>{cat.label}</span>
                    {isSelected && <Check className="size-3.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="h-px bg-border/70" />

          {/* Quick Toggles (Special Offers & Best Sellers) */}
          <div className="space-y-3">
            <span className="text-xs font-extrabold text-foreground block">
              فیلترهای ویژه
            </span>

            {/* Special Offers Toggle */}
            <label
              className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer select-none ${
                isSpecial
                  ? "border-primary/50 bg-primary/5 text-primary"
                  : "border-border/70 hover:border-border text-foreground"
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-bold">
                <Tag className="size-4 text-amber-500" />
                <span>پیشنهادات ویژه (تخفیف‌دار)</span>
              </div>
              <input
                type="checkbox"
                checked={isSpecial}
                onChange={handleSpecialToggle}
                className="size-4 accent-primary rounded cursor-pointer"
              />
            </label>

            {/* Best Sellers Toggle */}
            <label
              className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer select-none ${
                isBestSeller
                  ? "border-primary/50 bg-primary/5 text-primary"
                  : "border-border/70 hover:border-border text-foreground"
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-bold">
                <Flame className="size-4 text-rose-500" />
                <span>پرفروش‌ترین آثار</span>
              </div>
              <input
                type="checkbox"
                checked={isBestSeller}
                onChange={handleBestSellerToggle}
                className="size-4 accent-primary rounded cursor-pointer"
              />
            </label>
          </div>

          <div className="h-px bg-border/70" />

          {/* Price Range Filter */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-extrabold text-foreground">
                محدوده قیمت (تومان)
              </span>
              {(minPrice !== undefined || maxPrice !== undefined) && (
                <button
                  type="button"
                  onClick={handleClearPriceFilter}
                  className="text-[10px] text-destructive hover:underline font-bold cursor-pointer"
                >
                  حذف فیلتر قیمت
                </button>
              )}
            </div>

            {/* Quick Price Presets */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {PRICE_PRESETS.map((p) => {
                const isActive = minPrice === p.min && maxPrice === p.max;
                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => handlePresetClick(p.min, p.max)}
                    className={`text-[10px] font-medium px-2 py-1 rounded-lg border transition-colors cursor-pointer ${
                      isActive
                        ? "bg-primary text-primary-foreground border-primary font-bold shadow-xs"
                        : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border-border/70"
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleApplyPriceFilter} className="space-y-2.5">
              <div>
                <label className="text-[10px] text-muted-foreground mb-1 block font-medium">
                  از (حداقل):
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="مثلاً ۱،۰۰۰،۰۰۰"
                    value={minPriceInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      const num = parsePriceInput(val);
                      setMinPriceInput(num !== undefined ? formatPriceInput(num) : "");
                    }}
                    className="h-9 text-xs rounded-xl pl-12"
                  />
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground pointer-events-none">
                    تومان
                  </span>
                </div>
                {parsePriceInput(minPriceInput) !== undefined && (
                  <span className="text-[10px] text-primary/80 block mt-1 font-medium">
                    {describePrice(parsePriceInput(minPriceInput))}
                  </span>
                )}
              </div>

              <div>
                <label className="text-[10px] text-muted-foreground mb-1 block font-medium">
                  تا (حداکثر):
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="مثلاً ۵،۰۰۰،۰۰۰"
                    value={maxPriceInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      const num = parsePriceInput(val);
                      setMaxPriceInput(num !== undefined ? formatPriceInput(num) : "");
                    }}
                    className="h-9 text-xs rounded-xl pl-12"
                  />
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground pointer-events-none">
                    تومان
                  </span>
                </div>
                {parsePriceInput(maxPriceInput) !== undefined && (
                  <span className="text-[10px] text-primary/80 block mt-1 font-medium">
                    {describePrice(parsePriceInput(maxPriceInput))}
                  </span>
                )}
              </div>

              <Button
                type="submit"
                size="sm"
                className="w-full h-8 text-xs font-bold rounded-xl mt-2 cursor-pointer"
              >
                اعمال محدوده قیمت
              </Button>
            </form>
          </div>
        </aside>

        {/* ─── Main Content Area: Search, Sort Bar, Filter Chips, Grid, Pagination ─── */}
        <main className="flex-1 min-w-0 w-full">
          {/* Top Bar: In-page Search + Sort Tabs + Mobile Filter Trigger */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* In-page Search Box */}
              <form
                onSubmit={handleSearchSubmit}
                className="relative flex-1 max-w-md"
              >
                <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="text"
                  placeholder="جستجو در بین آثار..."
                  value={searchInputVal}
                  onChange={(e) => setSearchInputVal(e.target.value)}
                  className="pr-10 pl-9 h-11 text-xs rounded-2xl bg-card border-border/80 shadow-xs"
                />
                {searchInputVal && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                    aria-label="پاک کردن جستجو"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </form>

              {/* Mobile Filter Button */}
              <button
                type="button"
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden flex items-center justify-center gap-2 h-11 px-4 rounded-2xl border border-border bg-card text-xs font-bold text-foreground shadow-xs hover:border-primary transition-colors cursor-pointer"
              >
                <SlidersHorizontal className="size-4 text-primary" />
                <span>فیلترها</span>
                {activeFiltersCount > 0 && (
                  <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-black text-primary-foreground">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>

            {/* Sort Bar Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-muted/40 rounded-2xl border border-border/60 text-xs font-semibold">
              <span className="px-3 py-1 text-muted-foreground font-bold text-[11px] hidden sm:inline">
                مرتب‌سازی بر اساس:
              </span>
              {SORT_OPTIONS.map((opt) => {
                const isActive = sortBy === opt.sort_by && sortOrder === opt.sort_order;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSortChange(opt.sort_by, opt.sort_order)}
                    className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                      isActive
                        ? "bg-primary text-primary-foreground font-bold shadow-xs"
                        : "text-foreground/80 hover:bg-background hover:text-foreground"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Filter Chips (Tags) */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-6 animate-in fade-in duration-200">
              <span className="text-xs text-muted-foreground font-bold">فیلترهای فعال:</span>

              {selectedCategory && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                  <span>دسته: {selectedCategory}</span>
                  <button
                    onClick={() => handleCategorySelect("")}
                    className="hover:text-destructive cursor-pointer p-0.5"
                    aria-label="حذف فیلتر دسته"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              )}

              {searchTerm && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                  <span>جستجو: «{searchTerm}»</span>
                  <button
                    onClick={handleClearSearch}
                    className="hover:text-destructive cursor-pointer p-0.5"
                    aria-label="حذف فیلتر جستجو"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              )}

              {isSpecial && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                  <Sparkles className="size-3" />
                  <span>تخفیف‌دار</span>
                  <button
                    onClick={handleSpecialToggle}
                    className="hover:text-destructive cursor-pointer p-0.5"
                    aria-label="حذف فیلتر تخفیف‌دار"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              )}

              {isBestSeller && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20">
                  <Flame className="size-3" />
                  <span>پرفروش‌ترین</span>
                  <button
                    onClick={handleBestSellerToggle}
                    className="hover:text-destructive cursor-pointer p-0.5"
                    aria-label="حذف فیلتر پرفروش"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              )}

              {(minPrice !== undefined || maxPrice !== undefined) && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-muted text-foreground border border-border">
                  <span>
                    قیمت:{" "}
                    {minPrice !== undefined ? `${minPrice.toLocaleString("fa-IR")} تومان` : "۰"}{" "}
                    تا{" "}
                    {maxPrice !== undefined ? `${maxPrice.toLocaleString("fa-IR")} تومان` : "نامحدود"}
                  </span>
                  <button
                    onClick={handleClearPriceFilter}
                    className="hover:text-destructive cursor-pointer p-0.5"
                    aria-label="حذف فیلتر قیمت"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              )}

              <button
                onClick={handleResetAllFilters}
                className="text-xs font-bold text-destructive hover:underline cursor-pointer mr-2"
              >
                پاکسازی همه
              </button>
            </div>
          )}

          {/* Products Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="h-96 rounded-2xl bg-muted/40 animate-pulse border border-border/60"
                />
              ))}
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-3xl p-8 bg-card">
              <p className="text-sm font-bold text-destructive mb-3">
                خطا در دریافت لیست محصولات از سرور.
              </p>
              <Button
                onClick={() => refetch()}
                size="sm"
                variant="outline"
                className="rounded-xl cursor-pointer"
              >
                تلاش مجدد
              </Button>
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductBox key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <nav
                  aria-label="صفحه‌بندی محصولات"
                  className="flex items-center justify-center gap-2 mt-12 pt-6 border-t border-border"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="rounded-xl h-9 px-3 gap-1 cursor-pointer"
                  >
                    <ChevronRight className="size-4" />
                    <span>قبلی</span>
                  </Button>

                  <div className="flex items-center gap-1 text-xs font-bold">
                    {[...Array(totalPages)].map((_, i) => {
                      const pageNum = i + 1;
                      const isCurrent = pageNum === currentPage;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`size-9 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
                            isCurrent
                              ? "bg-primary text-primary-foreground font-black shadow-xs"
                              : "hover:bg-muted text-foreground"
                          }`}
                          aria-current={isCurrent ? "page" : undefined}
                        >
                          {pageNum.toLocaleString("fa-IR")}
                        </button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="rounded-xl h-9 px-3 gap-1 cursor-pointer"
                  >
                    <span>بعدی</span>
                    <ChevronLeft className="size-4" />
                  </Button>
                </nav>
              )}
            </>
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-border rounded-3xl p-8 bg-card">
              <Package className="size-16 text-muted-foreground/50 mb-4 stroke-1" />
              <h3 className="text-base font-extrabold text-foreground mb-1">
                محصولی با این مشخصات یافت نشد
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mb-6">
                می‌توانید فیلترها یا عبارت جستجوی خود را تغییر دهید تا نتایج بیشتری مشاهده نمایید.
              </p>
              {activeFiltersCount > 0 && (
                <Button
                  onClick={handleResetAllFilters}
                  variant="default"
                  size="sm"
                  className="rounded-xl gap-2 font-bold cursor-pointer"
                >
                  <RotateCcw className="size-4" />
                  <span>حذف همه فیلترها</span>
                </Button>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ─── Mobile Slide-Up Bottom Sheet Filter ─── */}
      <div
        className={`fixed inset-0 z-[60] lg:hidden transition-all duration-300 ${
          mobileFilterOpen ? "pointer-events-auto visible" : "pointer-events-none invisible"
        }`}
      >
        {/* Backdrop */}
        <div
          className={`fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300 ease-out ${
            mobileFilterOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setMobileFilterOpen(false)}
          aria-hidden="true"
        />

        {/* Bottom Sheet Modal Panel */}
        <div
          className={`fixed inset-x-0 bottom-0 max-h-[85vh] bg-background border-t border-border/80 rounded-t-[2rem] shadow-2xl flex flex-col z-10 overflow-hidden transition-transform duration-300 ease-out ${
            mobileFilterOpen ? "translate-y-0" : "translate-y-full"
          }`}
          dir="rtl"
        >
          {/* Drag Handle Indicator */}
          <div
            className="pt-3 pb-1 flex justify-center cursor-pointer"
            onClick={() => setMobileFilterOpen(false)}
          >
            <div className="w-12 h-1.5 rounded-full bg-muted-foreground/30 hover:bg-muted-foreground/50 transition-colors" />
          </div>

          {/* Sheet Header */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-border/70 shrink-0">
            <div className="flex items-center gap-2 font-black text-sm text-foreground">
              <SlidersHorizontal className="size-4 text-primary" />
              <span>فیلتر آثار</span>
              {activeFiltersCount > 0 && (
                <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-black text-primary-foreground">
                  {activeFiltersCount}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setMobileFilterOpen(false)}
              className="p-1.5 rounded-xl hover:bg-muted text-foreground transition-colors cursor-pointer"
              aria-label="بستن پنجره فیلترها"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Scrollable Filters Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 [scrollbar-width:thin]">
            {/* Categories */}
            <div>
              <span className="text-xs font-extrabold text-foreground mb-3 flex items-center gap-1.5">
                <Layers className="size-4 text-primary" />
                <span>دسته‌بندی آثار</span>
              </span>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat.value;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategorySelect(cat.value)}
                      className={`flex items-center justify-between p-2.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                        isSelected
                          ? "bg-primary/10 border-primary text-primary font-black shadow-xs"
                          : "border-border/70 bg-card text-foreground hover:border-primary/50"
                      }`}
                    >
                      <span className="truncate">{cat.label}</span>
                      {isSelected && <Check className="size-3.5 shrink-0 text-primary" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="h-px bg-border/70" />

            {/* Quick Toggles */}
            <div className="space-y-3">
              <span className="text-xs font-extrabold text-foreground block">
                فیلترهای ویژه
              </span>

              <label
                className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                  isSpecial
                    ? "border-primary/50 bg-primary/5 text-primary font-bold"
                    : "border-border/70 bg-card text-foreground"
                }`}
              >
                <div className="flex items-center gap-2 text-xs">
                  <Tag className="size-4 text-amber-500" />
                  <span>فقط پیشنهادات ویژه (تخفیف‌دار)</span>
                </div>
                <input
                  type="checkbox"
                  checked={isSpecial}
                  onChange={handleSpecialToggle}
                  className="size-4 accent-primary rounded cursor-pointer"
                />
              </label>

              <label
                className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                  isBestSeller
                    ? "border-primary/50 bg-primary/5 text-primary font-bold"
                    : "border-border/70 bg-card text-foreground"
                }`}
              >
                <div className="flex items-center gap-2 text-xs">
                  <Flame className="size-4 text-rose-500" />
                  <span>فقط پرفروش‌ترین آثار</span>
                </div>
                <input
                  type="checkbox"
                  checked={isBestSeller}
                  onChange={handleBestSellerToggle}
                  className="size-4 accent-primary rounded cursor-pointer"
                />
              </label>
            </div>

            <div className="h-px bg-border/70" />

            {/* Price Filter */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-extrabold text-foreground">
                  محدوده قیمت (تومان)
                </span>
                {(minPrice !== undefined || maxPrice !== undefined) && (
                  <button
                    type="button"
                    onClick={handleClearPriceFilter}
                    className="text-[10px] text-destructive hover:underline font-bold cursor-pointer"
                  >
                    حذف فیلتر قیمت
                  </button>
                )}
              </div>

              {/* Quick Price Presets in Mobile Drawer */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {PRICE_PRESETS.map((p) => {
                  const isActive = minPrice === p.min && maxPrice === p.max;
                  return (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => handlePresetClick(p.min, p.max)}
                      className={`text-[10px] font-medium px-2 py-1 rounded-lg border transition-colors cursor-pointer ${
                        isActive
                          ? "bg-primary text-primary-foreground border-primary font-bold shadow-xs"
                          : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border-border/70"
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>

              <form onSubmit={handleApplyPriceFilter} className="space-y-2.5">
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] text-muted-foreground mb-1 block font-medium">
                      از (حداقل):
                    </label>
                    <div className="relative">
                      <Input
                        type="text"
                        inputMode="numeric"
                        placeholder="مثلاً ۱،۰۰۰،۰۰۰"
                        value={minPriceInput}
                        onChange={(e) => {
                          const val = e.target.value;
                          const num = parsePriceInput(val);
                          setMinPriceInput(num !== undefined ? formatPriceInput(num) : "");
                        }}
                        className="h-9 text-xs rounded-xl pl-9"
                      />
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] text-muted-foreground pointer-events-none">
                        تومان
                      </span>
                    </div>
                    {parsePriceInput(minPriceInput) !== undefined && (
                      <span className="text-[9px] text-primary/80 block mt-1 font-medium">
                        {describePrice(parsePriceInput(minPriceInput))}
                      </span>
                    )}
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground mb-1 block font-medium">
                      تا (حداکثر):
                    </label>
                    <div className="relative">
                      <Input
                        type="text"
                        inputMode="numeric"
                        placeholder="مثلاً ۵،۰۰۰،۰۰۰"
                        value={maxPriceInput}
                        onChange={(e) => {
                          const val = e.target.value;
                          const num = parsePriceInput(val);
                          setMaxPriceInput(num !== undefined ? formatPriceInput(num) : "");
                        }}
                        className="h-9 text-xs rounded-xl pl-9"
                      />
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] text-muted-foreground pointer-events-none">
                        تومان
                      </span>
                    </div>
                    {parsePriceInput(maxPriceInput) !== undefined && (
                      <span className="text-[9px] text-primary/80 block mt-1 font-medium">
                        {describePrice(parsePriceInput(maxPriceInput))}
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  type="submit"
                  size="sm"
                  className="w-full h-8 text-xs font-bold rounded-xl mt-1 cursor-pointer"
                >
                  اعمال محدوده قیمت
                </Button>
              </form>
            </div>
          </div>

          {/* Sticky Bottom Actions */}
          <div className="p-4 px-6 border-t border-border/80 bg-background/95 backdrop-blur-xs shrink-0 flex items-center gap-2.5">
            <Button
              type="button"
              onClick={() => setMobileFilterOpen(false)}
              className="flex-1 h-10 rounded-xl text-xs font-bold cursor-pointer shadow-sm"
            >
              مشاهده {totalCount > 0 ? `${totalCount.toLocaleString("fa-IR")} اثر` : "نتایج"}
            </Button>
            {activeFiltersCount > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  handleResetAllFilters();
                  setMobileFilterOpen(false);
                }}
                className="h-10 rounded-xl text-xs font-bold text-destructive hover:bg-destructive/10 border-destructive/30 cursor-pointer"
              >
                حذف همه
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
