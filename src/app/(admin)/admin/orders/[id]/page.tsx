'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useAdminOrders, useUpdateOrderStatus } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  User,
  MapPin,
  CreditCard,
  Package,
  Clock,
  CheckCircle2,
  Truck,
  Loader2,
} from 'lucide-react';

export default function OrderDetailPage() {
  const params = useParams();
  const orderIdParam = params.id as string;

  const { data, isLoading } = useAdminOrders({ limit: 100 });
  const updateStatusMutation = useUpdateOrderStatus();

  const order = data?.items?.find((o) => o.orderId === orderIdParam || o.id === orderIdParam);

  const handleStatusChange = (newStatus: string) => {
    if (!order) return;
    updateStatusMutation.mutate({ orderId: order.orderId, status: newStatus });
  };

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="size-6 text-primary animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-8 text-center text-xs font-bold text-destructive" dir="rtl">
        سفارش مورد نظر پیدا نشد.
      </div>
    );
  }

  const timelineSteps = [
    { title: 'ثبت سفارش', date: order.date, completed: true, icon: Clock },
    { title: 'پرداخت', date: order.paymentStatus === 'paid' ? 'تایید شده' : 'در انتظار', completed: order.paymentStatus === 'paid', icon: CreditCard },
    { title: 'پردازش مرسوله', date: order.status !== 'pending' ? 'در حال آماده‌سازی' : '-', completed: ['processing', 'shipped', 'delivered'].includes(order.status), icon: Package },
    { title: 'تحویل به پست/پیک', date: ['shipped', 'delivered'].includes(order.status) ? 'ارسال شده' : '-', completed: ['shipped', 'delivered'].includes(order.status), icon: Truck },
    { title: 'تحویل به مشتری', date: order.status === 'delivered' ? 'تکمیل شده' : '-', completed: order.status === 'delivered', icon: CheckCircle2 },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto" dir="rtl">
      {/* Back Link */}
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary transition-colors cursor-pointer"
      >
        <ArrowRight className="size-4" />
        <span>بازگشت به لیست سفارشات</span>
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-foreground">سفارش شماره</h1>
            <span className="text-xl font-black text-primary dir-ltr">{order.orderId}</span>
          </div>
          <span className="text-xs text-muted-foreground font-semibold mt-1">
            تاریخ ثبت: {order.date}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-muted-foreground">تغییر وضعیت:</label>
          <select
            value={order.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={updateStatusMutation.isPending}
            className="rounded-xl border border-border bg-background px-3 py-2 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
          >
            <option value="pending">در انتظار</option>
            <option value="processing">در حال پردازش</option>
            <option value="shipped">ارسال شده</option>
            <option value="delivered">تحویل شده</option>
            <option value="cancelled">لغو شده</option>
            <option value="refunded">مرجوع شده</option>
          </select>
        </div>
      </div>

      {/* Timeline Steps */}
      <div className="rounded-3xl border border-border/60 bg-background/95 backdrop-blur-xl p-6 shadow-sm">
        <h2 className="text-xs font-black text-muted-foreground mb-4">تایم‌لاین وضعیت سفارش</h2>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          {timelineSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className={`flex flex-col items-center text-center p-3 rounded-2xl border transition-all ${
                  step.completed
                    ? 'bg-primary/10 border-primary/40 text-primary'
                    : 'bg-muted/20 border-border/40 text-muted-foreground'
                }`}
              >
                <Icon className="size-5 mb-1.5" />
                <span className="text-xs font-extrabold">{step.title}</span>
                <span className="text-[10px] font-semibold mt-0.5">{step.date}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Customer & Shipping Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Customer Card */}
        <div className="rounded-3xl border border-border/60 bg-background/95 backdrop-blur-xl p-6 shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-2 text-primary border-b border-border/40 pb-3">
            <User className="size-5" />
            <h2 className="text-sm font-black text-foreground">اطلاعات خریدار</h2>
          </div>
          <div className="flex flex-col gap-1.5 text-xs font-bold">
            <span className="text-foreground">نام خریدار: {order.shippingAddress?.fullName || 'نامشخص'}</span>
            <span className="text-muted-foreground dir-ltr text-right">شماره تماس: {order.shippingAddress?.phone || 'نامشخص'}</span>
          </div>
        </div>

        {/* Shipping Address Card */}
        <div className="rounded-3xl border border-border/60 bg-background/95 backdrop-blur-xl p-6 shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-2 text-primary border-b border-border/40 pb-3">
            <MapPin className="size-5" />
            <h2 className="text-sm font-black text-foreground">آدرس تحویل گیرنده</h2>
          </div>
          <div className="flex flex-col gap-1.5 text-xs font-bold">
            <span className="text-foreground">{order.shippingAddress?.address || 'آدرس ثبت نشده'}</span>
            {order.shippingAddress?.postalCode && (
              <span className="text-muted-foreground dir-ltr text-right">کد پستی: {order.shippingAddress.postalCode}</span>
            )}
          </div>
        </div>
      </div>

      {/* Order Items Table */}
      <div className="rounded-3xl border border-border/60 bg-background/95 backdrop-blur-xl p-6 shadow-sm flex flex-col gap-4">
        <h2 className="text-sm font-black text-foreground border-b border-border/40 pb-3">اقلام فاکتور ({order.items.length})</h2>
        <div className="divide-y divide-border/40">
          {order.items.map((item, idx) => (
            <div key={idx} className="py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="relative size-14 rounded-2xl overflow-hidden border border-border shrink-0">
                  <Image src={item.image || '/placeholder.png'} alt={item.name} fill className="object-cover" unoptimized />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-extrabold text-foreground">{item.name}</span>
                  <span className="text-[11px] font-bold text-muted-foreground">
                    تعداد: {item.quantity} عدد
                  </span>
                </div>
              </div>
              <span className="text-xs font-black text-primary">
                {(item.price * item.quantity).toLocaleString('fa-IR')} تومان
              </span>
            </div>
          ))}
        </div>

        {/* Total Price */}
        <div className="border-t border-border/60 pt-4 flex items-center justify-between">
          <span className="text-xs font-black text-foreground">مبلغ کل فاکتور:</span>
          <span className="text-base font-black text-primary">
            {order.totalPrice.toLocaleString('fa-IR')} تومان
          </span>
        </div>
      </div>
    </div>
  );
}
