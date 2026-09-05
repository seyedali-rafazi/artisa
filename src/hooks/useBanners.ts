import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface BannerPosition {
  x: number; // 0 - 100 percentage
  y: number; // 0 - 100 percentage
}

export interface BannerTextElement {
  id: string;
  text: string;
  fontFamily: string;
  fontSize: number; // in px
  fontWeight: string; // "400", "500", "600", "700", "800", "normal", "bold", etc.
  color: string; // hex or rgba
  textAlign: 'right' | 'center' | 'left';
  lineHeight?: number;
  letterSpacing?: number;
  textShadow?: string | null;
  position: BannerPosition;
  scaleX?: number; // horizontal scale factor (default 1.0)
  scaleY?: number; // vertical scale factor (default 1.0)
}

export interface BannerItem {
  id: string;
  title: string;
  image: string;
  texts: BannerTextElement[];
  link?: string;
  linkOpenInNewTab?: boolean;
  isActive?: boolean;
  order?: number;
  created_at?: string;
  updated_at?: string;

  // Legacy fields
  subtitle?: string;
  badge?: string;
  buttonText?: string;
}

export interface BannerPayload {
  title: string;
  image: string;
  texts?: BannerTextElement[];
  link?: string;
  linkOpenInNewTab?: boolean;
  isActive?: boolean;
  order?: number;
  subtitle?: string;
  badge?: string;
  buttonText?: string;
}

export interface BannerReorderItem {
  id: string;
  order: number;
}

// ─── PUBLIC STOREFRONT HOOKS ────────────────────────────────────────────────

/**
 * Fetch active hero banners sorted by display order for the storefront.
 */
export function useBanners(options?: { initialData?: BannerItem[] }) {
  return useQuery({
    queryKey: ['banners'],
    queryFn: () => api.get<BannerItem[]>('/api/v1/banners'),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    initialData: options?.initialData,
  });
}

// ─── ADMIN DASHBOARD HOOKS ──────────────────────────────────────────────────

/**
 * Fetch all banners for admin management with optional search & status filter.
 */
export function useAdminBanners(params?: { search?: string; status?: string }) {
  return useQuery({
    queryKey: ['admin-banners', params],
    queryFn: () => api.get<BannerItem[]>('/api/v1/admin/banners', params),
  });
}

/**
 * Fetch single banner details for editing.
 */
export function useAdminBanner(id?: string) {
  return useQuery({
    queryKey: ['admin-banner', id],
    queryFn: () => api.get<BannerItem>(`/api/v1/admin/banners/${id}`),
    enabled: Boolean(id),
  });
}

/**
 * Create a new banner document.
 */
export function useCreateBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BannerPayload) =>
      api.post<BannerItem>('/api/v1/admin/banners', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      queryClient.invalidateQueries({ queryKey: ['banners'] });
    },
  });
}

/**
 * Update an existing banner.
 */
export function useUpdateBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: Partial<BannerPayload> & { id: string }) =>
      api.put<BannerItem>(`/api/v1/admin/banners/${id}`, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      queryClient.invalidateQueries({ queryKey: ['admin-banner', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['banners'] });
    },
  });
}

/**
 * Toggle the publish/active status of a banner.
 */
export function useToggleBannerActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive?: boolean }) =>
      api.patch<BannerItem>(
        `/api/v1/admin/banners/${id}/status`,
        isActive !== undefined ? { isActive } : undefined
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      queryClient.invalidateQueries({ queryKey: ['banners'] });
    },
  });
}

/**
 * Batch reorder banner list.
 */
export function useReorderBanners() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (items: BannerReorderItem[]) =>
      api.patch<BannerItem[]>('/api/v1/admin/banners/order', { items }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      queryClient.invalidateQueries({ queryKey: ['banners'] });
    },
  });
}

/**
 * Delete a banner and trigger Vercel Blob cleanup.
 */
export function useDeleteBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/v1/admin/banners/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      queryClient.invalidateQueries({ queryKey: ['banners'] });
    },
  });
}

