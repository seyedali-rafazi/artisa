'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { useResetPassword, useForgotPassword } from '@/hooks/useAuth';
import OTPInput from '@/components/auth/OTPInput';
import ResendTimer from '@/components/auth/ResendTimer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Mail,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  ShieldCheck,
} from 'lucide-react';

const resetPasswordSchema = z
  .object({
    email: z.string().email('آدرس ایمیل وارد شده معتبر نیست'),
    code: z.string().length(4, 'کد بازیابی باید ۴ رقم باشد'),
    newPassword: z.string().min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'رمز عبور جدید و تکرار آن یکسان نیستند',
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get('email') || '';

  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const resetMutation = useResetPassword();
  const forgotMutation = useForgotPassword();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: initialEmail,
      code: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const emailVal = watch('email');
  const codeVal = watch('code');

  const onSubmit = (data: ResetPasswordFormData) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    resetMutation.mutate(
      {
        email: data.email,
        code: data.code,
        new_password: data.newPassword,
      },
      {
        onSuccess: (res) => {
          setSuccessMessage('رمز عبور شما با موفقیت تغییر یافت! در حال انتقال به صفحه ورود...');
          setTimeout(() => {
            router.push('/login');
          }, 1200);
        },
        onError: (err: any) => {
          setErrorMessage(err?.message || 'کد وارد شده اشتباه یا منقضی شده است');
        },
      }
    );
  };

  const handleResendCode = () => {
    if (!emailVal) {
      setErrorMessage('لطفاً ایمیل خود را وارد کنید');
      return;
    }
    setErrorMessage(null);
    setSuccessMessage(null);

    forgotMutation.mutate(
      { email: emailVal },
      {
        onSuccess: (res) => {
          setSuccessMessage('کد بازیابی جدید به ایمیل شما ارسال شد');
        },
        onError: (err: any) => {
          setErrorMessage(err?.message || 'خطا در ارسال مجدد کد بازیابی');
        },
      }
    );
  };

  return (
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
          <Image
            src="/logo.png"
            alt="آرتیسا"
            width={200}
            height={200}
            className="h-20 w-auto object-contain mb-3"
            priority
          />
          <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
            تغییر و تنظیم رمز عبور جدید
          </h1>
          <p className="text-xs text-muted-foreground mt-1 font-semibold leading-relaxed">
            کد ۴ رقمی ارسال شده به ایمیل را وارد کرده و رمز عبور جدید خود را مشخص نمایید
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 rounded-xl bg-destructive/10 border border-destructive/30 p-3 text-xs font-bold text-destructive flex items-center gap-2 animate-fade-in">
            <AlertCircle className="size-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="size-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-foreground/80 flex items-center gap-1.5">
              <Mail className="size-3.5 text-primary" />
              <span>آدرس ایمیل</span>
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

          {/* 4-digit OTP Code Input */}
          <div className="flex flex-col items-center gap-2 my-2">
            <label className="text-xs font-bold text-muted-foreground">کد ۴ رقمی بازیابی</label>
            <OTPInput
              value={codeVal || ''}
              onChange={(val) => setValue('code', val, { shouldValidate: true })}
              disabled={resetMutation.isPending}
            />
            {errors.code && (
              <span className="text-[11px] font-semibold text-destructive">{errors.code.message}</span>
            )}
          </div>

          {/* New Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-foreground/80 flex items-center gap-1.5">
              <Lock className="size-3.5 text-primary" />
              <span>رمز عبور جدید</span>
            </label>
            <div className="relative">
              <Input
                {...register('newPassword')}
                type={showPassword ? 'text' : 'password'}
                placeholder="حداقل ۶ کاراکتر"
                className="rounded-xl pl-10 pr-3 py-2.5 text-xs sm:text-sm bg-muted/20 focus-visible:ring-primary"
                dir="ltr"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {errors.newPassword && (
              <span className="text-[11px] font-semibold text-destructive">
                {errors.newPassword.message}
              </span>
            )}
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-foreground/80 flex items-center gap-1.5">
              <Lock className="size-3.5 text-primary" />
              <span>تکرار رمز عبور جدید</span>
            </label>
            <Input
              {...register('confirmPassword')}
              type="password"
              placeholder="••••••••"
              className="rounded-xl px-3 py-2.5 text-xs sm:text-sm bg-muted/20 focus-visible:ring-primary"
              dir="ltr"
            />
            {errors.confirmPassword && (
              <span className="text-[11px] font-semibold text-destructive">
                {errors.confirmPassword.message}
              </span>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            size="lg"
            disabled={resetMutation.isPending}
            className="w-full rounded-2xl font-extrabold text-sm gap-2 cursor-pointer shadow-lg shadow-primary/25 mt-2"
          >
            {resetMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <CheckCircle2 className="size-4" />
            )}
            <span>{resetMutation.isPending ? 'در حال ثبت رمز عبور...' : 'ثبت رمز عبور جدید و ذخیره'}</span>
          </Button>
        </form>

        {/* Resend Cooldown Timer */}
        <div className="mt-6 pt-4 border-t border-border/40 text-center">
          <ResendTimer
            onResend={handleResendCode}
            disabled={forgotMutation.isPending || resetMutation.isPending}
          />
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-muted-foreground font-medium">
          <ShieldCheck className="size-4 text-primary" />
          <span>اطلاعات شما با رمزنگاری پیشرفته ذخیره می‌شود</span>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div dir="rtl" className="min-h-[85vh] flex items-center justify-center py-10 px-4 relative overflow-hidden">
      <div className="absolute -top-20 -right-20 size-80 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 size-80 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <Suspense fallback={<div className="text-center p-8">در حال بارگذاری...</div>}>
        <ResetPasswordContent />
      </Suspense>
    </div>
  );
}
