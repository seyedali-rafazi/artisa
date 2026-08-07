'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserProfile } from '@/hooks/useAuth';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { ShieldAlert, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: user, isLoading, isError } = useUserProfile();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-background gap-3" dir="rtl">
        <Loader2 className="size-8 text-primary animate-spin" />
        <span className="text-xs font-bold text-muted-foreground">در حال تایید سطح دسترسی پنل مدیریت...</span>
      </div>
    );
  }

  const isAdmin =
    user &&
    (user.role === 'admin' ||
      user.role === 'superadmin' ||
      user.role === 'super_admin' ||
      user.role === 'مدیر سیستم' ||
      user.role === 'مدیر ارشد' ||
      (user as any)?.is_superuser);

  if (isError || !user || !isAdmin) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-background p-6 text-center" dir="rtl">
        <div className="size-16 rounded-3xl bg-destructive/10 text-destructive flex items-center justify-center mb-4">
          <ShieldAlert className="size-8" />
        </div>
        <h1 className="text-xl font-black text-foreground mb-1">دسترسی غیرمجاز</h1>
        <p className="text-xs text-muted-foreground font-semibold max-w-sm mb-6">
          حساب کاربری شما دسترسی لازم برای استفاده از بخش مدیریت را ندارد.
        </p>
        <Button onClick={() => router.push('/')} className="rounded-2xl font-bold text-xs">
          بازگشت به فروشگاه
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 text-foreground flex" dir="rtl">
      {/* Sidebar */}
      <AdminSidebar collapsed={collapsed} onToggleCollapse={() => setCollapsed(!collapsed)} />

      {/* Main Content Area */}
      <div className={`flex-1 transition-all duration-300 flex flex-col ${collapsed ? 'mr-20' : 'mr-64'}`}>
        <AdminHeader />
        <main className="p-6 flex-1">{children}</main>
      </div>
    </div>
  );
}
