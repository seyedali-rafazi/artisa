import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, setAuthTokens, removeAuthToken, getAuthToken } from '@/lib/api';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  avatar?: string;
  provider?: string;
  email_verified?: boolean;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  refresh_token?: string;
  user: UserProfile;
}

export function useUserProfile() {
  const token = typeof window !== 'undefined' ? getAuthToken() : null;

  return useQuery({
    queryKey: ['user-profile'],
    queryFn: () => api.get<UserProfile>('/api/v1/users/me'),
    enabled: Boolean(token),
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      api.post<AuthResponse>('/api/v1/auth/login', credentials),
    onSuccess: (data) => {
      if (data?.token) {
        setAuthTokens(data.token, data.refresh_token);
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
      if (data?.token) {
        setAuthTokens(data.token, data.refresh_token);
        queryClient.setQueryData(['user-profile'], data.user);
        queryClient.invalidateQueries({ queryKey: ['user-profile'] });
        queryClient.invalidateQueries({ queryKey: ['wishlist'] });
        queryClient.invalidateQueries({ queryKey: ['user-orders'] });
        queryClient.invalidateQueries({ queryKey: ['addresses'] });
      }
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { name: string; email: string; password: string; phone?: string }) =>
      api.post<AuthResponse>('/api/v1/auth/register', payload),
    onSuccess: (data) => {
      if (data?.token) {
        setAuthTokens(data.token, data.refresh_token);
        queryClient.setQueryData(['user-profile'], data.user);
        queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      }
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.post('/api/v1/auth/logout'),
    onSettled: () => {
      removeAuthToken();
      queryClient.setQueryData(['user-profile'], null);
      queryClient.clear();
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
