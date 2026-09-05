'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  q?: string;
  a?: string;
  order?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface FAQPayload {
  question: string;
  answer: string;
  order?: number;
  is_active?: boolean;
}

export interface FAQReorderItem {
  id: string;
  order: number;
}

// ─── PUBLIC HOOKS ──────────────────────────────────────────────────────────

/**
 * Fetch all active FAQs sorted by display order for the public storefront.
 */
export function useFAQs(initialData?: FAQItem[]) {
  return useQuery({
    queryKey: ['faqs'],
    queryFn: () => api.get<FAQItem[]>('/api/v1/faqs'),
    initialData,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
}

// ─── ADMIN HOOKS ───────────────────────────────────────────────────────────

/**
 * Fetch all FAQs for admin panel with optional text search.
 */
export function useAdminFAQs(params?: { search?: string }) {
  return useQuery({
    queryKey: ['admin-faqs', params],
    queryFn: () => api.get<FAQItem[]>('/api/v1/admin/faqs', params),
  });
}

/**
 * Fetch a single FAQ by ID for admin editing.
 */
export function useAdminFAQ(id?: string) {
  return useQuery({
    queryKey: ['admin-faq', id],
    queryFn: () => api.get<FAQItem>(`/api/v1/admin/faqs/${id}`),
    enabled: Boolean(id),
  });
}

/**
 * Create a new FAQ item.
 */
export function useCreateFAQ() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: FAQPayload) =>
      api.post<FAQItem>('/api/v1/admin/faqs', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-faqs'] });
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
    },
  });
}

/**
 * Update an existing FAQ item.
 */
export function useUpdateFAQ() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: Partial<FAQPayload> & { id: string }) =>
      api.put<FAQItem>(`/api/v1/admin/faqs/${id}`, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-faqs'] });
      queryClient.invalidateQueries({ queryKey: ['admin-faq', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
    },
  });
}

/**
 * Toggle the publish/active status of an FAQ.
 */
export function useToggleFAQActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.patch<FAQItem>(`/api/v1/admin/faqs/${id}/toggle-active`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-faqs'] });
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
    },
  });
}

/**
 * Batch reorder FAQ items.
 */
export function useReorderFAQs() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (items: FAQReorderItem[]) =>
      api.patch<FAQItem[]>('/api/v1/admin/faqs/reorder', { items }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-faqs'] });
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
    },
  });
}

/**
 * Delete an FAQ item permanently.
 */
export function useDeleteFAQ() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.delete(`/api/v1/admin/faqs/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-faqs'] });
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
    },
  });
}
