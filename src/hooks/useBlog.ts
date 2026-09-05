import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface ArticleItem {
  id: string;
  articleId?: string;
  title: string;
  desc: string;
  content?: string;
  date: string;
  author: string;
  image: string;
  created_at?: string;
  updated_at?: string;
}

export function useBlogPosts(
  params?: { search?: string; page?: number; limit?: number },
  options?: { initialData?: ArticleItem[] }
) {
  return useQuery({
    queryKey: ['blog-articles', params],
    queryFn: async () => {
      const res = await api.get<any>('/api/v1/blog/articles', params);
      if (Array.isArray(res)) {
        return res as ArticleItem[];
      }
      if (res && Array.isArray(res.items)) {
        return res.items as ArticleItem[];
      }
      if (res && res.data && Array.isArray(res.data)) {
        return res.data as ArticleItem[];
      }
      return [] as ArticleItem[];
    },
    initialData: options?.initialData,
  });
}

export function useBlogPost(id: string) {
  return useQuery({
    queryKey: ['blog-article', id],
    queryFn: async () => {
      const res = await api.get<any>(`/api/v1/blog/articles/${id}`);
      if (res && res.data && typeof res.data === 'object') {
        return res.data as ArticleItem;
      }
      return res as ArticleItem;
    },
    enabled: Boolean(id),
  });
}
