'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  useAdminBlogPosts,
  useDeleteBlogPost,
  AdminArticle,
} from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import ConfirmModal from '@/components/ui/ConfirmModal';
import BlogArticlesTable from '@/components/admin/blog/BlogArticlesTable';
import { useDebounce } from '@/hooks/useDebounce';
import { toPersianDigits } from '@/lib/utils';
import {
  Plus,
  BookOpen,
  FileText,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminBlogPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');

  const debouncedSearch = useDebounce(search, 350);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    articleId: string;
    articleTitle: string;
  }>({
    isOpen: false,
    articleId: '',
    articleTitle: '',
  });

  const { data, isLoading } = useAdminBlogPosts({
    page,
    limit: pageSize,
    search: debouncedSearch || undefined,
  });

  const deleteMutation = useDeleteBlogPost();

  const articles = data?.items || [];
  const total = data?.total || 0;
  const totalPages = data?.total_pages || Math.ceil(total / pageSize) || 1;

  const handleDeleteClick = (article: AdminArticle) => {
    setConfirmModal({
      isOpen: true,
      articleId: article.id || article.articleId || '',
      articleTitle: article.title,
    });
  };

  const handleConfirmDelete = () => {
    if (!confirmModal.articleId) return;
    deleteMutation.mutate(confirmModal.articleId, {
      onSuccess: () => {
        toast.success(`مقاله «${confirmModal.articleTitle}» با موفقیت حذف شد.`);
        setConfirmModal({ isOpen: false, articleId: '', articleTitle: '' });
      },
      onError: (err: any) => {
        toast.error(err?.message || 'خطا در حذف مقاله');
      },
    });
  };

  const handleResetFilters = () => {
    setSearch('');
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-6 min-w-0 w-full" dir="rtl">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-foreground flex items-center gap-2">
            <BookOpen className="size-6 text-primary" />
            <span>مدیریت مقالات بلاگ</span>
          </h1>
          <p className="text-xs text-muted-foreground font-semibold mt-1">
            ایجاد، ویرایش، حذف و مدیریت محتوای مجله آرتیسا بر پایه TanStack Table
          </p>
        </div>

        <Link href="/admin/blog/new">
          <Button className="rounded-2xl font-extrabold text-xs gap-2 cursor-pointer shadow-lg shadow-primary/25">
            <Plus className="size-4" />
            <span>افزودن مقاله جدید</span>
          </Button>
        </Link>
      </div>

      {/* Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-3xl border border-border/60 bg-background/95 backdrop-blur-xl p-4 flex items-center gap-4 shadow-sm">
          <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <FileText className="size-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground font-bold">کل مقالات منتشر شده</span>
            <span className="text-xl font-black text-foreground">
              {toPersianDigits(total)} مقاله
            </span>
          </div>
        </div>

        <div className="rounded-3xl border border-border/60 bg-background/95 backdrop-blur-xl p-4 flex items-center gap-4 shadow-sm">
          <div className="size-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <BookOpen className="size-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground font-bold">وضعیت انتشار</span>
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">فعال در سایت</span>
          </div>
        </div>

        <div className="rounded-3xl border border-border/60 bg-background/95 backdrop-blur-xl p-4 flex items-center gap-4 shadow-sm">
          <div className="size-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="size-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground font-bold">صفحه فعال</span>
            <span className="text-xl font-black text-foreground">
              صفحه {toPersianDigits(page)} از {toPersianDigits(totalPages)}
            </span>
          </div>
        </div>
      </div>

      {/* TanStack Blog Articles Table */}
      <BlogArticlesTable
        data={articles}
        isLoading={isLoading}
        totalCount={total}
        totalPages={totalPages}
        currentPage={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setPage(1);
        }}
        searchQuery={search}
        onSearchChange={(query) => {
          setSearch(query);
          setPage(1);
        }}
        onResetFilters={handleResetFilters}
        onDelete={handleDeleteClick}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, articleId: '', articleTitle: '' })}
        onConfirm={handleConfirmDelete}
        title="حذف مقاله"
        description={`آیا از حذف مقاله «${confirmModal.articleTitle}» اطمینان دارید؟ این عملیات غیرقابل بازگشت است.`}
        confirmText="حذف دائمی"
        cancelText="انصراف"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
