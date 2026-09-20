'use client';

import React, { useState } from 'react';
import {
  ContactMessageItem,
  useAdminContactMessages,
  useUpdateContactMessageStatus,
  useDeleteContactMessage,
} from '@/hooks/useContactMessages';
import { useDebounce } from '@/hooks/useDebounce';
import ContactMessagesTable from '@/components/admin/contact-messages/ContactMessagesTable';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { Button } from '@/components/ui/button';
import { formatShamsiDate, toPersianDigits } from '@/lib/utils';
import {
  Mail,
  MailOpen,
  Inbox,
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
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 350);
  const [statusFilter, setStatusFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [sortBy, setSortBy] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<string>('');

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
    limit: pageSize,
    search: debouncedSearch.trim() || undefined,
    status: statusFilter,
    sort_by: sortBy || undefined,
    sort_order: sortOrder || undefined,
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
  const handleToggleStatus = (message: ContactMessageItem) => {
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
  const handleOpenDelete = (message: ContactMessageItem) => {
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

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setSortBy('');
    setSortOrder('');
    setPage(1);
  };

  const handleSortChange = (newSortBy: string, newSortOrder: string) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setPage(1);
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
            مشاهده، مرتب‌سازی، مدیریت ستون‌ها، تغییر وضعیت و پاسخگویی به پیام‌های ارسالی کاربران
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

      {/* ─── Contact Messages Table Component ─── */}
      <ContactMessagesTable
        data={messages}
        isLoading={isLoading}
        totalCount={total}
        totalPages={totalPages}
        currentPage={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        searchQuery={search}
        onSearchChange={(q) => {
          setSearch(q);
          setPage(1);
        }}
        statusFilter={statusFilter}
        onStatusFilterChange={(status) => {
          setStatusFilter(status);
          setPage(1);
        }}
        onResetFilters={handleResetFilters}
        onSortChange={handleSortChange}
        onViewMessage={handleOpenDetail}
        onToggleStatus={handleToggleStatus}
        onDeleteMessage={handleOpenDelete}
      />

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
