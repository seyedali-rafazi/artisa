'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductImage from '@/components/ui/ProductImage';
import { useAdminDashboard } from '@/hooks/useAdmin';
import {
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  Users,
  Package,
  AlertTriangle,
  ArrowUpRight,
  Loader2,
  Sparkles,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [mounted, setMounted] = useState(false);
  const { data: stats, isLoading, isError } = useAdminDashboard();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isLoading) {
    return (
      <div className="h-96 flex items-center justify-center" dir="rtl">
        <div className="flex flex-col items-center gap-2 text-primary font-bold text-xs">
          <Loader2 className="size-8 animate-spin" />
          <span>در حال دریافت اطلاعات آمار و تحلیل...</span>
        </div>
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="p-8 text-center text-xs font-bold text-destructive" dir="rtl">
        خطا در دریافت آمار داشبورد مدیریت.
      </div>
    );
  }

  const kpiCards = [
    {
      title: 'کل درآمد فروش',
      value: `${(stats.total_revenue || 0).toLocaleString('fa-IR')} تومان`,
      icon: DollarSign,
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    },
    {
      title: 'درآمد امروز',
      value: `${(stats.today_revenue || 0).toLocaleString('fa-IR')} تومان`,
      icon: TrendingUp,
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    },
    {
      title: 'درآمد ماه جاری',
      value: `${(stats.monthly_revenue || 0).toLocaleString('fa-IR')} تومان`,
      icon: Sparkles,
      color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    },
    {
      title: 'کل سفارشات',
      value: (stats.total_orders || 0).toLocaleString('fa-IR'),
      icon: ShoppingBag,
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    },
    {
      title: 'سفارشات در انتظار',
      value: (stats.pending_orders || 0).toLocaleString('fa-IR'),
      icon: Clock,
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    },
    {
      title: 'سفارشات تکمیل شده',
      value: (stats.completed_orders || 0).toLocaleString('fa-IR'),
      icon: CheckCircle2,
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    },
    {
      title: 'سفارشات لغو شده',
      value: (stats.cancelled_orders || 0).toLocaleString('fa-IR'),
      icon: XCircle,
      color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    },
    {
      title: 'مشتریان فعال',
      value: (stats.total_customers || 0).toLocaleString('fa-IR'),
      icon: Users,
      color: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
    },
    {
      title: 'تنوع محصولات',
      value: (stats.total_products || 0).toLocaleString('fa-IR'),
      icon: Package,
      color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
    },
    {
      title: 'محصولات کم‌موجودی',
      value: (stats.low_stock_products || 0).toLocaleString('fa-IR'),
      icon: AlertTriangle,
      color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    },
  ];

  return (
    <div className="flex flex-col gap-4 sm:gap-6 min-w-0 w-full" dir="rtl">
      {/* KPI Cards Grid - Responsive from 2 cols on mobile to 5 cols on desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {kpiCards.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="rounded-2xl sm:rounded-3xl border border-border/60 bg-background/95 backdrop-blur-xl p-3 sm:p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2 gap-1">
                <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground truncate">{kpi.title}</span>
                <div className={`p-1.5 sm:p-2 rounded-xl sm:rounded-2xl shrink-0 ${kpi.color}`}>
                  <Icon className="size-3.5 sm:size-4" />
                </div>
              </div>
              <span className="text-xs sm:text-base font-black text-foreground tracking-tight">{kpi.value}</span>
            </div>
          );
        })}
      </div>

      {/* Analytics & Best Sellers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Best Selling Products */}
        <div className="lg:col-span-2 rounded-2xl sm:rounded-3xl border border-border/60 bg-background/95 backdrop-blur-xl p-4 sm:p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <h2 className="text-xs sm:text-sm font-black text-foreground flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              <span>پرفروش‌ترین محصولات</span>
            </h2>
            <Link
              href="/admin/products"
              className="text-[11px] sm:text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              <span>مشاهده همه</span>
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>

          <div className="flex flex-col gap-2.5">
            {stats.best_selling_products?.length === 0 ? (
              <span className="text-xs font-semibold text-muted-foreground text-center py-6">
                هنوز سفارشی ثبت نشده است.
              </span>
            ) : (
              stats.best_selling_products?.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 sm:p-3 rounded-2xl bg-muted/20 border border-border/40 hover:bg-muted/40 transition-colors gap-2"
                >
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <div className="relative size-10 sm:size-12 rounded-xl overflow-hidden shrink-0 border border-border">
                      <ProductImage src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-foreground truncate">{item.name}</span>
                      <span className="text-[10px] text-muted-foreground font-semibold">
                        {item.sales} عدد فروخته شده
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-primary shrink-0">
                    {item.revenue.toLocaleString('fa-IR')} تومان
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Categories Distribution */}
        <div className="rounded-2xl sm:rounded-3xl border border-border/60 bg-background/95 backdrop-blur-xl p-4 sm:p-6 shadow-sm flex flex-col gap-4">
          <div className="border-b border-border/40 pb-3">
            <h2 className="text-xs sm:text-sm font-black text-foreground">توزیع دسته‌بندی محصولات</h2>
          </div>
          <div className="flex flex-col gap-3">
            {stats.categories_distribution?.map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <span className="font-bold text-foreground/80">{cat.category}</span>
                <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary font-extrabold text-[11px]">
                  {cat.count} محصول
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
