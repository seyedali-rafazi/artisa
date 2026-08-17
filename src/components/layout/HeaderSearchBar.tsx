"use client";

import React, { useState, useEffect, useRef, useTransition } from "react";
import { createPortal } from "react-dom";
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

interface HeaderSearchBarProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export default function HeaderSearchBar({
  isOpen,
  onOpen,
  onClose,
}: HeaderSearchBarProps) {
  const router = useRouter();
  const { searchQuery, setSearchQuery } = useApp();
  const { t } = useLanguage();

  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState(searchQuery || "");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [liveProducts, setLiveProducts] = useState<Product[]>([]);
  const [totalLiveCount, setTotalLiveCount] = useState<number>(0);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [boxRect, setBoxRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const [, startTransition] = useTransition();

  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync searchQuery when it changes externally
  useEffect(() => {
    if (searchQuery && !isOpen) {
      setQuery(searchQuery);
    }
  }, [searchQuery, isOpen]);

  // Position tracking for portal anchoring
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const updatePosition = () => {
        if (triggerRef.current) {
          const r = triggerRef.current.getBoundingClientRect();
          setBoxRect({
            top: r.top,
            left: r.left,
            width: r.width,
            height: r.height,
          });
        }
      };
      updatePosition();
      window.addEventListener("resize", updatePosition);
      window.addEventListener("scroll", updatePosition);
      return () => {
        window.removeEventListener("resize", updatePosition);
        window.removeEventListener("scroll", updatePosition);
      };
    }
  }, [isOpen]);

  // Load recent searches and auto-focus when opened
  useEffect(() => {
    if (isOpen) {
      setQuery(searchQuery || "");
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
  }, [isOpen, searchQuery]);

  // Handle escape key
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

  return (
    <>
      {/* ── Search Bar Trigger in Navbar (Exact Original Size & Position) ── */}
      <div
        ref={triggerRef}
        className="relative hidden max-w-md flex-1 px-4 md:block"
        dir="rtl"
      >
        <div
          onClick={onOpen}
          className="w-full flex items-center justify-between pr-10 pl-3 py-2 rounded-2xl border border-border/80 bg-muted/30 hover:bg-muted/60 hover:border-primary/50 transition-all text-xs text-muted-foreground select-none cursor-pointer group"
        >
          <span className="truncate">
            {searchQuery ? `جستجو: «${searchQuery}»` : t("searchPlaceholder")}
          </span>
          <div className="absolute right-7 top-1/2 -translate-y-1/2 text-muted-foreground group-hover:text-primary transition-colors pointer-events-none">
            <Search className="size-4" />
          </div>
        </div>
      </div>

      {/* ── Portal Modal: Rendered directly on document.body above navbar & entire page ── */}
      {mounted &&
        isOpen &&
        boxRect &&
        createPortal(
          <>
            {/* 1. Global low-transparent backdrop covering entire window (navbar + page) */}
            <div
              className="fixed inset-0 z-[60] bg-black/25 backdrop-blur-[1px] transition-opacity duration-200 animate-fade-in"
              onClick={onClose}
              aria-hidden="true"
            />

            {/* 2. Floating Search Box & Suggestions anchored exactly over the header searchbox coordinates */}
            <div
              style={{
                position: "fixed",
                top: `${boxRect.top}px`,
                left: `${boxRect.left + 16}px`, // compensate for px-4
                width: `${boxRect.width - 32}px`, // compensate for px-4
              }}
              className="z-[70] flex flex-col pointer-events-auto"
              dir="rtl"
              role="dialog"
              aria-modal="true"
            >
              {/* Active Search Input matching original dimensions */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (query.trim()) {
                    executeSearch(query);
                  }
                }}
                style={{ height: `${boxRect.height || 36}px` }}
                className="relative w-full flex items-center justify-between pr-10 pl-3 rounded-2xl border border-primary/60 bg-background shadow-2xl text-xs"
              >
                {/* Search icon */}
                <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-primary pointer-events-none" />

                {/* Input Field */}
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="جستجو در آرتیسا..."
                  className="w-full bg-transparent text-foreground text-xs font-medium focus:outline-none placeholder:text-muted-foreground/70"
                />

                {/* Action buttons */}
                <div className="flex items-center gap-1 shrink-0">
                  {query ? (
                    <button
                      type="button"
                      onClick={() => {
                        setQuery("");
                        inputRef.current?.focus();
                      }}
                      className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                      title="پاک کردن"
                    >
                      <X className="size-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={onClose}
                      className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                      title="بستن"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>
              </form>

              {/* ── Dropdown Suggestions Menu ── */}
              <div className="w-full mt-1.5 bg-card border border-border/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh] animate-scale-up">
                <div className="flex-1 overflow-y-auto divide-y divide-border/30 min-h-[180px]">
                  {query.trim() ? (
                    <>
                      {/* 1. Category Suggestions matching the photo */}
                      {matchingSuggestions.length > 0 && (
                        <div>
                          {matchingSuggestions.map((item) => (
                            <button
                              key={item.id}
                              onClick={() => executeSearch(item.name)}
                              className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-muted/40 border-b border-border/30 last:border-b-0 transition-colors group cursor-pointer text-right"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="text-muted-foreground/70 group-hover:text-primary transition-colors shrink-0">
                                  {item.icon === "search" ? (
                                    <Search className="size-3.5" />
                                  ) : (
                                    <LayoutGrid className="size-3.5" />
                                  )}
                                </div>
                                <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                                  {item.name}
                                </span>
                              </div>
                              <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400 shrink-0">
                                {item.badge}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* 2. Direct Keyword Search Item */}
                      <button
                        onClick={() => executeSearch(query)}
                        className="w-full px-4 py-2 flex items-center justify-between bg-primary/5 hover:bg-primary/10 transition-colors group cursor-pointer text-right border-y border-primary/20"
                      >
                        <div className="flex items-center gap-2">
                          <Search className="size-3.5 text-primary" />
                          <span className="text-xs font-bold text-foreground">
                            جستجو برای «<strong className="text-primary">{query}</strong>»
                          </span>
                        </div>
                        <ArrowUpRight className="size-3.5 text-primary group-hover:-translate-x-0.5 transition-transform" />
                      </button>

                      {/* 3. Live Backend Products */}
                      <div className="p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-muted-foreground flex items-center gap-1.5">
                            <ShoppingBag className="size-3 text-primary" />
                            <span>کالاهای مرتبط</span>
                          </span>
                          {isLoadingProducts && (
                            <Loader2 className="size-3 text-primary animate-spin" />
                          )}
                        </div>

                        {isLoadingProducts && liveProducts.length === 0 ? (
                          <div className="grid grid-cols-1 gap-2">
                            {[1, 2, 3].map((n) => (
                              <div
                                key={n}
                                className="h-12 rounded-xl bg-muted/40 animate-pulse border border-border/30"
                              />
                            ))}
                          </div>
                        ) : liveProducts.length > 0 ? (
                          <div className="grid grid-cols-1 gap-1.5">
                            {liveProducts.map((prod) => (
                              <div
                                key={prod.id}
                                onClick={() => handleProductClick(prod.id)}
                                className="flex items-center gap-2.5 p-1.5 rounded-xl border border-border/40 bg-background/80 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group"
                              >
                                <div className="relative size-10 rounded-lg overflow-hidden bg-muted shrink-0">
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
                                </div>
                                <span className="text-xs font-black text-primary shrink-0 pl-2">
                                  {prod.price.toLocaleString("fa-IR")} تومان
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : !isLoadingProducts && matchingSuggestions.length === 0 ? (
                          <div className="text-center py-4 text-xs text-muted-foreground font-medium">
                            کالایی با عبارت «{query}» یافت نشد.
                          </div>
                        ) : null}
                      </div>
                    </>
                  ) : (
                    /* ── Default View: Recent & Trending ── */
                    <div className="p-3.5 space-y-4">
                      {/* Recent Searches */}
                      {recentSearches.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-extrabold text-foreground flex items-center gap-1">
                              <Clock className="size-3 text-muted-foreground" />
                              <span>جستجوهای اخیر</span>
                            </span>
                            <button
                              type="button"
                              onClick={clearAllRecent}
                              className="text-[10px] text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <Trash2 className="size-2.5" />
                              <span>پاک کردن همه</span>
                            </button>
                          </div>

                          <div className="flex flex-wrap gap-1.5">
                            {recentSearches.map((term, idx) => (
                              <div
                                key={idx}
                                onClick={() => executeSearch(term)}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border/60 bg-muted/20 hover:border-primary hover:bg-primary/5 text-xs font-bold text-foreground transition-all cursor-pointer group"
                              >
                                <Clock className="size-2.5 text-muted-foreground group-hover:text-primary transition-colors" />
                                <span>{term}</span>
                                <button
                                  type="button"
                                  onClick={(e) => removeRecentSearch(e, term)}
                                  className="text-muted-foreground hover:text-destructive p-0.5 rounded-full"
                                  title="حذف"
                                >
                                  <X className="size-2.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Popular Searches */}
                      <div className="space-y-2">
                        <span className="text-[11px] font-extrabold text-foreground flex items-center gap-1">
                          <TrendingUp className="size-3 text-rose-500" />
                          <span>بیشترین جستجوهای آرتیسا</span>
                        </span>

                        <div className="flex flex-wrap gap-1.5">
                          {POPULAR_SEARCHES.map((term, idx) => (
                            <button
                              key={idx}
                              onClick={() => executeSearch(term)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-border/60 bg-background hover:border-primary hover:text-primary text-xs font-bold text-muted-foreground transition-all cursor-pointer"
                            >
                              <Sparkles className="size-2.5 text-amber-500" />
                              <span>{term}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Categories Quick Grid */}
                      <div className="space-y-2 pt-0.5">
                        <span className="text-[11px] font-extrabold text-foreground flex items-center gap-1">
                          <LayoutGrid className="size-3 text-primary" />
                          <span>دسته‌بندی‌های برگزیده</span>
                        </span>

                        <div className="grid grid-cols-2 gap-1.5">
                          {[
                            { name: "تابلو نقاشی" },
                            { name: "هنر دیواری" },
                            { name: "مجسمه و دکوری" },
                            { name: "قاب و فریم" },
                          ].map((cat, idx) => (
                            <button
                              key={idx}
                              onClick={() => executeSearch(cat.name)}
                              className="p-2 rounded-xl border border-border/60 bg-muted/20 hover:border-primary hover:bg-primary/5 text-xs font-extrabold text-foreground text-center transition-all cursor-pointer"
                            >
                              {cat.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                {query.trim() && (
                  <div className="p-2.5 border-t border-border/40 bg-muted/10 flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground font-medium">
                      {totalLiveCount > 0
                        ? `${totalLiveCount} کالا یافت شد`
                        : "مشاهده تمام نتایج"}
                    </span>

                    <button
                      onClick={() => executeSearch(query)}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-primary text-primary-foreground text-xs font-extrabold hover:bg-primary/90 transition-all cursor-pointer"
                    >
                      <span>نتایج جستجو</span>
                      <ChevronLeft className="size-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>,
          document.body
        )}
    </>
  );
}
