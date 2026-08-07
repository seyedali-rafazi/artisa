import axios from 'axios';
import { getAuthToken } from './api';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://artisa-backend.vercel.app';

export const axiosClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
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
