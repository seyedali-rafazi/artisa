'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAdminUsers, useUpdateUserStatus, useUpdateUserRole } from '@/hooks/useAdmin';
import { useUserProfile } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  Users,
  Eye,
  ShieldCheck,
  UserCheck,
  UserX,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const { data: currentUser } = useUserProfile();
  const isSuperAdmin = currentUser?.role === 'superadmin' || currentUser?.role === 'super_admin' || currentUser?.role === 'مدیر ارشد' || (currentUser as any)?.is_superuser;

  const { data, isLoading } = useAdminUsers({ page, limit: 10, search, role: roleFilter });
  const statusMutation = useUpdateUserStatus();
  const roleMutation = useUpdateUserRole();

  const [selectedUserForRole, setSelectedUserForRole] = useState<{ id: string; name: string; currentRole: string } | null>(null);
  const [newRoleInput, setNewRoleInput] = useState('admin');

  const handleToggleStatus = (userId: string, currentStatus: boolean) => {
    if (confirm(`آیا از ${currentStatus ? 'غیرفعال‌سازی' : 'فعال‌سازی'} این کاربر اطمینان دارید؟`)) {
      statusMutation.mutate({ userId, is_active: !currentStatus });
    }
  };

  const handleSaveRole = () => {
    if (!selectedUserForRole) return;
    roleMutation.mutate(
      { userId: selectedUserForRole.id, role: newRoleInput },
      {
        onSuccess: () => {
          setSelectedUserForRole(null);
        },
      }
    );
  };

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-foreground">مدیریت کاربران و مشتریان</h1>
        <p className="text-xs text-muted-foreground font-semibold mt-1">
          مشاهده لیست کاربران، وضعیت فعال‌سازی و مدیریت دسترسی‌ها
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-background/95 border border-border/60 p-4 rounded-3xl backdrop-blur-xl">
        <div className="relative flex-1 w-full">
          <Input
            type="text"
            placeholder="جستجوی نام یا آدرس ایمیل..."
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
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-xl border border-border bg-background px-3 py-2 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-48 cursor-pointer"
        >
          <option value="">همه نقش‌ها</option>
          <option value="user">مشتری (User)</option>
          <option value="admin">مدیر سیستم (Admin)</option>
          <option value="superadmin">مدیر ارشد (Super Admin)</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="rounded-3xl border border-border/60 bg-background/95 backdrop-blur-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="size-6 text-primary animate-spin" />
          </div>
        ) : !data || data.items.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center gap-2">
            <Users className="size-10 text-muted-foreground/40" />
            <span className="text-xs font-bold text-muted-foreground">هیچ کاربری یافت نشد.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-muted/40 border-b border-border/40 font-extrabold text-muted-foreground">
                <tr>
                  <th className="p-4">کاربر</th>
                  <th className="p-4">ایمیل</th>
                  <th className="p-4">نقش کاربری</th>
                  <th className="p-4">تعداد سفارشات</th>
                  <th className="p-4">مجموع خرید</th>
                  <th className="p-4">وضعیت حساب</th>
                  <th className="p-4 text-left">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-semibold">
                {data.items.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-3">
                      <div className="flex flex-col">
                        <span className="font-extrabold text-foreground">{u.name}</span>
                        {u.phone && <span className="text-[10px] text-muted-foreground dir-ltr text-right">{u.phone}</span>}
                      </div>
                    </td>
                    <td className="p-3 dir-ltr text-right text-muted-foreground font-mono">{u.email}</td>
                    <td className="p-3">
                      {u.role === 'superadmin' || u.role === 'super_admin' ? (
                        <span className="px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-500 font-bold text-[10px]">
                          مدیر ارشد
                        </span>
                      ) : u.role === 'admin' ? (
                        <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-500 font-bold text-[10px]">
                          مدیر سیستم
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-muted text-muted-foreground font-bold text-[10px]">
                          مشتری
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-bold">{u.total_orders.toLocaleString('fa-IR')} سفارش</td>
                    <td className="p-3 font-extrabold text-primary">
                      {u.total_spent.toLocaleString('fa-IR')} تومان
                    </td>
                    <td className="p-3">
                      {u.is_active ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 font-bold text-[10px]">
                          فعال
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-500 font-bold text-[10px]">
                          غیرفعال
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-left">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link href={`/admin/users/${u.id}`}>
                          <button
                            title="جزئیات کاربر"
                            className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                          >
                            <Eye className="size-4" />
                          </button>
                        </Link>

                        <button
                          title={u.is_active ? 'غیرفعال‌سازی کاربر' : 'فعال‌سازی کاربر'}
                          onClick={() => handleToggleStatus(u.id, u.is_active)}
                          className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-amber-500 transition-colors cursor-pointer"
                        >
                          {u.is_active ? <UserX className="size-4" /> : <UserCheck className="size-4" />}
                        </button>

                        {isSuperAdmin && (
                          <button
                            title="تغییر نقش کاربری"
                            onClick={() => {
                              setSelectedUserForRole({ id: u.id, name: u.name, currentRole: u.role });
                              setNewRoleInput(u.role === 'user' ? 'admin' : u.role);
                            }}
                            className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-violet-500 transition-colors cursor-pointer"
                          >
                            <ShieldCheck className="size-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Role Change Modal (SUPER_ADMIN only) */}
      {selectedUserForRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-background border border-border/60 rounded-3xl p-6 max-w-sm w-full shadow-2xl flex flex-col gap-4">
            <h2 className="text-sm font-black text-foreground">تغییر سطح دسترسی کاربر</h2>
            <span className="text-xs font-bold text-muted-foreground">
              کاربر: <strong className="text-foreground">{selectedUserForRole.name}</strong>
            </span>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-muted-foreground">نقش کاربری جدید</label>
              <select
                value={newRoleInput}
                onChange={(e) => setNewRoleInput(e.target.value)}
                className="rounded-xl border border-border bg-background px-3 py-2 text-xs font-bold text-foreground cursor-pointer"
              >
                <option value="user">مشتری (User)</option>
                <option value="admin">مدیر سیستم (Admin)</option>
                <option value="superadmin">مدیر ارشد (Super Admin)</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 mt-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedUserForRole(null)} className="rounded-xl text-xs">
                انصراف
              </Button>
              <Button
                size="sm"
                onClick={handleSaveRole}
                disabled={roleMutation.isPending}
                className="rounded-xl text-xs font-extrabold gap-1 cursor-pointer"
              >
                {roleMutation.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}
                <span>ذخیره تغییرات</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
