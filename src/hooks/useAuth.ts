import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  api,
  setAccessToken,
  clearAccessToken,
  getAccessToken,
  useAccessToken,
  refreshAccessToken,
} from '@/lib/api';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  avatar?: string;
  provider?: string;
  email_verified?: boolean;
  is_verified?: boolean;
  createdAt?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type?: string;
  expires_in?: number;
  user: UserProfile;
}

export interface RegisterResponse {
  user_id: string;
  email: string;
  is_verified: boolean;
  message: string;
}

export interface SessionItem {
  id: string;
  token_family_id: string;
  created_at: string;
  expires_at: string;
  last_used_at?: string;
  user_agent?: string;
  ip_address?: string;
  device_info?: string;
  is_current: boolean;
}

export function useUserProfile() {
  const token = useAccessToken();

  return useQuery({
    queryKey: ['user-profile'],
    queryFn: () => api.get<UserProfile>('/api/v1/users/me'),
    enabled: Boolean(token),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (payload: { name: string; email: string; password: string; phone?: string }) =>
      api.post<RegisterResponse>('/api/v1/auth/register', payload),
  });
}

export function useVerifyEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { email: string; code: string }) =>
      api.post<AuthResponse>('/api/v1/auth/verify-email', payload),
    onSuccess: (data) => {
      const token = data?.access_token;
      if (token) {
        setAccessToken(token);
        queryClient.setQueryData(['user-profile'], data.user);
        queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      }
    },
  });
}

export function useResendVerification() {
  return useMutation({
    mutationFn: (payload: { email: string }) =>
      api.post<{ message: string }>('/api/v1/auth/resend-verification', payload),
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      api.post<AuthResponse>('/api/v1/auth/login', credentials),
    onSuccess: (data) => {
      const token = data?.access_token;
      if (token) {
        setAccessToken(token);
        queryClient.setQueryData(['user-profile'], data.user);
        queryClient.invalidateQueries({ queryKey: ['user-profile'] });
        queryClient.invalidateQueries({ queryKey: ['wishlist'] });
        queryClient.invalidateQueries({ queryKey: ['user-orders'] });
        queryClient.invalidateQueries({ queryKey: ['addresses'] });
      }
    },
  });
}

export function useGoogleLoginAuth() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credential: string) =>
      api.post<AuthResponse>('/api/v1/auth/google', { credential }),
    onSuccess: (data) => {
      const token = data?.access_token;
      if (token) {
        setAccessToken(token);
        queryClient.setQueryData(['user-profile'], data.user);
        queryClient.invalidateQueries({ queryKey: ['user-profile'] });
        queryClient.invalidateQueries({ queryKey: ['wishlist'] });
        queryClient.invalidateQueries({ queryKey: ['user-orders'] });
        queryClient.invalidateQueries({ queryKey: ['addresses'] });
      }
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (payload: { email: string }) =>
      api.post<{ message: string }>('/api/v1/auth/forgot-password', payload),
  });
}

export function useVerifyResetCode() {
  return useMutation({
    mutationFn: (payload: { email: string; code: string }) =>
      api.post<{ valid: boolean }>('/api/v1/auth/verify-reset-code', payload),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (payload: { email: string; code: string; new_password: string }) =>
      api.post<{ message: string }>('/api/v1/auth/reset-password', payload),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.post('/api/v1/auth/logout'),
    onSettled: () => {
      clearAccessToken();
      queryClient.setQueryData(['user-profile'], null);
      queryClient.clear();
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    },
  });
}

export function useLogoutAll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.post('/api/v1/auth/logout-all'),
    onSettled: () => {
      clearAccessToken();
      queryClient.setQueryData(['user-profile'], null);
      queryClient.clear();
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    },
  });
}

export function useSessions() {
  const token = useAccessToken();

  return useQuery({
    queryKey: ['user-sessions'],
    queryFn: () => api.get<SessionItem[]>('/api/v1/auth/sessions'),
    enabled: Boolean(token),
  });
}

export function useRevokeSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) =>
      api.delete(`/api/v1/auth/sessions/${sessionId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-sessions'] });
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { name?: string; phone?: string }) =>
      api.put<UserProfile>('/api/v1/users/profile', payload),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['user-profile'], updatedUser);
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: { currentPassword: string; newPassword: string }) =>
      api.put('/api/v1/users/password', payload),
  });
}
