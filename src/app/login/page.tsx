"use client"

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useLogin, useRegister, useGoogleLoginAuth, useVerifyEmail, useResendVerification } from "@/hooks/useAuth"
import GoogleLoginButton from "@/components/auth/GoogleLoginButton"
import OTPInput from "@/components/auth/OTPInput"
import ResendTimer from "@/components/auth/ResendTimer"
import { CredentialResponse } from "@react-oauth/google"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  ShieldCheck,
  Loader2
} from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const loginMutation = useLogin()
  const registerMutation = useRegister()
  const googleAuthMutation = useGoogleLoginAuth()
  const verifyMutation = useVerifyEmail()
  const resendMutation = useResendVerification()

  const [isSignup, setIsSignup] = useState(false)
  const [isOtpStep, setIsOtpStep] = useState(false)
  const [otpCode, setOtpCode] = useState("")

  const [showPassword, setShowPassword] = useState(false)

  // Form states
  const [loginIdentifier, setLoginIdentifier] = useState("")
  const [loginPassword, setLoginPassword] = useState("")

  const [signupUsername, setSignupUsername] = useState("")
  const [signupEmail, setSignupEmail] = useState("")
  const [signupPhone, setSignupPhone] = useState("")
  const [signupPassword, setSignupPassword] = useState("")

  const [errorMsg, setErrorMsg] = useState("")
  const [successMsg, setSuccessMsg] = useState("")

  const isPending = loginMutation.isPending || registerMutation.isPending || googleAuthMutation.isPending || verifyMutation.isPending

  const handleRedirect = (res: any) => {
    const user = res?.user || res?.data?.user || res?.data || res;
    const role = (user?.role || '').toLowerCase();
    const isSuperUser = Boolean(user?.is_superuser);

    if (role === 'admin' || role === 'superadmin' || role === 'super_admin' || isSuperUser) {
      router.push('/admin/dashboard');
    } else {
      router.push('/profile');
    }
  };

  const handleGoogleSuccess = (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      setErrorMsg("توکن گوگلی دریافت نشد")
      return
    }
    setErrorMsg("")
    setSuccessMsg("")
    googleAuthMutation.mutate(credentialResponse.credential, {
      onSuccess: (res: any) => {
        setSuccessMsg("ورود با موفقیت انجام شد. در حال انتقال...")
        setTimeout(() => {
          handleRedirect(res)
        }, 600)
      },
      onError: (err: any) => {
        setErrorMsg(err?.message || "خطا در ورود با گوگل")
      },
    })
  }

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg("")
    setSuccessMsg("")

    if (!loginIdentifier.trim() || !loginPassword.trim()) {
      setErrorMsg("لطفاً تمامی فیلدها را پر کنید.")
      return
    }

    loginMutation.mutate(
      { email: loginIdentifier.trim(), password: loginPassword },
      {
        onSuccess: (res: any) => {
          setSuccessMsg("ورود با موفقیت انجام شد. در حال انتقال...")
          setTimeout(() => {
            handleRedirect(res)
          }, 600)
        },
        onError: (err: any) => {
          const detail = err?.data?.detail;
          if (detail?.requires_verification || err?.data?.requires_verification) {
            const unverifiedEmail = detail?.email || err?.data?.email || loginIdentifier.trim();
            setSignupEmail(unverifiedEmail);
            setIsSignup(true);
            setIsOtpStep(true);
            setErrorMsg("حساب شما هنوز تایید نشده است. لطفاً کد تایید ۴ رقمی را وارد نمایید.");
          } else {
            setErrorMsg(err?.message || "ایمیل یا رمز عبور اشتباه است");
          }
        },
      }
    )
  }

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg("")
    setSuccessMsg("")

    if (!signupUsername.trim() || !signupEmail.trim() || !signupPassword.trim()) {
      setErrorMsg("لطفاً تمامی فیلدهای الزامی ثبت‌نام را تکمیل کنید.")
      return
    }

    if (signupPassword.length < 6) {
      setErrorMsg("رمز عبور باید حداقل ۶ کاراکتر باشد.")
      return
    }

    registerMutation.mutate(
      {
        name: signupUsername.trim(),
        email: signupEmail.trim(),
        password: signupPassword,
        phone: signupPhone.trim() || undefined,
      },
      {
        onSuccess: () => {
          setSuccessMsg("کد تایید ۴ رقمی به ایمیل شما ارسال شد.")
          setIsOtpStep(true)
        },
        onError: (err: any) => {
          setErrorMsg(err?.message || "خطا در ثبت‌نام. ممکن است ایمیل قبلا ثبت شده باشد.")
        },
      }
    )
  }

  const handleOtpVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg("")
    setSuccessMsg("")

    if (!otpCode || otpCode.length !== 4) {
      setErrorMsg("لطفاً کد ۴ رقمی تایید را به طور کامل وارد کنید.")
      return
    }

    const targetEmail = signupEmail || loginIdentifier

    verifyMutation.mutate(
      { email: targetEmail.trim(), code: otpCode },
      {
        onSuccess: (res: any) => {
          setSuccessMsg("ایمیل شما با موفقیت تایید شد! در حال انتقال...")
          setTimeout(() => {
            handleRedirect(res)
          }, 600)
        },
        onError: (err: any) => {
          setErrorMsg(err?.message || "کد تایید وارد شده اشتباه است.")
        },
      }
    )
  }

  const handleResendCode = () => {
    const targetEmail = signupEmail || loginIdentifier
    if (!targetEmail) return
    setErrorMsg("")
    setSuccessMsg("")

    resendMutation.mutate(
      { email: targetEmail.trim() },
      {
        onSuccess: (res) => {
          setSuccessMsg(res?.message || "کد تایید جدید به ایمیل شما ارسال شد.")
        },
        onError: (err: any) => {
          setErrorMsg(err?.message || "خطا در ارسال مجدد کد تایید.")
        },
      }
    )
  }

  return (
    <div dir="rtl" className="min-h-[85vh] flex items-center justify-center py-10 px-4 relative overflow-hidden">
      {/* Background Decorative Blur Orbs */}
      <div className="absolute -top-20 -right-20 size-80 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 size-80 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Back to Home Link */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary transition-colors mb-6 cursor-pointer"
        >
          <ArrowRight className="size-4" />
          <span>بازگشت به صفحه اصلی</span>
        </Link>

        {/* Auth Card Container */}
        <div className="rounded-3xl border border-border/60 bg-background/95 backdrop-blur-xl p-6 sm:p-8 shadow-2xl transition-all duration-300">
          
          {/* Logo & Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <Image
              src="/logo.png"
              alt="آرتیسا"
              width={200}
              height={200}
              className="h-24 w-auto object-contain mb-4"
              priority
            />
            <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              {isOtpStep
                ? "تایید آدرس ایمیل"
                : isSignup
                ? "عضویت در آرتیسا"
                : "ورود به حساب کاربری"}
            </h1>
            <p className="text-xs text-muted-foreground mt-1 font-semibold">
              {isOtpStep
                ? "کد تایید ۴ رقمی ارسال شده به ایمیل خود را وارد کنید"
                : isSignup 
                ? "جهت ثبت سفارش و دسترسی به امکانات، ثبت‌نام کنید" 
                : "خوش آمدید! لطفا اطلاعات ورود خود را وارد نمایید"}
            </p>
            {isOtpStep && (signupEmail || loginIdentifier) && (
              <span className="inline-block mt-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-bold dir-ltr" dir="ltr">
                {signupEmail || loginIdentifier}
              </span>
            )}
          </div>

          {/* Tab Switcher (Only visible if not in OTP step) */}
          {!isOtpStep && (
            <div className="grid grid-cols-2 rounded-2xl bg-muted/40 p-1 mb-6 border border-border/40">
              <button
                type="button"
                onClick={() => { setIsSignup(false); setErrorMsg(""); setSuccessMsg(""); }}
                className={`py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                  !isSignup 
                    ? "bg-background text-primary shadow-md" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                ورود
              </button>
              <button
                type="button"
                onClick={() => { setIsSignup(true); setErrorMsg(""); setSuccessMsg(""); }}
                className={`py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                  isSignup 
                    ? "bg-background text-primary shadow-md" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                ثبت‌نام
              </button>
            </div>
          )}

          {/* Feedback Messages */}
          {errorMsg && (
            <div className="mb-4 rounded-xl bg-destructive/10 border border-destructive/30 p-3 text-xs font-bold text-destructive flex items-center gap-2 animate-fade-in">
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="size-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ─────────────────── STEP 2: OTP VERIFICATION VIEW ─────────────────── */}
          {isOtpStep ? (
            <form onSubmit={handleOtpVerifySubmit} className="flex flex-col gap-6 animate-scale-up">
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
                {verifyMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                <span>{verifyMutation.isPending ? "در حال اعتبارسنجی..." : "تایید ایمیل و ورود"}</span>
              </Button>

              <div className="text-center border-t border-border/40 pt-4">
                <ResendTimer onResend={handleResendCode} disabled={isPending} />
              </div>

              <button
                type="button"
                onClick={() => { setIsOtpStep(false); setErrorMsg(""); setSuccessMsg(""); }}
                className="text-xs text-muted-foreground hover:text-foreground font-semibold text-center cursor-pointer"
              >
                ویرایش اطلاعات / بازگشت
              </button>
            </form>
          ) : (
            <>
              {/* Google Sign In Option */}
              <div className="flex flex-col items-center gap-2 mb-4">
                <GoogleLoginButton
                  onSuccess={handleGoogleSuccess}
                  onError={() => setErrorMsg("ارتباط با حساب گوگل ناموفق بود")}
                  disabled={isPending}
                />
                {googleAuthMutation.isPending && (
                  <div className="flex items-center gap-2 text-xs text-primary font-semibold">
                    <Loader2 className="size-4 animate-spin" />
                    <span>در حال اعتبارسنجی با گوگل...</span>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="relative flex items-center justify-center mb-6">
                <div className="border-t border-border/40 w-full" />
                <span className="bg-background px-3 text-[10px] font-semibold text-muted-foreground shrink-0">
                  یا با ایمیل
                </span>
                <div className="border-t border-border/40 w-full" />
              </div>

              {/* ─────────────────── LOGIN FORM ─────────────────── */}
              {!isSignup && (
                <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
                  {/* Email / Phone field */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-foreground/80 flex items-center gap-1.5">
                      <Mail className="size-3.5 text-primary" />
                      <span>ایمیل یا شماره موبایل</span>
                    </label>
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="مثال: user@example.com یا 09121234567"
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                        required
                        className="rounded-xl pl-4 pr-3 py-2.5 text-xs sm:text-sm bg-muted/20 focus-visible:ring-primary"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  {/* Password field */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-foreground/80 flex items-center gap-1.5">
                        <Lock className="size-3.5 text-primary" />
                        <span>رمز عبور</span>
                      </label>
                      <Link href="/forgot-password" className="text-[10px] font-bold text-primary hover:underline">
                        فراموشی رمز عبور؟
                      </Link>
                    </div>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
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
                  </div>

                  {/* Submit Login */}
                  <Button 
                    type="submit" 
                    size="lg" 
                    disabled={isPending}
                    className="w-full rounded-2xl font-extrabold text-sm gap-2 cursor-pointer shadow-lg shadow-primary/25 mt-2"
                  >
                    {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                    <span>{isPending ? "در حال پردازش..." : "ورود به حساب کاربری"}</span>
                  </Button>
                </form>
              )}

              {/* ─────────────────── SIGNUP FORM ─────────────────── */}
              {isSignup && (
                <form onSubmit={handleSignupSubmit} className="flex flex-col gap-4">
                  {/* Username / Full Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-foreground/80 flex items-center gap-1.5">
                      <User className="size-3.5 text-primary" />
                      <span>نام و نام خانوادگی</span>
                    </label>
                    <Input
                      type="text"
                      placeholder="مثال: سارا محمدی"
                      value={signupUsername}
                      onChange={(e) => setSignupUsername(e.target.value)}
                      required
                      className="rounded-xl px-3 py-2.5 text-xs sm:text-sm bg-muted/20 focus-visible:ring-primary"
                      dir="rtl"
                    />
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-foreground/80 flex items-center gap-1.5">
                      <Mail className="size-3.5 text-primary" />
                      <span>آدرس ایمیل</span>
                    </label>
                    <Input
                      type="email"
                      placeholder="name@example.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      required
                      className="rounded-xl px-3 py-2.5 text-xs sm:text-sm bg-muted/20 focus-visible:ring-primary"
                      dir="ltr"
                    />
                  </div>

                  {/* Phone number */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-foreground/80 flex items-center gap-1.5">
                      <Phone className="size-3.5 text-primary" />
                      <span>شماره موبایل (اختیاری)</span>
                    </label>
                    <Input
                      type="tel"
                      placeholder="09123456789"
                      value={signupPhone}
                      onChange={(e) => setSignupPhone(e.target.value)}
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
                        type={showPassword ? "text" : "password"}
                        placeholder="حداقل ۶ کاراکتر"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        required
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
                  </div>

                  {/* Submit Signup */}
                  <Button 
                    type="submit" 
                    size="lg" 
                    disabled={isPending}
                    className="w-full rounded-2xl font-extrabold text-sm gap-2 cursor-pointer shadow-lg shadow-primary/25 mt-2"
                  >
                    {registerMutation.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Sparkles className="size-4" />
                    )}
                    <span>{registerMutation.isPending ? "در حال دریافت کد تایید..." : "ثبت‌نام و دریافت کد تایید"}</span>
                  </Button>
                </form>
              )}
            </>
          )}

          {/* Footer Security Badge */}
          <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-center gap-2 text-[10px] text-muted-foreground font-medium">
            <ShieldCheck className="size-4 text-primary" />
            <span>اطلاعات شما با رمزنگاری پیشرفته محافظت می‌شود</span>
          </div>

        </div>
      </div>
    </div>
  )
}
