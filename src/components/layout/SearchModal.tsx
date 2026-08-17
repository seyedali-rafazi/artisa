"use client";

import React, { useState, useEffect, useRef, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  LayoutGrid,
  TrendingUp,
  Clock,
  Trash2,
  ChevronLeft,
  ArrowRight,
  ShoppingBag,
  Sparkles,
  ArrowUpRight,
  Loader2,
} from "lucide-react";
import { useApp, Product } from "@/components/AppContext";
import { useLanguage } from "@/components/LanguageContext";
import { useScrollLock } from "@/hooks/useScrollLock";
import { api } from "@/lib/api";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

interface CategorySuggestion {
  id: string;
  name: string;
  badge: string;
  categoryFilter: string;
  icon?: "grid" | "search";
}

const ALL_CATEGORY_SUGGESTIONS: CategorySuggestion[] = [
  { id: "c1", name: "تابلو", badge: "دسته‌بندی", categoryFilter: "تابلو نقاشی", icon: "grid" },
  { id: "c2", name: "تابلو دکوراتیو", badge: "در تابلو", categoryFilter: "تابلو نقاشی", icon: "grid" },
  { id: "c3", name: "تابلو دیواری", badge: "در تابلو", categoryFilter: "هنر دیواری", icon: "grid" },
  { id: "c4", name: "تابلو گیمینگ", badge: "در تابلو شاسی", categoryFilter: "تابلو نقاشی", icon: "grid" },
  { id: "c5", name: "تابلو مینیمال", badge: "در تابلو", categoryFilter: "هنر مدرن", icon: "grid" },
  { id: "c6", name: "تابلو نقاشی", badge: "دسته‌بندی", categoryFilter: "تابلو نقاشی", icon: "search" },
  { id: "c7", name: "تابلو فرش", badge: "دسته‌بندی", categoryFilter: "هنر دیواری", icon: "grid" },
  { id: "c8", name: "تابلو شاسی", badge: "در تابلو شاسی", categoryFilter: "تابلو نقاشی", icon: "grid" },
  { id: "c9", name: "تابلو نوری", badge: "در تابلو", categoryFilter: "هنر دیواری", icon: "grid" },
  { id: "c10", name: "هنر مدرن", badge: "دسته‌بندی", categoryFilter: "هنر مدرن", icon: "grid" },
  { id: "c11", name: "مجسمه و دکوری", badge: "دسته‌بندی", categoryFilter: "مجسمه و دکوری", icon: "grid" },
  { id: "c12", name: "قاب و فریم", badge: "دسته‌بندی", categoryFilter: "قاب و فریم", icon: "grid" },
  { id: "c13", name: "دیوارکوب ماکرامه", badge: "در هنر دیواری", categoryFilter: "هنر دیواری", icon: "grid" },
  { id: "c14", name: "گلدان سرامیکی", badge: "در مجسمه و دکوری", categoryFilter: "مجسمه و دکوری", icon: "grid" },
];

const POPULAR_SEARCHES = [
  "تابلو نقاشی",
  "هنر مدرن",
  "تابلو دکوراتیو",
  "مجسمه و دکوری",
  "هنر دیواری",
  "قاب و فریم",
  "تابلو مینیمال",
  "تابلو لیپان آرت",
];

const RECENT_SEARCHES_KEY = "artisa_recent_searches";

