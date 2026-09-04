"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAdminBlogPost, useUpdateBlogPost } from "@/hooks/useAdmin";
import ImageUploader from "@/components/admin/ImageUploader";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowRight,
  Save,
  Loader2,
  BookOpen,
  Calendar,
  User,
  FileText,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

export default function EditBlogArticlePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id || "";

  const { data: article, isLoading, isError } = useAdminBlogPost(id);
  const updateMutation = useUpdateBlogPost();

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [author, setAuthor] = useState("");
  const [date, setDate] = useState("");
  const [image, setImage] = useState("");
  const [content, setContent] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Prepopulate form fields when article loads
  useEffect(() => {
    if (article) {
      setTitle(article.title || "");
      setDesc(article.desc || "");
      setAuthor(article.author || "");
      setDate(article.date || "");
      setImage(article.image || "");
      setContent(article.content || "");
    }
  }, [article]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!title.trim()) {
      setErrorMsg("لطفاً عنوان مقاله را وارد کنید.");
      return;
    }
    if (!image.trim()) {
      setErrorMsg("لطفاً تصویر بنر (کاور) مقاله را تعیین نمایید.");
      return;
    }
    if (!content.trim() || content === "<p><br></p>") {
      setErrorMsg("لطفاً محتوای مقاله را بنویسید.");
      return;
    }

    const targetId = article?.articleId || article?.id || id;

    updateMutation.mutate(
      {
        id: targetId,
        title: title.trim(),
        desc: desc.trim() || undefined,
        author: author.trim() || undefined,
        date: date.trim() || undefined,
        image: image.trim(),
        content: content.trim(),
      },
      {
        onSuccess: () => {
          setSuccessMsg("تغییرات مقاله با موفقیت ذخیره شد.");
          setTimeout(() => {
            router.push("/admin/blog");
          }, 1000);
        },
        onError: (err: any) => {
          setErrorMsg(err?.message || "خطا در بروزرسانی مقاله.");
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3" dir="rtl">
        <Loader2 className="size-8 text-primary animate-spin" />
        <span className="text-xs font-bold text-muted-foreground">در حال بارگذاری اطلاعات مقاله...</span>
      </div>
    );
  }

  if (isError || !article) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4" dir="rtl">
        <div className="size-16 rounded-3xl bg-destructive/10 text-destructive flex items-center justify-center">
          <AlertCircle className="size-8" />
        </div>
        <h1 className="text-lg font-black text-foreground">مقاله یافت نشد</h1>
        <p className="text-xs text-muted-foreground font-semibold">
          مقاله مورد نظر وجود ندارد یا ممکن است حذف شده باشد.
        </p>
        <Link href="/admin/blog">
          <Button variant="outline" className="rounded-2xl text-xs font-bold">
            بازگشت به لیست مقالات
          </Button>
        </Link>
      </div>
    );
  }

  const articleTargetId = article.id || article.articleId || id;

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto min-w-0" dir="rtl">
      {/* ─── Top Bar with Back & Live View ─── */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/blog"
          className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary transition-colors cursor-pointer"
        >
          <ArrowRight className="size-4" />
          <span>بازگشت به لیست مقالات</span>
        </Link>

        <Link
          href={`/blog/${articleTargetId}`}
          target="_blank"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline cursor-pointer"
        >
          <span>مشاهده مقاله در سایت</span>
          <ExternalLink className="size-3.5" />
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* ─── Page Title & Action ─── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <BookOpen className="size-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-foreground">ویرایش مقاله</h1>
              <p className="text-xs text-muted-foreground font-semibold">
                ویرایش مشخصات و متن مقاله با فرمت‌بندی مایکروسافت ورد
              </p>
            </div>
          </div>

          <Button
            type="submit"
            disabled={updateMutation.isPending}
            className="rounded-2xl font-extrabold text-xs gap-2 cursor-pointer shadow-lg shadow-primary/25"
          >
            {updateMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            <span>ذخیره تغییرات</span>
          </Button>
        </div>

        {/* ─── Notifications ─── */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/30 text-destructive text-xs font-bold">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-xs font-bold">
            {successMsg}
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
              placeholder="عنوان مقاله را وارد کنید..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="rounded-xl text-xs font-bold"
            />
          </div>

          {/* Author & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                <User className="size-3.5 text-primary" />
                <span>نام نویسنده</span>
              </label>
              <Input
                type="text"
                placeholder="نام نویسنده..."
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

          {/* Excerpt */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-muted-foreground">
              خلاصه کوتاه مقاله (اختیاری - در صورت خالی بودن، خودکار از متن گرفته می‌شود)
            </label>
            <textarea
              rows={3}
              placeholder="خلاصه مقاله برای کارت‌ها..."
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
              در صورت تغییر تصویر، تصویر قبلی به صورت خودکار از سرور پاک‌سازی می‌شود
            </span>
          </h2>
          <ImageUploader
            featuredImage={image}
            onFeaturedChange={(url) => setImage(url)}
          />
        </div>

        {/* ─── Rich Text Article Content (Word Editor) ─── */}
        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-black text-foreground px-1">
            محتوا و نگارش مقاله (ویرایشگر مایکروسافت ورد) *
          </h2>
          <RichTextEditor
            value={content}
            onChange={setContent}
            placeholder="متن کامل مقاله، تیترها و قالب‌بندی را اینجا بنویسید..."
            minHeight="450px"
          />
        </div>

        {/* ─── Bottom Actions ─── */}
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
            disabled={updateMutation.isPending}
            className="rounded-2xl font-extrabold text-xs gap-2 cursor-pointer shadow-lg shadow-primary/25 px-6"
          >
            {updateMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            <span>ذخیره تغییرات</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
