"use client"

import React, { useState } from "react"
import { useApp } from "../AppContext"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { X, Lock, Mail, UserCheck, AlertCircle, Loader2, CheckCircle2 } from "lucide-react"
import { useLogin, useRegister, useGoogleLoginAuth, useVerifyEmail, useResendVerification } from "@/hooks/useAuth"
import GoogleLoginButton from "../auth/GoogleLoginButton"
import OTPInput from "../auth/OTPInput"
import ResendTimer from "../auth/ResendTimer"
import { CredentialResponse } from "@react-oauth/google"

export default function LoginDialog() {
  const { showLogin, setShowLogin } = useApp()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isRegister, setIsRegister] = useState(false)
  const [isOtpStep, setIsOtpStep] = useState(false)
  const [otpCode, setOtpCode] = useState("")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const loginMutation = useLogin()
  const registerMutation = useRegister()
  const googleAuthMutation = useGoogleLoginAuth()
  const verifyMutation = useVerifyEmail()
  const resendMutation = useResendVerification()

  if (!showLogin) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    if (!email || !password) return

    if (isRegister) {
      if (!name) return
      registerMutation.mutate(
        { name, email, password, phone: phone || undefined },
        {
          onSuccess: () => {
            setSuccessMessage("کد تایید ۴ رقمی به ایمیل شما ارسال شد.")
            setIsOtpStep(true)
          },
          onError: (err: any) => {
            setErrorMessage(err?.message || "خطا در ثبت نام")
          },
        }
      )
    } else {
      loginMutation.mutate(
        { email, password },
        {
          onSuccess: () => {
            setShowLogin(false)
            resetForm()
          },
          onError: (err: any) => {
            const detail = err?.data?.detail;
            if (detail?.requires_verification || err?.data?.requires_verification) {
              const unverifiedEmail = detail?.email || err?.data?.email || email;
              setEmail(unverifiedEmail);
              setIsRegister(true);
              setIsOtpStep(true);
              setErrorMessage("حساب شما تایید نشده است. لطفاً کد ۴ رقمی را وارد کنید.");
            } else {
              setErrorMessage(err?.message || "ایمیل یا رمز عبور اشتباه است");
            }
          },
        }
      )
    }
  }

  const handleOtpVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    if (!otpCode || otpCode.length !== 4) {
      setErrorMessage("لطفاً کد تایید ۴ رقمی را کامل وارد کنید")
      return
    }

    verifyMutation.mutate(
      { email: email.trim(), code: otpCode },
      {
        onSuccess: () => {
          setSuccessMessage("ایمیل شما با موفقیت تایید شد!")
          setTimeout(() => {
            setShowLogin(false)
            resetForm()
          }, 800)
        },
        onError: (err: any) => {
          setErrorMessage(err?.message || "کد تایید وارد شده اشتباه است")
        },
      }
    )
  }

  const handleResendCode = () => {
    if (!email) return
    setErrorMessage(null)
    setSuccessMessage(null)

    resendMutation.mutate(
      { email: email.trim() },
      {
        onSuccess: (res) => {
          setSuccessMessage(res?.message || "کد تایید جدید ارسال شد.")
        },
        onError: (err: any) => {
          setErrorMessage(err?.message || "خطا در ارسال مجدد کد.")
        },
      }
    )
  }

  const handleGoogleSuccess = (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      setErrorMessage("توکن گوگلی دریافت نشد")
      return
    }
    setErrorMessage(null)
    googleAuthMutation.mutate(credentialResponse.credential, {
      onSuccess: () => {
        setShowLogin(false)
        resetForm()
      },
      onError: (err: any) => {
        setErrorMessage(err?.message || "خطا در ورود با گوگل")
      },
    })
  }

  const resetForm = () => {
    setEmail("")
    setPassword("")
    setName("")
    setPhone("")
    setOtpCode("")
    setIsOtpStep(false)
    setErrorMessage(null)
    setSuccessMessage(null)
  }

  const isPending = loginMutation.isPending || registerMutation.isPending || googleAuthMutation.isPending || verifyMutation.isPending

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div 
        className="relative w-full max-w-sm rounded-3xl border border-border/40 bg-background p-6 shadow-2xl flex flex-col gap-4 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => { setShowLogin(false); resetForm(); }}
          className="absolute top-4 left-4 cursor-pointer text-muted-foreground hover:text-primary transition-colors"
          aria-label="Close"
        >
          <X className="size-5" />
        </button>

        {/* Dialog Header */}
        <div className="text-center mt-2 mb-1 flex flex-col items-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3">
            <Lock className="size-6" />
          </div>
          <h2 className="text-base md:text-lg font-black text-foreground">
            {isOtpStep
              ? "تایید آدرس ایمیل"
              : isRegister
              ? "عضویت در آرتیسا"
              : "ورود به حساب کاربری"}
          </h2>
          <span className="text-[10px] text-muted-foreground font-semibold mt-1">
            {isOtpStep
              ? "کد ۴ رقمی ارسال شده به ایمیل را وارد نمایید"
              : isRegister
              ? "حساب کاربری جدید بسازید"
              : "خوش آمدید! مشخصات خود را وارد کنید"}
          </span>
          {isOtpStep && email && (
            <span className="inline-block mt-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-bold dir-ltr" dir="ltr">
              {email}
            </span>
          )}
        </div>

        {errorMessage && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-xs font-bold">
            <AlertCircle className="size-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
            <CheckCircle2 className="size-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {isOtpStep ? (
          <form onSubmit={handleOtpVerifySubmit} className="flex flex-col gap-5 animate-scale-up">
            <div className="flex flex-col items-center gap-2">
              <label className="text-xs font-bold text-muted-foreground">کد ۴ رقمی تایید</label>
              <OTPInput
                value={otpCode}
                onChange={(val) => setOtpCode(val)}
                disabled={isPending}
              />
            </div>

            <Button 
              type="submit" 
              disabled={isPending || otpCode.length !== 4}
              className="w-full gap-2 rounded-xl font-bold cursor-pointer mt-1"
            >
              {verifyMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
              <span>{verifyMutation.isPending ? "در حال اعتبارسنجی..." : "تایید ایمیل و ورود"}</span>
            </Button>

            <div className="text-center border-t border-border/40 pt-3">
              <ResendTimer onResend={handleResendCode} disabled={isPending} />
            </div>

            <button
              type="button"
              onClick={() => { setIsOtpStep(false); setErrorMessage(null); setSuccessMessage(null); }}
              className="text-xs text-muted-foreground hover:text-foreground font-semibold text-center cursor-pointer"
            >
              ویرایش اطلاعات / بازگشت
            </button>
          </form>
        ) : (
          <>
            {/* Google Sign In Option */}
            <div className="flex flex-col items-center gap-2">
              <GoogleLoginButton
                onSuccess={handleGoogleSuccess}
                onError={() => setErrorMessage("ارتباط با حساب گوگل ناموفق بود")}
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
            <div className="relative flex items-center justify-center my-0.5">
              <div className="border-t border-border/40 w-full" />
              <span className="bg-background px-3 text-[10px] font-semibold text-muted-foreground shrink-0">
                یا با ایمیل
              </span>
              <div className="border-t border-border/40 w-full" />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
              {isRegister && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-muted-foreground">نام و نام خانوادگی</label>
                    <Input
                      type="text"
                      placeholder="مثال: علی رضایی"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="rounded-xl text-xs sm:text-sm"
                      dir="rtl"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-muted-foreground">شماره موبایل (اختیاری)</label>
                    <Input
                      type="tel"
                      placeholder="09121234567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="rounded-xl text-xs sm:text-sm"
                      dir="ltr"
                    />
                  </div>
                </>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted-foreground">آدرس ایمیل</label>
                <div className="relative">
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="rounded-xl pl-9 text-xs sm:text-sm"
                    dir="ltr"
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted-foreground">رمز عبور</label>
                <div className="relative">
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="rounded-xl pl-9 text-xs sm:text-sm"
                    dir="ltr"
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isPending}
                className="w-full gap-2 rounded-xl font-bold cursor-pointer mt-1"
              >
                {isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <UserCheck className="size-4" />
                )}
                <span>
                  {isPending
                    ? "در حال پردازش..."
                    : isRegister
                    ? "ثبت نام و دریافت کد تایید"
                    : "ورود"}
                </span>
              </Button>
            </form>

            {/* Footer switch trigger */}
            <div className="text-center text-[10px] text-muted-foreground border-t border-border/40 pt-3 mt-1">
              {isRegister ? (
                <span>
                  قبلاً ثبت نام کرده‌اید؟{" "}
                  <button 
                    onClick={() => { setIsRegister(false); setErrorMessage(null); }}
                    className="text-primary font-bold hover:underline cursor-pointer"
                  >
                    ورود به حساب
                  </button>
                </span>
              ) : (
                <span>
                  کاربر جدید هستید؟{" "}
                  <button 
                    onClick={() => { setIsRegister(true); setErrorMessage(null); }}
                    className="text-primary font-bold hover:underline cursor-pointer"
                  >
                    ایجاد حساب کاربری
                  </button>
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
