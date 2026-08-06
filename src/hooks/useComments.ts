import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface CommentItem {
  id: string;
  productId: string;
  userName: string;
  text: string;
  rating: number;
  date: string;
}

export interface PostCommentPayload {
  text: string;
  rating: number;
  name?: string;
}

export function useProductComments(productId: string) {
  return useQuery({
    queryKey: ['comments', productId],
    queryFn: () => api.get<CommentItem[]>(`/api/v1/products/${productId}/comments`),
    enabled: Boolean(productId),
  });
}

export function usePostComment(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PostCommentPayload) =>
      api.post<CommentItem>(`/api/v1/products/${productId}/comments`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', productId] });
    },
  });
}
