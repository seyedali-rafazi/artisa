'use client';

import React, { useState } from 'react';
import { useAuditLogs } from '@/hooks/useAdmin';
import { useUserProfile } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import {
  FileText,
  Search,
  Loader2,
  ShieldAlert,
  Clock,
} from 'lucide-react';

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data: currentUser } = useUserProfile();
  const isSuperAdmin = currentUser?.role === 'super_admin' || currentUser?.role === 'مدیر ارشد' || (currentUser as any)?.is_superuser;

  const { data, isLoading } = useAuditLogs({ page, limit: 20, search });

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
    <div className="flex flex-col gap-6" dir="rtl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-foreground">لاگ‌های امنیتی و عملیاتی</h1>
        <p className="text-xs text-muted-foreground font-semibold mt-1">
          مشاهده کلیه رخدادها، تغییرات حسّاس و فعالیت‌های مدیران در سیستم
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-3 bg-background/95 border border-border/60 p-4 rounded-3xl backdrop-blur-xl">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="جستجوی ایمیل مدیر، نوع عملیات یا منبع..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="rounded-xl pr-9 text-xs"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-3xl border border-border/60 bg-background/95 backdrop-blur-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="size-6 text-primary animate-spin" />
          </div>
        ) : !data || data.items.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center gap-2">
            <FileText className="size-10 text-muted-foreground/40" />
            <span className="text-xs font-bold text-muted-foreground">هیچ رخدادی ثبت نشده است.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-muted/40 border-b border-border/40 font-extrabold text-muted-foreground">
                <tr>
                  <th className="p-4">زمان ثبت</th>
                  <th className="p-4">مدیر مجری</th>
                  <th className="p-4">نوع عملیات</th>
                  <th className="p-4">منبع / شناسه</th>
                  <th className="p-4">جزئیات تغییرات</th>
                  <th className="p-4">IP کاربر</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-semibold">
                {data.items.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-3 text-muted-foreground font-mono text-[11px] shrink-0">
                      {new Date(log.created_at).toLocaleString('fa-IR')}
                    </td>
                    <td className="p-3">
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground">{log.user_email}</span>
                        <span className="text-[10px] text-primary font-bold">{log.user_role}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-lg bg-primary/10 text-primary font-mono text-[10px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-muted-foreground">{log.resource}</td>
                    <td className="p-3">
                      <pre className="text-[10px] font-mono text-muted-foreground bg-muted/40 p-1.5 rounded-lg max-w-xs overflow-x-auto">
                        {JSON.stringify(log.details)}
                      </pre>
                    </td>
                    <td className="p-3 text-muted-foreground font-mono text-[11px] dir-ltr text-right">
                      {log.ip_address || '127.0.0.1'}
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
