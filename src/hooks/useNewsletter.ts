'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface NewsletterSubscriberItem {
  id: string;
  email: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PaginatedNewsletterSubscribersResult {
  items: NewsletterSubscriberItem[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  active_count: number;
}

export interface NewsletterFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  is_active?: boolean;
}

// ─── PUBLIC HOOK ─────────────────────────────────────────────────────────────

/**
 * Hook to subscribe user email to the newsletter from footer.
 */
export function useSubscribeNewsletter() {
  return useMutation({
    mutationFn: (email: string) =>
      api.post<NewsletterSubscriberItem>('/api/v1/newsletter/subscribe', { email }),
  });
}

// ─── ADMIN HOOKS ────────────────────────────────────────────────────────────

/**
 * Hook for administrators to fetch paginated newsletter subscribers with search & filters.
 */
export function useAdminNewsletterSubscribers(params?: NewsletterFilterParams) {
  const cleanParams: Record<string, any> = {
    page: params?.page ?? 1,
    limit: params?.limit ?? 10,
  };
  if (params?.search && params.search.trim()) {
    cleanParams.search = params.search.trim();
  }
  if (params?.is_active !== undefined) {
    cleanParams.is_active = params.is_active;
  }

  return useQuery({
    queryKey: ['admin-newsletter-subscribers', cleanParams],
    queryFn: () =>
      api.get<PaginatedNewsletterSubscribersResult>(
        '/api/v1/admin/newsletter/subscribers',
        cleanParams
      ),
  });
}

/**
 * Hook to toggle subscriber active/inactive status.
 */
export function useToggleNewsletterSubscriberActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.patch<NewsletterSubscriberItem>(
        `/api/v1/admin/newsletter/subscribers/${id}/toggle-active`
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-newsletter-subscribers'] });
    },
  });
}

/**
 * Hook to permanently delete a newsletter subscriber.
 */
export function useDeleteNewsletterSubscriber() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.delete(`/api/v1/admin/newsletter/subscribers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-newsletter-subscribers'] });
    },
  });
}
