import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface BannerItem {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  buttonText?: string;
  image: string;
  link?: string;
}

export function useBanners() {
  return useQuery({
    queryKey: ['banners'],
    queryFn: () => api.get<BannerItem[]>('/api/v1/banners'),
  });
}
