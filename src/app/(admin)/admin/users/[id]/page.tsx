'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAdminUsers, useAdminOrders } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import { ArrowRight, User, Mail, Phone, ShoppingBag, ShieldCheck, Calendar, DollarSign, Loader2 } from 'lucide-react';

export default function UserDetailPage() {
  const params = useParams();
  const userId = params.id as string;

  const { data: usersData, isLoading: isUsersLoading } = useAdminUsers({ limit: 100 });
  const { data: ordersData, isLoading: isOrdersLoading } = useAdminOrders({ limit: 100 });

  const user = usersData?.items?.find((u) => u.id === userId);
  const userOrders = ordersData?.items?.filter((o) => o.userId === userId || o.shippingAddress?.fullName === user?.name) || [];

  if (isUsersLoading || isOrdersLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="size-6 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8 text-center text-xs font-bold text-destructive" dir="rtl">
        کاربر مورد نظر پیدا نشد.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto" dir="rtl">
      {/* Back Link */}
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary transition-colors cursor-pointer"
      >
        <ArrowRight className="size-4" />
        <span>بازگشت به لیست کاربران</span>
      </Link>

      {/* User Info Header */}
      <div className="rounded-3xl border border-border/60 bg-background/95 backdrop-blur-xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary font-bold">
            <User className="size-8" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-black text-foreground">{user.name}</h1>
            <span className="text-xs text-muted-foreground font-mono dir-ltr text-right">{user.email}</span>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold text-[10px]">
                {user.role}
              </span>
              {user.is_active ? (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-bold text-[10px]">
                  فعال
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-500 font-bold text-[10px]">
                  غیرفعال
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 border-t sm:border-t-0 sm:border-r border-border/40 pt-4 sm:pt-0 sm:pr-6">
          <div className="flex flex-col text-center">
            <span className="text-xs font-bold text-muted-foreground">تعداد سفارشات</span>
            <span className="text-base font-black text-foreground">{user.total_orders}</span>
          </div>
          <div className="flex flex-col text-center">
            <span className="text-xs font-bold text-muted-foreground">مجموع خرید</span>
            <span className="text-base font-black text-primary">{user.total_spent.toLocaleString('fa-IR')} تومان</span>
          </div>
        </div>
      </div>

      {/* User Order History */}
      <div className="rounded-3xl border border-border/60 bg-background/95 backdrop-blur-xl p-6 shadow-sm flex flex-col gap-4">
        <h2 className="text-sm font-black text-foreground border-b border-border/40 pb-3 flex items-center gap-2">
          <ShoppingBag className="size-4 text-primary" />
          <span>تاریخچه سفارشات کاربر ({userOrders.length})</span>
        </h2>

        {userOrders.length === 0 ? (
          <div className="p-8 text-center text-xs font-bold text-muted-foreground">
            هیچ سفارشی برای این کاربر ثبت نشده است.
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {userOrders.map((order) => (
              <div key={order.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex flex-col">
                  <span className="text-xs font-extrabold text-primary dir-ltr text-right">{order.orderId}</span>
                  <span className="text-[10px] text-muted-foreground font-semibold">تاریخ: {order.date}</span>
                </div>
                <span className="text-xs font-black text-foreground">
                  {order.totalPrice.toLocaleString('fa-IR')} تومان
                </span>
                <Link href={`/admin/orders/${order.orderId}`}>
                  <Button variant="outline" size="sm" className="rounded-xl text-[11px] font-bold">
                    مشاهده فاکتور
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
