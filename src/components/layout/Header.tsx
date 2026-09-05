"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { useLanguage } from "../LanguageContext";
import { useApp } from "../AppContext";
import { Input } from "../ui/input";
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  ChevronDown,
  ChevronLeft,
  ShoppingBag,
  Heart,
  MapPin,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import dynamic from "next/dynamic";
const SearchModal = dynamic(() => import("./SearchModal"), { ssr: false });
import HeaderSearchBar from "./HeaderSearchBar";
import { useScrollLock } from "@/hooks/useScrollLock";

const profileNavItems = [
  {
    tab: "profile",
    href: "/profile?tab=profile",
    label: "پروفایل کاربری",
    icon: User,
  },
  {
    tab: "orders",
    href: "/profile?tab=orders",
    label: "سفارش‌های من",
    icon: ShoppingBag,
  },
  {
    tab: "wishlist",
    href: "/profile?tab=wishlist",
    label: "علاقه‌مندی‌ها",
    icon: Heart,
  },
  {
    tab: "addresses",
    href: "/profile?tab=addresses",
    label: "آدرس‌های من",
    icon: MapPin,
  },
] as const;

export default function Header() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const { cart, user, logout, searchQuery, setSearchQuery } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [isDesktopSearchOpen, setIsDesktopSearchOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const profileMenuRef = useRef<HTMLDivElement>(null);
  const activeProfileTab = pathname.startsWith("/profile")
    ? searchParams.get("tab") || "profile"
    : null;
  const isOnProfile = pathname.startsWith("/profile");

  // Global search shortcut (Ctrl+K or /)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }
      if (((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") || e.key === "/") {
        e.preventDefault();
        if (typeof window !== "undefined" && window.innerWidth < 768) {
          setMobileMenuOpen(false);
          setIsMobileSearchOpen(true);
        } else {
          setIsDesktopSearchOpen(true);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useScrollLock(mobileMenuOpen);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
  };

  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const role = (user?.role || "").toLowerCase();
  const isAdmin =
    !!user &&
    (role === "admin" ||
      role === "superadmin" ||
      role === "super_admin" ||
      role === "مدیر سیستم" ||
      role === "مدیر ارشد" ||
      (user as { is_superuser?: boolean })?.is_superuser === true);
  const isOnAdmin = pathname.startsWith("/admin");

  const categories = [
    { key: "categoryPainting", filter: "تابلو نقاشی" },
    { key: "categoryWallArt", filter: "هنر دیواری" },
    { key: "categorySculpture", filter: "مجسمه و دکوری" },
    { key: "categoryFrame", filter: "قاب و فریم" },
    { key: "categoryModernArt", filter: "هنر مدرن" },
    { key: "categoryGift", filter: "هدایای هنری" },
  ];
  const isCategoryActive = categories.some((cat) => searchQuery === cat.filter);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
        {/* Main Header Row */}
        <div className="relative flex h-16 w-full items-center justify-between px-4 md:h-20 md:px-8">
          {/* Menu Trigger (Mobile) + Desktop Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-xl p-2 text-foreground hover:bg-muted md:hidden cursor-pointer transition-colors"
              aria-label="منوی سایت"
            >
              {mobileMenuOpen ? (
                <X className="size-6" />
              ) : (
                <Menu className="size-6" />
              )}
            </button>

            <Link
              href="/"
              onClick={() => {
                setSearchQuery("");
                setSearchInput("");
              }}
              className="hidden md:flex cursor-pointer items-center gap-2.5 group"
            >
              <Image
                src="/logo.png"
                alt={t("brandName")}
                width={160}
                height={160}
                className="h-14 w-auto object-contain transition-transform group-hover:scale-105"
                priority
              />
              <div className="flex flex-col">
                <span className="text-lg font-extrabold tracking-tight md:text-xl text-foreground group-hover:text-primary transition-colors">
                  {t("brandName")}
                </span>
                <span className="text-[9px] text-muted-foreground hidden sm:inline leading-3">
                  {t("brandSubtitle")}
                </span>
              </div>
            </Link>
          </div>


          {/* Desktop Search bar — EXACT size and location with anchored suggestions dropdown */}
          <HeaderSearchBar
            isOpen={isDesktopSearchOpen}
            onOpen={() => setIsDesktopSearchOpen(true)}
            onClose={() => setIsDesktopSearchOpen(false)}
          />

          {/* Mobile Search bar trigger in Navbar — directly opens SearchModal without opening sidebar */}


          {/* Action icons (Cart, Profile Popup) */}
          <div className="flex items-center gap-1.5 md:gap-3 shrink-0">

            {/* Cart Button */}
            <Link
              href="/cart"
              className="relative flex size-10 items-center justify-center rounded-full hover:bg-muted/80 text-foreground transition-all cursor-pointer"
              title={t("cart")}
            >
              <ShoppingCart className="size-5" />
              {mounted && cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground animate-bounce">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            {/* User Profile / Login Button */}
            {user ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 md:px-3 md:py-2 rounded-full border transition-all cursor-pointer ${isOnProfile || profileMenuOpen
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-muted/20 text-foreground hover:border-primary hover:bg-primary/5"
                    }`}
                  title="پروفایل کاربری"
                  aria-label="منوی پروفایل"
                  aria-expanded={profileMenuOpen}
                >
                  <User className="size-5 text-primary" />
                  <ChevronDown
                    className={`size-3.5 text-muted-foreground transition-transform duration-200 ${profileMenuOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Profile Popup Dropdown */}
                {profileMenuOpen && (
                  <div
                    className="absolute left-0 mt-2 w-60 rounded-2xl border border-border bg-popover p-2.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150"
                    dir="rtl"
                  >
                    {/* User Info Header */}
                    <div className="flex items-center gap-3 p-2.5 border-b border-border/60 mb-1 bg-muted/40 rounded-xl">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary text-sm font-extrabold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-extrabold text-foreground truncate">
                          {user.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground truncate">
                          {user.email}
                        </span>
                      </div>
                    </div>

                    {/* Nav Links */}
                    <div className="flex flex-col gap-0.5 text-xs font-medium">
                      {isAdmin && (
                        <Link
                          href="/admin/dashboard"
                          onClick={() => setProfileMenuOpen(false)}
                          className={`flex items-center gap-2.5 rounded-xl px-3 py-2 transition-colors ${isOnAdmin
                            ? "bg-primary/15 text-primary font-bold"
                            : "text-foreground hover:bg-muted hover:text-primary"
                            }`}
                          aria-current={isOnAdmin ? "page" : undefined}
                        >
                          <LayoutDashboard
                            className={`size-4 ${isOnAdmin ? "text-primary" : "text-muted-foreground"}`}
                          />
                          <span>پنل مدیریت</span>
                        </Link>
                      )}
                      {profileNavItems.map(
                        ({ tab, href, label, icon: Icon }) => {
                          const isActive = activeProfileTab === tab;
                          return (
                            <Link
                              key={tab}
                              href={href}
                              onClick={() => setProfileMenuOpen(false)}
                              className={`flex items-center gap-2.5 rounded-xl px-3 py-2 transition-colors ${isActive
                                ? "bg-primary/15 text-primary font-bold"
                                : "text-foreground hover:bg-muted hover:text-primary"
                                }`}
                              aria-current={isActive ? "page" : undefined}
                            >
                              <Icon
                                className={`size-4 ${isActive ? "text-primary" : "text-muted-foreground"}`}
                              />
                              <span>{label}</span>
                            </Link>
                          );
                        },
                      )}
                    </div>

                    {/* Logout Button */}
                    <div className="border-t border-border/60 mt-1 pt-1">
                      <button
                        onClick={() => {
                          logout();
                          setProfileMenuOpen(false);
                        }}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                      >
                        <LogOut className="size-4" />
                        <span>خروج از حساب</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 rounded-full border border-border bg-muted/20 px-3.5 py-1.5 text-xs font-extrabold text-foreground hover:border-primary hover:bg-primary/5 hover:text-primary transition-all cursor-pointer shadow-sm"
                title={t("loginSignup")}
              >
                <User className="size-4 text-primary" />
                <span>{t("loginSignup")}</span>
              </Link>
            )}
          </div>
        </div>

        {/* Megamenu Navigation (Desktop) */}
        <nav className="hidden border-t border-border bg-background px-8 md:block">
          <div className="flex h-12 w-full items-center justify-between text-sm font-semibold">
            <div className="flex items-center gap-6">
              <Link
                href="/"
                onClick={() => {
                  setSearchQuery("");
                }}
                className={`cursor-pointer transition-colors py-2 ${pathname === "/" && !searchQuery ? "text-primary font-bold" : "hover:text-primary"}`}
              >
                {t("home")}
              </Link>
              {/* Products dropdown */}
              <div className="group relative flex h-12 items-center">
                <Link
                  href="/products"
                  className={`flex items-center gap-1.5 py-2 cursor-pointer transition-colors ${
                    pathname === "/products" ? "text-primary font-bold" : "text-foreground hover:text-primary"
                  }`}
                >
                  <span>{t("products")}</span>
                  <ChevronDown className="size-4 text-muted-foreground transition-transform duration-200 group-hover:rotate-180 group-hover:text-primary" />
                </Link>

                {/* Dropdown panel on hover */}
                <div className="absolute top-12 right-0 z-50 hidden w-64 rounded-2xl border border-border bg-popover p-2.5 shadow-2xl group-hover:block left-auto animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex flex-col gap-0.5">
                    <Link
                      href="/products"
                      className="flex items-center justify-between rounded-xl px-3 py-2 text-start text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 transition-all mb-1"
                    >
                      <span>مشاهده همه محصولات</span>
                      <ChevronLeft className="size-3.5" />
                    </Link>
                    <div className="h-px bg-border/60 my-0.5" />
                    {categories.map((cat) => (
                      <Link
                        key={cat.key}
                        href={`/products?category=${encodeURIComponent(cat.filter)}`}
                        className="rounded-xl px-3 py-2 text-start text-xs font-medium text-foreground hover:bg-muted/80 hover:text-primary transition-all"
                      >
                        {t(cat.key)}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
              <Link
                href="/blog"
                className={`cursor-pointer transition-colors py-2 ${pathname === "/blog" ? "text-primary font-bold" : "hover:text-primary"}`}
              >
                {t("blog")}
              </Link>
              <Link
                href="/faq"
                className={`cursor-pointer transition-colors py-2 ${pathname === "/faq" ? "text-primary font-bold" : "hover:text-primary"}`}
              >
                {t("faqTitle")}
              </Link>
            </div>

            <div className="flex items-center gap-6 text-muted-foreground text-xs">
              <Link
                href="/about-us"
                className={`cursor-pointer transition-colors ${pathname === "/about-us" ? "text-primary font-bold" : "hover:text-primary"}`}
              >
                {t("aboutUs")}
              </Link>
              <Link
                href="/contact-us"
                className={`cursor-pointer transition-colors ${pathname === "/contact-us" ? "text-primary font-bold" : "hover:text-primary"}`}
              >
                {t("contactUs")}
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile drawer — rendered outside header to avoid backdrop-blur transparency */}
      <div className={`fixed inset-0 z-[60] md:hidden ${mobileMenuOpen && !isMobileSearchOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(false)}
          className={`fixed inset-0 bg-black/30 transition-opacity duration-300 ${mobileMenuOpen && !isMobileSearchOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
          aria-hidden="true"
        />

        <div
          className={`fixed inset-y-0 right-0 z-[60] flex w-full max-w-sm flex-col overflow-y-auto border-l border-border bg-background p-6 pt-4 shadow-2xl transition-transform duration-300 ease-in-out ${mobileMenuOpen && !isMobileSearchOpen ? "translate-x-0 pointer-events-auto" : "translate-x-full pointer-events-none"}`}
          aria-label="Mobile menu"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative size-10 rounded-full overflow-hidden bg-white border border-border/80 shadow-xs flex items-center justify-center p-0.5 ring-2 ring-primary/20">
                <Image
                  src="/logo.png"
                  alt={t("brandName")}
                  width={80}
                  height={80}
                  className="size-full object-cover rounded-full scale-110"
                />
              </div>
              <span className="text-sm font-extrabold text-foreground">{t("brandName")}</span>
            </div>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl p-2 hover:bg-muted cursor-pointer transition-colors"
              aria-label="بستن منو"
            >
              <X className="size-6" />
            </button>
          </div>

          {/* Mobile Search button in Sidebar */}
          <div
            onClick={() => {
              setMobileMenuOpen(false);
              setIsMobileSearchOpen(true);
            }}
            className="mb-5 cursor-pointer group"
          >
            <div className="relative flex items-center justify-between pr-10 pl-3.5 py-3 rounded-2xl bg-muted/40 hover:bg-muted/70 active:scale-[0.99] border border-border/80 group-hover:border-primary/40 transition-all text-xs text-muted-foreground shadow-xs">
              <span className="truncate font-medium">
                {searchQuery ? `جستجو: «${searchQuery}»` : "جستجو در آرتیسا..."}
              </span>
              <Search className="absolute right-3.5 size-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </div>

          {/* Menu links */}
          <div className="flex flex-col gap-1 text-base font-bold">
            <Link
              href="/"
              onClick={() => {
                setMobileMenuOpen(false);
                setSearchQuery("");
              }}
              className={`flex items-center text-start rounded-xl px-3 py-2.5 transition-colors ${pathname === "/" && !searchQuery
                ? "bg-primary/15 text-primary"
                : "hover:bg-muted hover:text-primary"
                }`}
            >
              {t("home")}
            </Link>
            {/* Products link & Collapsible Categories in Mobile Sidebar */}
            <div className="flex flex-col">
              <div
                className={`flex items-center justify-between rounded-xl transition-colors ${
                  pathname === "/products" ? "bg-primary/15 text-primary" : "hover:bg-muted"
                }`}
              >
                <Link
                  href="/products"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex-1 flex items-center text-start px-3 py-2.5 ${
                    pathname === "/products" ? "text-primary font-bold" : "text-foreground hover:text-primary"
                  }`}
                >
                  <span>{t("products")}</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileCategoriesOpen(!mobileCategoriesOpen)}
                  className="p-2.5 text-muted-foreground hover:text-primary cursor-pointer transition-colors"
                  aria-label="نمایش دسته‌بندی‌ها"
                >
                  <ChevronDown
                    className={`size-4 transition-transform duration-200 ${
                      mobileCategoriesOpen ? "rotate-180 text-primary" : ""
                    }`}
                  />
                </button>
              </div>

              {/* Collapsible Category Links */}
              {mobileCategoriesOpen && (
                <div className="mr-3 my-1 flex flex-col gap-0.5 border-r-2 border-primary/20 pr-3 text-sm font-medium animate-in fade-in slide-in-from-top-1 duration-150">
                  <Link
                    href="/products"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg px-2.5 py-1.5 text-xs text-primary font-bold hover:bg-muted transition-colors flex items-center justify-between"
                  >
                    <span>همه محصولات</span>
                    <ChevronLeft className="size-3" />
                  </Link>
                  {categories.map((cat) => (
                    <Link
                      key={cat.key}
                      href={`/products?category=${encodeURIComponent(cat.filter)}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
                    >
                      {t(cat.key)}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <Link
              href="/blog"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center text-start rounded-xl px-3 py-2.5 transition-colors ${pathname === "/blog"
                ? "bg-primary/15 text-primary"
                : "hover:bg-muted hover:text-primary"
                }`}
            >
              {t("blog")}
            </Link>
            <Link
              href="/faq"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center text-start rounded-xl px-3 py-2.5 transition-colors ${pathname === "/faq"
                ? "bg-primary/15 text-primary"
                : "hover:bg-muted hover:text-primary"
                }`}
            >
              {t("faqTitle")}
            </Link>
            <Link
              href="/track-order"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center text-start rounded-xl px-3 py-2.5 transition-colors ${pathname === "/track-order"
                ? "bg-primary/15 text-primary"
                : "hover:bg-muted hover:text-primary"
                }`}
            >
              {t("trackOrder")}
            </Link>
          </div>

          {/* Utility links at the bottom of drawer */}
          <div className="mt-auto flex flex-col gap-4 border-t border-border pt-6">
            <div className="flex justify-around text-xs text-muted-foreground">
              <Link
                href="/about-us"
                onClick={() => setMobileMenuOpen(false)}
                className="cursor-pointer hover:text-primary"
              >
                {t("aboutUs")}
              </Link>
              <span>•</span>
              <Link
                href="/contact-us"
                onClick={() => setMobileMenuOpen(false)}
                className="cursor-pointer hover:text-primary"
              >
                {t("contactUs")}
              </Link>
              <span>•</span>
              <span>0919-444-0839</span>
            </div>
          </div>
        </div>
      </div>

      {/* Digikala-Style Mobile Search Modal */}
      <SearchModal
        isOpen={isMobileSearchOpen}
        onClose={() => {
          setIsMobileSearchOpen(false);
          setMobileMenuOpen(false);
        }}
        initialQuery={searchQuery}
      />
    </>
  );
}
