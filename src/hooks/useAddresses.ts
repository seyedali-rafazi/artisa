import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, getAuthToken } from '@/lib/api';

export interface AddressItem {
  id: string;
  title: string;
  fullName: string;
  phone: string;
  province: string;
  city: string;
  postalCode: string;
  addressLine: string;
  isDefault: boolean;
}

export interface CreateAddressPayload {
  title: string;
  fullName: string;
  phone: string;
  province: string;
  city: string;
  postalCode: string;
  addressLine: string;
  isDefault?: boolean;
}

export function useAddresses() {
  const token = typeof window !== 'undefined' ? getAuthToken() : null;

  return useQuery({
    queryKey: ['addresses'],
    queryFn: () => api.get<AddressItem[]>('/api/v1/addresses'),
    enabled: Boolean(token),
  });
}

export function useCreateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAddressPayload) =>
      api.post<AddressItem>('/api/v1/addresses', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });
}

export function useSetDefaultAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.put(`/api/v1/addresses/${id}/default`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/v1/addresses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });
}
