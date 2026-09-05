"use client"

import React, { useState } from "react"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useSubscribeNewsletter } from "@/hooks/useNewsletter"

export default function NewsletterForm() {
  const [email, setEmail] = useState("")
  const subscribeMutation = useSubscribeNewsletter()

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed) {
      toast.error("لطفاً آدرس ایمیل خود را وارد کنید")
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmed)) {
      toast.error("فرمت آدرس ایمیل نامعتبر است (مثال: name@gmail.com)")
      return
    }

    subscribeMutation.mutate(trimmed, {
      onSuccess: (res: any) => {
        const msg = res?.message || "ایمیل شما با موفقیت در خبرنامه گالری آرتیسا ثبت شد!"
        toast.success(msg)
        setEmail("")
      },
      onError: (err: any) => {
        toast.error(err?.message || "خطا در ثبت ایمیل در خبرنامه")
      },
    })
  }

  return (
    <form onSubmit={handleSubscribe} className="flex w-full max-w-md items-center gap-2">
      <Input
        type="email"
        placeholder="آدرس ایمیل شما (name@gmail.com)"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={subscribeMutation.isPending}
        className="rounded-xl border-border bg-background text-sm h-10"
        dir="ltr"
        required
      />
      <Button
        type="submit"
        size="sm"
        disabled={subscribeMutation.isPending}
        className="rounded-xl font-bold cursor-pointer shrink-0 gap-1.5 h-10 px-4 shadow-sm"
      >
        {subscribeMutation.isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            <span>در حال عضویت...</span>
          </>
        ) : (
          "عضویت"
        )}
      </Button>
    </form>
  )
}
