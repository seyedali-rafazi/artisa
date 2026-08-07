'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUserProfile, useLogout } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  User,
  LogOut,
  ShieldCheck,
  Bell,
  Search,
} from 'lucide-react';

interface AdminHeaderProps {
  title?: string;
}

export default function AdminHeader({ title = 'پنل مدیریت' }: AdminHeaderProps) {
  const router = useRouter();
  const { data: user } = useUserProfile();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        router.push('/login');
      },
    });
  };

  const roleTitle =
    user?.role === 'superadmin' || user?.role === 'super_admin' || (user as any)?.is_superuser
      ? 'مدیر ارشد (Super Admin)'
      : 'مدیر سیستم (Admin)';

  return (
    <header className="h-16 border-b border-border/60 bg-background/95 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-30" dir="rtl">
      {/* Title / Search */}
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-black text-foreground tracking-tight">{title}</h1>
      </div>

      {/* Admin Profile & Actions */}
      <div className="flex items-center gap-4">
        {/* User Info */}
        <div className="flex items-center gap-3 bg-muted/30 border border-border/40 px-3 py-1.5 rounded-2xl">
          <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold">
            <User className="size-4" />
          </div>
          <div className="flex flex-col text-right">
            <span className="text-xs font-bold text-foreground">{user?.name || 'کاربر مدیر'}</span>
            <span className="text-[10px] text-primary font-bold flex items-center gap-1">
              <ShieldCheck className="size-3" />
              {roleTitle}
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          className="rounded-xl font-bold text-xs gap-1.5 cursor-pointer hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
        >
          <LogOut className="size-3.5" />
          <span>خروج</span>
        </Button>
      </div>
    </header>
  );
}
