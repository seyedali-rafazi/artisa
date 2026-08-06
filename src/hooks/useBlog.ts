import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface ArticleItem {
  id: string;
  title: string;
  desc: string;
  content?: string;
  date: string;
  author: string;
  image: string;
}

export function useBlogPosts() {
  return useQuery({
    queryKey: ['blog-articles'],
    queryFn: () => api.get<ArticleItem[]>('/api/v1/blog/articles'),
  });
}

export function useBlogPost(id: string) {
  return useQuery({
    queryKey: ['blog-article', id],
    queryFn: () => api.get<ArticleItem>(`/api/v1/blog/articles/${id}`),
    enabled: Boolean(id),
  });
}
