"use client"

import React, { useState } from "react"
import { useLanguage } from "../LanguageContext"
import { Address } from "../AppContext"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { MapPin, Plus, Trash2, Star, StarOff, X, Check } from "lucide-react"
import ConfirmDialog from "../dialogs/ConfirmDialog"
import {
  useAddresses,
  useCreateAddress,
  useSetDefaultAddress,
  useDeleteAddress,
} from "@/hooks/useAddresses"

interface Toast {
  message: string
  type: "success" | "error"
}

interface Props {
  onToast: (toast: Toast) => void
}

type FormMode = "add" | null

const EMPTY_FORM: Omit<Address, "id"> = {
  title: "",
  fullName: "",
  phone: "",
  province: "",
  city: "",
  postalCode: "",
  addressLine: "",
  isDefault: false,
}

export default function SavedAddresses({ onToast }: Props) {
  const { t } = useLanguage()
  const { data: apiAddresses, isLoading } = useAddresses()
  const createAddressMutation = useCreateAddress()
  const setDefaultAddressMutation = useSetDefaultAddress()
  const deleteAddressMutation = useDeleteAddress()

  const [formMode, setFormMode] = useState<FormMode>(null)
  const [form, setForm] = useState<Omit<Address, "id">>(EMPTY_FORM)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const addresses = apiAddresses || []

  const openAdd = () => {
    setForm(EMPTY_FORM)
    setFormMode("add")
  }

  const handleSave = () => {
    if (!form.title || !form.fullName || !form.phone || !form.addressLine) return

    createAddressMutation.mutate(
      {
        title: form.title,
        fullName: form.fullName,
        phone: form.phone,
        province: form.province || "",
        city: form.city || "",
        postalCode: form.postalCode || "",
        addressLine: form.addressLine,
        isDefault: form.isDefault,
      },
      {
        onSuccess: () => {
          onToast({ message: "آدرس جدید اضافه شد.", type: "success" })
          setFormMode(null)
          setForm(EMPTY_FORM)
        },
        onError: (err: any) => {
          onToast({ message: err?.message || "خطا در افزودن آدرس", type: "error" })
        },
      }
    )
  }

  const handleDelete = (id: string) => {
    deleteAddressMutation.mutate(id, {
      onSuccess: () => {
        setConfirmDelete(null)
        onToast({ message: "آدرس حذف شد.", type: "success" })
      },
    })
  }

  const handleSetDefault = (id: string) => {
    setDefaultAddressMutation.mutate(id, {
      onSuccess: () => {
        onToast({ message: "آدرس پیش‌فرض تغییر کرد.", type: "success" })
      },
    })
  }

  const update = (key: keyof Omit<Address, "id">, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {[1, 2].map((i) => (
          <div key={i} className="h-20 rounded-2xl bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-foreground">{t("savedAddresses")}</h3>
        <Button
          size="sm"
          onClick={openAdd}
          className="gap-1.5 rounded-xl cursor-pointer"
          aria-label={t("addAddress")}
        >
          <Plus className="size-3.5" />
          {t("addAddress")}
        </Button>
      </div>

      {addresses.length === 0 && formMode === null && (
        <EmptyState icon={<MapPin className="size-8" />} message={t("noAddresses")} />
      )}

      <div className="flex flex-col gap-3">
        {addresses.map((addr) => (
          <div
            key={addr.id}
            className={`relative rounded-2xl border p-4 transition-all ${
              addr.isDefault
                ? "border-primary/50 bg-primary/5"
                : "border-border/40 bg-background hover:border-border"
            }`}
          >
            {addr.isDefault && (
              <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5">
                <Star className="size-3" />
                {t("defaultAddress")}
              </span>
            )}
            <div className="flex gap-3 items-start mt-1">
              <MapPin className="size-4 text-primary shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-extrabold text-foreground mb-0.5">{addr.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {addr.province}، {addr.city}، {addr.addressLine}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {addr.fullName} — {addr.phone} — کد پستی: {addr.postalCode}
                </p>
              </div>
            </div>
            <div className="flex gap-2 mt-3 justify-end">
              {!addr.isDefault && (
                <button
                  onClick={() => handleSetDefault(addr.id)}
                  className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                  aria-label={t("setDefaultAddress")}
                >
                  <StarOff className="size-3.5" />
                  {t("setDefaultAddress")}
                </button>
              )}
              <button
                onClick={() => setConfirmDelete(addr.id)}
                className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                aria-label={t("deleteAddress")}
              >
                <Trash2 className="size-3.5" />
                {t("deleteAddress")}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Form */}
      {formMode !== null && (
        <div className="rounded-2xl border border-border/50 bg-muted/10 p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-extrabold text-foreground">{t("addAddress")}</h4>
            <button
              onClick={() => setFormMode(null)}
              className="text-muted-foreground hover:text-foreground cursor-pointer"
              aria-label={t("cancel")}
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label={t("addressTitle")} htmlFor="addr-title">
              <Input id="addr-title" value={form.title} onChange={(e) => update("title", e.target.value)} className="rounded-xl text-sm" dir="rtl" />
            </Field>
            <Field label={t("fullName")} htmlFor="addr-name">
              <Input id="addr-name" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} className="rounded-xl text-sm" dir="rtl" />
            </Field>
            <Field label={t("phoneNumber")} htmlFor="addr-phone">
              <Input id="addr-phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} className="rounded-xl text-sm" dir="ltr" placeholder="09xxxxxxxxx" />
            </Field>
            <Field label={t("postalCode")} htmlFor="addr-postal">
              <Input id="addr-postal" value={form.postalCode} onChange={(e) => update("postalCode", e.target.value)} className="rounded-xl text-sm" dir="ltr" />
            </Field>
            <Field label={t("province")} htmlFor="addr-province">
              <Input id="addr-province" value={form.province} onChange={(e) => update("province", e.target.value)} className="rounded-xl text-sm" dir="rtl" />
            </Field>
            <Field label={t("city")} htmlFor="addr-city">
              <Input id="addr-city" value={form.city} onChange={(e) => update("city", e.target.value)} className="rounded-xl text-sm" dir="rtl" />
            </Field>
            <div className="sm:col-span-2">
              <Field label={t("address")} htmlFor="addr-line">
                <Input id="addr-line" value={form.addressLine} onChange={(e) => update("addressLine", e.target.value)} className="rounded-xl text-sm" dir="rtl" />
              </Field>
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold text-foreground cursor-pointer select-none w-fit">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => update("isDefault", e.target.checked)}
              className="rounded accent-primary cursor-pointer"
            />
            {t("setDefaultAddress")}
          </label>

          <div className="flex gap-3">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={createAddressMutation.isPending}
              className="gap-1.5 rounded-xl cursor-pointer"
            >
              <Check className="size-3.5" />
              {createAddressMutation.isPending ? "در حال ثبت..." : t("saveChanges")}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setFormMode(null)} className="gap-1.5 rounded-xl cursor-pointer">
              <X className="size-3.5" />
              {t("cancel")}
            </Button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete !== null}
        message={t("confirmDeleteAddress")}
        confirmLabel={t("deleteAddress")}
        cancelLabel={t("cancel")}
        variant="danger"
        onConfirm={() => confirmDelete && handleDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  )
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-xs font-bold text-muted-foreground">{label}</label>
      {children}
    </div>
  )
}

function EmptyState({ icon, message }: { icon: React.ReactNode; message: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center text-muted-foreground">
      <div className="flex size-14 items-center justify-center rounded-full bg-muted/40">
        {icon}
      </div>
      <p className="text-xs font-semibold">{message}</p>
    </div>
  )
}
