'use client';

import React, { useState, useMemo } from 'react';
import {
  ContactMessageItem,
  useAdminContactMessages,
  useUpdateContactMessageStatus,
  useDeleteContactMessage,
} from '@/hooks/useContactMessages';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatShamsiDate, toPersianDigits } from '@/lib/utils';
import {
  Mail,
  MailOpen,
  Search,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  Inbox,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  Copy,
  ExternalLink,
  Check,
  Send,
  User,
  Calendar,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminContactMessagesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unread' | 'read'>('all');

  // Detail modal state
  const [selectedMessage, setSelectedMessage] = useState<ContactMessageItem | null>(null);
  const [copiedText, setCopiedText] = useState(false);

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    message: ContactMessageItem | null;
  }>({
    isOpen: false,
    message: null,
  });

  // Queries & Mutations
  const { data, isLoading, isError, refetch, isFetching } = useAdminContactMessages({
    page,
    limit: 10,
    search: search.trim() || undefined,
    status: statusFilter,
  });

  const updateStatusMutation = useUpdateContactMessageStatus();
  const deleteMutation = useDeleteContactMessage();

  const messages: ContactMessageItem[] = data?.items || [];
  const total = data?.total || 0;
  const totalPages = data?.total_pages || 1;
  const unreadCount = data?.unread_count || 0;
  const readCount = Math.max(0, total - unreadCount);

  // Open message details & automatically mark as read if unread
  const handleOpenDetail = (message: ContactMessageItem) => {
    setSelectedMessage(message);
    setCopiedText(false);

    if (message.status === 'unread') {
      updateStatusMutation.mutate(
        { id: message.id, status: 'read' },
        {
          onSuccess: (updated) => {
            setSelectedMessage(updated);
          },
        }
      );
    }
  };

  // Explicitly toggle read / unread status
  const handleToggleStatus = (message: ContactMessageItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    const newStatus: 'read' | 'unread' = message.status === 'unread' ? 'read' : 'unread';
    updateStatusMutation.mutate(
      { id: message.id, status: newStatus },
      {
        onSuccess: (updated) => {
          toast.success(
            newStatus === 'read'
              ? 'پیام به عنوان خوانده‌شده علامت‌گذاری شد'
              : 'پیام به عنوان خوانده‌نشده علامت‌گذاری شد'
          );
          if (selectedMessage?.id === message.id) {
            setSelectedMessage(updated);
          }
        },
        onError: (err: any) => {
          toast.error(err?.message || 'خطا در تغییر وضعیت پیام');
        },
      }
    );
  };

  // Open confirm delete modal
  const handleOpenDelete = (message: ContactMessageItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDeleteModal({ isOpen: true, message });
  };

  // Confirm delete
  const handleConfirmDelete = () => {
    if (!deleteModal.message) return;

    deleteMutation.mutate(deleteModal.message.id, {
      onSuccess: () => {
        toast.success('پیام تماس با موفقیت حذف شد');
        if (selectedMessage?.id === deleteModal.message?.id) {
          setSelectedMessage(null);
        }
        setDeleteModal({ isOpen: false, message: null });
      },
      onError: (err: any) => {
        toast.error(err?.message || 'خطا در حذف پیام');
      },
    });
  };

  // Copy message text to clipboard
  const handleCopyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    toast.success('متن پیام در کلیپ‌بورد کپی شد');
    setTimeout(() => setCopiedText(false), 2500);
  };

  return (
    <div className="flex flex-col gap-6 min-w-0 w-full" dir="rtl">
      {/* ─── Header & Title ─── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-foreground flex items-center gap-2.5">
            <div className="size-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Mail className="size-5" />
            </div>
            <span>پیام‌های تماس با ما</span>
          </h1>
          <p className="text-xs text-muted-foreground font-semibold mt-1">
            مشاهده، مدیریت، تغییر وضعیت خوانده‌شدن و پاسخگویی به درخواست‌های ارسالی کاربران
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="rounded-2xl text-xs font-bold gap-2 cursor-pointer h-10 border-border/60 hover:border-primary/40"
        >
          <RefreshCw className={`size-3.5 ${isFetching ? 'animate-spin text-primary' : ''}`} />
          <span>بروزرسانی لیست</span>
        </Button>
      </div>

      {/* ─── Metric Stat Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Messages */}
        <div className="rounded-3xl border border-border/60 bg-background/95 backdrop-blur-xl p-4 flex items-center gap-4 shadow-xs">
          <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Inbox className="size-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground font-bold">کل پیام‌های دریافتی</span>
            <span className="text-xl font-black text-foreground">
              {toPersianDigits(total)} پیام
            </span>
          </div>
        </div>

        {/* Unread Messages */}
        <div className="rounded-3xl border border-border/60 bg-background/95 backdrop-blur-xl p-4 flex items-center gap-4 shadow-xs">
          <div className="size-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <Mail className="size-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground font-bold">پیام‌های جدید و خوانده‌نشده</span>
            <span className="text-xl font-black text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
              {toPersianDigits(unreadCount)} مورد
              {unreadCount > 0 && (
                <span className="size-2 rounded-full bg-rose-500 animate-pulse inline-block" />
              )}
            </span>
          </div>
        </div>

        {/* Read Messages */}
        <div className="rounded-3xl border border-border/60 bg-background/95 backdrop-blur-xl p-4 flex items-center gap-4 shadow-xs">
          <div className="size-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
            <MailOpen className="size-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground font-bold">بررسی و خوانده‌شده</span>
            <span className="text-xl font-black text-foreground">
              {toPersianDigits(readCount)} پیام
            </span>
          </div>
        </div>
      </div>

      {/* ─── Search & Status Filters ─── */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-background/95 border border-border/60 p-4 rounded-3xl backdrop-blur-xl shadow-xs">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Input
            type="text"
            placeholder="جستجو در نام فرستنده، آدرس ایمیل یا متن پیام..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="rounded-2xl pr-9 text-xs h-11 border-border/50"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          {search && (
            <button
              onClick={() => {
                setSearch('');
                setPage(1);
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-muted/30 border border-border/60 self-stretch sm:self-auto shrink-0">
          <button
            onClick={() => {
              setStatusFilter('all');
              setPage(1);
            }}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            همه ({toPersianDigits(total)})
          </button>
          <button
            onClick={() => {
              setStatusFilter('unread');
              setPage(1);
            }}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'unread'
                ? 'bg-background text-rose-600 shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            خوانده‌نشده ({toPersianDigits(unreadCount)})
          </button>
          <button
            onClick={() => {
              setStatusFilter('read');
              setPage(1);
            }}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'read'
                ? 'bg-background text-emerald-600 shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            خوانده‌شده ({toPersianDigits(readCount)})
          </button>
        </div>
      </div>

      {/* ─── Contact Messages List ─── */}
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-28 rounded-3xl bg-neutral-200 dark:bg-neutral-800/60 animate-pulse border border-border/40"
            />
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-16 rounded-3xl border border-destructive/20 bg-destructive/5 p-6 flex flex-col items-center gap-3">
          <span className="text-xs font-bold text-destructive">خطا در دریافت پیام‌های تماس از سرور.</span>
          <Button onClick={() => refetch()} variant="outline" className="rounded-2xl text-xs">
            تلاش مجدد
          </Button>
        </div>
      ) : messages.length > 0 ? (
        <div className="flex flex-col gap-3">
          {messages.map((msg) => {
            const isUnread = msg.status === 'unread';

            return (
              <div
                key={msg.id}
                onClick={() => handleOpenDetail(msg)}
                className={`group rounded-3xl border transition-all duration-200 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer ${
                  isUnread
                    ? 'border-rose-500/30 bg-rose-500/5 dark:bg-rose-500/[0.03] hover:border-rose-500/50 shadow-xs'
                    : 'border-border/60 bg-background/95 hover:border-primary/40 shadow-xs hover:shadow-md'
                }`}
              >
                {/* Left side: Status badge, Sender details, Message preview */}
                <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                  {/* Status Indicator Icon */}
                  <div
                    className={`size-11 rounded-2xl flex items-center justify-center shrink-0 ${
                      isUnread
                        ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {isUnread ? <Mail className="size-5" /> : <MailOpen className="size-5" />}
                  </div>

                  {/* Content */}
                  <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-xs sm:text-sm text-foreground">
                        {msg.name}
                      </span>

                      {/* Status Badge */}
                      {isUnread ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-black border border-rose-500/20">
                          <span className="size-1.5 rounded-full bg-rose-500 inline-block animate-pulse" />
                          <span>جدید / خوانده‌نشده</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xl bg-muted text-muted-foreground text-[10px] font-bold border border-border/60">
                          <CheckCircle2 className="size-3 text-emerald-600" />
                          <span>خوانده‌شده</span>
                        </span>
                      )}

                      {/* Submission Date */}
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1 mr-auto sm:mr-0">
                        <Clock className="size-3" />
                        <span>{formatShamsiDate(msg.created_at, 'time')}</span>
                      </span>
                    </div>

                    {/* Email */}
                    <div className="flex items-center gap-1.5">
                      <span
                        dir="ltr"
                        className="text-xs font-semibold text-primary hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <a href={`mailto:${msg.email}`}>{msg.email}</a>
                      </span>
                    </div>

                    {/* Message Preview */}
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed font-medium break-words mt-0.5">
                      {msg.message}
                    </p>
                  </div>
                </div>

                {/* Right side: Action Buttons */}
                <div
                  className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-border/40 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* View Details */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDetail(msg)}
                    className="rounded-xl text-xs font-bold gap-1.5 h-9 cursor-pointer hover:border-primary/50"
                  >
                    <Eye className="size-3.5 text-primary" />
                    <span>مشاهده کامل</span>
                  </Button>

                  {/* Toggle Read/Unread Status */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => handleToggleStatus(msg, e)}
                    disabled={updateStatusMutation.isPending}
                    title={isUnread ? 'علامت به عنوان خوانده‌شده' : 'علامت به عنوان خوانده‌نشده'}
                    className={`rounded-xl text-xs font-bold gap-1.5 h-9 cursor-pointer ${
                      isUnread
                        ? 'text-emerald-600 hover:bg-emerald-500/10 hover:border-emerald-500/30'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {isUnread ? (
                      <>
                        <Check className="size-3.5" />
                        <span className="hidden md:inline">علامت خوانده شد</span>
                      </>
                    ) : (
                      <>
                        <Mail className="size-3.5" />
                        <span className="hidden md:inline">تبدیل به خوانده‌نشده</span>
                      </>
                    )}
                  </Button>

                  {/* Delete Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => handleOpenDelete(msg, e)}
                    className="rounded-xl text-xs font-bold gap-1.5 h-9 text-destructive hover:bg-destructive/10 hover:border-destructive/30 cursor-pointer"
                  >
                    <Trash2 className="size-3.5" />
                    <span className="hidden md:inline">حذف</span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-3xl border border-dashed border-border/80 bg-background/50 p-12 text-center flex flex-col items-center justify-center gap-4">
          <div className="size-16 rounded-3xl bg-muted/60 flex items-center justify-center text-muted-foreground">
            <Mail className="size-8" />
          </div>
          <div className="flex flex-col gap-1 max-w-sm">
            <span className="text-sm font-black text-foreground">
              {search || statusFilter !== 'all'
                ? 'پیامی با شرایط جستجوی شما یافت نشد'
                : 'هنوز هیچ پیام تماسی ثبت نشده است'}
            </span>
            <span className="text-xs text-muted-foreground">
              {search || statusFilter !== 'all'
                ? 'لطفاً عبارت جستجو را پاک کرده یا فیلتر وضعیت را روی «همه» قرار دهید.'
                : 'پیام‌های ارسال شده از طریق صفحه تماس با ما در این قسمت نمایش داده خواهند شد.'}
            </span>
          </div>
          {(search || statusFilter !== 'all') && (
            <Button
              variant="outline"
              onClick={() => {
                setSearch('');
                setStatusFilter('all');
                setPage(1);
              }}
              className="rounded-2xl text-xs mt-2"
            >
              پاک کردن فیلترها
            </Button>
          )}
        </div>
      )}

      {/* ─── Pagination Controls ─── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-4 p-4 rounded-3xl bg-background/95 border border-border/60 shadow-xs">
          <span className="text-xs text-muted-foreground font-semibold">
            صفحه {toPersianDigits(page)} از {toPersianDigits(totalPages)} (مجموع{' '}
            {toPersianDigits(total)} پیام)
          </span>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || isLoading}
              className="rounded-xl text-xs font-bold gap-1 cursor-pointer h-9"
            >
              <ChevronRight className="size-4" />
              <span>قبلی</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || isLoading}
              className="rounded-xl text-xs font-bold gap-1 cursor-pointer h-9"
            >
              <span>بعدی</span>
              <ChevronLeft className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ─── Message Detail Modal Dialog ─── */}
      {selectedMessage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in"
          dir="rtl"
          onClick={() => setSelectedMessage(null)}
        >
          <div
            className="bg-background border border-border/60 rounded-3xl p-6 max-w-xl w-full shadow-2xl flex flex-col gap-5 text-right transform transition-all max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-border/40 pb-4">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Mail className="size-6" />
                </div>
                <div className="flex flex-col">
                  <h2 className="text-base font-black text-foreground">
                    پیام از طرف: {selectedMessage.name}
                  </h2>
                  <span className="text-xs text-muted-foreground font-semibold">
                    شناسه پیام: {selectedMessage.id}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedMessage(null)}
                className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Sender Meta Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-muted/20 border border-border/50 text-xs">
              <div className="flex items-center gap-2">
                <User className="size-4 text-muted-foreground shrink-0" />
                <span className="font-bold text-muted-foreground">نام فرستنده:</span>
                <span className="font-extrabold text-foreground">{selectedMessage.name}</span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="size-4 text-muted-foreground shrink-0" />
                <span className="font-bold text-muted-foreground">تاریخ ارسال:</span>
                <span className="font-bold text-foreground">
                  {formatShamsiDate(selectedMessage.created_at, 'time')}
                </span>
              </div>

              <div className="flex items-center gap-2 sm:col-span-2">
                <Mail className="size-4 text-muted-foreground shrink-0" />
                <span className="font-bold text-muted-foreground">ایمیل:</span>
                <a
                  href={`mailto:${selectedMessage.email}`}
                  dir="ltr"
                  className="font-bold text-primary hover:underline inline-flex items-center gap-1"
                >
                  <span>{selectedMessage.email}</span>
                  <ExternalLink className="size-3" />
                </a>
              </div>
            </div>

            {/* Full Message Body */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-foreground">متن کامل پیام یا درخواست:</label>
                <button
                  type="button"
                  onClick={() => handleCopyMessage(selectedMessage.message)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {copiedText ? (
                    <>
                      <Check className="size-3 text-emerald-600" />
                      <span className="text-emerald-600">کپی شد</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-3" />
                      <span>کپی متن پیام</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-muted/15 border border-border/40 text-xs sm:text-sm text-foreground leading-relaxed whitespace-pre-wrap break-words max-h-60 overflow-y-auto">
                {selectedMessage.message}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/40">
              {/* Quick Reply Button via Email */}
              <a
                href={`mailto:${selectedMessage.email}?subject=${encodeURIComponent(
                  'پاسخ به پیام شما در گالری آرتیسا'
                )}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-md shadow-primary/25 hover:bg-primary/90 transition-all cursor-pointer"
              >
                <Send className="size-3.5" />
                <span>ارسال ایمیل پاسخ</span>
              </a>

              <div className="flex items-center gap-2">
                {/* Toggle status in modal */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleStatus(selectedMessage)}
                  disabled={updateStatusMutation.isPending}
                  className="rounded-xl text-xs font-bold gap-1.5 cursor-pointer"
                >
                  {selectedMessage.status === 'unread' ? (
                    <>
                      <Check className="size-3.5 text-emerald-600" />
                      <span>علامت به عنوان خوانده‌شده</span>
                    </>
                  ) : (
                    <>
                      <Mail className="size-3.5 text-rose-600" />
                      <span>علامت به عنوان خوانده‌نشده</span>
                    </>
                  )}
                </Button>

                {/* Close Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedMessage(null)}
                  className="rounded-xl text-xs font-bold cursor-pointer"
                >
                  بستن
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Confirm Delete Modal ─── */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, message: null })}
        onConfirm={handleConfirmDelete}
        title="حذف پیام تماس"
        description={
          deleteModal.message ? (
            <span>
              آیا از حذف دائم پیام ارسالی توسط «<strong className="text-foreground">{deleteModal.message.name}</strong>» ({deleteModal.message.email}) اطمینان دارید؟ این عملیات غیرقابل بازگشت است.
            </span>
          ) : (
            'آیا از حذف این پیام اطمینان دارید؟'
          )
        }
        confirmText="بله، حذف کن"
        cancelText="انصراف"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
