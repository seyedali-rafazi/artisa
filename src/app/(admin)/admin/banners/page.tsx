'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  BannerItem,
  useAdminBanners,
  useToggleBannerActive,
  useReorderBanners,
  useDeleteBanner,
} from '@/hooks/useBanners';
import BannerPreviewModal from '@/components/admin/BannerPreviewModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toPersianDigits } from '@/lib/utils';
import {
  Image as ImageIcon,
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  CheckCircle2,
  Power,
  ChevronUp,
  ChevronDown,
  Eye,
  ExternalLink,
  Layers,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminBannersPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean;
    banner: BannerItem | null;
  }>({
    isOpen: false,
    banner: null,
  });

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    bannerId: string;
    bannerTitle: string;
  }>({
    isOpen: false,
    bannerId: '',
    bannerTitle: '',
  });

  // Queries & Mutations
  const { data: rawBanners, isLoading, isError, refetch } = useAdminBanners();
  const toggleActiveMutation = useToggleBannerActive();
  const reorderMutation = useReorderBanners();
  const deleteMutation = useDeleteBanner();

  const allBanners = useMemo(() => {
    if (!rawBanners) return [];
    return [...rawBanners].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [rawBanners]);

  // Filtered banners
  const filteredBanners = useMemo(() => {
    return allBanners.filter((b) => {
      const matchesSearch =
        !search.trim() ||
        (b.title && b.title.toLowerCase().includes(search.trim().toLowerCase()));

      const isActive = b.isActive !== false;
      let matchesStatus = true;
      if (statusFilter === 'active') matchesStatus = isActive;
      if (statusFilter === 'inactive') matchesStatus = !isActive;

      return matchesSearch && matchesStatus;
    });
  }, [allBanners, search, statusFilter]);

  // KPI Metrics
  const totalCount = allBanners.length;
  const activeCount = allBanners.filter((b) => b.isActive !== false).length;
  const inactiveCount = allBanners.filter((b) => b.isActive === false).length;

  const handleOpenPreview = (banner: BannerItem) => {
    setPreviewModal({ isOpen: true, banner });
  };

  const handleOpenDelete = (banner: BannerItem) => {
    setDeleteModal({
      isOpen: true,
      bannerId: banner.id,
      bannerTitle: banner.title,
    });
  };

  const handleConfirmDelete = () => {
    if (!deleteModal.bannerId) return;

    deleteMutation.mutate(deleteModal.bannerId, {
      onSuccess: () => {
        toast.success('بنر با موفقیت حذف شد.');
        setDeleteModal({ isOpen: false, bannerId: '', bannerTitle: '' });
      },
      onError: (err: any) => {
        toast.error(err?.message || 'خطا در حذف بنر');
      },
    });
  };

  const handleToggleStatus = (banner: BannerItem) => {
    toggleActiveMutation.mutate(
      { id: banner.id, isActive: !banner.isActive },
      {
        onSuccess: (updated) => {
          const statusStr = updated.isActive ? 'فعال' : 'غیرفعال';
          toast.success(`وضعیت بنر به ${statusStr} تغییر یافت.`);
        },
        onError: (err: any) => {
          toast.error(err?.message || 'خطا در تغییر وضعیت بنر');
        },
      }
    );
  };

  // Reorder single banner up or down
  const handleMoveOrder = (currentIndex: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= filteredBanners.length) return;

    const currentBanner = filteredBanners[currentIndex];
    const targetBanner = filteredBanners[targetIndex];

    const currentOrder = currentBanner.order ?? currentIndex + 1;
    const targetOrder = targetBanner.order ?? targetIndex + 1;

    const newItems = [
      { id: currentBanner.id, order: targetOrder },
      { id: targetBanner.id, order: currentOrder },
    ];

    reorderMutation.mutate(newItems, {
      onSuccess: () => {
        toast.success('ترتیب نمایش بنرها بروزرسانی شد.');
      },
      onError: (err: any) => {
        toast.error(err?.message || 'خطا در تغییر ترتیب بنرها');
      },
    });
  };

  return (
    <div className="flex flex-col gap-6 min-w-0 w-full" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-foreground flex items-center gap-2">
            <ImageIcon className="size-6 text-primary" />
            <span>مدیریت بنرهای صفحه اصلی</span>
          </h1>
          <p className="text-xs text-muted-foreground font-semibold mt-1">
            ایجاد بنرهای اسلایدر در صفحه اختصاصی، طراحی تعاملی و کنترل ریسپانسیو
          </p>
        </div>

        <Link href="/admin/banners/new">
          <Button className="rounded-2xl font-extrabold text-xs gap-2 cursor-pointer shadow-lg shadow-primary/25">
            <Plus className="size-4" />
            <span>افزودن بنر جدید</span>
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-3xl bg-card border border-border/60 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-muted-foreground block">کل بنرها</span>
            <span className="text-2xl font-black text-foreground mt-1 block">
              {toPersianDigits(totalCount)}
            </span>
          </div>
          <div className="size-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <Layers className="size-5" />
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-card border border-border/60 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-muted-foreground block">بنرهای فعال</span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block">
              {toPersianDigits(activeCount)}
            </span>
          </div>
          <div className="size-11 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="size-5" />
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-card border border-border/60 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-muted-foreground block">بنرهای غیرفعال</span>
            <span className="text-2xl font-black text-muted-foreground mt-1 block">
              {toPersianDigits(inactiveCount)}
            </span>
          </div>
          <div className="size-11 rounded-2xl bg-muted/60 text-muted-foreground flex items-center justify-center">
            <Power className="size-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-3 rounded-2xl border border-border/60">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجو در عنوان بنر..."
            className="pr-10 rounded-xl text-xs h-10 bg-background border-border/60"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border/50 shrink-0">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            همه ({toPersianDigits(totalCount)})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'active'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            فعال ({toPersianDigits(activeCount)})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('inactive')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'inactive'
                ? 'bg-muted-foreground text-background shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            غیرفعال ({toPersianDigits(inactiveCount)})
          </button>
        </div>
      </div>

      {/* Main Content List / Cards */}
      {isLoading ? (
        <div className="p-12 flex flex-col items-center justify-center gap-3 bg-card rounded-3xl border border-border/60 text-muted-foreground">
          <Loader2 className="size-8 animate-spin text-primary" />
          <span className="text-xs font-bold">در حال بارگذاری لیست بنرها...</span>
        </div>
      ) : isError ? (
        <div className="p-8 text-center bg-destructive/10 rounded-3xl border border-destructive/20 text-destructive text-xs font-bold space-y-3">
          <p>خطا در دریافت اطلاعات بنرها از سرور.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="rounded-xl">
            تلاش مجدد
          </Button>
        </div>
      ) : filteredBanners.length === 0 ? (
        <div className="p-12 text-center bg-card rounded-3xl border border-border/60 flex flex-col items-center justify-center gap-4">
          <div className="size-16 rounded-3xl bg-muted/40 text-muted-foreground flex items-center justify-center">
            <ImageIcon className="size-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-black text-foreground">هیچ بنری یافت نشد</h3>
            <p className="text-xs text-muted-foreground font-semibold">
              {search || statusFilter !== 'all'
                ? 'نتیجه‌ای متناسب با فیلترهای جستجو پیدا نشد.'
                : 'تاکنون هیچ بنری ایجاد نکرده‌اید. با فشردن دکمه زیر اولین بنر را بسازید.'}
            </p>
          </div>
          {!search && statusFilter === 'all' && (
            <Link href="/admin/banners/new">
              <Button className="rounded-2xl text-xs font-bold gap-2">
                <Plus className="size-4" />
                <span>افزودن اولین بنر</span>
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredBanners.map((banner, index) => {
            const isActive = banner.isActive !== false;
            const textsCount = banner.texts?.length || 0;

            return (
              <div
                key={banner.id}
                className="bg-card rounded-3xl border border-border/60 p-4 sm:p-5 shadow-xs transition-all hover:border-primary/40 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left Side: Thumbnail Canvas Preview + Details */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1 min-w-0">
                  {/* Thumbnail with hover preview */}
                  <div className="relative w-full sm:w-48 h-28 rounded-2xl overflow-hidden bg-neutral-900 shrink-0 border border-border/60 group">
                    <img
                      src={banner.image}
                      alt={banner.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/20" />

                    {/* Preview button overlay on hover */}
                    <button
                      type="button"
                      onClick={() => handleOpenPreview(banner)}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-bold cursor-pointer"
                    >
                      <Eye className="size-4" />
                      <span>پیش‌نمایش</span>
                    </button>
                  </div>

                  {/* Banner Info Details */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/admin/banners/${banner.id}`}
                        className="text-sm sm:text-base font-black text-foreground truncate hover:text-primary transition-colors"
                      >
                        {banner.title}
                      </Link>

                      {/* Status Badge */}
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isActive
                            ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        <span className={`size-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-muted-foreground'}`} />
                        <span>{isActive ? 'فعال در سایت' : 'غیرفعال'}</span>
                      </span>

                      {/* Texts count badge */}
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold border border-primary/20">
                        <Layers className="size-3" />
                        <span>{toPersianDigits(textsCount)} لایه متن</span>
                      </span>
                    </div>

                    {/* Link Preview if present */}
                    {banner.link ? (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium truncate" dir="ltr">
                        <ExternalLink className="size-3 text-primary shrink-0" />
                        <span className="truncate">{banner.link}</span>
                        {banner.linkOpenInNewTab && (
                          <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">new tab</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-[11px] text-muted-foreground font-medium">بدون لینک هدایت</span>
                    )}

                    {/* Order & Metadata */}
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-semibold pt-1">
                      <span>ترتیب نمایش: <strong className="text-foreground">{toPersianDigits(banner.order ?? 0)}</strong></span>
                      {banner.created_at && (
                        <span>تاریخ ثبت: {new Date(banner.created_at).toLocaleDateString('fa-IR')}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Side: Reordering & Action Buttons */}
                <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-border/40">
                  {/* Reordering arrows */}
                  <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border/40">
                    <button
                      type="button"
                      disabled={index === 0 || reorderMutation.isPending}
                      onClick={() => handleMoveOrder(index, 'up')}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                      title="انتقال به بالا"
                    >
                      <ChevronUp className="size-4" />
                    </button>
                    <button
                      type="button"
                      disabled={index === filteredBanners.length - 1 || reorderMutation.isPending}
                      onClick={() => handleMoveOrder(index, 'down')}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                      title="انتقال به پایین"
                    >
                      <ChevronDown className="size-4" />
                    </button>
                  </div>

                  {/* Toggle Active Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleStatus(banner)}
                    disabled={toggleActiveMutation.isPending}
                    className={`rounded-xl text-xs font-bold gap-1 cursor-pointer ${
                      isActive
                        ? 'text-muted-foreground hover:text-destructive'
                        : 'text-emerald-600 hover:bg-emerald-50'
                    }`}
                  >
                    <Power className="size-3.5" />
                    <span className="hidden sm:inline">{isActive ? 'غیرفعال‌سازی' : 'فعال‌سازی'}</span>
                  </Button>

                  {/* Preview Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenPreview(banner)}
                    className="rounded-xl text-xs font-bold gap-1 cursor-pointer"
                    title="پیش‌نمایش ریسپانسیو"
                  >
                    <Eye className="size-3.5 text-primary" />
                    <span className="hidden sm:inline">پیش‌نمایش</span>
                  </Button>

                  {/* Edit Button (Links to /admin/banners/[id]) */}
                  <Link href={`/admin/banners/${banner.id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl text-xs font-bold gap-1 cursor-pointer hover:bg-primary/10 hover:text-primary hover:border-primary/40"
                    >
                      <Edit className="size-3.5" />
                      <span>ویرایش</span>
                    </Button>
                  </Link>

                  {/* Delete Button */}
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleOpenDelete(banner)}
                    className="rounded-xl text-xs font-bold cursor-pointer size-9 p-0"
                    title="حذف بنر"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Responsive Preview Modal */}
      <BannerPreviewModal
        isOpen={previewModal.isOpen}
        onClose={() => setPreviewModal({ isOpen: false, banner: null })}
        banner={previewModal.banner}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="حذف دائمی بنر"
        description={`آیا از حذف بنر «${deleteModal.bannerTitle}» اطمینان دارید؟ این عملیات تصویر ذخیره شده در فضای ابری را نیز پاک کرده و غیرقابل بازگشت است.`}
        confirmText="بله، حذف بنر"
        cancelText="انصراف"
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteModal({ isOpen: false, bannerId: '', bannerTitle: '' })}
        isLoading={deleteMutation.isPending}
        variant="danger"
      />
    </div>
  );
}
