import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { CommentsStore } from '@/lib/commentsStore';

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
  receiptUrl?: string;
  rejectionReason?: string;
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

export function useApproveOrderPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) =>
      api.post(`/api/v1/admin/orders/${orderId}/approve-payment`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
  });
}

export function useRejectOrderPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, rejectionReason }: { orderId: string; rejectionReason?: string }) =>
      api.post(`/api/v1/admin/orders/${orderId}/reject-payment`, { rejectionReason }),
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

// ─── COMMENTS ──────────────────────────────────────────────────────────────

export interface AdminComment {
  id: string;
  productId: string;
  productName?: string;
  userId?: string;
  userName: string;
  userEmail?: string;
  text: string;
  rating: number;
  type?: 'comment' | 'question';
  reply?: string;
  replyDate?: string;
  status: string; // approved, pending, rejected
  date: string;
  created_at: string;
  moderated_by?: string;
  moderated_at?: string;
}

export function useAdminComments(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  type?: string;
  product_id?: string;
}) {
  return useQuery({
    queryKey: ['admin-comments', params],
    queryFn: async () => {
      let apiItems: AdminComment[] = [];
      try {
        const res = await api.get<PaginatedResult<AdminComment>>('/api/v1/admin/comments', params);
        if (res && Array.isArray(res.items)) {
          apiItems = res.items;
        }
      } catch (err) {}

      const localResult = CommentsStore.getAllAdminComments(params);
      const map = new Map<string, AdminComment>();
      const textKey = (item: AdminComment) =>
        `${item.productId}_${(item.userName || '').trim()}_${(item.text || '').trim().toLowerCase()}`;
      const seenTextKeys = new Set<string>();

      apiItems.forEach((item) => {
        map.set(item.id, item);
        seenTextKeys.add(textKey(item));
      });

      localResult.items.forEach((item) => {
        const tKey = textKey(item as AdminComment);
        if (map.has(item.id)) {
          const existing = map.get(item.id)!;
          map.set(item.id, {
            ...existing,
            ...(item as AdminComment),
            reply: item.reply || existing.reply,
            replyDate: item.replyDate || existing.replyDate,
          });
        } else if (!seenTextKeys.has(tKey)) {
          map.set(item.id, item as AdminComment);
          seenTextKeys.add(tKey);
        }
      });

      const mergedList = Array.from(map.values());
      const totalCount = Math.max(mergedList.length, localResult.total);

      return {
        items: mergedList,
        total: totalCount,
        page: params.page || 1,
        limit: params.limit || 10,
        total_pages: Math.ceil(mergedList.length / (params.limit || 10)) || 1,
      };
    },
  });
}

export function useUpdateAdminComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      commentId,
      status,
      text,
      rating,
      reply,
    }: {
      commentId: string;
      status?: string;
      text?: string;
      rating?: number;
      reply?: string;
    }) => {
      CommentsStore.updateComment(commentId, { status: status as any, text, rating, reply });
      try {
        await api.patch(`/api/v1/admin/comments/${commentId}`, { status, text, rating, reply });
      } catch (e) {}
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-comments'] });
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
  });
}

export function useDeleteAdminComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (commentId: string) => {
      CommentsStore.deleteComment(commentId);
      try {
        await api.delete(`/api/v1/admin/comments/${commentId}`);
      } catch (e) {}
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-comments'] });
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
  });
}

