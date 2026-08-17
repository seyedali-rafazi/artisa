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
  ShoppingBag,
  Sparkles,
  ArrowUpRight,
  Loader2,
} from "lucide-react";
import { useApp, Product } from "@/components/AppContext";
import { useLanguage } from "@/components/LanguageContext";
import { api } from "@/lib/api";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

interface CategorySuggestion {
  id: string;
  name: string;
  badge: string; // e.g. "دسته‌بندی", "در تابلو", "در تابلو شاسی"
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
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, initialQuery]);

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
          limit: 6,
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
    }, 250);

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
    <>
      {/* ── Low-transparent darkened backdrop overlay (Mobile) ── */}
      <div
        className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[1px] transition-opacity duration-200 animate-fade-in md:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* ── Mobile Floating Modal anchored at top ── */}
      <div
        className="fixed top-2.5 left-1/2 -translate-x-1/2 w-[calc(100%-1.5rem)] max-w-xl z-50 flex flex-col animate-fade-in md:hidden"
        dir="rtl"
        role="dialog"
        aria-modal="true"
      >
        <div
          className="w-full bg-card/95 backdrop-blur-xl border border-border/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Header: Pill Search Input matching the photo ── */}
          <div className="p-3 sm:p-3.5 border-b border-border/40 bg-background/50">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (query.trim()) {
                  executeSearch(query);
                }
              }}
              className="relative flex items-center"
            >
              {/* Search Icon (RTL Right side) */}
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                <Search className="size-4.5 text-muted-foreground/80" />
              </div>

              {/* Input Field */}
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="جستجو..."
                className="w-full h-11 pr-10 pl-12 rounded-2xl bg-muted/40 dark:bg-muted/20 border border-transparent focus:border-primary/40 focus:bg-background text-foreground text-sm font-medium focus:outline-none transition-all placeholder:text-muted-foreground/60"
              />

              {/* Clear (✕) Button (RTL Left side) */}
              <div className="absolute left-2.5 top-1/2 -translate-y-1/2 flex items-center">
                {query ? (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      inputRef.current?.focus();
                    }}
                    className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
                    title="پاک کردن"
                  >
                    <X className="size-4 text-muted-foreground" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
                    title="بستن"
                  >
                    <X className="size-4 text-muted-foreground" />
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* ── Body: Live Suggestions List / Products / Trends ── */}
          <div className="flex-1 overflow-y-auto divide-y divide-border/30 min-h-[200px]">
            {query.trim() ? (
              <>
                {/* 1. Category Suggestions matching the photo */}
                {matchingSuggestions.length > 0 && (
                  <div>
                    {matchingSuggestions.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => executeSearch(item.name)}
                        className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/40 border-b border-border/30 last:border-b-0 transition-colors group cursor-pointer text-right"
                      >
                        {/* Right: Icon + Suggestion title */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="text-muted-foreground/70 group-hover:text-primary transition-colors shrink-0">
                            {item.icon === "search" ? (
                              <Search className="size-4" />
                            ) : (
                              <LayoutGrid className="size-4" />
                            )}
                          </div>
                          <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                            {item.name}
                          </span>
                        </div>

                        {/* Left: Blue Contextual Badge (e.g. "دسته‌بندی", "در تابلو") */}
                        <span className="text-xs font-bold text-sky-600 dark:text-sky-400 shrink-0">
                          {item.badge}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* 2. Direct Keyword Search Item */}
                <button
                  onClick={() => executeSearch(query)}
                  className="w-full px-4 py-2.5 flex items-center justify-between bg-primary/5 hover:bg-primary/10 transition-colors group cursor-pointer text-right border-y border-primary/20"
                >
                  <div className="flex items-center gap-2.5">
                    <Search className="size-4 text-primary" />
                    <span className="text-xs font-bold text-foreground">
                      جستجو برای «<strong className="text-primary">{query}</strong>»
                    </span>
                  </div>
                  <ArrowUpRight className="size-4 text-primary group-hover:-translate-x-0.5 transition-transform" />
                </button>

                {/* 3. Live Backend Products */}
                <div className="p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-muted-foreground flex items-center gap-1.5">
                      <ShoppingBag className="size-3.5 text-primary" />
                      <span>کالاهای مرتبط</span>
                    </span>
                    {isLoadingProducts && (
                      <Loader2 className="size-3.5 text-primary animate-spin" />
                    )}
                  </div>

                  {isLoadingProducts && liveProducts.length === 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[1, 2, 3, 4].map((n) => (
                        <div
                          key={n}
                          className="h-14 rounded-2xl bg-muted/40 animate-pulse border border-border/30"
                        />
                      ))}
                    </div>
                  ) : liveProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {liveProducts.map((prod) => (
                        <div
                          key={prod.id}
                          onClick={() => handleProductClick(prod.id)}
                          className="flex items-center gap-2.5 p-2 rounded-2xl border border-border/40 bg-background/80 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group"
                        >
                          <div className="relative size-11 rounded-xl overflow-hidden bg-muted shrink-0">
                            <Image
                              src={prod.image || "/placeholder.jpg"}
                              alt={prod.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                              {prod.name}
                            </span>
                            <span className="text-[10px] text-muted-foreground truncate">
                              {prod.category}
                            </span>
                            <span className="text-xs font-black text-primary mt-0.5">
                              {prod.price.toLocaleString("fa-IR")} تومان
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : !isLoadingProducts && matchingSuggestions.length === 0 ? (
                    <div className="text-center py-6 text-xs text-muted-foreground font-medium">
                      کالایی با عبارت «{query}» یافت نشد.
                    </div>
                  ) : null}
                </div>
              </>
            ) : (
              /* ── Default View: Recent & Trending ── */
              <div className="p-4 space-y-5">
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-foreground flex items-center gap-1.5">
                        <Clock className="size-3.5 text-muted-foreground" />
                        <span>جستجوهای اخیر</span>
                      </span>
                      <button
                        type="button"
                        onClick={clearAllRecent}
                        className="text-[11px] text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Trash2 className="size-3" />
                        <span>پاک کردن همه</span>
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((term, idx) => (
                        <div
                          key={idx}
                          onClick={() => executeSearch(term)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/60 bg-muted/20 hover:border-primary hover:bg-primary/5 text-xs font-bold text-foreground transition-all cursor-pointer group"
                        >
                          <Clock className="size-3 text-muted-foreground group-hover:text-primary transition-colors" />
                          <span>{term}</span>
                          <button
                            type="button"
                            onClick={(e) => removeRecentSearch(e, term)}
                            className="text-muted-foreground hover:text-destructive p-0.5 rounded-full"
                            title="حذف"
                          >
                            <X className="size-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular Searches */}
                <div className="space-y-2.5">
                  <span className="text-xs font-extrabold text-foreground flex items-center gap-1.5">
                    <TrendingUp className="size-3.5 text-rose-500" />
                    <span>بیشترین جستجوهای آرتیسا</span>
                  </span>

                  <div className="flex flex-wrap gap-2">
                    {POPULAR_SEARCHES.map((term, idx) => (
                      <button
                        key={idx}
                        onClick={() => executeSearch(term)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border/60 bg-background hover:border-primary hover:text-primary text-xs font-bold text-muted-foreground transition-all cursor-pointer"
                      >
                        <Sparkles className="size-3 text-amber-500" />
                        <span>{term}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Categories Quick Grid */}
                <div className="space-y-2.5 pt-1">
                  <span className="text-xs font-extrabold text-foreground flex items-center gap-1.5">
                    <LayoutGrid className="size-3.5 text-primary" />
                    <span>دسته‌بندی‌های برگزیده</span>
                  </span>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
                        className="p-2.5 rounded-2xl border border-border/60 bg-muted/20 hover:border-primary hover:bg-primary/5 text-xs font-extrabold text-foreground text-center transition-all cursor-pointer"
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Footer ── */}
          {query.trim() && (
            <div className="p-3 border-t border-border/40 bg-muted/10 flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">
                {totalLiveCount > 0
                  ? `${totalLiveCount} کالا در پایگاه داده یافت شد`
                  : "مشاهده تمام نتایج"}
              </span>

              <button
                onClick={() => executeSearch(query)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-extrabold hover:bg-primary/90 transition-all cursor-pointer"
              >
                <span>مشاهده نتایج جستجو</span>
                <ChevronLeft className="size-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
