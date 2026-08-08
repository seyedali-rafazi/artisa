import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface DashboardStats {
  total_revenue: number;
  today_revenue: number;
  monthly_revenue: number;
  total_orders: number;
  pending_orders: number;
  completed_orders: number;
  cancelled_orders: number;
  total_customers: number;
  total_products: number;
  low_stock_products: number;
  out_of_stock_products: number;
  monthly_revenue_chart: { month: string; revenue: number }[];
  monthly_orders_chart: { month: string; orders: number }[];
  categories_distribution: { category: string; count: number }[];
  best_selling_products: { name: string; sales: number; revenue: number; image: string }[];
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  total_orders: number;
  total_spent: number;
  created_at: string;
}

export interface AdminProduct {
  id: string;
  name: string;
  nameEn?: string;
  price: number;
  oldPrice?: number;
  image: string;
  gallery?: string[];
  category: string;
  categoryEn?: string;
  rating?: number;
  isSpecial?: boolean;
  isBestSeller?: boolean;
  description?: string;
  descriptionEn?: string;
  specifications?: Record<string, string>;
  stock_quantity: number;
  sku?: string;
  status: string; // published, draft, archived
}

export interface AdminOrder {
  id: string;
  orderId: string;
  userId?: string;
  date: string;
  status: string;
  totalPrice: number;
  paymentStatus: string;
  paymentMethod: string;
  items: { id: string; name: string; price: number; quantity: number; image: string }[];
  shippingAddress?: { fullName: string; phone: string; postalCode?: string; address: string };
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  user_email: string;
  user_role: string;
  action: string;
  resource: string;
  details: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// ─── DASHBOARD ─────────────────────────────────────────────────────────────

export function useAdminDashboard() {
  return useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => api.get<DashboardStats>('/api/v1/admin/analytics/dashboard'),
  });
}

// ─── USERS ─────────────────────────────────────────────────────────────────

export function useAdminUsers(params: { page?: number; limit?: number; search?: string; role?: string; is_active?: boolean }) {
  return useQuery({
    queryKey: ['admin-users', params],
    queryFn: () => api.get<PaginatedResult<AdminUser>>('/api/v1/admin/users', params),
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, is_active }: { userId: string; is_active: boolean }) =>
      api.patch(`/api/v1/admin/users/${userId}/status`, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      api.patch(`/api/v1/admin/users/${userId}/role`, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-list'] });
    },
  });
}

// ─── PRODUCTS ──────────────────────────────────────────────────────────────

export function useAdminProducts(params: { page?: number; limit?: number; search?: string; category?: string; status?: string }) {
  return useQuery({
    queryKey: ['admin-products', params],
    queryFn: () => api.get<PaginatedResult<AdminProduct>>('/api/v1/admin/products', params),
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<AdminProduct>) => api.post<AdminProduct>('/api/v1/admin/products', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<AdminProduct> & { id: string }) =>
      api.put<AdminProduct>(`/api/v1/admin/products/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useArchiveProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/v1/admin/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/v1/admin/products/${id}/permanent`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useRestoreProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/api/v1/admin/products/${id}/restore`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
  });
}

export function useDuplicateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<AdminProduct>(`/api/v1/admin/products/${id}/duplicate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
  });
}

// ─── ORDERS ────────────────────────────────────────────────────────────────

export function useAdminOrders(params: { page?: number; limit?: number; search?: string; status?: string }) {
  return useQuery({
    queryKey: ['admin-orders', params],
    queryFn: () => api.get<PaginatedResult<AdminOrder>>('/api/v1/admin/orders', params),
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, status, paymentStatus }: { orderId: string; status: string; paymentStatus?: string }) =>
      api.patch(`/api/v1/admin/orders/${orderId}/status`, { status, paymentStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
  });
}

// ─── ADMIN MANAGEMENT ──────────────────────────────────────────────────────

export function useAdminList() {
  return useQuery({
    queryKey: ['admin-list'],
    queryFn: () => api.get<AdminUser[]>('/api/v1/admin/admins'),
  });
}

export function useCreateAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string; email: string; password: string; role?: string; phone?: string }) =>
      api.post('/api/v1/admin/admins', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-list'] });
    },
  });
}

export function useDeleteAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (adminId: string) => api.delete(`/api/v1/admin/admins/${adminId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-list'] });
    },
  });
}

// ─── AUDIT LOGS ────────────────────────────────────────────────────────────

export function useAuditLogs(params: { page?: number; limit?: number; search?: string }) {
  return useQuery({
    queryKey: ['audit-logs', params],
    queryFn: () => api.get<PaginatedResult<AuditLog>>('/api/v1/admin/audit-logs', params),
  });
}
