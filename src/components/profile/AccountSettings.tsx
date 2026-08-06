"use client"

import React, { useState } from "react"
import { useLanguage } from "../LanguageContext"
import { useApp } from "../AppContext"
import { Button } from "../ui/button"
import { LogOut, Trash2 } from "lucide-react"
import ConfirmDialog from "../dialogs/ConfirmDialog"
import { useRouter } from "next/navigation"

export default function AccountSettings() {
  const { t } = useLanguage()
  const { logout } = useApp()
  const router = useRouter()
  const [confirmLogout, setConfirmLogout] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleLogout = () => {
    logout()
    setConfirmLogout(false)
    router.push("/")
  }

  const handleDeleteAccount = () => {
    logout()
    setConfirmDelete(false)
    router.push("/")
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-border/40 bg-background p-4 flex flex-col gap-3">
        <h3 className="text-sm font-extrabold text-foreground">{t("accountSettings")}</h3>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between rounded-xl border border-border/40 bg-muted/10 p-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-bold text-foreground">{t("logout")}</span>
              <span className="text-[10px] text-muted-foreground">از حساب کاربری خود خارج شوید</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmLogout(true)}
              className="gap-1.5 rounded-xl cursor-pointer shrink-0"
            >
              <LogOut className="size-3.5" />
              {t("logout")}
            </Button>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-destructive/20 bg-destructive/5 p-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-bold text-destructive">{t("deleteAccount")}</span>
              <span className="text-[10px] text-muted-foreground">این عمل غیرقابل بازگشت است</span>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setConfirmDelete(true)}
              className="gap-1.5 rounded-xl cursor-pointer shrink-0"
            >
              <Trash2 className="size-3.5" />
              {t("deleteAccount")}
            </Button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmLogout}
        message="آیا می‌خواهید از حساب کاربری خود خارج شوید؟"
        confirmLabel={t("logout")}
        cancelLabel={t("cancel")}
        onConfirm={handleLogout}
        onCancel={() => setConfirmLogout(false)}
      />

      <ConfirmDialog
        open={confirmDelete}
        message={t("confirmDeleteAccount")}
        confirmLabel={t("deleteAccount")}
        cancelLabel={t("cancel")}
        variant="danger"
        onConfirm={handleDeleteAccount}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  )
}
