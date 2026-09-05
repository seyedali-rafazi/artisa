'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface SpecialOfferProduct {
  id: string;
  name: string;
  nameEn?: string;
  price: number;
  oldPrice?: number;
  image: string;
  category: string;
  categoryEn?: string;
  rating?: number;
  stock_quantity: number;
  status: string;
}

export interface SpecialOffer {
  id: string;
  title: string;
  description?: string;
  product_ids: string[];
  products?: SpecialOfferProduct[];
  start_at: string;
  end_at: string;
  start_at_tehran: string;
  end_at_tehran: string;
  is_active: boolean;
  status: 'active' | 'upcoming' | 'expired' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface PaginatedSpecialOffers {
  items: SpecialOffer[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface SpecialOfferPayload {
  title: string;
  description?: string;
  product_ids: string[];
  start_at: string;
  end_at: string;
  is_active?: boolean;
}

// ─── PUBLIC HOOKS ──────────────────────────────────────────────────────────

/**
 * Fetch all currently active special offers for customer storefront.
 */
export function useActiveSpecialOffers(options?: { initialData?: SpecialOffer[] }) {
  return useQuery({
    queryKey: ['special-offers-active'],
    queryFn: () => api.get<SpecialOffer[]>('/api/v1/special-offers/active'),
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 60, // Poll every minute to stay synced with lifecycle
    initialData: options?.initialData,
  });
}

// ─── ADMIN HOOKS ───────────────────────────────────────────────────────────

/**
 * Fetch paginated special offers with search and status filtering for admin panel.
 */
export function useAdminSpecialOffers(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: ['admin-special-offers', params],
    queryFn: () => api.get<PaginatedSpecialOffers>('/api/v1/admin/special-offers', params),
  });
}

/**
 * Fetch single special offer by ID for admin viewing/editing.
 */
export function useAdminSpecialOffer(id?: string) {
  return useQuery({
    queryKey: ['admin-special-offer', id],
    queryFn: () => api.get<SpecialOffer>(`/api/v1/admin/special-offers/${id}`),
    enabled: Boolean(id),
  });
}

/**
 * Mutation to create a new special offer.
 */
export function useCreateSpecialOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SpecialOfferPayload) =>
      api.post<SpecialOffer>('/api/v1/admin/special-offers', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-special-offers'] });
      queryClient.invalidateQueries({ queryKey: ['special-offers-active'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

/**
 * Mutation to update an existing special offer.
 */
export function useUpdateSpecialOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<SpecialOfferPayload> & { id: string }) =>
      api.put<SpecialOffer>(`/api/v1/admin/special-offers/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-special-offers'] });
      queryClient.invalidateQueries({ queryKey: ['admin-special-offer', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['special-offers-active'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

/**
 * Mutation to toggle an offer's manual active flag.
 */
export function useToggleSpecialOfferActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.patch<SpecialOffer>(`/api/v1/admin/special-offers/${id}/toggle-active`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-special-offers'] });
      queryClient.invalidateQueries({ queryKey: ['special-offers-active'] });
    },
  });
}

/**
 * Mutation to delete a special offer.
 */
export function useDeleteSpecialOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.delete(`/api/v1/admin/special-offers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-special-offers'] });
      queryClient.invalidateQueries({ queryKey: ['special-offers-active'] });
    },
  });
}
