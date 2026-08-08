const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://artisa-backend.vercel.app';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  errors?: string[];
}

export class ApiError extends Error {
  status: number;
  errors?: string[];

  constructor(message: string, status: number, errors?: string[]) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('artisa_token');
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('artisa_refresh_token');
}

export function setAuthTokens(token: string, refreshToken?: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('artisa_token', token);
    if (refreshToken) {
      localStorage.setItem('artisa_refresh_token', refreshToken);
    }
  }
}

export function setAuthToken(token: string) {
  setAuthTokens(token);
}

export function removeAuthToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('artisa_token');
    localStorage.removeItem('artisa_refresh_token');
  }
}

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!res.ok) {
      removeAuthToken();
      return null;
    }

    const data = await res.json();
    const newAccessToken = data?.data?.token || data?.token;
    const newRefreshToken = data?.data?.refresh_token || data?.refresh_token || refreshToken;

    if (newAccessToken) {
      setAuthTokens(newAccessToken, newRefreshToken);
      return newAccessToken;
    } else {
      removeAuthToken();
      return null;
    }
  } catch (err) {
    removeAuthToken();
    return null;
  }
}

export async function fetchApi<T = any>(
  endpoint: string,
  options: RequestInit & { params?: Record<string, any>; _isRetry?: boolean } = {}
): Promise<T> {
  const { params, headers: customHeaders, _isRetry, ...customOptions } = options;

  let url = `${BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  let queryParams = params;
  if (queryParams && typeof queryParams === 'object' && 'params' in queryParams && typeof (queryParams as any).params === 'object') {
    queryParams = (queryParams as any).params;
  }

  if (queryParams) {
    const searchParams = new URLSearchParams();
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...customHeaders,
  };

  const response = await fetch(url, {
    credentials: 'include',
    ...customOptions,
    headers,
  });

  // Handle 401 Unauthorized with Automatic Refresh Token
  if (
    response.status === 401 &&
    !_isRetry &&
    !endpoint.includes('/auth/login') &&
    !endpoint.includes('/auth/register') &&
    !endpoint.includes('/auth/google')
  ) {
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => fetchApi<T>(endpoint, { ...options, _isRetry: true }))
        .catch((err) => Promise.reject(err));
    }

    isRefreshing = true;
    const newToken = await refreshAccessToken();
    isRefreshing = false;

    if (newToken) {
      processQueue(null, newToken);
      return fetchApi<T>(endpoint, { ...options, _isRetry: true });
    } else {
      processQueue(new ApiError('نشست شما منقضی شده است', 401), null);
    }
  }

  const contentType = response.headers.get('content-type');
  let data: any = null;

  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMessage = data?.message || data?.detail || `HTTP Error ${response.status}`;
    const errors = data?.errors || [];
    throw new ApiError(errorMessage, response.status, errors);
  }

  // Handle envelope { success: true, message: "...", data: ... }
  if (data && typeof data === 'object' && 'data' in data && 'success' in data) {
    return data.data as T;
  }

  return data as T;
}

export const api = {
  get: <T = any>(endpoint: string, params?: Record<string, any>, options?: RequestInit) =>
    fetchApi<T>(endpoint, { method: 'GET', params, ...options }),

  post: <T = any>(endpoint: string, body?: any, options?: RequestInit) =>
    fetchApi<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    }),

  put: <T = any>(endpoint: string, body?: any, options?: RequestInit) =>
    fetchApi<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    }),

  delete: <T = any>(endpoint: string, options?: RequestInit) =>
    fetchApi<T>(endpoint, { method: 'DELETE', ...options }),

  patch: <T = any>(endpoint: string, body?: any, options?: RequestInit) =>
    fetchApi<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    }),
};
