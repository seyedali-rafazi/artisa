import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, getAuthToken } from '@/lib/api';
import { Product } from '@/components/AppContext';

export function useWishlist() {
  const token = typeof window !== 'undefined' ? getAuthToken() : null;

  return useQuery({
    queryKey: ['wishlist'],
    queryFn: () => api.get<Product[]>('/api/v1/wishlist'),
    enabled: Boolean(token),
  });
}

export function useToggleWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) =>
      api.post<{ added: boolean }>(`/api/v1/wishlist/toggle/${productId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });
}
