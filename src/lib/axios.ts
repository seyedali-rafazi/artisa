import axios from 'axios';
import { getAccessToken, refreshAccessToken, clearAccessToken } from './api';

const BASE_URL =
  typeof window !== 'undefined'
    ? '' // Use relative path in browser so Next.js rewrites proxy requests as first-party
    : process.env.NEXT_PUBLIC_API_URL || 'https://artisa-backend.vercel.app';

export const axiosClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Send HttpOnly refresh_token cookies automatically
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/register') &&
      !originalRequest.url?.includes('/auth/google') &&
      !originalRequest.url?.includes('/auth/verify-email') &&
      !originalRequest.url?.includes('/auth/forgot-password') &&
      !originalRequest.url?.includes('/auth/reset-password') &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      originalRequest._retry = true;
      try {
        const newToken = await refreshAccessToken();
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosClient(originalRequest);
        } else {
          clearAccessToken();
        }
      } catch {
        clearAccessToken();
      }
    }

    const message =
      error.response?.data?.message ||
      error.response?.data?.detail ||
      'خطایی رخ داده است';
    const customError = new Error(
      typeof message === 'object' ? JSON.stringify(message) : message
    );
    (customError as any).status = error.response?.status;
    (customError as any).data = error.response?.data;
    return Promise.reject(customError);
  }
);

