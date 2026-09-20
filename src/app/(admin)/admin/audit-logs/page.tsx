'use client';

import React, { useState } from 'react';
import { useAuditLogs } from '@/hooks/useAdmin';
import { useUserProfile } from '@/hooks/useAuth';
import { useDebounce } from '@/hooks/useDebounce';
import AuditLogsTable from '@/components/admin/audit-logs/AuditLogsTable';
import { Button } from '@/components/ui/button';
import { toPersianDigits } from '@/lib/utils';
import {
  FileText,
  ShieldAlert,
  Shield,
  RefreshCw,
  Activity,
  History,
} from 'lucide-react';

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 350);
  const [actionFilter, setActionFilter] = useState('all');
  const [sortBy, setSortBy] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<string>('');

  const { data: currentUser } = useUserProfile();
  const isSuperAdmin =
    currentUser?.role === 'super_admin' ||
    currentUser?.role === 'superadmin' ||
    (currentUser as any)?.is_superuser;

  const { data, isLoading, refetch, isFetching } = useAuditLogs({
    page,
    limit: pageSize,
    search: debouncedSearch.trim() || undefined,
    action: actionFilter !== 'all' ? actionFilter : undefined,
    sort_by: sortBy || undefined,
    sort_order: sortOrder || undefined,
  });

  const logs = data?.items || [];
  const total = data?.total || 0;
  const totalPages = data?.total_pages || 1;

  const handleResetFilters = () => {
    setSearch('');
    setActionFilter('all');
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
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-foreground flex items-center gap-2.5">
            <div className="size-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <History className="size-5" />
            </div>
            <span>لاگ‌های امنیتی و عملیاتی</span>
          </h1>
          <p className="text-xs text-muted-foreground font-semibold mt-1">
            مشاهده، مرتب‌سازی، مدیریت ستون‌ها و مانیتورینگ کلیه رخدادها و تغییرات حساس مدیران
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
          <span>بروزرسانی لاگ‌ها</span>
        </Button>
      </div>

      {/* ─── Metric Stat Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Logs */}
        <div className="rounded-3xl border border-border/60 bg-background/95 backdrop-blur-xl p-4 flex items-center gap-4 shadow-xs">
          <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <FileText className="size-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground font-bold">کل رخدادهای ثبت‌شده</span>
            <span className="text-xl font-black text-foreground">
              {toPersianDigits(total)} رخداد
            </span>
          </div>
        </div>

        {/* Current Page Logs */}
        <div className="rounded-3xl border border-border/60 bg-background/95 backdrop-blur-xl p-4 flex items-center gap-4 shadow-xs">
          <div className="size-12 rounded-2xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
            <Activity className="size-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground font-bold">رخدادهای این صفحه</span>
            <span className="text-xl font-black text-violet-600 dark:text-violet-400">
              {toPersianDigits(logs.length)} مورد
            </span>
          </div>
        </div>

        {/* Superadmin Status */}
        <div className="rounded-3xl border border-border/60 bg-background/95 backdrop-blur-xl p-4 flex items-center gap-4 shadow-xs">
          <div className="size-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Shield className="size-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground font-bold">سطح نظارت امنیتی</span>
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
              فعال و برخط
            </span>
          </div>
        </div>
      </div>

      {/* ─── Audit Logs Table Component ─── */}
      <AuditLogsTable
        data={logs}
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
        actionFilter={actionFilter}
        onActionFilterChange={(act) => {
          setActionFilter(act);
          setPage(1);
        }}
        onResetFilters={handleResetFilters}
        onSortChange={handleSortChange}
      />
    </div>
  );
}
