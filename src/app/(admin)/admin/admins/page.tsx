'use client';

import React, { useState, useMemo } from 'react';
import { useAdminList, useCreateAdmin, useDeleteAdmin, AdminUser } from '@/hooks/useAdmin';
import { useUserProfile } from '@/hooks/useAuth';
import { useDebounce } from '@/hooks/useDebounce';
import AdminsTable from '@/components/admin/admins/AdminsTable';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toPersianDigits } from '@/lib/utils';
import {
  ShieldCheck,
  Shield,
  Plus,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminsManagementPage() {
  const { data: currentUser } = useUserProfile();
  
  const isSuperAdmin =
    currentUser?.role === 'super_admin' ||
    currentUser?.role === 'superadmin' ||
    (currentUser as any)?.is_superuser;

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 350);
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortBy, setSortBy] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<string>('');

  const { data: allAdmins = [], isLoading } = useAdminList({
    search: debouncedSearch.trim() || undefined,
    role: roleFilter !== 'all' ? roleFilter : undefined,
    sort_by: sortBy || undefined,
    sort_order: sortOrder || undefined,
  });

  const createAdminMutation = useCreateAdmin();
  const deleteAdminMutation = useDeleteAdmin();

  // Create admin modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    admin: AdminUser | null;
  }>({
    isOpen: false,
    admin: null,
  });
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(null);

  // Stats
  const totalCount = allAdmins.length;
  const superAdminCount = useMemo(
    () =>
      allAdmins.filter(
        (a) => a.role === 'super_admin' || a.role === 'superadmin'
      ).length,
    [allAdmins]
  );
  const standardAdminCount = Math.max(0, totalCount - superAdminCount);

  // Client-side pagination for the returned admins
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const paginatedAdmins = useMemo(() => {
    const start = (page - 1) * pageSize;
    return allAdmins.slice(start, start + pageSize);
  }, [allAdmins, page, pageSize]);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name || !email || !password) return;

    createAdminMutation.mutate(
      { name, email, password, role },
      {
        onSuccess: () => {
          toast.success('حساب مدیر با موفقیت ایجاد شد');
          setShowCreateModal(false);
          setName('');
          setEmail('');
          setPassword('');
        },
        onError: (err: any) => {
          setErrorMessage(err?.message || 'خطا در تعریف مدیر جدید.');
        },
      }
    );
  };

  const handleDeleteAdminClick = (admin: AdminUser) => {
    setDeleteErrorMessage(null);
    setDeleteModal({ isOpen: true, admin });
  };

  const handleConfirmDeleteAdmin = () => {
    if (!deleteModal.admin) return;
    setDeleteErrorMessage(null);

    deleteAdminMutation.mutate(deleteModal.admin.id, {
      onSuccess: () => {
        toast.success('حساب مدیر با موفقیت حذف شد');
        setDeleteModal({ isOpen: false, admin: null });
      },
      onError: (err: any) => {
        setDeleteErrorMessage(err?.message || 'امکان حذف این مدیر وجود ندارد.');
      },
    });
  };

  const handleResetFilters = () => {
    setSearch('');
    setRoleFilter('all');
    setSortBy('');
    setSortOrder('');
    setPage(1);
  };

  const handleSortChange = (newSortBy: string, newSortOrder: string) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setPage(1);
  };

  if (!isSuperAdmin) {
    return (
      <div className="p-12 text-center flex flex-col items-center gap-3" dir="rtl">
        <div className="size-14 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
          <ShieldAlert className="size-7" />
        </div>
        <h1 className="text-lg font-black text-foreground">دسترسی محدود</h1>
        <p className="text-xs font-bold text-muted-foreground max-w-sm">
          این صفحه تنها برای مدیر ارشد (Super Admin) قابل مشاهده است.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 min-w-0 w-full" dir="rtl">
      {/* ─── Header & Actions ─── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-foreground flex items-center gap-2.5">
            <div className="size-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <ShieldCheck className="size-5" />
            </div>
            <span>مدیریت مدیران سیستم</span>
          </h1>
          <p className="text-xs text-muted-foreground font-semibold mt-1">
            تعریف مدیر جدید، مرتب‌سازی، مدیریت ستون‌ها، تعیین سطوح دسترسی و تیم مدیریت
          </p>
        </div>

        <Button
          onClick={() => setShowCreateModal(true)}
          className="rounded-2xl font-extrabold text-xs gap-2 cursor-pointer shadow-lg shadow-primary/25 h-10"
        >
          <Plus className="size-4" />
          <span>افزودن مدیر جدید</span>
        </Button>
      </div>

      {/* ─── Metric Stat Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Admins */}
        <div className="rounded-3xl border border-border/60 bg-background/95 backdrop-blur-xl p-4 flex items-center gap-4 shadow-xs">
          <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Users className="size-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground font-bold">کل مدیران سیستم</span>
            <span className="text-xl font-black text-foreground">
              {toPersianDigits(totalCount)} نفر
            </span>
          </div>
        </div>

        {/* Super Admins */}
        <div className="rounded-3xl border border-border/60 bg-background/95 backdrop-blur-xl p-4 flex items-center gap-4 shadow-xs">
          <div className="size-12 rounded-2xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
            <Shield className="size-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground font-bold">مدیران ارشد (Super Admin)</span>
            <span className="text-xl font-black text-violet-600 dark:text-violet-400">
              {toPersianDigits(superAdminCount)} مدیر
            </span>
          </div>
        </div>

        {/* Standard Admins */}
        <div className="rounded-3xl border border-border/60 bg-background/95 backdrop-blur-xl p-4 flex items-center gap-4 shadow-xs">
          <div className="size-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="size-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground font-bold">مدیران سیستم (Admin)</span>
            <span className="text-xl font-black text-foreground">
              {toPersianDigits(standardAdminCount)} مدیر
            </span>
          </div>
        </div>
      </div>

      {/* ─── Admins Table Component ─── */}
      <AdminsTable
        data={paginatedAdmins}
        isLoading={isLoading}
        totalCount={totalCount}
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
        roleFilter={roleFilter}
        onRoleFilterChange={(r) => {
          setRoleFilter(r);
          setPage(1);
        }}
        onResetFilters={handleResetFilters}
        onSortChange={handleSortChange}
        onDeleteAdmin={handleDeleteAdminClick}
        currentUserId={currentUser?.id}
      />

      {/* ─── Create Admin Modal ─── */}
      {showCreateModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setShowCreateModal(false)}
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="bg-background border border-border/60 rounded-3xl p-6 max-w-sm w-full shadow-2xl flex flex-col gap-4 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-base font-black text-foreground">افزودن مدیر جدید</h2>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-xs font-bold flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted-foreground">نام و نام خانوادگی</label>
                <Input
                  type="text"
                  placeholder="مثال: رضا حسینی"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted-foreground">آدرس ایمیل</label>
                <Input
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="rounded-xl text-xs"
                  dir="ltr"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted-foreground">رمز عبور</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="rounded-xl text-xs"
                  dir="ltr"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted-foreground">سطح دسترسی</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="rounded-xl border border-border bg-background px-3 py-2 text-xs font-bold text-foreground cursor-pointer"
                >
                  <option value="admin">مدیر سیستم (Admin)</option>
                  <option value="superadmin">مدیر ارشد (Super Admin)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 mt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl text-xs"
                >
                  انصراف
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={createAdminMutation.isPending}
                  className="rounded-xl text-xs font-extrabold gap-1 cursor-pointer"
                >
                  {createAdminMutation.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}
                  <span>ایجاد مدیر</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Delete Admin Confirmation Modal ─── */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => {
          setDeleteModal({ isOpen: false, admin: null });
          setDeleteErrorMessage(null);
        }}
        onConfirm={handleConfirmDeleteAdmin}
        title="حذف حساب مدیر"
        variant="danger"
        confirmText="حذف مدیر"
        isLoading={deleteAdminMutation.isPending}
        description={
          <div className="flex flex-col gap-2">
            <span>
              آیا از حذف حساب مدیر <strong className="text-foreground font-black">«{deleteModal.admin?.name}»</strong> اطمینان دارید؟
            </span>
            {deleteErrorMessage && (
              <div className="p-2.5 rounded-xl bg-destructive/10 text-destructive text-xs font-bold flex items-center gap-2 mt-1">
                <AlertCircle className="size-4 shrink-0" />
                <span>{deleteErrorMessage}</span>
              </div>
            )}
          </div>
        }
      />
    </div>
  );
}
