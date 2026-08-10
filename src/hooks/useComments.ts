import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface CommentItem {
  id: string;
  productId: string;
  userId?: string;
  userName: string;
  userEmail?: string;
  text: string;
  rating: number;
  status: string;
  date: string;
  created_at?: string;
  productName?: string;
}

export interface PaginatedComments {
  items: CommentItem[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface PostCommentPayload {
  text: string;
  rating: number;
  name?: string;
}

export interface UpdateCommentPayload {
  text?: string;
  rating?: number;
}

export function useProductComments(
  productId: string,
  params?: { page?: number; limit?: number }
) {
  const page = params?.page || 1;
  const limit = params?.limit || 10;

  return useQuery({
    queryKey: ['comments', productId, page, limit],
    queryFn: () =>
      api.get<PaginatedComments>(`/api/v1/products/${productId}/comments`, { page, limit }),
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
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateComment(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, payload }: { commentId: string; payload: UpdateCommentPayload }) =>
      api.patch<CommentItem>(`/api/v1/comments/${commentId}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', productId] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useDeleteComment(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => api.delete(`/api/v1/comments/${commentId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', productId] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
