import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, getAuthToken } from '@/lib/api';

export interface OrderItemPayload {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface CreateOrderPayload {
  fullName: string;
  phone: string;
  postalCode: string;
  address: string;
  paymentMethod: string;
  items: OrderItemPayload[];
}

export interface OrderResponseData {
  id: string;
  date: string;
  status: string;
  totalPrice: number;
  paymentStatus: string;
  paymentMethod: string;
  items: OrderItemPayload[];
  shippingAddress?: {
    fullName: string;
    phone: string;
    postalCode: string;
    address: string;
  };
}

export interface TrackingStep {
  title: string;
  desc: string;
  completed: boolean;
}

export interface OrderTrackingData {
  orderId: string;
  status: string;
  date: string;
  totalPrice: number;
  steps: TrackingStep[];
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateOrderPayload) =>
      api.post<OrderResponseData>('/api/v1/orders', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-orders'] });
    },
  });
}

export function useUserOrders() {
  const token = typeof window !== 'undefined' ? getAuthToken() : null;

  return useQuery({
    queryKey: ['user-orders'],
    queryFn: () => api.get<OrderResponseData[]>('/api/v1/orders'),
    enabled: Boolean(token),
  });
}

export function useTrackOrder(orderId: string) {
  return useQuery({
    queryKey: ['track-order', orderId],
    queryFn: () => api.get<OrderTrackingData>(`/api/v1/orders/track/${orderId}`),
    enabled: Boolean(orderId && orderId.trim().length > 0),
    retry: false,
  });
}
