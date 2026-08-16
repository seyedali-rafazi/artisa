"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { useLanguage } from "../LanguageContext"
import { useApp } from "../AppContext"
import { Button } from "../ui/button"
import {
  User,
  MapPin,
  ShoppingBag,
  Heart,
  Package,
  Settings,
  Lock,
  X,
  Check,
  ChevronLeft,
  Menu,
} from "lucide-react"

import ProfileInfo from "../profile/ProfileInfo"
import ChangePasswordForm from "../profile/ChangePasswordForm"
import SavedAddresses from "../profile/SavedAddresses"
import OrderHistory from "../profile/OrderHistory"
import ProfileCart from "../profile/ProfileCart"
import WishlistSection from "../profile/WishlistSection"
import AccountSettings from "../profile/AccountSettings"
import { toast as sonnerToast } from "sonner"

// ─── Types ──────────────────────────────────────────────────────────────────

type Tab =
  | "profile"
  | "password"
  | "addresses"
  | "orders"
  | "cart"
  | "wishlist"
  | "settings"

interface Toast {
  message: string
  type: "success" | "error"
}

// ─── Sidebar config ──────────────────────────────────────────────────────────

interface NavItem {
  id: Tab
  labelKey: string
  icon: React.ReactNode
}

const NAV_ITEMS: NavItem[] = [
  { id: "profile", labelKey: "profileInfo", icon: <User className="size-4 shrink-0" /> },
  { id: "password", labelKey: "changePassword", icon: <Lock className="size-4 shrink-0" /> },
  { id: "addresses", labelKey: "savedAddresses", icon: <MapPin className="size-4 shrink-0" /> },
  { id: "orders", labelKey: "orderHistory", icon: <Package className="size-4 shrink-0" /> },
  { id: "cart", labelKey: "profileCart", icon: <ShoppingBag className="size-4 shrink-0" /> },
  { id: "wishlist", labelKey: "wishlist", icon: <Heart className="size-4 shrink-0" /> },
  { id: "settings", labelKey: "accountSettings", icon: <Settings className="size-4 shrink-0" /> },
]

// ─── Loading skeleton ────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="animate-pulse flex flex-col gap-4">
      <div className="h-5 w-40 rounded-lg bg-muted/60" />
      <div className="h-24 rounded-2xl bg-muted/40" />
      <div className="h-12 rounded-2xl bg-muted/30" />
      <div className="h-12 rounded-2xl bg-muted/30" />
    </div>
  )
}

// ─── Main ProfileView ────────────────────────────────────────────────────────

