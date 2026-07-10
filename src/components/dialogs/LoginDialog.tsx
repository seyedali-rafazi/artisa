"use client"

import React, { useState } from "react"
import { useApp } from "../AppContext"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { X, Lock, Mail, UserCheck } from "lucide-react"

export default function LoginDialog() {
  const { showLogin, setShowLogin, setUser } = useApp()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isRegister, setIsRegister] = useState(false)
  const [name, setName] = useState("")

  if (!showLogin) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    
    // Simulate login
    const userName = isRegister ? name : email.split("@")[0]
    setUser({
      name: userName || "کاربر",
      email: email
    })
    setShowLogin(false)
    setEmail("")
    setPassword("")
    setName("")
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div 
        className="relative w-full max-w-sm rounded-3xl border border-border/40 bg-background p-6 shadow-2xl flex flex-col gap-4 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setShowLogin(false)}
          className="absolute top-4 left-4 cursor-pointer text-muted-foreground hover:text-primary transition-colors"
          aria-label="Close"
        >
          <X className="size-5" />
        </button>

        {/* Dialog Header */}
        <div className="text-center mt-2 mb-2 flex flex-col items-center">
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

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {isRegister && (
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

          <Button type="submit" className="w-full gap-2 rounded-xl font-bold cursor-pointer mt-2">
            <UserCheck className="size-4" />
            <span>
              {isRegister ? "ثبت نام" : "ورود"}
            </span>
          </Button>
        </form>

        {/* Footer switch trigger */}
        <div className="text-center text-[10px] text-muted-foreground border-t border-border/40 pt-4 mt-2">
          {isRegister ? (
            <span>
              قبلاً ثبت نام کرده‌اید؟{" "}
              <button 
                onClick={() => setIsRegister(false)}
                className="text-primary font-bold hover:underline cursor-pointer"
              >
                ورود به حساب
              </button>
            </span>
          ) : (
            <span>
              کاربر جدید هستید؟{" "}
              <button 
                onClick={() => setIsRegister(true)}
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
