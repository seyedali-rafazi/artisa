"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  useAdminBlogPosts,
  useDeleteBlogPost,
  AdminArticle,
} from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ConfirmModal from "@/components/ui/ConfirmModal";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  ExternalLink,
  BookOpen,
  Calendar,
  User,
  Loader2,
  FileText,
  Clock,
} from "lucide-react";

export default function AdminBlogPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    articleId: string;
    articleTitle: string;
  }>({
    isOpen: false,
    articleId: "",
    articleTitle: "",
  });

  const { data, isLoading, isError, refetch } = useAdminBlogPosts({
    page,
    limit: 10,
    search,
  });

  const deleteMutation = useDeleteBlogPost();

  const articles = data?.items || [];
  const total = data?.total || 0;
  const totalPages = data?.total_pages || 1;

  const handleDeleteClick = (article: AdminArticle) => {
    setConfirmModal({
      isOpen: true,
      articleId: article.id || article.articleId || "",
      articleTitle: article.title,
    });
  };

  const handleConfirmDelete = () => {
    if (!confirmModal.articleId) return;
    deleteMutation.mutate(confirmModal.articleId, {
      onSuccess: () => {
        setConfirmModal({ isOpen: false, articleId: "", articleTitle: "" });
      },
    });
  };

  return (
    <div className="flex flex-col gap-6 min-w-0 w-full" dir="rtl">
      {/* ─── Header & Actions ─── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-foreground flex items-center gap-2">
            <BookOpen className="size-6 text-primary" />
            <span>مدیریت مقالات بلاگ</span>
          </h1>
          <p className="text-xs text-muted-foreground font-semibold mt-1">
            ایجاد، ویرایش، حذف و مدیریت مقالات و محتوای مجله هنر آرتیسا
          </p>
        </div>

        <Link href="/admin/blog/new">
          <Button className="rounded-2xl font-extrabold text-xs gap-2 cursor-pointer shadow-lg shadow-primary/25">
            <Plus className="size-4" />
            <span>افزودن مقاله جدید</span>
          </Button>
        </Link>
      </div>

      {/* ─── Stats Banner ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-3xl border border-border/60 bg-background/95 backdrop-blur-xl p-4 flex items-center gap-4 shadow-sm">
          <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <FileText className="size-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground font-bold">کل مقالات منتشر شده</span>
            <span className="text-xl font-black text-foreground">{total} مقاله</span>
          </div>
        </div>

        <div className="rounded-3xl border border-border/60 bg-background/95 backdrop-blur-xl p-4 flex items-center gap-4 shadow-sm">
          <div className="size-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
            <BookOpen className="size-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground font-bold">وضعیت انتشار</span>
            <span className="text-xl font-black text-emerald-600">فعال در سایت</span>
          </div>
        </div>

        <div className="rounded-3xl border border-border/60 bg-background/95 backdrop-blur-xl p-4 flex items-center gap-4 shadow-sm">
          <div className="size-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="size-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground font-bold">صفحه فعال</span>
            <span className="text-xl font-black text-foreground">صفحه {page} از {totalPages}</span>
          </div>
        </div>
      </div>

      {/* ─── Search & Filters ─── */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-background/95 border border-border/60 p-4 rounded-3xl backdrop-blur-xl">
        <div className="relative flex-1 w-full">
          <Input
            type="text"
            placeholder="جستجوی عنوان، متن یا نویسنده مقاله..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="rounded-xl pr-9 text-xs"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        </div>
      </div>

      {/* ─── Articles Table ─── */}
      <div className="rounded-3xl border border-border/60 bg-background/95 backdrop-blur-xl shadow-sm overflow-hidden min-w-0">
        <div className="overflow-x-auto min-w-0">
          <table className="w-full text-right border-collapse text-xs">
            <thead>
              <tr className="border-b border-border/60 bg-muted/40 text-muted-foreground font-extrabold text-[11px]">
                <th className="py-3.5 px-4">تصویر شاخص</th>
                <th className="py-3.5 px-4">عنوان و خلاصه مقاله</th>
                <th className="py-3.5 px-4">نویسنده</th>
                <th className="py-3.5 px-4">تاریخ انتشار</th>
                <th className="py-3.5 px-4 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <Loader2 className="size-6 animate-spin text-primary" />
                      <span>در حال دریافت لیست مقالات...</span>
                    </div>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-destructive">
                    خطا در دریافت مقالات از سرور. لطفاً صفحه را رفرش کنید.
                  </td>
                </tr>
              ) : articles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground">
                    هیچ مقاله‌ای یافت نشد. می‌توانید با کلیک روی «افزودن مقاله جدید» اولین مقاله را منتشر کنید.
                  </td>
                </tr>
              ) : (
                articles.map((article) => {
                  const articleTargetId = article.id || article.articleId;
                  return (
                    <tr
                      key={article.id || article.articleId}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      {/* Thumbnail */}
                      <td className="py-3 px-4 shrink-0">
                        <div className="relative size-14 rounded-2xl overflow-hidden border border-border/80 bg-muted/30 shrink-0">
                          {article.image ? (
                            <Image
                              src={article.image}
                              alt={article.title}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="size-full flex items-center justify-center text-muted-foreground">
                              <BookOpen className="size-5" />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Title & Desc */}
                      <td className="py-3 px-4 max-w-xs sm:max-w-md">
                        <div className="flex flex-col gap-1">
                          <span className="font-black text-foreground text-xs leading-5 hover:text-primary transition-colors">
                            {article.title}
                          </span>
                          <span className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                            {article.desc || "بدون خلاصه"}
                          </span>
                        </div>
                      </td>

                      {/* Author */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-foreground/90">
                          <User className="size-3.5 text-primary" />
                          <span>{article.author || "مدیر سایت"}</span>
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
                          <Calendar className="size-3.5 text-muted-foreground" />
                          <span>{article.date}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 whitespace-nowrap text-center">
                        <div className="inline-flex items-center gap-1.5 justify-center">
                          {/* Live Article View Link */}
                          <Link
                            href={`/blog/${articleTargetId}`}
                            target="_blank"
                            title="مشاهده مقاله در سایت"
                            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                          >
                            <ExternalLink className="size-4" />
                          </Link>

                          {/* Edit */}
                          <Link
                            href={`/admin/blog/${articleTargetId}`}
                            title="ویرایش مقاله"
                            className="p-2 rounded-xl text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                          >
                            <Edit className="size-4" />
                          </Link>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(article)}
                            title="حذف دائمی مقاله"
                            className="p-2 rounded-xl text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ─── Pagination ─── */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-border/40 flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-bold">
              نمایش صفحه {page} از {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="rounded-xl text-xs"
              >
                صفحه قبل
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="rounded-xl text-xs"
              >
                صفحه بعد
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ─── Delete Confirmation Modal ─── */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, articleId: "", articleTitle: "" })}
        onConfirm={handleConfirmDelete}
        title="حذف مقاله از وبلاگ"
        description={`آیا از حذف مقاله «${confirmModal.articleTitle}» اطمینان دارید؟ تصویر شاخص و محتوای این مقاله به صورت دائمی از سرور حذف خواهند شد.`}
        confirmText="بله، حذف کن"
        cancelText="انصراف"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
