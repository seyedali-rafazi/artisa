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
  ShoppingBag,
  Heart,
  MapPin,
  LogOut,
  LayoutDashboard,
} from "lucide-react";

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
  const [searchInput, setSearchInput] = useState("");

  const profileMenuRef = useRef<HTMLDivElement>(null);
  const activeProfileTab = pathname.startsWith("/profile")
    ? searchParams.get("tab") || "profile"
    : null;
  const isOnProfile = pathname.startsWith("/profile");

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

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.overflow = "";
      window.scrollTo(0, scrollY);
    };
  }, [mobileMenuOpen]);

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
  ];
  const isCategoryActive = categories.some((cat) => searchQuery === cat.filter);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
        {/* Main Header Row */}
        <div className="flex h-16 w-full items-center justify-between px-4 md:h-20 md:px-8">
          {/* Logo and Menu Trigger (Mobile) */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-md p-1.5 hover:bg-muted md:hidden"
              aria-label="Toggle menu"
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
              className="flex cursor-pointer items-center gap-2.5"
            >
              <Image
                src="/logo.png"
                alt={t("brandName")}
                width={160}
                height={160}
                className="h-11 w-auto md:h-14 object-contain"
                priority
              />
              <div className="flex flex-col">
                <span className="text-lg font-extrabold tracking-tight md:text-xl text-foreground">
                  {t("brandName")}
                </span>
                <span className="text-[9px] text-muted-foreground hidden sm:inline leading-3">
                  {t("brandSubtitle")}
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Search bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="relative hidden max-w-md flex-1 px-4 md:block"
          >
            <div className="relative">
              <Input
                type="text"
                placeholder={t("searchPlaceholder")}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pr-10 pl-4 py-2 rounded-xl border-border bg-muted/30 focus-visible:ring-primary/40 focus-visible:border-primary text-sm"
                dir="rtl"
              />
              <button
                type="submit"
                className="absolute top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-primary transition-colors left-3"
              >
                <Search className="size-4" />
              </button>
            </div>
          </form>

          {/* Action icons (Cart, Profile Popup) */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Cart Button */}
            <Link
              href="/cart"
              className="relative flex size-10 items-center justify-center rounded-full hover:bg-muted/80 text-foreground transition-all cursor-pointer"
              title={t("cart")}
            >
              <ShoppingCart className="size-5" />
              {cartItemsCount > 0 && (
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
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 md:px-3 md:py-2 rounded-full border transition-all cursor-pointer ${
                    isOnProfile || profileMenuOpen
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
                          className={`flex items-center gap-2.5 rounded-xl px-3 py-2 transition-colors ${
                            isOnAdmin
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
                              className={`flex items-center gap-2.5 rounded-xl px-3 py-2 transition-colors ${
                                isActive
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
              {/* Categories dropdown */}
              <div
                className={`group relative flex h-12 cursor-pointer items-center gap-1 transition-colors `}
              >
                <span>{t("categories")}</span>
                <ChevronDown className="size-4" />
                {/* Dropdown panel */}
                <div className="absolute top-12 right-6 z-50 hidden w-60 rounded-xl border border-border bg-popover p-2 shadow-xl group-hover:block left-0">
                  <div className="flex flex-col gap-0.5">
                    {categories.map((cat) => {
                      const isActive = searchQuery === cat.filter;
                      return (
                        <button
                          type="button"
                          key={cat.key}
                          onClick={() => {
                            setSearchQuery(cat.filter);
                          }}
                          className={`rounded-lg px-3 py-2 text-start text-xs font-medium transition-all cursor-pointer ${
                            isActive
                              ? "bg-primary/15 text-primary font-bold"
                              : "hover:bg-muted/80 hover:text-primary"
                          }`}
                          aria-current={isActive ? "true" : undefined}
                        >
                          {t(cat.key)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              <Link
                href="/"
                onClick={() => {
                  setSearchQuery("special");
                }}
                className={`cursor-pointer transition-colors py-2 ${searchQuery === "special" ? "text-primary font-bold" : "hover:text-primary"}`}
              >
                {t("amazingOffers")}
              </Link>
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
      <div className="fixed inset-0 z-[60] md:hidden pointer-events-none">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(false)}
          className={`fixed inset-0 bg-black/30 transition-opacity duration-300 ${mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
          aria-hidden="true"
        />

        <div
          className={`fixed inset-y-0 right-0 z-[60] flex w-full max-w-sm flex-col overflow-y-auto border-l border-border bg-background p-6 pt-4 shadow-2xl transition-transform duration-300 ease-in-out ${mobileMenuOpen ? "translate-x-0 pointer-events-auto" : "translate-x-full"}`}
          aria-label="Mobile menu"
        >
          <div className="mb-4 flex items-center justify-between">
            <Image
              src="/logo.png"
              alt={t("brandName")}
              width={120}
              height={120}
              className="h-10 w-auto object-contain"
            />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-md p-1.5 hover:bg-muted"
              aria-label="Close menu"
            >
              <X className="size-6" />
            </button>
          </div>

          {/* Mobile Search input */}
          <form onSubmit={handleSearchSubmit} className="mb-6">
            <div className="relative">
              <Input
                type="text"
                placeholder={t("searchPlaceholder")}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pr-10 pl-4 py-2 rounded-xl bg-muted/40 border-border text-sm"
                dir="rtl"
              />
              <button
                type="submit"
                className="absolute top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground left-3"
              >
                <Search className="size-4" />
              </button>
            </div>
          </form>

          {/* Menu links */}
          <div className="flex flex-col gap-1 text-base font-bold">
            <Link
              href="/"
              onClick={() => {
                setMobileMenuOpen(false);
                setSearchQuery("");
              }}
              className={`flex items-center text-start rounded-xl px-3 py-2.5 transition-colors ${
                pathname === "/" && !searchQuery
                  ? "bg-primary/15 text-primary"
                  : "hover:bg-muted hover:text-primary"
              }`}
            >
              {t("home")}
            </Link>
            <Link
              href="/"
              onClick={() => {
                setSearchQuery("special");
                setMobileMenuOpen(false);
              }}
              className={`flex items-center text-start rounded-xl px-3 py-2.5 transition-colors ${
                searchQuery === "special"
                  ? "bg-primary/15 text-primary"
                  : "hover:bg-muted hover:text-primary"
              }`}
            >
              {t("amazingOffers")}
            </Link>
            <Link
              href="/blog"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center text-start rounded-xl px-3 py-2.5 transition-colors ${
                pathname === "/blog"
                  ? "bg-primary/15 text-primary"
                  : "hover:bg-muted hover:text-primary"
              }`}
            >
              {t("blog")}
            </Link>
            <Link
              href="/faq"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center text-start rounded-xl px-3 py-2.5 transition-colors ${
                pathname === "/faq"
                  ? "bg-primary/15 text-primary"
                  : "hover:bg-muted hover:text-primary"
              }`}
            >
              {t("faqTitle")}
            </Link>
            <Link
              href="/track-order"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center text-start rounded-xl px-3 py-2.5 transition-colors ${
                pathname === "/track-order"
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
              <span>021-88888888</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
