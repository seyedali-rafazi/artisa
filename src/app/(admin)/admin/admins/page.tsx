'use client';

import React, { useState } from 'react';
import { useAdminList, useCreateAdmin, useDeleteAdmin } from '@/hooks/useAdmin';
import { useUserProfile } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ShieldCheck,
  Plus,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
} from 'lucide-react';

import ConfirmModal from '@/components/ui/ConfirmModal';

export default function AdminsManagementPage() {
  const { data: currentUser } = useUserProfile();
  
  const isSuperAdmin = currentUser?.role === 'super_admin' || currentUser?.role === 'superadmin' || (currentUser as any)?.is_superuser;

  const { data: admins, isLoading } = useAdminList();
  const createAdminMutation = useCreateAdmin();
  const deleteAdminMutation = useDeleteAdmin();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(null);

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    adminId: string;
    adminName: string;
  }>({
    isOpen: false,
    adminId: '',
    adminName: '',
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name || !email || !password) return;

    createAdminMutation.mutate(
      { name, email, password, role },
      {
        onSuccess: () => {
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

  const handleDeleteAdminClick = (adminId: string, adminName: string) => {
    setDeleteErrorMessage(null);
    setDeleteModal({ isOpen: true, adminId, adminName });
  };

  const handleConfirmDeleteAdmin = () => {
    if (!deleteModal.adminId) return;
    setDeleteErrorMessage(null);
    deleteAdminMutation.mutate(deleteModal.adminId, {
      onSuccess: () => {
        setDeleteModal({ isOpen: false, adminId: '', adminName: '' });
      },
      onError: (err: any) => {
        setDeleteErrorMessage(err?.message || 'امکان حذف این مدیر وجود ندارد.');
      },
    });
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-foreground">مدیریت مدیران سیستم</h1>
          <p className="text-xs text-muted-foreground font-semibold mt-1">
            تعریف مدیر جدید، تعیین سطوح دسترسی و مدیریت تیم مدیریت
          </p>
        </div>

        <Button
          onClick={() => setShowCreateModal(true)}
          className="rounded-2xl font-extrabold text-xs gap-2 cursor-pointer shadow-lg shadow-primary/25"
        >
          <Plus className="size-4" />
          <span>افزودن مدیر جدید</span>
        </Button>
      </div>

      {/* Admins Table */}
      <div className="rounded-2xl sm:rounded-3xl border border-border/60 bg-background/95 backdrop-blur-xl shadow-sm min-w-0 overflow-hidden">
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="size-6 text-primary animate-spin" />
          </div>
        ) : !admins || admins.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center gap-2">
            <ShieldCheck className="size-10 text-muted-foreground/40" />
            <span className="text-xs font-bold text-muted-foreground">هیچ مدیری تعریف نشده است.</span>
          </div>
        ) : (
          <div className="overflow-x-auto overscroll-x-contain">
            <table className="w-full min-w-[640px] text-right text-xs">
              <thead className="bg-muted/40 border-b border-border/40 font-extrabold text-muted-foreground">
                <tr>
                  <th className="p-3 sm:p-4 whitespace-nowrap">نام مدیر</th>
                  <th className="p-3 sm:p-4 whitespace-nowrap">ایمیل</th>
                  <th className="p-3 sm:p-4 whitespace-nowrap">سطح دسترسی</th>
                  <th className="p-3 sm:p-4 whitespace-nowrap">وضعیت</th>
                  <th className="p-3 sm:p-4 text-left whitespace-nowrap">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-semibold">
                {admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-3 font-extrabold text-foreground whitespace-nowrap">{admin.name}</td>
                    <td className="p-3 dir-ltr text-right text-muted-foreground font-mono whitespace-nowrap">{admin.email}</td>
                    <td className="p-3 whitespace-nowrap">
                      {admin.role === 'superadmin' || admin.role === 'super_admin' ? (
                        <span className="px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-500 font-bold text-[10px]">
                          مدیر ارشد (Super Admin)
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-500 font-bold text-[10px]">
                          مدیر سیستم (Admin)
                        </span>
                      )}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 font-bold text-[10px]">
                        فعال
                      </span>
                    </td>
                    <td className="p-3 text-left whitespace-nowrap">
                      <button
                        title="حذف مدیر"
                        onClick={() => handleDeleteAdminClick(admin.id, admin.name)}
                        disabled={deleteAdminMutation.isPending}
                        className="p-1.5 rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Admin Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-background border border-border/60 rounded-3xl p-6 max-w-sm w-full shadow-2xl flex flex-col gap-4">
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

      {/* Delete Admin Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => {
          setDeleteModal({ isOpen: false, adminId: '', adminName: '' });
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
              آیا از حذف حساب مدیر <strong className="text-foreground font-black">«{deleteModal.adminName}»</strong> اطمینان دارید؟
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
