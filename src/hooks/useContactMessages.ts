'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface ContactMessageItem {
  id: string;
  name: string;
  email: string;
  message: string;
  status: 'unread' | 'read';
  created_at?: string;
  updated_at?: string;
}

export interface ContactMessagePayload {
  name: string;
  email: string;
  message: string;
}

export interface ContactMessagesListResult {
  items: ContactMessageItem[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  unread_count: number;
}

export interface ContactMessagesFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

// ─── PUBLIC HOOK ─────────────────────────────────────────────────────────────

/**
 * Hook to submit a new contact form message from the storefront.
 */
export function useSubmitContactMessage() {
  return useMutation({
    mutationFn: (payload: ContactMessagePayload) =>
      api.post<ContactMessageItem>('/api/v1/contact-messages', payload),
  });
}

// ─── ADMIN HOOKS ────────────────────────────────────────────────────────────

/**
 * Hook for administrators to fetch paginated contact messages with filters.
 */
export function useAdminContactMessages(params?: ContactMessagesFilterParams) {
  const cleanParams: Record<string, any> = {
    page: params?.page ?? 1,
    limit: params?.limit ?? 10,
  };
  if (params?.search && params.search.trim()) {
    cleanParams.search = params.search.trim();
  }
  if (params?.status && params.status !== 'all') {
    cleanParams.status = params.status;
  }

  return useQuery({
    queryKey: ['admin-contact-messages', cleanParams],
    queryFn: () =>
      api.get<ContactMessagesListResult>('/api/v1/contact-messages', cleanParams),
  });
}

/**
 * Hook for administrators to retrieve a single contact message by ID.
 */
export function useAdminContactMessage(id?: string, markAsRead = true) {
  return useQuery({
    queryKey: ['admin-contact-message', id, markAsRead],
    queryFn: () =>
      api.get<ContactMessageItem>(`/api/v1/contact-messages/${id}`, {
        mark_as_read: markAsRead,
      }),
    enabled: Boolean(id),
  });
}

/**
 * Hook for administrators to update message status (read / unread).
 */
export function useUpdateContactMessageStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'unread' | 'read' }) =>
      api.patch<ContactMessageItem>(`/api/v1/contact-messages/${id}`, { status }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-contact-messages'] });
      queryClient.invalidateQueries({
        queryKey: ['admin-contact-message', variables.id],
      });
    },
  });
}

/**
 * Hook for administrators to permanently delete a contact message.
 */
export function useDeleteContactMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.delete(`/api/v1/contact-messages/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-contact-messages'] });
    },
  });
}
