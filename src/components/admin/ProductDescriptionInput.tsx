"use client"

import React, { useState, useRef } from "react"
import { List, ListOrdered, Bold, Heading3, Eye, Edit3 } from "lucide-react"
import ProductDescription from "@/components/product/ProductDescription"

interface ProductDescriptionInputProps {
  value: string
  onChange: (val: string) => void
  placeholder?: string
}

export default function ProductDescriptionInput({
  value,
  onChange,
  placeholder = "توضیحات جامع درباره محصول، متریال، ابعاد و ویژگی‌ها..."
}: ProductDescriptionInputProps) {
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const insertText = (before: string, after: string = "", defaultText: string = "") => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = value.substring(start, end) || defaultText

    // Check if we are inserting at line start
    const isLineStart = start === 0 || value[start - 1] === "\n"
    const prefix = !isLineStart && before.startsWith("- ") ? "\n" : ""

    const replacement = `${prefix}${before}${selected}${after}`
    const newValue = value.substring(0, start) + replacement + value.substring(end)
    onChange(newValue)

    setTimeout(() => {
      textarea.focus()
      const newCursor = start + prefix.length + before.length + selected.length + after.length
      textarea.setSelectionRange(newCursor, newCursor)
    }, 10)
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-muted-foreground">
          توضیحات کامل محصول
        </label>
        <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg border border-border/40 text-[11px]">
          <button
            type="button"
            onClick={() => setActiveTab("edit")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
              activeTab === "edit"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Edit3 className="size-3" />
            <span>ویرایش متن</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
              activeTab === "preview"
                ? "bg-background text-primary shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Eye className="size-3" />
            <span>پیش‌نمایش زنده</span>
          </button>
        </div>
      </div>

      {activeTab === "edit" ? (
        <div className="flex flex-col rounded-xl border border-border bg-background overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary">
          {/* Quick formatting toolbar */}
          <div className="flex items-center gap-1 p-1.5 border-b border-border/40 bg-muted/20 text-xs">
            <button
              type="button"
              onClick={() => insertText("- ", "", "آیتم جدید")}
              title="افزودن لیست بالت"
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted font-bold text-[11px] cursor-pointer transition-colors"
            >
              <List className="size-3.5 text-primary" />
              <span>لیست بالت</span>
            </button>
            <button
              type="button"
              onClick={() => insertText("1. ", "", "مورد اول")}
              title="افزودن لیست عددی"
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted font-bold text-[11px] cursor-pointer transition-colors"
            >
              <ListOrdered className="size-3.5 text-primary" />
              <span>لیست شماره‌دار</span>
            </button>
            <button
              type="button"
              onClick={() => insertText("**", "**", "متن پررنگ")}
              title="متن پررنگ"
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted font-bold text-[11px] cursor-pointer transition-colors"
            >
              <Bold className="size-3.5 text-primary" />
              <span>بولد</span>
            </button>
            <button
              type="button"
              onClick={() => insertText("### ", "", "عنوان بخش")}
              title="عنوان بخش"
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted font-bold text-[11px] cursor-pointer transition-colors"
            >
              <Heading3 className="size-3.5 text-primary" />
              <span>عنوان</span>
            </button>
          </div>

          <textarea
            ref={textareaRef}
            rows={6}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full p-3 text-xs leading-relaxed focus:outline-none bg-transparent resize-y text-foreground font-medium"
          />
        </div>
      ) : (
        <div className="min-h-[140px] rounded-xl border border-border bg-background/50 p-4 text-xs">
          {value.trim() ? (
            <ProductDescription description={value} />
          ) : (
            <p className="text-muted-foreground italic text-xs">
              متنی برای نمایش وارد نشده است.
            </p>
          )}
        </div>
      )}

      <p className="text-[11px] text-muted-foreground">
        💡 خطوط جدید (Enter)، فاصله‌ها و آیتم‌های لیست (- یا 1.) دقیقاً به همان صورت در صفحه محصول نمایش داده می‌شوند.
      </p>
    </div>
  )
}
