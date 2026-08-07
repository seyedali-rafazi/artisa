'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useUserProfile } from '@/hooks/useAuth';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  ShieldCheck,
  FileText,
  Settings,
  ArrowRight,
  Sparkles,
  ChevronLeft,
} from 'lucide-react';

interface AdminSidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function AdminSidebar({ collapsed = false, onToggleCollapse }: AdminSidebarProps) {
  const pathname = usePathname();
  const { data: user } = useUserProfile();

  const isSuperAdmin = user?.role === 'superadmin' || user?.role === 'super_admin' || user?.role === 'مدیر ارشد' || (user as any)?.is_superuser;

  const navItems = [
    {
      title: 'داشبورد مدیریت',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
      superAdminOnly: false,
    },
    {
      title: 'مدیریت محصولات',
      href: '/admin/products',
      icon: Package,
      superAdminOnly: false,
    },
    {
      title: 'سفارشات مشتریان',
      href: '/admin/orders',
      icon: ShoppingBag,
      superAdminOnly: false,
    },
    {
      title: 'مدیریت کاربران',
      href: '/admin/users',
      icon: Users,
      superAdminOnly: false,
    },
    {
      title: 'مدیریت مدیران',
      href: '/admin/admins',
      icon: ShieldCheck,
      superAdminOnly: true,
    },
    {
      title: 'لاگ‌های امنیتی',
      href: '/admin/audit-logs',
      icon: FileText,
      superAdminOnly: true,
    },
  ];

  return (
    <aside
      className={`fixed top-0 right-0 z-50 h-screen bg-background/95 backdrop-blur-xl border-l border-border/60 transition-all duration-300 flex flex-col justify-between ${
        collapsed ? 'w-20' : 'w-64'
      }`}
      dir="rtl"
    >
      <div>
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border/40">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <Image src="/logo.png" alt="آرتیسا" width={40} height={40} className="h-9 w-auto object-contain shrink-0" />
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-black text-sm text-foreground tracking-tight flex items-center gap-1">
                  پنل مدیریت <Sparkles className="size-3 text-primary inline" />
                </span>
                <span className="text-[10px] text-muted-foreground font-semibold">Artisa Admin Portal</span>
              </div>
            )}
          </Link>
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <ChevronLeft className={`size-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            if (item.superAdminOnly && !isSuperAdmin) return null;
            const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname?.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                }`}
                title={collapsed ? item.title : undefined}
              >
                <Icon className="size-4 shrink-0" />
                {!collapsed && <span>{item.title}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Link to Main Site */}
      <div className="p-3 border-t border-border/40">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2.5 rounded-2xl text-xs font-bold text-muted-foreground hover:bg-muted/60 hover:text-primary transition-colors cursor-pointer"
        >
          <ArrowRight className="size-4 shrink-0" />
          {!collapsed && <span>بازگشت به فروشگاه</span>}
        </Link>
      </div>
    </aside>
  );
}
