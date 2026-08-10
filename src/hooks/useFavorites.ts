import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, getAuthToken } from '@/lib/api';
import { Product } from '@/components/AppContext';

export interface FavoriteIdsResponse {
  favorite_ids: string[];
}

export function useFavoriteIds() {
  const token = typeof window !== 'undefined' ? getAuthToken() : null;

  return useQuery({
    queryKey: ['favorites', 'ids'],
    queryFn: async () => {
      const res = await api.get<{ favorite_ids: string[] }>('/api/v1/favorites/ids');
      return res?.favorite_ids || [];
    },
    enabled: Boolean(token),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
}

export function useFavorites() {
  const token = typeof window !== 'undefined' ? getAuthToken() : null;

  return useQuery({
    queryKey: ['favorites', 'list'],
    queryFn: async () => {
      const res = await api.get<Product[]>('/api/v1/favorites');
      return Array.isArray(res) ? res : [];
    },
    enabled: Boolean(token),
    staleTime: 1000 * 60 * 5,
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ product, isFavorited }: { product: Product; isFavorited: boolean }) => {
      if (isFavorited) {
        return api.delete<{ is_favorited: boolean; product_id: string }>(
          `/api/v1/favorites/${product.id}`
        );
      } else {
        return api.post<{ is_favorited: boolean; product_id: string }>(
          `/api/v1/favorites/${product.id}`
        );
      }
    },
    onMutate: async ({ product, isFavorited }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['favorites', 'ids'] });
      await queryClient.cancelQueries({ queryKey: ['favorites', 'list'] });

      // Snapshot previous values
      const previousIds = queryClient.getQueryData<string[]>(['favorites', 'ids']) || [];
      const previousList = queryClient.getQueryData<Product[]>(['favorites', 'list']) || [];

      // Optimistically update IDs
      queryClient.setQueryData<string[]>(['favorites', 'ids'], (old = []) => {
        if (isFavorited) {
          return old.filter((id) => id !== product.id);
        } else {
          return old.includes(product.id) ? old : [...old, product.id];
        }
      });

      // Optimistically update List
      queryClient.setQueryData<Product[]>(['favorites', 'list'], (old = []) => {
        if (isFavorited) {
          return old.filter((p) => p.id !== product.id);
        } else {
          return old.some((p) => p.id === product.id) ? old : [...old, product];
        }
      });

      return { previousIds, previousList };
    },
    onError: (err, context, contextData: any) => {
      if (contextData?.previousIds) {
        queryClient.setQueryData(['favorites', 'ids'], contextData.previousIds);
      }
      if (contextData?.previousList) {
        queryClient.setQueryData(['favorites', 'list'], contextData.previousList);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites', 'ids'] });
      queryClient.invalidateQueries({ queryKey: ['favorites', 'list'] });
    },
  });
}
