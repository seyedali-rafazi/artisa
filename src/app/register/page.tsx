'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { useRegister, useVerifyEmail, useResendVerification } from '@/hooks/useAuth';
import OTPInput from '@/components/auth/OTPInput';
import ResendTimer from '@/components/auth/ResendTimer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  User,
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

const registerSchema = z
  .object({
    name: z.string().min(2, 'نام و نام خانوادگی باید حداقل ۲ کاراکتر باشد'),
    email: z.string().email('آدرس ایمیل وارد شده معتبر نیست'),
    phone: z.string().optional(),
    password: z.string().min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'رمز عبور و تکرار آن یکسان نیستند',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const registerMutation = useRegister();
  const verifyMutation = useVerifyEmail();
  const resendMutation = useResendVerification();

  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [isOtpStep, setIsOtpStep] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onRegisterSubmit = (data: RegisterFormData) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    registerMutation.mutate(
      {
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone || undefined,
      },
      {
        onSuccess: () => {
          setRegisteredEmail(data.email);
          setSuccessMessage('کد تایید ۴ رقمی به ایمیل شما ارسال شد.');
          setIsOtpStep(true);
        },
        onError: (err: any) => {
          setErrorMessage(err?.message || 'خطا در ثبت‌نام. ممکن است ایمیل قبلاً ثبت شده باشد.');
        },
      }
    );
  };

  const onOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!otpCode || otpCode.length !== 4) {
      setErrorMessage('لطفاً کد تایید ۴ رقمی را وارد کنید');
      return;
    }

    verifyMutation.mutate(
      { email: registeredEmail.trim(), code: otpCode },
      {
        onSuccess: () => {
          setSuccessMessage('ایمیل شما با موفقیت تایید شد! در حال انتقال به پروفایل...');
          setTimeout(() => {
            router.push('/profile');
          }, 800);
        },
        onError: (err: any) => {
          setErrorMessage(err?.message || 'کد تایید وارد شده اشتباه است');
        },
      }
    );
  };

  const handleResendCode = () => {
    if (!registeredEmail) return;
    setErrorMessage(null);
    setSuccessMessage(null);

    resendMutation.mutate(
      { email: registeredEmail.trim() },
      {
        onSuccess: (res) => {
          setSuccessMessage(res?.message || 'کد تایید جدید به ایمیل شما ارسال شد.');
        },
        onError: (err: any) => {
          setErrorMessage(err?.message || 'خطا در ارسال مجدد کد تایید.');
        },
      }
    );
  };

  const isPending = registerMutation.isPending || verifyMutation.isPending || resendMutation.isPending;

  return (
    <div dir="rtl" className="min-h-[85vh] flex items-center justify-center py-10 px-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute -top-20 -right-20 size-80 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 size-80 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary transition-colors mb-6 cursor-pointer"
        >
          <ArrowRight className="size-4" />
          <span>بازگشت به صفحه اصلی</span>
        </Link>

        {/* Card Container */}
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
              {isOtpStep ? 'تایید آدرس ایمیل' : 'ایجاد حساب کاربری جدید'}
            </h1>
            <p className="text-xs text-muted-foreground mt-1 font-semibold">
              {isOtpStep
                ? 'کد تایید ۴ رقمی ارسال شده به ایمیل خود را وارد کنید'
                : 'مشخصات خود را وارد کنید تا کد تایید به ایمیل شما ارسال شود'}
            </p>
            {isOtpStep && registeredEmail && (
              <span className="inline-block mt-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-bold dir-ltr" dir="ltr">
                {registeredEmail}
              </span>
            )}
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

          {/* STEP 2: OTP View */}
          {isOtpStep ? (
            <form onSubmit={onOtpSubmit} className="flex flex-col gap-6 animate-scale-up">
              <div className="flex flex-col items-center gap-3">
                <label className="text-xs font-bold text-muted-foreground">کد ۴ رقمی تایید</label>
                <OTPInput
                  value={otpCode}
                  onChange={(val) => setOtpCode(val)}
                  disabled={isPending}
                />
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={isPending || otpCode.length !== 4}
                className="w-full rounded-2xl font-extrabold text-sm gap-2 cursor-pointer shadow-lg shadow-primary/25"
              >
                {verifyMutation.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="size-4" />
                )}
                <span>{verifyMutation.isPending ? 'در حال اعتبارسنجی...' : 'تایید ایمیل و ورود'}</span>
              </Button>

              <div className="text-center border-t border-border/40 pt-4">
                <ResendTimer onResend={handleResendCode} disabled={isPending} />
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsOtpStep(false);
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="text-xs text-muted-foreground hover:text-foreground font-semibold text-center cursor-pointer"
              >
                ویرایش اطلاعات / بازگشت
              </button>
            </form>
          ) : (
            /* STEP 1: Registration Form */
            <form onSubmit={handleSubmit(onRegisterSubmit)} className="flex flex-col gap-4">
              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-foreground/80 flex items-center gap-1.5">
                  <User className="size-3.5 text-primary" />
                  <span>نام و نام خانوادگی</span>
                </label>
                <Input
                  {...register('name')}
                  type="text"
                  placeholder="مثال: علی رضایی"
                  className="rounded-xl px-3 py-2.5 text-xs sm:text-sm bg-muted/20 focus-visible:ring-primary"
                  dir="rtl"
                />
                {errors.name && (
                  <span className="text-[11px] font-semibold text-destructive">{errors.name.message}</span>
                )}
              </div>

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

              {/* Phone (Optional) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-foreground/80 flex items-center gap-1.5">
                  <Phone className="size-3.5 text-primary" />
                  <span>شماره موبایل (اختیاری)</span>
                </label>
                <Input
                  {...register('phone')}
                  type="tel"
                  placeholder="09121234567"
                  className="rounded-xl px-3 py-2.5 text-xs sm:text-sm bg-muted/20 focus-visible:ring-primary"
                  dir="ltr"
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-foreground/80 flex items-center gap-1.5">
                  <Lock className="size-3.5 text-primary" />
                  <span>رمز عبور</span>
                </label>
                <div className="relative">
                  <Input
                    {...register('password')}
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
                {errors.password && (
                  <span className="text-[11px] font-semibold text-destructive">{errors.password.message}</span>
                )}
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-foreground/80 flex items-center gap-1.5">
                  <Lock className="size-3.5 text-primary" />
                  <span>تکرار رمز عبور</span>
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

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                disabled={registerMutation.isPending}
                className="w-full rounded-2xl font-extrabold text-sm gap-2 cursor-pointer shadow-lg shadow-primary/25 mt-2"
              >
                {registerMutation.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Sparkles className="size-4" />
                )}
                <span>{registerMutation.isPending ? 'در حال دریافت کد تایید...' : 'ثبت‌نام و دریافت کد تایید'}</span>
              </Button>
            </form>
          )}

          {/* Footer Link */}
          {!isOtpStep && (
            <div className="text-center text-xs text-muted-foreground border-t border-border/40 pt-4 mt-6">
              <span>قبلاً ثبت‌نام کرده‌اید؟ </span>
              <Link href="/login" className="text-primary font-bold hover:underline">
                ورود به حساب کاربری
              </Link>
            </div>
          )}

          <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-muted-foreground font-medium">
            <ShieldCheck className="size-4 text-primary" />
            <span>اطلاعات شما با رمزنگاری پیشرفته محافظت می‌شود</span>
          </div>
        </div>
      </div>
    </div>
  );
}
