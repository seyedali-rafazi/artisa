'use client';

import React from 'react';
import BannerEditorForm from '@/components/admin/BannerEditorForm';
import { useAdminBanners } from '@/hooks/useBanners';

export default function NewBannerPage() {
  const { data: banners } = useAdminBanners();
  const nextOrder = banners && banners.length > 0
    ? Math.max(...banners.map((b) => b.order ?? 0)) + 1
    : 1;

  return <BannerEditorForm isEditing={false} nextOrder={nextOrder} />;
}
