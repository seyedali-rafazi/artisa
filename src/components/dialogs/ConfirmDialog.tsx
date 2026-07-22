"use client"

import React from "react"
import { Button } from "../ui/button"
import { AlertTriangle } from "lucide-react"

interface ConfirmDialogProps {
  open: boolean
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  variant?: "danger" | "default"
}

export default function ConfirmDialog({
  open,
  message,
  confirmLabel = "تأیید",
  cancelLabel = "انصراف",
  onConfirm,
  onCancel,
  variant = "default",
}: ConfirmDialogProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-sm rounded-2xl border border-border/40 bg-background p-6 shadow-2xl flex flex-col gap-5">
        <div className="flex flex-col items-center gap-3 text-center">
          <div
            className={`flex size-12 items-center justify-center rounded-2xl ${
              variant === "danger" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
            }`}
          >
            <AlertTriangle className="size-6" />
          </div>
          <p className="text-sm font-semibold text-foreground leading-relaxed">{message}</p>
        </div>
        <div className="flex gap-3 justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="flex-1 rounded-xl cursor-pointer"
          >
            {cancelLabel}
          </Button>
          <Button
            variant={variant === "danger" ? "destructive" : "default"}
            size="sm"
            onClick={onConfirm}
            className="flex-1 rounded-xl cursor-pointer"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
