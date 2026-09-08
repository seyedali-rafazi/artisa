'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface SpecificationSetting {
  id: string;
  title: string;
  default_value?: string;
  category?: string | null;
  description?: string | null;
  order?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateSpecificationSettingPayload {
  title: string;
  default_value?: string;
  category?: string | null;
  description?: string | null;
  order?: number;
  is_active?: boolean;
}

export interface UpdateSpecificationSettingPayload {
  id: string;
  title?: string;
  default_value?: string;
  category?: string | null;
  description?: string | null;
  order?: number;
  is_active?: boolean;
}

/**
 * Fetch all saved specification settings with search and category filtering.
 * Returns only real data from the database.
 */
export function useSpecificationSettings(params?: {
  search?: string;
  category?: string;
  active_only?: boolean;
}) {
  return useQuery({
    queryKey: ['specification-settings', params],
    queryFn: async () => {
      try {
        const queryObj: Record<string, string> = {};
        if (params?.search) queryObj.search = params.search;
        if (params?.category) queryObj.category = params.category;
        if (params?.active_only) queryObj.active_only = 'true';

        const data = await api.get<SpecificationSetting[]>(
          '/api/v1/admin/specification-settings',
          queryObj
        );
        if (Array.isArray(data)) {
          return data;
        }
        return [];
      } catch {
        return [];
      }
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Create a new specification setting preset.
 */
export function useCreateSpecificationSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSpecificationSettingPayload) =>
      api.post<SpecificationSetting>('/api/v1/admin/specification-settings', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['specification-settings'] });
    },
  });
}

/**
 * Update an existing specification setting preset.
 */
export function useUpdateSpecificationSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: UpdateSpecificationSettingPayload) =>
      api.put<SpecificationSetting>(`/api/v1/admin/specification-settings/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['specification-settings'] });
    },
  });
}

/**
 * Delete a specification setting preset.
 */
export function useDeleteSpecificationSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.delete(`/api/v1/admin/specification-settings/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['specification-settings'] });
    },
  });
}
