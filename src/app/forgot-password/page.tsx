'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { useForgotPassword } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Mail,
  ArrowRight,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
} from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().email('آدرس ایمیل وارد شده معتبر نیست'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const forgotPasswordMutation = useForgotPassword();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    setErrorMessage(null);
    forgotPasswordMutation.mutate(
      { email: data.email },
      {
        onSuccess: (res) => {
          // Redirect to /reset-password with email query parameter
          router.push(`/reset-password?email=${encodeURIComponent(data.email)}`);
        },
        onError: (err: any) => {
          setErrorMessage(err?.message || 'خطا در ثبت درخواست بازیابی رمز عبور');
        },
      }
    );
  };

  return (
    <div dir="rtl" className="min-h-[85vh] flex items-center justify-center py-10 px-4 relative overflow-hidden">
      <div className="absolute -top-20 -right-20 size-80 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 size-80 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Back Link */}
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary transition-colors mb-6 cursor-pointer"
        >
          <ArrowRight className="size-4" />
          <span>بازگشت به صفحه ورود</span>
        </Link>

        {/* Card */}
        <div className="rounded-3xl border border-border/60 bg-background/95 backdrop-blur-xl p-6 sm:p-8 shadow-2xl transition-all duration-300">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3">
              <KeyRound className="size-7" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              فراموشی رمز عبور
            </h1>
            <p className="text-xs text-muted-foreground mt-1 font-semibold leading-relaxed">
              آدرس ایمیل خود را وارد کنید تا کد ۴ رقمی بازیابی رمز عبور برای شما ارسال شود
            </p>
          </div>

          {errorMessage && (
            <div className="mb-4 rounded-xl bg-destructive/10 border border-destructive/30 p-3 text-xs font-bold text-destructive flex items-center gap-2 animate-fade-in">
              <AlertCircle className="size-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-foreground/80 flex items-center gap-1.5">
                <Mail className="size-3.5 text-primary" />
                <span>آدرس ایمیل حساب کاربری</span>
              </label>
              <Input
                {...register('email')}
                type="email"
                placeholder="name@example.com"
                className="rounded-xl px-3 py-2.5 text-xs sm:text-sm bg-muted/20 focus-visible:ring-primary"
                dir="ltr"
              />
              {errors.email && (
                <span className="text-[11px] font-semibold text-destructive">{errors.email.message}</span>
              )}
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={forgotPasswordMutation.isPending}
              className="w-full rounded-2xl font-extrabold text-sm gap-2 cursor-pointer shadow-lg shadow-primary/25 mt-2"
            >
              {forgotPasswordMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <KeyRound className="size-4" />
              )}
              <span>
                {forgotPasswordMutation.isPending ? 'در حال ارسال کد...' : 'ارسال کد بازیابی رمز عبور'}
              </span>
            </Button>
          </form>

          {/* Security note */}
          <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-center gap-2 text-[10px] text-muted-foreground font-medium">
            <ShieldCheck className="size-4 text-primary" />
            <span>کد بازیابی به صورت یک‌بار مصرف به ایمیل شما ارسال می‌شود</span>
          </div>
        </div>
      </div>
    </div>
  );
}
