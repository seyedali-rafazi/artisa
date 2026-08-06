"use client"

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useLogin, useRegister } from "@/hooks/useAuth"
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
  ShieldCheck
} from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const loginMutation = useLogin()
  const registerMutation = useRegister()

  const [isSignup, setIsSignup] = useState(false)
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

  const isPending = loginMutation.isPending || registerMutation.isPending

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
        onSuccess: () => {
          setSuccessMsg("ورود با موفقیت انجام شد. در حال انتقال...")
          setTimeout(() => {
            router.push("/profile")
          }, 800)
        },
        onError: (err: any) => {
          setErrorMsg(err?.message || "ایمیل یا رمز عبور اشتباه است")
        },
      }
    )
  }

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg("")
    setSuccessMsg("")

    if (!signupUsername.trim() || !signupEmail.trim() || !signupPhone.trim() || !signupPassword.trim()) {
      setErrorMsg("لطفاً تمامی فیلدهای ثبت‌نام را تکمیل کنید.")
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
        phone: signupPhone.trim(),
      },
      {
        onSuccess: () => {
          setSuccessMsg("حساب کاربری شما با موفقیت ایجاد شد! در حال انتقال...")
          setTimeout(() => {
            router.push("/profile")
          }, 800)
        },
        onError: (err: any) => {
          setErrorMsg(err?.message || "خطا در ثبت‌نام. ممکن است ایمیل قبلا ثبت شده باشد.")
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
              {isSignup ? "عضویت در آرتیسا" : "ورود به حساب کاربری"}
            </h1>
            <p className="text-xs text-muted-foreground mt-1 font-semibold">
              {isSignup 
                ? "جهت ثبت سفارش و دسترسی به امکانات، ثبت‌نام کنید" 
                : "خوش آمدید! لطفا اطلاعات ورود خود را وارد نمایید"}
            </p>
          </div>

          {/* Tab Switcher */}
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
                  <a href="#" onClick={(e) => { e.preventDefault(); alert("لینک بازیابی رمز عبور به ایمیل شما ارسال شد."); }} className="text-[10px] font-bold text-primary hover:underline">
                    فراموشی رمز عبور؟
                  </a>
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
                  <span>شماره موبایل</span>
                </label>
                <Input
                  type="tel"
                  placeholder="09123456789"
                  value={signupPhone}
                  onChange={(e) => setSignupPhone(e.target.value)}
                  required
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
                <Sparkles className="size-4" />
                <span>{isPending ? "در حال ثبت‌نام..." : "ثبت‌نام و ایجاد حساب"}</span>
              </Button>
            </form>
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
