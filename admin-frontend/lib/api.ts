// lib/api.ts  ← sửa đúng 1 chỗ này thôi
import { getAccessToken, setAuth, signOut, getUser } from './auth';

const API_URL = 'http://localhost:5000';

interface FetchOptions extends RequestInit {
  retry?: boolean;
}

export async function apiFetch(url: string, options: FetchOptions = {}) {
  const token = getAccessToken();

  const res = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  // ✅ Xử lý 401 - Token expired
  if (res.status === 401 && !options.retry) {
    console.log('🔄 Token expired, attempting refresh...');

    const refreshed = await refreshToken();

    if (refreshed) {
      console.log('✅ Token refreshed, retrying request...');
      return apiFetch(url, { ...options, retry: true });
    }

    // ❌ Refresh failed
    console.log('❌ Refresh token failed, redirecting to login...');
    signOut();
    window.location.href = '/login';
    throw new Error('Session expired. Please login again.');
  }

  return res;
}

async function refreshToken(): Promise<boolean> {
  const refreshToken = localStorage.getItem('mybeauty_refresh_token');
  if (!refreshToken) {
    console.log('❌ No refresh token found');
    return false;
  }

  try {
    console.log('🔄 Calling refresh token API...');

    const res = await fetch(`${API_URL}/api/users/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    console.log('📡 Refresh response status:', res.status);

    if (!res.ok) {
      console.log('❌ Refresh API failed:', res.status);
      return false;
    }

    const data = await res.json();
    console.log('📦 Refresh data received:', {
      hasToken: !!data.token,
      hasRefreshToken: !!data.refreshToken
    });

    const user = getUser();
    if (!user) {
      console.log('❌ No user found in storage');
      return false;
    }

    // ✅ Lưu token mới
    setAuth(user, data.token, data.refreshToken);
    console.log('✅ New tokens saved to localStorage');

    return true;
  } catch (error) {
    console.error('❌ Refresh token error:', error);
    return false;
  }
}