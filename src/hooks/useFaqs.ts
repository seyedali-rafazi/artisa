import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface FAQItem {
  id: string;
  q: string;
  a: string;
}

export function useFAQs() {
  return useQuery({
    queryKey: ['faqs'],
    queryFn: () => api.get<FAQItem[]>('/api/v1/faqs'),
  });
}
