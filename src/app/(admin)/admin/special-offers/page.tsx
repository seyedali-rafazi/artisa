'use client';

import React, { useState } from 'react';
import {
  SpecialOffer,
  useAdminSpecialOffers,
  useToggleSpecialOfferActive,
  useDeleteSpecialOffer,
} from '@/hooks/useSpecialOffers';
import SpecialOfferDialog from '@/components/admin/SpecialOfferDialog';
import ConfirmModal from '@/components/ui/ConfirmModal';
import ProductImage from '@/components/ui/ProductImage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toPersianDigits } from '@/lib/utils';
import {
  Sparkles,
  Plus,
  Search,
  Calendar,
  Clock,
  Edit,
  Trash2,
  Package,
  Loader2,
  CheckCircle2,
  Timer,
  AlertTriangle,
  Power,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';

/**
 * Formats ISO timestamp to Shamsi date & clock time in Asia/Tehran timezone.
 */
function formatTehranShamsi(isoString?: string): string {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '—';
    const formatted = new Intl.DateTimeFormat('fa-IR', {
      timeZone: 'Asia/Tehran',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
    return toPersianDigits(formatted);
  } catch {
    return '—';
  }
}

export default function AdminSpecialOffersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Dialog & Modal states
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    offerToEdit: SpecialOffer | null;
  }>({
    isOpen: false,
    offerToEdit: null,
  });

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    offerId: string;
    offerTitle: string;
  }>({
    isOpen: false,
    offerId: '',
    offerTitle: '',
  });

  // Queries & Mutations
  const { data, isLoading } = useAdminSpecialOffers({
    page,
    limit: 10,
    search: search || undefined,
    status: statusFilter || undefined,
  });

  const toggleActiveMutation = useToggleSpecialOfferActive();
  const deleteMutation = useDeleteSpecialOffer();

  const offers = data?.items || [];
  const totalOffers = data?.total || 0;
  const totalPages = data?.total_pages || 1;

  const handleOpenCreate = () => {
    setDialogState({ isOpen: true, offerToEdit: null });
  };

  const handleOpenEdit = (offer: SpecialOffer) => {
    setDialogState({ isOpen: true, offerToEdit: offer });
  };

  const handleOpenDelete = (offer: SpecialOffer) => {
    setDeleteModal({
      isOpen: true,
      offerId: offer.id,
      offerTitle: offer.title,
    });
  };

  const handleConfirmDelete = () => {
    if (!deleteModal.offerId) return;
    deleteMutation.mutate(deleteModal.offerId, {
      onSuccess: () => {
        setDeleteModal({ isOpen: false, offerId: '', offerTitle: '' });
      },
    });
  };

  const handleToggleActive = (offerId: string) => {
    toggleActiveMutation.mutate(offerId);
  };

  // Status Badge Component
  const renderStatusBadge = (status: string, isActive: boolean) => {
    if (!isActive) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-destructive/10 text-destructive text-[11px] font-black border border-destructive/20">
          <Power className="size-3" />
          <span>غیرفعال شده</span>
        </span>
      );
    }

    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-black border border-emerald-500/20 animate-pulse">
            <span className="size-2 rounded-full bg-emerald-500 inline-block" />
            <span>در حال اجرا (فعال)</span>
          </span>
        );
      case 'upcoming':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] font-black border border-amber-500/20">
            <Timer className="size-3" />
            <span>زمان‌بندی شده (پیش‌رو)</span>
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-muted text-muted-foreground text-[11px] font-bold border border-border">
            <Clock className="size-3" />
            <span>منقضی شده</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-6 min-w-0 w-full" dir="rtl">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-foreground flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            <span>پیشنهادات ویژه و کمپین‌های تخفیف</span>
          </h1>
          <p className="text-xs text-muted-foreground font-semibold mt-1">
            تعریف، زمان‌بندی بر اساس ساعت رسمی تهران و مدیریت محصولات تخفیف‌دار
          </p>
        </div>

        <Button
          onClick={handleOpenCreate}
          className="rounded-2xl font-extrabold text-xs gap-2 cursor-pointer shadow-lg shadow-primary/25"
        >
          <Plus className="size-4" />
          <span>افزودن پیشنهاد ویژه جدید</span>
        </Button>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-3xl bg-card border border-border/80 shadow-xs">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { label: 'همه پیشنهادات', value: '' },
            { label: 'فعال', value: 'active' },
            { label: 'زمان‌بندی شده', value: 'upcoming' },
            { label: 'منقضی شده', value: 'expired' },
            { label: 'غیرفعال دستی', value: 'inactive' },
          ].map((tab) => {
            const isActiveTab = statusFilter === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => {
                  setStatusFilter(tab.value);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  isActiveTab
                    ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="جستجو در عنوان کمپین..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pr-9 h-10 rounded-2xl text-xs bg-background"
          />
        </div>
      </div>

      {/* Offers Table / Cards List */}
      <div className="rounded-3xl border border-border/80 bg-card overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
            <Loader2 className="size-8 animate-spin text-primary" />
            <span className="text-xs font-bold">در حال بارگذاری پیشنهادات ویژه...</span>
          </div>
        ) : offers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
            <Sparkles className="size-10 stroke-[1.5] text-muted-foreground/50" />
            <span className="text-sm font-extrabold text-foreground">
              هیچ پیشنهاد ویژه‌ای یافت نشد
            </span>
            <p className="text-xs text-muted-foreground max-w-sm text-center">
              می‌توانید اولین کمپین تخفیف ویژه خود را با مشخص کردن تاریخ شروع، پایان و انتخاب محصولات ایجاد نمایید.
            </p>
            <Button
              onClick={handleOpenCreate}
              size="sm"
              className="mt-2 rounded-xl text-xs font-bold gap-1.5 cursor-pointer"
            >
              <Plus className="size-3.5" />
              <span>ایجاد پیشنهاد جدید</span>
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-[11px] font-black text-muted-foreground">
                  <th className="p-4">عنوان و شرح کمپین</th>
                  <th className="p-4">وضعیت</th>
                  <th className="p-4">زمان شروع (تهران)</th>
                  <th className="p-4">زمان پایان (تهران)</th>
                  <th className="p-4">محصولات متصل</th>
                  <th className="p-4">فعال‌سازی</th>
                  <th className="p-4 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-xs">
                {offers.map((offer) => {
                  const productCount = offer.product_ids?.length || 0;
                  const displayProducts = offer.products || [];

                  return (
                    <tr
                      key={offer.id}
                      className="hover:bg-muted/30 transition-colors group"
                    >
                      {/* Title & Description */}
                      <td className="p-4">
                        <div className="flex flex-col gap-1 max-w-xs">
                          <span className="font-black text-foreground text-xs group-hover:text-primary transition-colors">
                            {offer.title}
                          </span>
                          {offer.description && (
                            <span className="text-[11px] text-muted-foreground line-clamp-1">
                              {offer.description}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-4 whitespace-nowrap">
                        {renderStatusBadge(offer.status, offer.is_active)}
                      </td>

                      {/* Start Time */}
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-muted-foreground font-semibold text-[11px]">
                          <Calendar className="size-3.5 text-primary shrink-0" />
                          <span>{formatTehranShamsi(offer.start_at_tehran || offer.start_at)}</span>
                        </div>
                      </td>

                      {/* End Time */}
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-muted-foreground font-semibold text-[11px]">
                          <Clock className="size-3.5 text-destructive shrink-0" />
                          <span>{formatTehranShamsi(offer.end_at_tehran || offer.end_at)}</span>
                        </div>
                      </td>

                      {/* Products Preview */}
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2 rtl:space-x-reverse overflow-hidden py-1">
                            {displayProducts.slice(0, 3).map((p, idx) => (
                              <div
                                key={idx}
                                className="size-7 rounded-lg overflow-hidden border-2 border-background shadow-xs bg-muted shrink-0"
                                title={p.name}
                              >
                                <ProductImage
                                  src={p.image}
                                  alt={p.name}
                                  width={28}
                                  height={28}
                                  className="size-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                          <span className="text-[11px] font-black text-foreground">
                            {toPersianDigits(productCount)} اثر
                          </span>
                        </div>
                      </td>

                      {/* Active Toggle Switch */}
                      <td className="p-4 whitespace-nowrap">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={offer.is_active}
                            onChange={() => handleToggleActive(offer.id)}
                            className="sr-only peer"
                            disabled={toggleActiveMutation.isPending}
                          />
                          <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </td>

                      {/* Actions */}
                      <td className="p-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(offer)}
                            className="p-1.5 rounded-xl hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                            title="ویرایش پیشنهاد"
                          >
                            <Edit className="size-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenDelete(offer)}
                            className="p-1.5 rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                            title="حذف پیشنهاد"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-border flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-semibold">
              صفحه {toPersianDigits(page)} از {toPersianDigits(totalPages)} ({toPersianDigits(totalOffers)} پیشنهاد)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-8 px-3 rounded-xl text-xs font-bold gap-1 cursor-pointer"
              >
                <ChevronRight className="size-4" />
                <span>قبلی</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="h-8 px-3 rounded-xl text-xs font-bold gap-1 cursor-pointer"
              >
                <span>بعدی</span>
                <ChevronLeft className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit Dialog */}
      <SpecialOfferDialog
        isOpen={dialogState.isOpen}
        onClose={() => setDialogState({ isOpen: false, offerToEdit: null })}
        offerToEdit={dialogState.offerToEdit}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, offerId: '', offerTitle: '' })}
        onConfirm={handleConfirmDelete}
        title="حذف پیشنهاد ویژه"
        description={`آیا از حذف پیشنهاد ویژه «${deleteModal.offerTitle}» اطمینان دارید؟ این عمل غیرقابل بازگشت است.`}
        confirmText="حذف دائمی"
        cancelText="انصراف"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
