/**
 * In-Memory Access Token Store (TokenManager).
 *
 * Security Design Principles:
 * 1. Access Token is stored EXCLUSIVELY in application JavaScript memory.
 * 2. NEVER stored in localStorage, sessionStorage, IndexedDB, document.cookie, or URL params.
 * 3. Protected against token theft via Cross-Site Scripting (XSS).
 * 4. Refresh Token is managed exclusively by the backend via HttpOnly + Secure + SameSite cookies.
 * 5. JavaScript runtime cannot access the Refresh Token.
 */

import { useSyncExternalStore } from 'react';

type TokenListener = (token: string | null) => void;

class TokenManager {
  private accessToken: string | null = null;
  private listeners = new Set<TokenListener>();

  /**
   * Retrieve the current in-memory access token.
   */
  public getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Set the in-memory access token and notify subscribers.
   */
  public setAccessToken(token: string | null): void {
    this.accessToken = token;
    this.notifyListeners(token);
  }

  /**
   * Clear the in-memory access token.
   */
  public clearAccessToken(): void {
    this.setAccessToken(null);
  }

  /**
   * Check if an access token exists in memory.
   */
  public hasAccessToken(): boolean {
    return Boolean(this.accessToken);
  }

  /**
   * Subscribe to access token changes.
   * Returns an unsubscribe function.
   */
  public subscribe(listener: TokenListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(token: string | null): void {
    this.listeners.forEach((listener) => {
      try {
        listener(token);
      } catch (err) {
        console.error('Error in auth token listener:', err);
      }
    });
  }
}

// Singleton in-memory token manager instance
export const tokenManager = new TokenManager();

// One-time cleanup of legacy tokens from localStorage to ensure clean migration
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem('artisa_token');
    localStorage.removeItem('artisa_refresh_token');
  } catch {
    // Ignore storage access errors in private browsing/sandboxes
  }
}

// Functional helper exports
export const getAccessToken = () => tokenManager.getAccessToken();
export const setAccessToken = (token: string | null) => tokenManager.setAccessToken(token);
export const clearAccessToken = () => tokenManager.clearAccessToken();
export const hasAccessToken = () => tokenManager.hasAccessToken();
export const subscribeAccessToken = (listener: TokenListener) => tokenManager.subscribe(listener);

/**
 * React hook to reactively subscribe to the in-memory access token state.
 */
export function useAccessToken(): string | null {
  return useSyncExternalStore(
    (callback) => tokenManager.subscribe(callback),
    () => tokenManager.getAccessToken(),
    () => null
  );
}

// Legacy alias helpers for backward compatibility
export const getAuthToken = getAccessToken;
export const setAuthToken = setAccessToken;
export const setAuthTokens = (token: string) => setAccessToken(token);
export const removeAuthToken = clearAccessToken;
