'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useVerifyEmail, useResendVerification } from '@/hooks/useAuth';
import OTPInput from '@/components/auth/OTPInput';
import ResendTimer from '@/components/auth/ResendTimer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Mail,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
} from 'lucide-react';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get('email') || '';

  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const verifyMutation = useVerifyEmail();
  const resendMutation = useResendVerification();

  const handleVerifySubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim()) {
      setErrorMessage('لطفاً آدرس ایمیل خود را وارد کنید');
      return;
    }

    if (code.length !== 4) {
      setErrorMessage('لطفاً کد تایید ۴ رقمی را به طور کامل وارد کنید');
      return;
    }

    verifyMutation.mutate(
      { email: email.trim(), code },
      {
        onSuccess: (data) => {
          setSuccessMessage('ایمیل شما با موفقیت تایید شد! در حال انتقال...');
          setTimeout(() => {
            router.push('/profile');
          }, 1000);
        },
        onError: (err: any) => {
          setErrorMessage(err?.message || 'کد تایید وارد شده اشتباه است');
        },
      }
    );
  };

  const handleResendCode = () => {
    if (!email.trim()) {
      setErrorMessage('لطفاً آدرس ایمیل خود را وارد کنید');
      return;
    }
    setErrorMessage(null);
    setSuccessMessage(null);

    resendMutation.mutate(
      { email: email.trim() },
      {
        onSuccess: (res) => {
          setSuccessMessage(res?.message || 'کد تایید جدید به ایمیل شما ارسال شد');
        },
        onError: (err: any) => {
          setErrorMessage(err?.message || 'خطا در ارسال مجدد کد تایید');
        },
      }
    );
  };

  return (
    <div className="w-full max-w-md relative z-10">
      {/* Back Link */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary transition-colors mb-6 cursor-pointer"
      >
        <ArrowRight className="size-4" />
        <span>بازگشت به صفحه اصلی</span>
      </Link>

      {/* Card */}
      <div className="rounded-3xl border border-border/60 bg-background/95 backdrop-blur-xl p-6 sm:p-8 shadow-2xl transition-all duration-300">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3">
            <Mail className="size-7" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
            تایید آدرس ایمیل
          </h1>
          <p className="text-xs text-muted-foreground mt-1 font-semibold leading-relaxed">
            کد تایید ۴ رقمی ارسال شده به ایمیل خود را وارد کنید
          </p>
          {email && (
            <span className="inline-block mt-2 px-3 py-1 rounded-full bg-muted text-[11px] font-bold text-primary dir-ltr" dir="ltr">
              {email}
            </span>
          )}
        </div>

        {/* Feedback Messages */}
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
        <form onSubmit={handleVerifySubmit} className="flex flex-col gap-6">
          {!initialEmail && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-foreground/80">آدرس ایمیل</label>
              <Input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-xl px-3 py-2.5 text-xs sm:text-sm bg-muted/20"
                dir="ltr"
              />
            </div>
          )}

          {/* 4-Digit OTP Input */}
          <div className="flex flex-col items-center gap-3">
            <label className="text-xs font-bold text-muted-foreground">کد ۴ رقمی را وارد کنید</label>
            <OTPInput
              value={code}
              onChange={(val) => {
                setCode(val);
                if (val.length === 4) {
                  // Auto submit when 4 digits entered
                  setErrorMessage(null);
                }
              }}
              disabled={verifyMutation.isPending}
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            disabled={verifyMutation.isPending || code.length !== 4}
            className="w-full rounded-2xl font-extrabold text-sm gap-2 cursor-pointer shadow-lg shadow-primary/25"
          >
            {verifyMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <CheckCircle2 className="size-4" />
            )}
            <span>{verifyMutation.isPending ? 'در حال اعتبارسنجی...' : 'تایید ایمیل و ورود'}</span>
          </Button>
        </form>

        {/* Resend Cooldown Timer */}
        <div className="mt-6 pt-4 border-t border-border/40 text-center">
          <ResendTimer
            onResend={handleResendCode}
            disabled={resendMutation.isPending || verifyMutation.isPending}
          />
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-muted-foreground font-medium">
          <ShieldCheck className="size-4 text-primary" />
          <span>کد تایید تا ۱۰ دقیقه دیگر معتبر است</span>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div dir="rtl" className="min-h-[85vh] flex items-center justify-center py-10 px-4 relative overflow-hidden">
      <div className="absolute -top-20 -right-20 size-80 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 size-80 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <Suspense fallback={<div className="text-center p-8">در حال بارگذاری...</div>}>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
