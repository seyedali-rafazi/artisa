'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import BannerEditorForm from '@/components/admin/BannerEditorForm';
import { useAdminBanner } from '@/hooks/useBanners';
import { Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EditBannerPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id || '';

  const { data: banner, isLoading, isError, refetch } = useAdminBanner(id);

  if (isLoading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center gap-3 bg-card rounded-3xl border border-border/60 text-muted-foreground" dir="rtl">
        <Loader2 className="size-8 animate-spin text-primary" />
        <span className="text-xs font-bold">در حال دریافت اطلاعات بنر...</span>
      </div>
    );
  }

  if (isError || !banner) {
    return (
      <div className="p-8 text-center bg-destructive/10 rounded-3xl border border-destructive/20 text-destructive text-xs font-bold space-y-4 max-w-lg mx-auto" dir="rtl">
        <AlertCircle className="size-8 mx-auto" />
        <p>بنر مورد نظر یافت نشد یا در دریافت اطلاعات آن خطایی رخ داده است.</p>
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} className="rounded-xl">
            تلاش مجدد
          </Button>
          <Link href="/admin/banners">
            <Button size="sm" className="rounded-xl">
              بازگشت به لیست بنرها
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return <BannerEditorForm initialData={banner} isEditing={true} />;
}
