import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Product } from '@/components/AppContext';

export interface ProductsQueryParams {
  search?: string;
  category?: string;
  isSpecial?: boolean;
  isBestSeller?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sort_by?: string;
  sort_order?: string;
  page?: number;
  limit?: number;
}

export interface ProductsPaginatedResponse {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export function useProducts(
  params: ProductsQueryParams = {},
  options?: { initialData?: ProductsPaginatedResponse }
) {
  // Only use initialData if we are on the default first page with no filters applied
  const hasActiveFilters = Boolean(
    params.category ||
    params.search ||
    params.isSpecial ||
    params.isBestSeller ||
    params.minPrice !== undefined ||
    params.maxPrice !== undefined ||
    (params.page && params.page > 1) ||
    (params.sort_by && params.sort_by !== 'created_at') ||
    (params.sort_order && params.sort_order !== 'desc')
  );

  return useQuery({
    queryKey: ['products', params],
    queryFn: () => api.get<ProductsPaginatedResponse>('/api/v1/products', params),
    initialData: hasActiveFilters ? undefined : options?.initialData,
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => api.get<Product>(`/api/v1/products/${id}`),
    enabled: Boolean(id),
  });
}
