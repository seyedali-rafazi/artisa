"use client"

import React, { useState } from "react"
import { useLanguage } from "../LanguageContext"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Lock, Eye, EyeOff, Check } from "lucide-react"

interface Toast {
  message: string
  type: "success" | "error"
}

interface Props {
  onToast: (toast: Toast) => void
}

export default function ChangePasswordForm({ onToast }: Props) {
  const { t } = useLanguage()
  const [currentPwd, setCurrentPwd] = useState("")
  const [newPwd, setNewPwd] = useState("")
  const [confirmPwd, setConfirmPwd] = useState("")
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (newPwd.length < 6) {
      setError(t("passwordTooShort"))
      return
    }
    if (newPwd !== confirmPwd) {
      setError(t("passwordMismatch"))
      return
    }
    // Simulate password change (mock)
    setCurrentPwd("")
    setNewPwd("")
    setConfirmPwd("")
    onToast({ message: t("passwordUpdateSuccess"), type: "success" })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-border/50 bg-muted/10 p-4">
      <h3 className="text-sm font-extrabold text-foreground">{t("changePassword")}</h3>

      <PasswordField
        id="current-pwd"
        label={t("currentPassword")}
        value={currentPwd}
        onChange={setCurrentPwd}
        show={showCurrent}
        onToggle={() => setShowCurrent((v) => !v)}
      />
      <PasswordField
        id="new-pwd"
        label={t("newPassword")}
        value={newPwd}
        onChange={setNewPwd}
        show={showNew}
        onToggle={() => setShowNew((v) => !v)}
      />
      <PasswordField
        id="confirm-pwd"
        label={t("confirmNewPassword")}
        value={confirmPwd}
        onChange={setConfirmPwd}
        show={showConfirm}
        onToggle={() => setShowConfirm((v) => !v)}
      />

      {error && (
        <p role="alert" className="text-xs font-semibold text-destructive">
          {error}
        </p>
      )}

      <Button type="submit" size="sm" className="self-start gap-1.5 rounded-xl cursor-pointer">
        <Check className="size-3.5" />
        {t("saveChanges")}
      </Button>
    </form>
  )
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  show,
  onToggle,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  show: boolean
  onToggle: () => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-bold text-muted-foreground flex items-center gap-1">
        <Lock className="size-3" />
        {label}
      </label>
      <div className="relative">
        <Input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          className="rounded-xl pl-9 text-sm"
          dir="ltr"
          placeholder="••••••••"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          aria-label={show ? "مخفی کردن رمز" : "نمایش رمز"}
        >
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    </div>
  )
}