export default function ProfileView() {
  const { t } = useLanguage()
  const { user, isAuthLoading } = useApp()
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab") as Tab | null

  const [activeTab, setActiveTab] = useState<Tab>("profile")
  const [loading] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    if (tabParam && ["profile", "password", "addresses", "orders", "cart", "wishlist", "settings"].includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  const showToast = (t: Toast) => {
    if (t.type === "error") {
      sonnerToast.error(t.message)
    } else {
      sonnerToast.success(t.message)
    }
  }

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab)
    setDrawerOpen(false)
    router.push(`/profile?tab=${tab}`)
  }

  // ── Initial Auth Bootstrap Loading State (Prevents Flickering) ───────────
  if (isAuthLoading) {
    return (
      <div className="w-full py-12" dir="rtl">
        <Skeleton />
      </div>
    )
  }

  // ── Unauthenticated state ────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <User className="size-8" />
        </div>
        <h1 className="text-base font-extrabold text-foreground">{t("profileTitle")}</h1>
        <p className="text-xs text-muted-foreground max-w-xs">{t("loginToViewProfile")}</p>
        <Link href="/login">
          <Button
            className="gap-2 rounded-xl cursor-pointer font-bold"
          >
            <User className="size-4" />
            {t("goToLogin")}
          </Button>
        </Link>
      </div>
    )
  }

  // ── Render active section ────────────────────────────────────────────────
  const renderSection = () => {
    if (loading) return <Skeleton />
    switch (activeTab) {
      case "profile":
        return (
          <div className="flex flex-col gap-6">
            <ProfileInfo onToast={showToast} />
            <ChangePasswordForm onToast={showToast} />
          </div>
        )
      case "password":
        return <ChangePasswordForm onToast={showToast} />
      case "addresses":
        return <SavedAddresses onToast={showToast} />
      case "orders":
        return <OrderHistory />
      case "cart":
        return <ProfileCart />
      case "wishlist":
        return <WishlistSection onToast={showToast} />
      case "settings":
        return <AccountSettings />
      default:
        return null
    }
  }

  const activeItem = NAV_ITEMS.find((n) => n.id === activeTab)
  const avatar = user.name.charAt(0).toUpperCase()

  return (
    <div dir="rtl" className="w-full">
      {/* Page Title */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-extrabold text-foreground">{t("profileTitle")}</h1>
        {/* Mobile sidebar toggle */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground border border-border/50 rounded-xl px-3 py-1.5 hover:border-primary hover:text-primary transition-colors md:hidden cursor-pointer"
          aria-label={t("profileSidebar")}
        >
          <Menu className="size-4" />
          {activeItem ? t(activeItem.labelKey) : ""}
        </button>
      </div>

      <div className="flex gap-6 items-start">
        {/* ── Sidebar (Desktop) ────────────────────────────── */}
        <aside className="hidden md:flex flex-col w-56 shrink-0 gap-2 sticky top-24">
          {/* User card */}
          <div className="flex items-center gap-3 rounded-2xl border border-border/40 bg-muted/10 p-4 mb-2">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-extrabold text-base select-none">
              {avatar}
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-xs font-extrabold text-foreground truncate">{user.name}</span>
              <span className="text-[10px] text-muted-foreground truncate">{user.email}</span>
            </div>
          </div>

          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold transition-all cursor-pointer text-start ${
                activeTab === item.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-foreground hover:bg-muted/60"
              }`}
              aria-current={activeTab === item.id ? "page" : undefined}
            >
              {item.icon}
              <span>{t(item.labelKey)}</span>
              {activeTab !== item.id && <ChevronLeft className="size-3.5 mr-auto opacity-40" />}
            </button>
          ))}
        </aside>

        {/* ── Mobile Drawer ─────────────────────────────────── */}
        {drawerOpen && (
          <div className="fixed inset-0 z-[80] md:hidden">
            <button
              className="fixed inset-0 bg-black/40"
              onClick={() => setDrawerOpen(false)}
              aria-hidden="true"
              tabIndex={-1}
            />
            <div className="fixed inset-y-0 right-0 z-[90] w-72 flex flex-col bg-background border-l border-border shadow-2xl p-5 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-extrabold text-foreground">{t("profileSidebar")}</span>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="text-muted-foreground hover:text-foreground cursor-pointer"
                  aria-label="بستن"
                >
                  <X className="size-5" />
                </button>
              </div>
              {/* User card */}
              <div className="flex items-center gap-3 rounded-2xl border border-border/40 bg-muted/10 p-3 mb-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-extrabold text-sm select-none">
                  {avatar}
                </div>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-xs font-extrabold text-foreground truncate">{user.name}</span>
                  <span className="text-[10px] text-muted-foreground truncate">{user.email}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                {NAV_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold transition-all cursor-pointer text-start ${
                      activeTab === item.id
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-muted/60"
                    }`}
                  >
                    {item.icon}
                    <span>{t(item.labelKey)}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Main Content ──────────────────────────────────── */}
        <main className="flex-1 min-w-0">
          {/* Section Header */}
          <div className="mb-5 flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
              {activeItem?.icon}
            </div>
            <h2 className="text-sm font-extrabold text-foreground">
              {activeItem ? t(activeItem.labelKey) : ""}
            </h2>
          </div>

          {/* Section Body */}
          <div className="rounded-2xl border border-border/40 bg-background p-4 sm:p-6 min-h-[300px]">
            {renderSection()}
          </div>
        </main>
      </div>
    </div>
  )
}
