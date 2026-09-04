"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useBlogPost } from "@/hooks/useBlog";
import BlogDetailsView from "@/components/views/BlogDetailsView";
import { Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function BlogDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id || "";

  const { data: article, isLoading, isError } = useBlogPost(id);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 flex flex-col items-center justify-center gap-3" dir="rtl">
        <Loader2 className="size-8 text-primary animate-spin" />
        <p className="text-xs text-muted-foreground font-bold">در حال دریافت مقاله از سرور...</p>
      </div>
    );
  }

  if (isError || !article) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 flex flex-col items-center justify-center text-center gap-4" dir="rtl">
        <div className="size-16 rounded-3xl bg-destructive/10 text-destructive flex items-center justify-center">
          <AlertCircle className="size-8" />
        </div>
        <h1 className="text-lg font-black text-foreground">مقاله مورد نظر یافت نشد</h1>
        <p className="text-xs text-muted-foreground font-semibold">
          ممکن است این مقاله حذف شده باشد یا آدرس وارد شده نادرست باشد.
        </p>
        <Link href="/blog">
          <Button variant="outline" className="rounded-2xl text-xs font-bold">
            بازگشت به صفحه مقالات
          </Button>
        </Link>
      </div>
    );
  }

  return <BlogDetailsView article={article} />;
}
