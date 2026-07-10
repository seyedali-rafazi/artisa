"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useLanguage } from "../LanguageContext"
import { useApp } from "../AppContext"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { 
  Search, 
  ShoppingCart, 
  User, 
  RefreshCw, 
  Menu, 
  X, 
  ChevronDown
} from "lucide-react"

export default function Header() {
  const pathname = usePathname()
  const { t } = useLanguage()
  const { 
    cart, 
    compareList, 
    user, 
    setShowLogin,
    setSearchQuery 
  } = useApp()

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchInput, setSearchInput] = useState("")

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchQuery(searchInput)
  }

  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0)
  const compareCount = compareList.length

  const categories = [
    { key: "categoryPainting", filter: "تابلو نقاشی" },
    { key: "categoryWallArt", filter: "هنر دیواری" },
    { key: "categorySculpture", filter: "مجسمه و دکوری" },
    { key: "categoryFrame", filter: "قاب و فریم" },
    { key: "categoryModernArt", filter: "هنر مدرن" },
  ]

  return (
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
            {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>

          <Link 
            href="/"
            onClick={() => { setSearchQuery(""); setSearchInput(""); }}
            className="flex cursor-pointer items-center gap-2"
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-xl shadow-lg shadow-primary/30">
              A
            </div>
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

        {/* Action icons (Cart, Compare, User) */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Compare Button */}
          <Link
            href="/checkout"
            className="relative flex size-10 items-center justify-center rounded-full hover:bg-muted/80 text-foreground transition-all cursor-pointer"
            title={t("compare")}
          >
            <RefreshCw className="size-5" />
            {compareCount > 0 && (
              <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {compareCount}
              </span>
            )}
          </Link>

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

          {/* User Profile / Login */}
          {user ? (
            <div className="flex items-center gap-2 border border-border rounded-full py-1 px-3 bg-muted/20">
              <User className="size-4 text-primary" />
              <span className="text-xs font-semibold max-w-[80px] truncate">{user.name}</span>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowLogin(true)}
              className="hidden gap-1.5 rounded-full md:flex cursor-pointer text-xs"
            >
              <User className="size-4" />
              <span>{t("loginSignup")}</span>
            </Button>
          )}

          {/* Mobile login trigger */}
          {!user && (
            <button
              onClick={() => setShowLogin(true)}
              className="flex size-10 items-center justify-center rounded-full hover:bg-muted md:hidden"
            >
              <User className="size-5" />
            </button>
          )}
        </div>
      </div>

      {/* Megamenu Navigation (Desktop) */}
      <nav className="hidden border-t border-border bg-background px-8 md:block">
        <div className="flex h-12 w-full items-center justify-between text-sm font-semibold">
          <div className="flex items-center gap-6">
            <Link 
              href="/"
              onClick={() => { setSearchQuery(""); }}
              className={`cursor-pointer transition-colors py-2 ${pathname === "/" ? "text-primary font-bold" : "hover:text-primary"}`}
            >
              {t("home")}
            </Link>
             {/* Categories dropdown */}
            <div className="group relative flex h-12 cursor-pointer items-center gap-1 hover:text-primary">
              <span>{t("categories")}</span>
              <ChevronDown className="size-4" />
              {/* Dropdown panel */}
              <div className="absolute top-12 right-6 z-50 hidden w-60 rounded-xl border border-border bg-background p-4 shadow-xl group-hover:block left-0">
                <div className="flex flex-col gap-2">
                  {categories.map((cat) => (
                    <span 
                      key={cat.key} 
                      onClick={() => {
                        setSearchQuery(cat.filter);
                      }}
                      className="rounded-md p-2 hover:bg-muted/80 hover:text-primary transition-all text-xs font-medium"
                    >
                      {t(cat.key)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <Link 
              href="/"
              onClick={() => { setSearchQuery("special"); }}
              className="cursor-pointer transition-colors py-2 hover:text-primary"
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
            <Link href="/about-us" className={`cursor-pointer transition-colors ${pathname === "/about-us" ? "text-primary font-bold" : "hover:text-primary"}`}>
              {t("aboutUs")}
            </Link>
            <Link href="/contact-us" className={`cursor-pointer transition-colors ${pathname === "/contact-us" ? "text-primary font-bold" : "hover:text-primary"}`}>
              {t("contactUs")}
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Slide-out menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-16 z-40 flex flex-col bg-background/95 backdrop-blur-md px-6 py-6 md:hidden">
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
          <div className="flex flex-col gap-4 text-base font-bold">
            <Link
              href="/"
              onClick={() => { setMobileMenuOpen(false); setSearchQuery(""); }}
              className="flex items-center text-start py-2 border-b border-border/40 hover:text-primary"
            >
              {t("home")}
            </Link>
            <Link
              href="/"
              onClick={() => { setSearchQuery("special"); setMobileMenuOpen(false); }}
              className="flex items-center text-start py-2 border-b border-border/40 text-primary"
            >
              {t("amazingOffers")}
            </Link>
            <Link
              href="/blog"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center text-start py-2 border-b border-border/40 hover:text-primary"
            >
              {t("blog")}
            </Link>
            <Link
              href="/faq"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center text-start py-2 border-b border-border/40 hover:text-primary"
            >
              {t("faqTitle")}
            </Link>
            <Link
              href="/track-order"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center text-start py-2 border-b border-border/40 hover:text-primary"
            >
              {t("trackOrder")}
            </Link>
          </div>

          {/* Utility links at the bottom of drawer */}
          <div className="mt-auto flex flex-col gap-4 border-t border-border pt-6">
            <div className="flex justify-around text-xs text-muted-foreground">
              <Link href="/about-us" onClick={() => setMobileMenuOpen(false)} className="cursor-pointer hover:text-primary">{t("aboutUs")}</Link>
              <span>•</span>
              <Link href="/contact-us" onClick={() => setMobileMenuOpen(false)} className="cursor-pointer hover:text-primary">{t("contactUs")}</Link>
              <span>•</span>
              <span>021-88888888</span>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
