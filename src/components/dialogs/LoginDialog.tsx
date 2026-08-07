"use client"

import React, { useState } from "react"
import { useApp } from "../AppContext"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { X, Lock, Mail, UserCheck, AlertCircle, Loader2 } from "lucide-react"
import { useLogin, useRegister, useGoogleLoginAuth } from "@/hooks/useAuth"
import GoogleLoginButton from "../auth/GoogleLoginButton"
import { CredentialResponse } from "@react-oauth/google"

export default function LoginDialog() {
  const { showLogin, setShowLogin } = useApp()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isRegister, setIsRegister] = useState(false)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const loginMutation = useLogin()
  const registerMutation = useRegister()
  const googleAuthMutation = useGoogleLoginAuth()

  if (!showLogin) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!email || !password) return

    if (isRegister) {
      if (!name) return
      registerMutation.mutate(
        { name, email, password, phone: phone || undefined },
        {
          onSuccess: () => {
            setShowLogin(false)
            resetForm()
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
            setErrorMessage(err?.message || "ایمیل یا رمز عبور اشتباه است")
          },
        }
      )
    }
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
    setErrorMessage(null)
  }

  const isPending = loginMutation.isPending || registerMutation.isPending || googleAuthMutation.isPending

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div 
        className="relative w-full max-w-sm rounded-3xl border border-border/40 bg-background p-6 shadow-2xl flex flex-col gap-4 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => { setShowLogin(false); setErrorMessage(null); }}
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
            {isRegister ? "عضویت در آرتیسا" : "ورود به حساب کاربری"}
          </h2>
          <span className="text-[10px] text-muted-foreground font-semibold mt-1">
            {isRegister ? "حساب کاربری جدید بسازید" : "خوش آمدید! مشخصات خود را وارد کنید"}
          </span>
        </div>

        {errorMessage && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-xs font-bold">
            <AlertCircle className="size-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

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
                <label className="text-xs font-bold text-muted-foreground">شماره موبایل</label>
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
                ? "ثبت نام"
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
      </div>
    </div>
  )
}
