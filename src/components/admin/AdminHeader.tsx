'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useUserProfile, useLogout } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  User,
  LogOut,
  ShieldCheck,
  Menu,
} from 'lucide-react';

interface AdminHeaderProps {
  title?: string;
  onMobileMenuToggle?: () => void;
}

export default function AdminHeader({ title = 'پنل مدیریت', onMobileMenuToggle }: AdminHeaderProps) {
  const router = useRouter();
  const { data: user } = useUserProfile();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        router.push('/');
      },
    });
  };

  const roleTitle =
    user?.role === 'superadmin' || user?.role === 'super_admin' || (user as any)?.is_superuser
      ? 'مدیر ارشد (Super Admin)'
      : 'مدیر سیستم (Admin)';

  return (
    <header className="h-16 border-b border-border/60 bg-background/95 backdrop-blur-xl px-4 md:px-6 flex items-center justify-between sticky top-0 z-30" dir="rtl">
      {/* Title & Mobile Hamburger */}
      <div className="flex items-center gap-3">
        {onMobileMenuToggle && (
          <button
            onClick={onMobileMenuToggle}
            className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground md:hidden transition-colors cursor-pointer"
            aria-label="منوی مدیریت"
          >
            <Menu className="size-5" />
          </button>
        )}
        <h1 className="text-base sm:text-lg font-black text-foreground tracking-tight">{title}</h1>
      </div>

      {/* Admin Profile & Actions */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* User Info */}
        <div className="flex items-center gap-2.5 bg-muted/30 border border-border/40 px-2.5 py-1.5 rounded-2xl">
          <div className="flex size-7 sm:size-8 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold shrink-0">
            <User className="size-3.5 sm:size-4" />
          </div>
          <div className="flex flex-col text-right min-w-0">
            <span className="text-xs font-bold text-foreground truncate max-w-[100px] sm:max-w-none">
              {user?.name || 'کاربر مدیر'}
            </span>
            <span className="text-[9px] sm:text-[10px] text-primary font-bold flex items-center gap-1">
              <ShieldCheck className="size-3 shrink-0" />
              <span className="truncate">{roleTitle}</span>
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          className="rounded-xl font-bold text-xs gap-1.5 cursor-pointer hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 px-3"
        >
          <LogOut className="size-3.5" />
          <span className="hidden sm:inline">خروج</span>
        </Button>
      </div>
    </header>
  );
}
