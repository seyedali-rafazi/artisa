"use client"

import React, { useState } from "react"
import { useLanguage } from "../LanguageContext"
import { useApp } from "../AppContext"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { User as UserIcon, Mail, Phone, Calendar, Shield, Edit2, Check, X } from "lucide-react"
import { useUpdateProfile } from "@/hooks/useAuth"
import { formatShamsiDate } from "@/lib/utils"

interface Toast {
  message: string
  type: "success" | "error"
}

interface Props {
  onToast: (toast: Toast) => void
}

export default function ProfileInfo({ onToast }: Props) {
  const { t } = useLanguage()
  const { user } = useApp()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(user?.name ?? "")
  const [phone, setPhone] = useState(user?.phone ?? "")

  const updateProfileMutation = useUpdateProfile()

  if (!user) return null

  const handleSave = () => {
    if (!name.trim()) return

    updateProfileMutation.mutate(
      { name: name.trim(), phone: phone.trim() || undefined },
      {
        onSuccess: () => {
          setEditing(false)
          onToast({ message: t("profileUpdateSuccess"), type: "success" })
        },
        onError: (err: any) => {
          onToast({ message: err?.message || "خطا در بروزرسانی پروفایل", type: "error" })
        },
      }
    )
  }

  const handleCancel = () => {
    setName(user.name)
    setPhone(user.phone ?? "")
    setEditing(false)
  }

  const avatar = user.name.charAt(0).toUpperCase()

  return (
    <div className="flex flex-col gap-6">
      {/* Avatar + Name Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary text-2xl font-extrabold select-none">
            {avatar}
          </div>
          <div className="flex flex-col gap-0.5 min-w-0">
            <h2 className="text-base font-extrabold text-foreground truncate">{user.name}</h2>
            <span className="text-xs text-muted-foreground truncate">{user.email}</span>
            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary w-fit">
              <Shield className="size-3" />
              {user.role ?? t("defaultRole")}
            </span>
          </div>
        </div>
        {!editing && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setName(user.name)
              setPhone(user.phone ?? "")
              setEditing(true)
            }}
            className="self-start sm:self-center shrink-0 rounded-xl gap-1.5 cursor-pointer max-w-full"
            aria-label={t("editProfile")}
          >
            <Edit2 className="size-3.5" />
            <span>{t("editProfile")}</span>
          </Button>
        )}
      </div>

      {editing ? (
        <div className="flex flex-col gap-4 rounded-2xl border border-border/50 bg-muted/10 p-4">
          <h3 className="text-sm font-extrabold text-foreground">{t("editProfile")}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-muted-foreground" htmlFor="profile-name">
                {t("fullName")}
              </label>
              <Input
                id="profile-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-xl text-sm"
                dir="rtl"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-muted-foreground" htmlFor="profile-phone">
                {t("phoneNumber")}
              </label>
              <Input
                id="profile-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="rounded-xl text-sm"
                dir="ltr"
                placeholder="09xxxxxxxxx"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={updateProfileMutation.isPending}
              className="gap-1.5 rounded-xl cursor-pointer"
            >
              <Check className="size-3.5" />
              {updateProfileMutation.isPending ? "در حال ذخیره..." : t("saveChanges")}
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancel} className="gap-1.5 rounded-xl cursor-pointer">
              <X className="size-3.5" />
              {t("cancel")}
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InfoRow icon={<UserIcon className="size-4" />} label={t("fullName")} value={user.name} />
          <InfoRow icon={<Mail className="size-4" />} label="ایمیل" value={user.email} />
          {user.phone && (
            <InfoRow icon={<Phone className="size-4" />} label={t("phoneNumber")} value={user.phone} />
          )}
          {user.createdAt && (
            <InfoRow icon={<Calendar className="size-4" />} label={t("memberSince")} value={formatShamsiDate(user.createdAt)} />
          )}
        </div>
      )}
    </div>
  )
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/40 bg-muted/10 px-4 py-3">
      <span className="text-muted-foreground shrink-0">{icon}</span>
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-[10px] font-bold text-muted-foreground">{label}</span>
        <span className="text-xs font-semibold text-foreground truncate">{value}</span>
      </div>
    </div>
  )
}
