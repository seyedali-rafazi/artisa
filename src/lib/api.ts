import {
  getAccessToken,
  setAccessToken,
  clearAccessToken,
  hasAccessToken,
  subscribeAccessToken,
  useAccessToken,
  tokenManager,
  getAuthToken,
  setAuthToken,
  setAuthTokens,
  removeAuthToken,
} from './auth-token';

export {
  getAccessToken,
  setAccessToken,
  clearAccessToken,
  hasAccessToken,
  subscribeAccessToken,
  useAccessToken,
  tokenManager,
  getAuthToken,
  setAuthToken,
  setAuthTokens,
  removeAuthToken,
};

const BASE_URL =
  typeof window !== 'undefined'
    ? '' // Use relative path in browser so Next.js rewrites proxy requests as first-party
    : process.env.NEXT_PUBLIC_API_URL || 'https://artisa-backend.vercel.app';

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

// ─── Synchronized Single-Flight Refresh Mutex ──────────────────────────────────

let refreshPromise: Promise<string | null> | null = null;

/**
 * Trigger token rotation via HttpOnly refresh token cookie.
 * - Single-flight deduplication: multiple concurrent callers share the exact same promise.
 * - Prevents multiple /refresh requests from triggering backend reuse detection.
 * - In-memory access token is updated upon successful response.
 */
export async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
        method: 'POST',
        credentials: 'include', // Send HttpOnly refresh_token cookie
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        clearAccessToken();
        return null;
      }

      const resJson = await res.json();
      const newAccessToken =
        resJson?.data?.access_token ||
        resJson?.data?.token ||
        resJson?.access_token ||
        resJson?.token;

      if (newAccessToken && typeof newAccessToken === 'string') {
        setAccessToken(newAccessToken);
        return newAccessToken;
      } else {
        clearAccessToken();
        return null;
      }
    } catch {
      clearAccessToken();
      return null;
    }
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

/**
 * Universal authenticated API fetch function with single-flight refresh interceptor.
 */
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

  const isFormData = typeof FormData !== 'undefined' && customOptions.body instanceof FormData;
  const token = getAccessToken();

  const headers: HeadersInit = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...customHeaders,
  };

  const response = await fetch(url, {
    credentials: 'include',
    ...customOptions,
    headers,
  });

  // Handle 401 Unauthorized with Automatic Single-Flight Refresh & Retry
  if (
    response.status === 401 &&
    !_isRetry &&
    !endpoint.includes('/auth/login') &&
    !endpoint.includes('/auth/register') &&
    !endpoint.includes('/auth/google') &&
    !endpoint.includes('/auth/verify-email') &&
    !endpoint.includes('/auth/forgot-password') &&
    !endpoint.includes('/auth/reset-password') &&
    !endpoint.includes('/auth/refresh')
  ) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      return fetchApi<T>(endpoint, { ...options, _isRetry: true });
    } else {
      const error = new ApiError('نشست شما منقضی شده است', 401);
      throw error;
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

  post: <T = any>(endpoint: string, body?: any, options?: RequestInit) => {
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
    return fetchApi<T>(endpoint, {
      method: 'POST',
      body: isFormData ? body : (body ? JSON.stringify(body) : undefined),
      ...options,
    });
  },

  upload: <T = any>(endpoint: string, formData: FormData, options?: RequestInit) =>
    fetchApi<T>(endpoint, {
      method: 'POST',
      body: formData,
      ...options,
    }),

  put: <T = any>(endpoint: string, body?: any, options?: RequestInit) => {
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
    return fetchApi<T>(endpoint, {
      method: 'PUT',
      body: isFormData ? body : (body ? JSON.stringify(body) : undefined),
      ...options,
    });
  },

  delete: <T = any>(endpoint: string, options?: RequestInit) =>
    fetchApi<T>(endpoint, { method: 'DELETE', ...options }),

  patch: <T = any>(endpoint: string, body?: any, options?: RequestInit) => {
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
    return fetchApi<T>(endpoint, {
      method: 'PATCH',
      body: isFormData ? body : (body ? JSON.stringify(body) : undefined),
      ...options,
    });
  },
};
