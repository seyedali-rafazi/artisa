"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCreateBlogPost } from "@/hooks/useAdmin";
import { useUserProfile } from "@/hooks/useAuth";
import ImageUploader from "@/components/admin/ImageUploader";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Save, Loader2, BookOpen, Calendar, User, FileText } from "lucide-react";

export default function NewBlogArticlePage() {
  const router = useRouter();
  const createMutation = useCreateBlogPost();
  const { data: currentUser } = useUserProfile();

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [author, setAuthor] = useState(currentUser?.name || "تیم تحریریه آرتیسا");
  const [date, setDate] = useState(() => {
    try {
      return new Intl.DateTimeFormat("fa-IR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date());
    } catch {
      return "۱۴۰۵/۰۴/۱۵";
    }
  });
  const [image, setImage] = useState("");
  const [content, setContent] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!title.trim()) {
      setErrorMsg("لطفاً عنوان مقاله را وارد کنید.");
      return;
    }
    if (!image.trim()) {
      setErrorMsg("لطفاً تصویر بنر (کاور) مقاله را بارگذاری کنید.");
      return;
    }
    if (!content.trim() || content === "<p><br></p>") {
      setErrorMsg("لطفاً محتوای مقاله را بنویسید.");
      return;
    }

    createMutation.mutate(
      {
        title: title.trim(),
        desc: desc.trim() || undefined,
        author: author.trim() || undefined,
        date: date.trim() || undefined,
        image: image.trim(),
        content: content.trim(),
      },
      {
        onSuccess: () => {
          router.push("/admin/blog");
        },
        onError: (err: any) => {
          setErrorMsg(err?.message || "خطا در ایجاد مقاله. لطفاً مجدداً تلاش نمایید.");
        },
      }
    );
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto min-w-0" dir="rtl">
      {/* ─── Back Link ─── */}
      <Link
        href="/admin/blog"
        className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary transition-colors cursor-pointer"
      >
        <ArrowRight className="size-4" />
        <span>بازگشت به لیست مقالات</span>
      </Link>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* ─── Page Title & Submit Button ─── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <BookOpen className="size-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-foreground">افزودن مقاله جدید</h1>
              <p className="text-xs text-muted-foreground font-semibold">
                نوشتن و انتشار مقاله جدید با ویرایشگر ورد در مجله هنر آرتیسا
              </p>
            </div>
          </div>

          <Button
            type="submit"
            disabled={createMutation.isPending}
            className="rounded-2xl font-extrabold text-xs gap-2 cursor-pointer shadow-lg shadow-primary/25"
          >
            {createMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            <span>انتشار مقاله</span>
          </Button>
        </div>

        {/* ─── Error Message Alert ─── */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/30 text-destructive text-xs font-bold">
            {errorMsg}
          </div>
        )}

        {/* ─── Basic Meta Card ─── */}
        <div className="rounded-3xl border border-border/60 bg-background/95 backdrop-blur-xl p-6 shadow-sm flex flex-col gap-4">
          <h2 className="text-sm font-black text-foreground border-b border-border/40 pb-3 flex items-center gap-2">
            <FileText className="size-4 text-primary" />
            <span>مشخصات اصلی مقاله</span>
          </h2>

          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-muted-foreground">عنوان مقاله *</label>
            <Input
              type="text"
              placeholder="مثال: راهنمای انتخاب بهترین رنگ برای قاب تابلوهای دکوراتیو"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="rounded-xl text-xs font-bold"
            />
          </div>

          {/* Author & Date Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                <User className="size-3.5 text-primary" />
                <span>نام نویسنده</span>
              </label>
              <Input
                type="text"
                placeholder="مثال: پریسا بابایی"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="rounded-xl text-xs"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                <Calendar className="size-3.5 text-primary" />
                <span>تاریخ انتشار (شمسی)</span>
              </label>
              <Input
                type="text"
                placeholder="۱۴۰۵/۰۴/۱۵"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Excerpt / Summary */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-muted-foreground">
              خلاصه کوتاه مقاله (اختیاری - در صورت خالی بودن، به طور خودکار از متن استخراج می‌شود)
            </label>
            <textarea
              rows={3}
              placeholder="خلاصه‌ای جذاب در ۱ الی ۲ جمله برای نمایش در کارت‌های وبلاگ..."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full p-3 text-xs leading-relaxed rounded-xl border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary text-foreground font-medium resize-y"
            />
          </div>
        </div>

        {/* ─── Banner / Cover Image Card ─── */}
        <div className="rounded-3xl border border-border/60 bg-background/95 backdrop-blur-xl p-6 shadow-sm flex flex-col gap-4">
          <h2 className="text-sm font-black text-foreground border-b border-border/40 pb-3 flex items-center justify-between">
            <span>تصویر بنر (کاور) مقاله *</span>
            <span className="text-[11px] text-muted-foreground font-semibold">
              ذخیره‌سازی بهینه در فضای ابری Vercel Blob
            </span>
          </h2>
          <ImageUploader
            featuredImage={image}
            onFeaturedChange={(url) => setImage(url)}
          />
        </div>

        {/* ─── Rich Text Article Content Card (Word Editor) ─── */}
        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-black text-foreground px-1">
            محتوا و نگارش مقاله (ویرایشگر مایکروسافت ورد) *
          </h2>
          <RichTextEditor
            value={content}
            onChange={setContent}
            placeholder="محتوای کامل مقاله، راهنما، تیترها و تصاویر را با فرمت‌بندی ورد بنویسید..."
            minHeight="450px"
          />
        </div>

        {/* ─── Bottom Submit Actions ─── */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
          <Link href="/admin/blog">
            <Button
              type="button"
              variant="outline"
              className="rounded-2xl text-xs font-bold cursor-pointer"
            >
              انصراف
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={createMutation.isPending}
            className="rounded-2xl font-extrabold text-xs gap-2 cursor-pointer shadow-lg shadow-primary/25 px-6"
          >
            {createMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            <span>انتشار مقاله</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