export default function SearchModal({
  isOpen,
  onClose,
  initialQuery = "",
}: SearchModalProps) {
  const router = useRouter();
  const { setSearchQuery } = useApp();
  const { t } = useLanguage();

  const [query, setQuery] = useState(initialQuery);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [liveProducts, setLiveProducts] = useState<Product[]>([]);
  const [totalLiveCount, setTotalLiveCount] = useState<number>(0);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [, startTransition] = useTransition();

  const inputRef = useRef<HTMLInputElement>(null);

  // Sync initial query and load recent searches from localStorage
  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery);
      try {
        const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
        if (stored) {
          setRecentSearches(JSON.parse(stored));
        }
      } catch {
        // ignore
      }
      const timeout = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          // Move cursor to end of text
          const len = inputRef.current.value.length;
          inputRef.current.setSelectionRange(len, len);
        }
      }, 80);
      return () => clearTimeout(timeout);
    }
  }, [isOpen, initialQuery]);

  useScrollLock(isOpen);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Save term to recent searches
  const saveRecentSearch = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item !== trimmed);
      const updated = [trimmed, ...filtered].slice(0, 8);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const removeRecentSearch = (e: React.MouseEvent, term: string) => {
    e.stopPropagation();
    setRecentSearches((prev) => {
      const updated = prev.filter((item) => item !== term);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const clearAllRecent = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {
      // ignore
    }
  };

  // Perform search submission
  const executeSearch = (searchTerm: string) => {
    const term = searchTerm.trim();
    if (term) {
      saveRecentSearch(term);
    }
    onClose();

    startTransition(() => {
      setSearchQuery(term);
      router.push(`/?search=${encodeURIComponent(term)}`);
    });
  };

  const handleProductClick = (productId: string) => {
    onClose();
    router.push(`/product/${productId}`);
  };

  // Live debounced fetch strictly from backend
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setLiveProducts([]);
      setTotalLiveCount(0);
      setIsLoadingProducts(false);
      return;
    }

    setIsLoadingProducts(true);
    const timer = setTimeout(async () => {
      try {
        const res = await api.get<{ items: Product[]; total: number }>("/api/v1/products", {
          search: trimmed,
          limit: 8,
        });

        if (res && res.items) {
          setLiveProducts(res.items);
          setTotalLiveCount(res.total || res.items.length);
        } else {
          setLiveProducts([]);
          setTotalLiveCount(0);
        }
      } catch {
        setLiveProducts([]);
        setTotalLiveCount(0);
      } finally {
        setIsLoadingProducts(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Filter category suggestions based on query
  const matchingSuggestions = query.trim()
    ? ALL_CATEGORY_SUGGESTIONS.filter((s) =>
        s.name.includes(query.trim()) ||
        query.trim().includes(s.name) ||
        s.categoryFilter.includes(query.trim())
      )
    : [];

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] w-full h-[100dvh] bg-white flex flex-col overflow-hidden animate-in fade-in duration-200 select-none md:hidden"
      dir="rtl"
      role="dialog"
      aria-modal="true"
    >
      {/* ── Top Header: Back Button + Search Input + Clear Button ── */}
      <header className="sticky top-0 z-20 flex items-center gap-2 px-3 py-2.5 bg-white border-b border-gray-200 shadow-xs shrink-0">
        {/* Back Button (RTL: Arrow pointing right to return) */}
        <button
          type="button"
          onClick={onClose}
          className="flex size-10 items-center justify-center rounded-full text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors cursor-pointer shrink-0"
          title="بازگشت"
          aria-label="بازگشت"
        >
          <ArrowRight className="size-5 text-gray-800" />
        </button>

        {/* Search Input Container */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (query.trim()) {
              executeSearch(query);
            }
          }}
          className="relative flex-1 flex items-center min-w-0"
        >
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجو در آرتیسا..."
            className="w-full h-11 pr-4 pl-10 rounded-2xl bg-gray-100 text-gray-900 placeholder:text-gray-400 text-sm font-medium border border-transparent focus:border-amber-600/50 focus:bg-white focus:outline-none transition-all shadow-inner"
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
          />

          {/* Clear (✕) Button */}
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 flex size-7 items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-200/80 active:bg-gray-300 transition-colors cursor-pointer"
              title="پاک کردن"
            >
              <X className="size-4" />
            </button>
          ) : (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <Search className="size-4" />
            </div>
          )}
        </form>
      </header>

      {/* ── Body: Pure White Full-Screen Scrollable Content ── */}
      <div className="flex-1 overflow-y-auto bg-white overscroll-contain">
        {query.trim() ? (
          <div className="divide-y divide-gray-100 pb-20">
            {/* 1. Category Suggestions matching query */}
            {matchingSuggestions.length > 0 && (
              <div className="bg-white">
                {matchingSuggestions.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => executeSearch(item.name)}
                    className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-gray-50 active:bg-gray-100 border-b border-gray-100 last:border-b-0 transition-colors group cursor-pointer text-right"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="text-gray-400 group-hover:text-amber-700 transition-colors shrink-0">
                        {item.icon === "search" ? (
                          <Search className="size-4.5" />
                        ) : (
                          <LayoutGrid className="size-4.5" />
                        )}
                      </div>
                      <span className="text-sm font-bold text-gray-800 group-hover:text-amber-700 transition-colors truncate">
                        {item.name}
                      </span>
                    </div>

                    <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2.5 py-0.5 rounded-full shrink-0">
                      {item.badge}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* 2. Direct Keyword Search Action */}
            <button
              onClick={() => executeSearch(query)}
              className="w-full px-4 py-3 flex items-center justify-between bg-amber-50/60 hover:bg-amber-100/60 active:bg-amber-100 transition-colors group cursor-pointer text-right"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Search className="size-4 text-amber-700 shrink-0" />
                <span className="text-xs font-bold text-gray-800 truncate">
                  جستجو برای «<strong className="text-amber-700">{query}</strong>»
                </span>
              </div>
              <ArrowUpRight className="size-4 text-amber-700 group-hover:-translate-x-0.5 transition-transform shrink-0" />
            </button>

            {/* 3. Live Products Results */}
            <div className="p-4 space-y-3 bg-white">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-gray-700 flex items-center gap-1.5">
                  <ShoppingBag className="size-4 text-amber-700" />
                  <span>کالاهای مرتبط</span>
                  {totalLiveCount > 0 && (
                    <span className="text-[11px] font-bold text-gray-400 mr-1">
                      ({totalLiveCount})
                    </span>
                  )}
                </span>
                {isLoadingProducts && (
                  <Loader2 className="size-4 text-amber-700 animate-spin" />
                )}
              </div>

              {isLoadingProducts && liveProducts.length === 0 ? (
                <div className="grid grid-cols-1 gap-2.5">
                  {[1, 2, 3, 4].map((n) => (
                    <div
                      key={n}
                      className="h-16 rounded-2xl bg-gray-100 animate-pulse border border-gray-200/60"
                    />
                  ))}
                </div>
              ) : liveProducts.length > 0 ? (
                <div className="grid grid-cols-1 gap-2.5">
                  {liveProducts.map((prod) => (
                    <div
                      key={prod.id}
                      onClick={() => handleProductClick(prod.id)}
                      className="flex items-center gap-3 p-2.5 rounded-2xl border border-gray-100 bg-white hover:border-amber-600/40 hover:bg-amber-50/30 active:bg-gray-50 shadow-xs transition-all cursor-pointer group"
                    >
                      <div className="relative size-14 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
                        <Image
                          src={prod.image || "/placeholder.jpg"}
                          alt={prod.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="flex flex-col min-w-0 flex-1 justify-center">
                        <span className="text-xs font-bold text-gray-900 truncate group-hover:text-amber-800 transition-colors">
                          {prod.name}
                        </span>
                        <span className="text-[11px] text-gray-500 truncate mt-0.5">
                          {prod.category}
                        </span>
                        <span className="text-xs font-black text-amber-800 mt-1">
                          {prod.price.toLocaleString("fa-IR")} تومان
                        </span>
                      </div>
                      <ChevronLeft className="size-4 text-gray-300 group-hover:text-amber-700 group-hover:-translate-x-0.5 transition-all shrink-0" />
                    </div>
                  ))}
                </div>
              ) : !isLoadingProducts && matchingSuggestions.length === 0 ? (
                <div className="text-center py-10 text-xs text-gray-500 font-medium">
                  کالایی با عبارت «{query}» یافت نشد.
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          /* ── Default View: Recent & Trending & Categories ── */
          <div className="p-4 space-y-6 pb-20 bg-white">
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-gray-800 flex items-center gap-1.5">
                    <Clock className="size-4 text-gray-400" />
                    <span>جستجوهای اخیر</span>
                  </span>
                  <button
                    type="button"
                    onClick={clearAllRecent}
                    className="text-[11px] font-bold text-gray-400 hover:text-red-600 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Trash2 className="size-3.5" />
                    <span>پاک کردن همه</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((term, idx) => (
                    <div
                      key={idx}
                      onClick={() => executeSearch(term)}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-gray-200 bg-gray-50 hover:bg-gray-100 active:bg-gray-200 text-xs font-bold text-gray-800 transition-all cursor-pointer group"
                    >
                      <Clock className="size-3.5 text-gray-400 group-hover:text-amber-700 transition-colors" />
                      <span>{term}</span>
                      <button
                        type="button"
                        onClick={(e) => removeRecentSearch(e, term)}
                        className="text-gray-400 hover:text-red-600 p-0.5 rounded-full"
                        title="حذف"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Searches */}
            <div className="space-y-3">
              <span className="text-xs font-extrabold text-gray-800 flex items-center gap-1.5">
                <TrendingUp className="size-4 text-rose-500" />
                <span>بیشترین جستجوهای آرتیسا</span>
              </span>

              <div className="flex flex-wrap gap-2">
                {POPULAR_SEARCHES.map((term, idx) => (
                  <button
                    key={idx}
                    onClick={() => executeSearch(term)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-gray-200 bg-white hover:border-amber-600/60 hover:text-amber-800 active:bg-gray-50 text-xs font-bold text-gray-700 transition-all cursor-pointer shadow-2xs"
                  >
                    <Sparkles className="size-3.5 text-amber-500" />
                    <span>{term}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Categories Quick Access Grid */}
            <div className="space-y-3 pt-1">
              <span className="text-xs font-extrabold text-gray-800 flex items-center gap-1.5">
                <LayoutGrid className="size-4 text-amber-700" />
                <span>دسته‌بندی‌های برگزیده</span>
              </span>

              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { name: "تابلو نقاشی" },
                  { name: "هنر دیواری" },
                  { name: "مجسمه و دکوری" },
                  { name: "قاب و فریم" },
                  { name: "هنر مدرن" },
                  { name: "پیشنهادات شگفت‌انگیز" },
                ].map((cat, idx) => (
                  <button
                    key={idx}
                    onClick={() => executeSearch(cat.name)}
                    className="p-3 rounded-2xl border border-gray-200 bg-gray-50 hover:border-amber-600/40 hover:bg-amber-50/40 active:bg-gray-100 text-xs font-extrabold text-gray-800 text-center transition-all cursor-pointer shadow-2xs"
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Sticky Bottom Footer: Show All Search Results ── */}
      {query.trim() && (
        <footer className="fixed bottom-0 inset-x-0 z-20 p-3 bg-white border-t border-gray-200 shadow-lg flex items-center justify-between">
          <span className="text-xs text-gray-500 font-medium">
            {totalLiveCount > 0
              ? `${totalLiveCount} کالا یافت شد`
              : "مشاهده تمام نتایج"}
          </span>

          <button
            onClick={() => executeSearch(query)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-700 active:bg-amber-800 text-white text-xs font-extrabold hover:bg-amber-800 transition-all cursor-pointer shadow-sm"
          >
            <span>مشاهده همه نتایج</span>
            <ChevronLeft className="size-4" />
          </button>
        </footer>
      )}
    </div>
  );
}
