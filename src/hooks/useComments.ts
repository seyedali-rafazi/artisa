import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { CommentsStore } from '@/lib/commentsStore';

export interface CommentItem {
  id: string;
  productId: string;
  userId?: string;
  userName: string;
  userEmail?: string;
  text: string;
  rating: number;
  type?: 'comment' | 'question';
  reply?: string;
  replyDate?: string;
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
  type?: 'comment' | 'question';
}

export interface UpdateCommentPayload {
  text?: string;
  rating?: number;
  reply?: string;
}

export function useProductComments(
  productId: string,
  params?: { page?: number; limit?: number }
) {
  const page = params?.page || 1;
  const limit = params?.limit || 10;

  return useQuery({
    queryKey: ['comments', productId, page, limit],
    queryFn: async () => {
      let apiItems: CommentItem[] = [];
      try {
        const res = await api.get<PaginatedComments>(`/api/v1/products/${productId}/comments`, { page, limit });
        if (res && Array.isArray(res.items)) {
          apiItems = res.items;
        }
      } catch (err) {}

      const localResult = CommentsStore.getCommentsByProductId(productId, page, limit);
      
      // Deduplicate by ID and content signature so no comment appears twice
      const map = new Map<string, CommentItem>();
      const textKey = (item: CommentItem) =>
        `${item.productId}_${(item.userName || '').trim()}_${(item.text || '').trim().toLowerCase()}`;
      const seenTextKeys = new Set<string>();

      apiItems.forEach((item) => {
        map.set(item.id, item);
        seenTextKeys.add(textKey(item));
      });

      localResult.items.forEach((item) => {
        const tKey = textKey(item);
        if (map.has(item.id)) {
          const existing = map.get(item.id)!;
          map.set(item.id, {
            ...existing,
            ...item,
            reply: item.reply || existing.reply,
            replyDate: item.replyDate || existing.replyDate,
          });
        } else if (!seenTextKeys.has(tKey)) {
          map.set(item.id, item);
          seenTextKeys.add(tKey);
        }
      });

      const mergedList = Array.from(map.values());
      const totalCount = Math.max(mergedList.length, localResult.total);
      const totalPagesCount = Math.ceil(mergedList.length / limit) || 1;

      return {
        items: mergedList,
        total: totalCount,
        page,
        limit,
        total_pages: totalPagesCount,
      };
    },
    enabled: Boolean(productId),
  });
}

export function usePostComment(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: PostCommentPayload) => {
      let backendComment: any = null;
      try {
        backendComment = await api.post(`/api/v1/products/${productId}/comments`, payload);
      } catch (e) {}

      const commentId = backendComment?.id || backendComment?.data?.id;

      return CommentsStore.addComment({
        id: commentId ? String(commentId) : undefined,
        productId,
        userName: payload.name || 'کاربر مهمان',
        text: payload.text,
        rating: payload.rating,
        type: payload.type || 'comment',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      queryClient.invalidateQueries({ queryKey: ['admin-comments'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateComment(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId, payload }: { commentId: string; payload: UpdateCommentPayload }) => {
      CommentsStore.updateComment(commentId, payload);
      try {
        await api.patch(`/api/v1/comments/${commentId}`, payload);
      } catch (e) {}
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      queryClient.invalidateQueries({ queryKey: ['admin-comments'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useDeleteComment(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentId: string) => {
      CommentsStore.deleteComment(commentId);
      try {
        await api.delete(`/api/v1/comments/${commentId}`);
      } catch (e) {}
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      queryClient.invalidateQueries({ queryKey: ['admin-comments'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
