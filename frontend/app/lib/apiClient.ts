// app/lib/apiClient.ts
// Centralized API client with automatic token refresh logic

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface FetchOptions extends RequestInit {
  retry?: boolean;
}

/**
 * Get access token from localStorage
 */
function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
}

/**
 * Get refresh token from localStorage
 */
function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refresh_token');
}

/**
 * Set tokens in localStorage
 */
function setTokens(accessToken: string, refreshToken: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
}

/**
 * Refresh the access token using refresh token
 */
async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    console.log('❌ No refresh token found');
    return false;
  }

  try {
    console.log('🔄 Attempting to refresh access token...');
    const response = await fetch(`${API_URL}/api/users/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      console.log('❌ Token refresh failed:', response.status);
      return false;
    }

    const data = await response.json();
    
    if (data.token && data.refreshToken) {
      setTokens(data.token, data.refreshToken);
      console.log('✅ Access token refreshed successfully');
      return true;
    }

    return false;
  } catch (error) {
    console.error('❌ Error refreshing token:', error);
    return false;
  }
}

/**
 * Enhanced fetch with automatic token refresh on 401
 */
export async function apiFetch(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const token = getAccessToken();

  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  });

  // If 401 and not already retried, try to refresh token
  if (response.status === 401 && !options.retry) {
    console.log('🔄 Token expired, attempting refresh...');
    const refreshed = await refreshAccessToken();

    if (refreshed) {
      console.log('✅ Token refreshed, retrying request...');
      return apiFetch(url, { ...options, retry: true });
    }

    // Refresh failed - redirect to login
    console.log('❌ Token refresh failed, redirecting to login...');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  }

  return response;
}

/**
 * Convenience wrapper for GET requests
 */
export async function apiGet(url: string, options: FetchOptions = {}) {
  return apiFetch(url, { ...options, method: 'GET' });
}

/**
 * Convenience wrapper for POST requests
 */
export async function apiPost(url: string, body?: any, options: FetchOptions = {}) {
  return apiFetch(url, {
    ...options,
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * Convenience wrapper for PATCH requests
 */
export async function apiPatch(url: string, body?: any, options: FetchOptions = {}) {
  return apiFetch(url, {
    ...options,
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * Convenience wrapper for DELETE requests
 */
export async function apiDelete(url: string, options: FetchOptions = {}) {
  return apiFetch(url, { ...options, method: 'DELETE' });
}
