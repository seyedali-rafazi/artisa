'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { 
  useAdminOrders, 
  useUpdateOrderStatus, 
  useApproveOrderPayment, 
  useRejectOrderPayment 
} from '@/hooks/useAdmin';
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
  XCircle,
  Eye,
  X,
  FileCheck,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { formatShamsiDate } from '@/lib/utils';

export default function OrderDetailPage() {
  const params = useParams();
  const orderIdParam = params.id as string;

  const { data, isLoading } = useAdminOrders({ limit: 100 });
  const updateStatusMutation = useUpdateOrderStatus();
  const approvePaymentMutation = useApproveOrderPayment();
  const rejectPaymentMutation = useRejectOrderPayment();

  // Modal & Preview state
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const order = data?.items?.find((o) => o.orderId === orderIdParam || o.id === orderIdParam);

  const handleStatusChange = (newStatus: string) => {
    if (!order) return;
    updateStatusMutation.mutate(
      { orderId: order.orderId, status: newStatus },
      {
        onSuccess: () => toast.success('وضعیت سفارش بروزرسانی شد'),
        onError: (err: any) => toast.error(err?.message || 'خطا در بروزرسانی وضعیت'),
      }
    );
  };

  const handleApprovePayment = () => {
    if (!order) return;
    approvePaymentMutation.mutate(order.orderId, {
      onSuccess: () => {
        toast.success('پرداخت تایید شد و وضعیت سفارش به در حال پردازش تغییر یافت');
      },
      onError: (err: any) => {
        toast.error(err?.data?.detail || err?.message || 'خطا در تایید پرداخت');
      },
    });
  };

  const handleRejectPayment = () => {
    if (!order) return;
    rejectPaymentMutation.mutate(
      { orderId: order.orderId, rejectionReason: rejectionReason.trim() || undefined },
      {
        onSuccess: () => {
          toast.success('پرداخت رد شد و به کاربر اطلاع‌رسانی می‌شود');
          setShowRejectModal(false);
          setRejectionReason('');
        },
        onError: (err: any) => {
          toast.error(err?.data?.detail || err?.message || 'خطا در رد پرداخت');
        },
      }
    );
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

  const isApproved = order.paymentStatus === 'payment_approved' || order.paymentStatus === 'paid';
  const isRejected = order.paymentStatus === 'payment_rejected';
  const isPendingReview = order.paymentStatus === 'payment_pending_review';

  const timelineSteps = [
    { title: 'ثبت سفارش', date: formatShamsiDate(order.date || order.created_at), completed: true, icon: Clock },
    { 
      title: 'بررسی فیش واریز', 
      date: isApproved ? 'تایید شد' : isRejected ? 'رد شد' : 'در انتظار بررسی', 
      completed: isApproved, 
      icon: CreditCard 
    },
    { 
      title: 'پردازش مرسوله', 
      date: order.status !== 'pending' ? 'در حال آماده‌سازی' : '-', 
      completed: ['processing', 'shipped', 'delivered'].includes(order.status), 
      icon: Package 
    },
    { 
      title: 'تحویل به پست/پیک', 
      date: ['shipped', 'delivered'].includes(order.status) ? 'ارسال شده' : '-', 
      completed: ['shipped', 'delivered'].includes(order.status), 
      icon: Truck 
    },
    { 
      title: 'تحویل به مشتری', 
      date: order.status === 'delivered' ? 'تکمیل شده' : '-', 
      completed: order.status === 'delivered', 
      icon: CheckCircle2 
    },
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
            تاریخ ثبت: {formatShamsiDate(order.date || order.created_at)}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-muted-foreground">تغییر وضعیت سفارش:</label>
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
          </select>
        </div>
      </div>

      {/* ─── PAYMENT REVIEW SECTION (CARD-TO-CARD) ─── */}
      <div className="rounded-3xl border border-primary/40 bg-background p-6 shadow-sm flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-4">
          <div className="flex items-center gap-2">
            <FileCheck className="size-5 text-primary" />
            <h2 className="text-sm font-black text-foreground">بررسی پرداخت کارت به کارت</h2>
          </div>

          <div className="flex items-center gap-2">
            {isApproved && (
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs flex items-center gap-1">
                <CheckCircle2 className="size-4" />
                پرداخت تایید شده است
              </span>
            )}
            {isRejected && (
              <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-extrabold text-xs flex items-center gap-1">
                <XCircle className="size-4" />
                پرداخت رد شده است
              </span>
            )}
            {isPendingReview && (
              <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-extrabold text-xs flex items-center gap-1 animate-pulse">
                <Clock className="size-4" />
                در انتظار تایید مدیریت
              </span>
            )}
          </div>
        </div>

        {/* Receipt Image Preview and Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {order.receiptUrl ? (
              <div
                onClick={() => setShowReceiptModal(true)}
                className="relative size-24 rounded-2xl overflow-hidden border-2 border-primary/40 cursor-pointer group shrink-0 bg-muted"
              >
                <img src={order.receiptUrl} alt="فیش واریزی" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                  <Eye className="size-6" />
                </div>
              </div>
            ) : (
              <div className="size-24 rounded-2xl border-2 border-dashed border-border/60 flex flex-col items-center justify-center text-muted-foreground text-center p-2 shrink-0">
                <AlertTriangle className="size-6 text-amber-500 mb-1" />
                <span className="text-[10px] font-bold">فیش بارگذاری نشده</span>
              </div>
            )}

            <div className="flex flex-col gap-1 text-xs">
              <span className="font-extrabold text-foreground">مبلغ کل فاکتور: {order.totalPrice.toLocaleString('fa-IR')} تومان</span>
              <span className="text-muted-foreground">روش پرداخت: کارت به کارت</span>
              {order.receiptUrl && (
                <button
                  onClick={() => setShowReceiptModal(true)}
                  className="text-primary font-bold hover:underline text-right mt-1 cursor-pointer flex items-center gap-1 text-[11px]"
                >
                  <Eye className="size-3.5" />
                  <span>مشاهده تصویر بزرگ فیش</span>
                </button>
              )}
              {order.rejectionReason && (
                <span className="text-rose-500 font-bold mt-1 text-[11px]">
                  دلیل رد: {order.rejectionReason}
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons for Admin */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              disabled={isApproved || approvePaymentMutation.isPending}
              onClick={handleApprovePayment}
              className="flex-1 sm:flex-initial rounded-xl font-black text-xs gap-1.5 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {approvePaymentMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
              <span>{isApproved ? 'پرداخت تایید شده' : 'تایید پرداخت'}</span>
            </Button>

            <Button
              disabled={rejectPaymentMutation.isPending}
              variant="outline"
              onClick={() => setShowRejectModal(true)}
              className="flex-1 sm:flex-initial rounded-xl font-black text-xs gap-1.5 cursor-pointer border-rose-500 text-rose-500 hover:bg-rose-500/10"
            >
              <XCircle className="size-4" />
              <span>رد پرداخت</span>
            </Button>
          </div>
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

      {/* Lightbox Modal for Receipt Image */}
      {showReceiptModal && order.receiptUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-3xl max-h-[90vh] bg-background border border-border rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-sm font-black text-foreground">تصویر فیش پرداخت کارت به کارت - سفارش {order.orderId}</h3>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="p-4 overflow-auto flex items-center justify-center bg-black/40">
              <img src={order.receiptUrl} alt="فیش پرداخت کامل" className="max-h-[75vh] object-contain rounded-xl" />
            </div>
          </div>
        </div>
      )}

      {/* Reject Payment Reason Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-w-md w-full bg-background border border-border rounded-3xl p-6 shadow-2xl flex flex-col gap-4">
            <h3 className="text-sm font-black text-foreground border-b border-border/40 pb-3">
              رد پرداخت فیش واریزی
            </h3>

            <p className="text-xs text-muted-foreground leading-5 font-semibold">
              در صورت رد پرداخت، دلیل آن را ثبت نمایید تا به خریدار نمایش داده شود و امکان بارگذاری فیش جدید برای وی فعال گردد.
            </p>

            <textarea
              placeholder="مثال: تصویر فیش واضح نیست یا مبلغ واریزی با فاکتور تطابق ندارد..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
              className="w-full p-3 text-xs border border-border/60 rounded-xl bg-background focus:outline-none focus:border-rose-500"
              dir="rtl"
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowRejectModal(false)}
                className="rounded-xl text-xs"
              >
                انصراف
              </Button>
              <Button
                disabled={rejectPaymentMutation.isPending}
                onClick={handleRejectPayment}
                className="rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
              >
                {rejectPaymentMutation.isPending ? <Loader2 className="size-3 animate-spin" /> : null}
                <span>ثبت و رد پرداخت</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

