'use client';

import React, { useState } from 'react';
import { useAdminUsers, useUpdateUserStatus, useUpdateUserRole } from '@/hooks/useAdmin';
import { useUserProfile } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/hooks/useDebounce';
import ConfirmModal from '@/components/ui/ConfirmModal';
import UsersTable from '@/components/admin/users/UsersTable';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const debouncedSearch = useDebounce(search, 350);

  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean;
    userId: string;
    userName: string;
    currentStatus: boolean;
  }>({
    isOpen: false,
    userId: '',
    userName: '',
    currentStatus: true,
  });

  const { data: currentUser } = useUserProfile();
  const currentRole = (currentUser?.role || '').toLowerCase();
  const isSuperAdmin =
    currentRole === 'superadmin' ||
    currentRole === 'super_admin' ||
    currentRole === 'مدیر ارشد';

  const isActiveParam =
    statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined;

  const { data, isLoading } = useAdminUsers({
    page,
    limit: pageSize,
    search: debouncedSearch,
    role: roleFilter || undefined,
    is_active: isActiveParam,
  });

  const statusMutation = useUpdateUserStatus();
  const roleMutation = useUpdateUserRole();

  const [selectedUserForRole, setSelectedUserForRole] = useState<{
    id: string;
    name: string;
    currentRole: string;
  } | null>(null);
  const [newRoleInput, setNewRoleInput] = useState('admin');

  const handleToggleStatusClick = (userId: string, userName: string, currentStatus: boolean) => {
    setStatusModal({ isOpen: true, userId, userName, currentStatus });
  };

  const handleConfirmToggleStatus = () => {
    if (!statusModal.userId) return;
    const targetStatus = !statusModal.currentStatus;
    statusMutation.mutate(
      { userId: statusModal.userId, is_active: targetStatus },
      {
        onSuccess: () => {
          toast.success(
            targetStatus
              ? `حساب کاربر «${statusModal.userName}» با موفقیت فعال گردید.`
              : `حساب کاربر «${statusModal.userName}» غیرفعال شد.`
          );
          setStatusModal({ isOpen: false, userId: '', userName: '', currentStatus: true });
        },
        onError: (err: unknown) => {
          const message =
            err && typeof err === 'object' && 'response' in err
              ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
              : undefined;
          toast.error(message || 'خطا در تغییر وضعیت کاربر');
        },
      }
    );
  };

  const handleEditRoleClick = (userId: string, userName: string, currentRole: string) => {
    setSelectedUserForRole({ id: userId, name: userName, currentRole });
    const cleanRole = (currentRole || '').toLowerCase();
    setNewRoleInput(cleanRole === 'user' ? 'admin' : cleanRole);
  };

  const handleSaveRole = () => {
    if (!selectedUserForRole) return;
    roleMutation.mutate(
      { userId: selectedUserForRole.id, role: newRoleInput },
      {
        onSuccess: () => {
          toast.success(`سطح دسترسی «${selectedUserForRole.name}» با موفقیت بروزرسانی شد.`);
          setSelectedUserForRole(null);
        },
        onError: (err: unknown) => {
          const message =
            err && typeof err === 'object' && 'response' in err
              ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
              : undefined;
          toast.error(message || 'خطا در ویرایش سطح دسترسی');
        },
      }
    );
  };

  const handleResetFilters = () => {
    setSearch('');
    setRoleFilter('');
    setStatusFilter('');
    setPage(1);
  };

  const usersList = data?.items || [];
  const totalCount = data?.total || 0;
  const totalPages = data?.total_pages || Math.ceil(totalCount / pageSize) || 1;

  return (
    <div className="flex flex-col gap-6 min-w-0 w-full" dir="rtl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-foreground">مدیریت کاربران و مشتریان</h1>
          <p className="text-xs text-muted-foreground font-semibold mt-1">
            مشاهده لیست کاربران، وضعیت فعال‌سازی و مدیریت دسترسی‌ها بر پایه TanStack Table
          </p>
        </div>
      </div>

      {/* TanStack Users Table */}
      <UsersTable
        data={usersList}
        isLoading={isLoading}
        totalCount={totalCount}
        totalPages={totalPages}
        currentPage={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setPage(1);
        }}
        searchQuery={search}
        onSearchChange={(query) => {
          setSearch(query);
          setPage(1);
        }}
        roleFilter={roleFilter}
        onRoleFilterChange={(newRole) => {
          setRoleFilter(newRole);
          setPage(1);
        }}
        statusFilter={statusFilter}
        onStatusFilterChange={(newStatus) => {
          setStatusFilter(newStatus);
          setPage(1);
        }}
        onResetFilters={handleResetFilters}
        isSuperAdmin={isSuperAdmin}
        onToggleStatus={handleToggleStatusClick}
        onEditRole={handleEditRoleClick}
      />

      {/* Role Change Modal (SUPER_ADMIN only) */}
      {selectedUserForRole && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setSelectedUserForRole(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-background border border-border/60 rounded-3xl p-6 max-w-sm w-full shadow-2xl flex flex-col gap-4 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-sm font-black text-foreground">تغییر سطح دسترسی کاربر</h2>
            <span className="text-xs font-bold text-muted-foreground">
              کاربر: <strong className="text-foreground font-black">{selectedUserForRole.name}</strong>
            </span>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-muted-foreground">نقش کاربری جدید</label>
              <select
                value={newRoleInput}
                onChange={(e) => setNewRoleInput(e.target.value)}
                className="rounded-xl border border-border bg-background px-3 py-2 text-xs font-bold text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="user">مشتری (User)</option>
                <option value="admin">مدیر سیستم (Admin)</option>
                <option value="superadmin">مدیر ارشد (Super Admin)</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedUserForRole(null)}
                className="rounded-xl text-xs cursor-pointer"
              >
                انصراف
              </Button>
              <Button
                size="sm"
                onClick={handleSaveRole}
                disabled={roleMutation.isPending}
                className="rounded-xl text-xs font-extrabold gap-1 cursor-pointer"
              >
                {roleMutation.isPending ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="size-3.5" />
                )}
                <span>ذخیره تغییرات</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Status Confirmation Modal */}
      <ConfirmModal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal({ isOpen: false, userId: '', userName: '', currentStatus: true })}
        onConfirm={handleConfirmToggleStatus}
        title={statusModal.currentStatus ? 'غیرفعال‌سازی کاربر' : 'فعال‌سازی کاربر'}
        variant={statusModal.currentStatus ? 'warning' : 'info'}
        confirmText={statusModal.currentStatus ? 'غیرفعال کن' : 'فعال کن'}
        isLoading={statusMutation.isPending}
        description={
          <span>
            آیا از {statusModal.currentStatus ? 'غیرفعال‌سازی' : 'فعال‌سازی'} حساب کاربر{' '}
            <strong className="text-foreground font-black">«{statusModal.userName}»</strong> اطمینان
            دارید؟
          </span>
        }
      />
    </div>
  );
}
