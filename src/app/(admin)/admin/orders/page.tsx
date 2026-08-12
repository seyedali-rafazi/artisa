'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAdminOrders, useUpdateOrderStatus } from '@/hooks/useAdmin';
import { Input } from '@/components/ui/input';
import {
  Search,
  Eye,
  ShoppingBag,
  Loader2,
  FileCheck,
  Clock,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export default function AdminOrdersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useAdminOrders({ page, limit: 10, search, status: statusFilter });
  const updateStatusMutation = useUpdateOrderStatus();

  const handleStatusChange = (orderId: string, newStatus: string) => {
    updateStatusMutation.mutate({ orderId, status: newStatus });
  };

  const getStatusBadge = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'delivered' || s === 'completed') {
      return <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 font-bold text-[10px]">تحویل شده</span>;
    }
    if (s === 'shipped') {
      return <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-500 font-bold text-[10px]">ارسال شده</span>;
    }
    if (s === 'processing' || s === 'paid') {
      return <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-500 font-bold text-[10px]">در حال پردازش</span>;
    }
    if (s === 'cancelled' || s === 'refunded') {
      return <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-500 font-bold text-[10px]">لغو شده</span>;
    }
    return <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 font-bold text-[10px]">در انتظار</span>;
  };

  const getPaymentStatusBadge = (paymentStatus: string, hasReceipt: boolean) => {
    const p = (paymentStatus || '').toLowerCase();
    if (p === 'payment_approved' || p === 'paid') {
      return (
        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold text-[10px] flex items-center gap-1 w-fit">
          <CheckCircle2 className="size-3" />
          پرداخت تایید شد
        </span>
      );
    }
    if (p === 'payment_rejected') {
      return (
        <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-extrabold text-[10px] flex items-center gap-1 w-fit">
          <AlertCircle className="size-3" />
          پرداخت رد شد
        </span>
      );
    }
    if (p === 'payment_pending_review' || hasReceipt) {
      return (
        <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-extrabold text-[10px] flex items-center gap-1 w-fit animate-pulse">
          <FileCheck className="size-3" />
          نیازمند بررسی فیش
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-extrabold text-[10px] flex items-center gap-1 w-fit">
        <Clock className="size-3" />
        در انتظار پرداخت
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-6 min-w-0 w-full" dir="rtl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-foreground">مدیریت و بررسی پرداخت سفارشات</h1>
        <p className="text-xs text-muted-foreground font-semibold mt-1">
          بررسی فیش‌های کارت به کارت، تایید یا رد پرداخت‌ها و مدیریت ارسال سفارشات
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-background/95 border border-border/60 p-4 rounded-3xl backdrop-blur-xl">
        <div className="relative flex-1 w-full">
          <Input
            type="text"
            placeholder="جستجوی کد سفارش یا نام مشتری..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="rounded-xl pr-9 text-xs"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-xl border border-border bg-background px-3 py-2 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-48 cursor-pointer"
        >
          <option value="">همه وضعیت‌ها</option>
          <option value="pending">در انتظار</option>
          <option value="processing">در حال پردازش</option>
          <option value="shipped">ارسال شده</option>
          <option value="delivered">تحویل شده</option>
          <option value="cancelled">لغو شده</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl sm:rounded-3xl border border-border/60 bg-background/95 backdrop-blur-xl shadow-sm min-w-0 overflow-hidden">
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="size-6 text-primary animate-spin" />
          </div>
        ) : !data || data.items.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center gap-2">
            <ShoppingBag className="size-10 text-muted-foreground/40" />
            <span className="text-xs font-bold text-muted-foreground">هیچ سفارشی یافت نشد.</span>
          </div>
        ) : (
          <div className="overflow-x-auto overscroll-x-contain">
            <table className="w-full min-w-[850px] text-right text-xs">
              <thead className="bg-muted/40 border-b border-border/40 font-extrabold text-muted-foreground">
                <tr>
                  <th className="p-3 sm:p-4 whitespace-nowrap">کد سفارش</th>
                  <th className="p-3 sm:p-4 whitespace-nowrap">مشتری</th>
                  <th className="p-3 sm:p-4 whitespace-nowrap">تاریخ ثبت</th>
                  <th className="p-3 sm:p-4 whitespace-nowrap">مبلغ کل</th>
                  <th className="p-3 sm:p-4 whitespace-nowrap">وضعیت پرداخت</th>
                  <th className="p-3 sm:p-4 whitespace-nowrap">وضعیت سفارش</th>
                  <th className="p-3 sm:p-4 whitespace-nowrap">تغییر وضعیت</th>
                  <th className="p-3 sm:p-4 text-left whitespace-nowrap">بررسی</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-semibold">
                {data.items.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-3 font-extrabold text-primary dir-ltr text-right whitespace-nowrap">{order.orderId}</td>
                    <td className="p-3">
                      <div className="flex flex-col min-w-[120px]">
                        <span className="font-bold text-foreground truncate">
                          {order.shippingAddress?.fullName || 'کاربر مهمان'}
                        </span>
                        <span className="text-[10px] text-muted-foreground dir-ltr text-right whitespace-nowrap">
                          {order.shippingAddress?.phone}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-muted-foreground dir-ltr text-right whitespace-nowrap">{order.date}</td>
                    <td className="p-3 font-extrabold text-foreground whitespace-nowrap">
                      {order.totalPrice.toLocaleString('fa-IR')} تومان
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {getPaymentStatusBadge(order.paymentStatus, Boolean(order.receiptUrl))}
                    </td>
                    <td className="p-3 whitespace-nowrap">{getStatusBadge(order.status)}</td>
                    <td className="p-3 whitespace-nowrap">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
                        className="rounded-xl border border-border bg-background px-2.5 py-1 text-[11px] font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer max-w-[140px]"
                      >
                        <option value="pending">در انتظار</option>
                        <option value="processing">در حال پردازش</option>
                        <option value="shipped">ارسال شده</option>
                        <option value="delivered">تحویل شده</option>
                        <option value="cancelled">لغو شده</option>
                      </select>
                    </td>
                    <td className="p-3 text-left whitespace-nowrap">
                      <Link href={`/admin/orders/${order.orderId}`}>
                        <button
                          title="مشاهده و بررسی فیش پرداخت"
                          className="px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-white font-extrabold transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
                        >
                          <Eye className="size-3.5" />
                          <span>بررسی</span>
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

