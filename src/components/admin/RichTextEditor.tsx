"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignRight,
  AlignCenter,
  AlignLeft,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Minus,
  Link as LinkIcon,
  Unlink,
  Undo,
  Redo,
  RemoveFormatting,
  Eye,
  Edit3,
  Code,
  Check,
  X,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "متن مقاله را اینجا بنویسید...",
  minHeight = "400px",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<"edit" | "preview" | "code">("edit");
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [savedSelection, setSavedSelection] = useState<Range | null>(null);

  // Active state indicators
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrike, setIsStrike] = useState(false);
  const [currentBlock, setCurrentBlock] = useState<string>("p");

  // Keep editor content in sync when value changes from outside (e.g. initial load)
  useEffect(() => {
    if (editorRef.current && viewMode === "edit") {
      const currentHtml = editorRef.current.innerHTML;
      // Only set if meaningfully different to avoid moving cursor while typing
      if (value !== currentHtml && (value || currentHtml !== "<p><br></p>")) {
        editorRef.current.innerHTML = value || "<p><br></p>";
      }
    }
  }, [value, viewMode]);

  // Update active state when selection changes
  const updateToolbarState = useCallback(() => {
    if (typeof document === "undefined" || viewMode !== "edit") return;
    try {
      setIsBold(document.queryCommandState("bold"));
      setIsItalic(document.queryCommandState("italic"));
      setIsUnderline(document.queryCommandState("underline"));
      setIsStrike(document.queryCommandState("strikeThrough"));

      const formatBlock = document.queryCommandValue("formatBlock");
      if (formatBlock) {
        setCurrentBlock(formatBlock.toLowerCase());
      }
    } catch {
      // Ignored
    }
  }, [viewMode]);

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      onChange(html);
      updateToolbarState();
    }
  };

  const executeCommand = (command: string, arg: string | undefined = undefined) => {
    if (typeof document === "undefined" || !editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command, false, arg);
    handleInput();
    updateToolbarState();
  };

  const handleFormatBlock = (tag: string) => {
    executeCommand("formatBlock", tag);
    setCurrentBlock(tag);
  };

  // Link handling
  const openLinkModal = () => {
    if (typeof window === "undefined") return;
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      setSavedSelection(sel.getRangeAt(0).cloneRange());
      setLinkText(sel.toString());
    } else {
      setSavedSelection(null);
      setLinkText("");
    }
    setLinkUrl("");
    setLinkModalOpen(true);
  };

  const applyLink = () => {
    if (!linkUrl.trim()) return;
    setLinkModalOpen(false);

    if (!editorRef.current) return;
    editorRef.current.focus();

    if (savedSelection && typeof window !== "undefined") {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedSelection);
      }
    }

    const finalUrl =
      linkUrl.startsWith("http://") || linkUrl.startsWith("https://")
        ? linkUrl
        : `https://${linkUrl}`;

    if (linkText.trim() && savedSelection && savedSelection.collapsed) {
      const a = document.createElement("a");
      a.href = finalUrl;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = linkText;
      a.className = "text-primary underline hover:opacity-80";
      savedSelection.insertNode(a);
      handleInput();
    } else {
      executeCommand("createLink", finalUrl);
      // Make all new links open in new tab
      const links = editorRef.current.querySelectorAll("a");
      links.forEach((l) => {
        if (l.getAttribute("href") === finalUrl) {
          l.setAttribute("target", "_blank");
          l.setAttribute("rel", "noopener noreferrer");
          l.classList.add("text-primary", "underline");
        }
      });
      handleInput();
    }
  };

  // Stats
  const getStats = () => {
    const text = value.replace(/<[^>]+>/g, " ").trim();
    const words = text ? text.split(/\s+/).length : 0;
    const chars = text.length;
    return { words, chars };
  };
  const { words, chars } = getStats();

  return (
    <div
      className="flex flex-col rounded-3xl border border-border/80 bg-background/95 backdrop-blur-xl shadow-md overflow-hidden transition-all"
      dir="rtl"
    >
      {/* ─── Word-Inspired Ribbon Header ─── */}
      <div className="border-b border-border/60 bg-muted/40 p-2.5 flex flex-wrap items-center justify-between gap-2">
        {/* Left: Document indicator */}
        <div className="flex items-center gap-2 text-xs font-black text-foreground/80 px-2">
          <div className="size-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <FileText className="size-3.5" />
          </div>
          <span>ویرایشگر مقاله (Word Ribbon)</span>
        </div>

        {/* Right: View Mode Switcher */}
        <div className="flex items-center gap-1 bg-background/80 p-1 rounded-xl border border-border/40 text-[11px] font-bold">
          <button
            type="button"
            onClick={() => setViewMode("edit")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
              viewMode === "edit"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Edit3 className="size-3.5" />
            <span>ویرایشگر دیداری</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("preview")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
              viewMode === "preview"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Eye className="size-3.5" />
            <span>پیش‌نمایش زنده</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("code")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
              viewMode === "code"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Code className="size-3.5" />
            <span>کد HTML</span>
          </button>
        </div>
      </div>

      {/* ─── Word Formatting Toolbar (Visible in edit mode) ─── */}
      {viewMode === "edit" && (
        <div className="flex flex-wrap items-center gap-1.5 p-2 border-b border-border/50 bg-background/50 text-xs">
          {/* Paragraph / Headings Dropdown */}
          <div className="flex items-center pl-2 border-l border-border/40">
            <select
              value={currentBlock}
              onChange={(e) => handleFormatBlock(e.target.value)}
              className="h-8 rounded-xl border border-border bg-background px-2.5 text-xs font-bold text-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="p">متن عادی (پاراگراف)</option>
              <option value="h1">سرتیتر بزرگ (Heading 1)</option>
              <option value="h2">سرتیتر اصلی (Heading 2)</option>
              <option value="h3">سرتیتر فرعی (Heading 3)</option>
            </select>
          </div>

          {/* Inline Styles Group */}
          <div className="flex items-center gap-0.5 pl-2 border-l border-border/40">
            <button
              type="button"
              title="پررنگ (Bold) - Ctrl+B"
              onClick={() => executeCommand("bold")}
              className={`size-8 rounded-xl flex items-center justify-center font-bold transition-colors cursor-pointer ${
                isBold
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-foreground/80 hover:bg-muted hover:text-foreground"
              }`}
            >
              <Bold className="size-4" />
            </button>
            <button
              type="button"
              title="مورب (Italic) - Ctrl+I"
              onClick={() => executeCommand("italic")}
              className={`size-8 rounded-xl flex items-center justify-center font-bold transition-colors cursor-pointer ${
                isItalic
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-foreground/80 hover:bg-muted hover:text-foreground"
              }`}
            >
              <Italic className="size-4" />
            </button>
            <button
              type="button"
              title="زیرخط (Underline) - Ctrl+U"
              onClick={() => executeCommand("underline")}
              className={`size-8 rounded-xl flex items-center justify-center font-bold transition-colors cursor-pointer ${
                isUnderline
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-foreground/80 hover:bg-muted hover:text-foreground"
              }`}
            >
              <Underline className="size-4" />
            </button>
            <button
              type="button"
              title="خط‌خورده (Strikethrough)"
              onClick={() => executeCommand("strikeThrough")}
              className={`size-8 rounded-xl flex items-center justify-center font-bold transition-colors cursor-pointer ${
                isStrike
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-foreground/80 hover:bg-muted hover:text-foreground"
              }`}
            >
              <Strikethrough className="size-4" />
            </button>
            <button
              type="button"
              title="پاک کردن فرمت (Clear Formatting)"
              onClick={() => executeCommand("removeFormat")}
              className="size-8 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer transition-colors"
            >
              <RemoveFormatting className="size-4" />
            </button>
          </div>

          {/* Alignment Group */}
          <div className="flex items-center gap-0.5 pl-2 border-l border-border/40">
            <button
              type="button"
              title="راست‌چین (پیش‌فرض فارسی)"
              onClick={() => executeCommand("justifyRight")}
              className="size-8 rounded-xl flex items-center justify-center text-foreground/80 hover:bg-muted hover:text-foreground cursor-pointer transition-colors"
            >
              <AlignRight className="size-4" />
            </button>
            <button
              type="button"
              title="وسط‌چین"
              onClick={() => executeCommand("justifyCenter")}
              className="size-8 rounded-xl flex items-center justify-center text-foreground/80 hover:bg-muted hover:text-foreground cursor-pointer transition-colors"
            >
              <AlignCenter className="size-4" />
            </button>
            <button
              type="button"
              title="چپ‌چین"
              onClick={() => executeCommand("justifyLeft")}
              className="size-8 rounded-xl flex items-center justify-center text-foreground/80 hover:bg-muted hover:text-foreground cursor-pointer transition-colors"
            >
              <AlignLeft className="size-4" />
            </button>
            <button
              type="button"
              title="هم‌تراز (Justify)"
              onClick={() => executeCommand("justifyFull")}
              className="size-8 rounded-xl flex items-center justify-center text-foreground/80 hover:bg-muted hover:text-foreground cursor-pointer transition-colors"
            >
              <AlignJustify className="size-4" />
            </button>
          </div>

          {/* Lists & Quotes Group */}
          <div className="flex items-center gap-0.5 pl-2 border-l border-border/40">
            <button
              type="button"
              title="لیست بالت‌دار (نشانه‌دار)"
              onClick={() => executeCommand("insertUnorderedList")}
              className="size-8 rounded-xl flex items-center justify-center text-foreground/80 hover:bg-muted hover:text-foreground cursor-pointer transition-colors"
            >
              <List className="size-4" />
            </button>
            <button
              type="button"
              title="لیست شماره‌دار (ترتیبی)"
              onClick={() => executeCommand("insertOrderedList")}
              className="size-8 rounded-xl flex items-center justify-center text-foreground/80 hover:bg-muted hover:text-foreground cursor-pointer transition-colors"
            >
              <ListOrdered className="size-4" />
            </button>
            <button
              type="button"
              title="نقل‌قول (Blockquote)"
              onClick={() => handleFormatBlock("blockquote")}
              className="size-8 rounded-xl flex items-center justify-center text-foreground/80 hover:bg-muted hover:text-foreground cursor-pointer transition-colors"
            >
              <Quote className="size-4" />
            </button>
            <button
              type="button"
              title="خط افقی جداکننده"
              onClick={() => executeCommand("insertHorizontalRule")}
              className="size-8 rounded-xl flex items-center justify-center text-foreground/80 hover:bg-muted hover:text-foreground cursor-pointer transition-colors"
            >
              <Minus className="size-4" />
            </button>
          </div>

          {/* Links Group */}
          <div className="flex items-center gap-0.5 pl-2 border-l border-border/40">
            <button
              type="button"
              title="افزودن پیوند / لینک"
              onClick={openLinkModal}
              className="size-8 rounded-xl flex items-center justify-center text-foreground/80 hover:bg-muted hover:text-primary cursor-pointer transition-colors"
            >
              <LinkIcon className="size-4" />
            </button>
            <button
              type="button"
              title="حذف پیوند"
              onClick={() => executeCommand("unlink")}
              className="size-8 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-destructive cursor-pointer transition-colors"
            >
              <Unlink className="size-4" />
            </button>
          </div>

          {/* Undo / Redo */}
          <div className="flex items-center gap-0.5 mr-auto">
            <button
              type="button"
              title="بازگشت (Undo) - Ctrl+Z"
              onClick={() => executeCommand("undo")}
              className="size-8 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer transition-colors"
            >
              <Undo className="size-4" />
            </button>
            <button
              type="button"
              title="انجام مجدد (Redo) - Ctrl+Y"
              onClick={() => executeCommand("redo")}
              className="size-8 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer transition-colors"
            >
              <Redo className="size-4" />
            </button>
          </div>
        </div>
      )}

      {/* ─── Link Inserter Modal ─── */}
      {linkModalOpen && (
        <div className="p-4 bg-muted/40 border-b border-border/60 flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full flex flex-col sm:flex-row items-center gap-2">
            <input
              type="text"
              placeholder="متن نمایشی لینک (اختیاری)"
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
              className="w-full sm:w-1/3 h-9 px-3 rounded-xl border border-border bg-background text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <input
              type="url"
              placeholder="آدرس اینترنتی لینک (مثال: https://artisagallery.ir)..."
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyLink()}
              autoFocus
              className="w-full sm:flex-1 h-9 px-3 rounded-xl border border-border bg-background text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
              dir="ltr"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              onClick={applyLink}
              className="rounded-xl text-xs gap-1 cursor-pointer font-bold"
            >
              <Check className="size-3.5" />
              <span>ثبت پیوند</span>
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setLinkModalOpen(false)}
              className="rounded-xl text-xs cursor-pointer font-bold"
            >
              <X className="size-3.5" />
              <span>انصراف</span>
            </Button>
          </div>
        </div>
      )}

      {/* ─── Document Body Canvas ─── */}
      <div className="p-4 sm:p-8 bg-neutral-100/60 dark:bg-neutral-900/40 flex justify-center">
        {/* Word Document Sheet */}
        <div
          className="w-full max-w-4xl bg-background rounded-2xl border border-border/60 shadow-sm p-6 sm:p-10 transition-all"
          style={{ minHeight }}
        >
          {viewMode === "edit" && (
            <div
              ref={editorRef}
              contentEditable
              onInput={handleInput}
              onKeyUp={updateToolbarState}
              onMouseUp={updateToolbarState}
              dir="rtl"
              className="outline-none min-h-[350px] leading-relaxed text-foreground font-medium text-sm sm:text-base prose prose-neutral dark:prose-invert max-w-none focus:outline-none"
              data-placeholder={placeholder}
              style={{
                direction: "rtl",
                textAlign: "right",
              }}
            />
          )}

          {viewMode === "preview" && (
            <div
              dir="rtl"
              className="prose prose-neutral dark:prose-invert max-w-none text-foreground text-sm sm:text-base leading-relaxed"
              dangerouslySetInnerHTML={{
                __html:
                  value ||
                  '<p class="text-muted-foreground italic">هیچ محتوایی برای پیش‌نمایش وارد نشده است.</p>',
              }}
            />
          )}

          {viewMode === "code" && (
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              rows={15}
              dir="ltr"
              className="w-full h-full p-4 rounded-xl font-mono text-xs bg-muted/40 text-foreground border border-border/60 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          )}
        </div>
      </div>

      {/* ─── Status Bar ─── */}
      <div className="border-t border-border/40 bg-muted/20 px-4 py-2 flex flex-wrap items-center justify-between text-[11px] font-semibold text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>
            تعداد کلمات: <strong className="text-foreground">{words}</strong>
          </span>
          <span>
            تعداد کاراکترها: <strong className="text-foreground">{chars}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-emerald-500" />
          <span>پشتیبانی از قالب‌بندی Word و نگارش استاندارد فارسی</span>
        </div>
      </div>
    </div>
  );
}
