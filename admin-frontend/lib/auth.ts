// lib/auth.ts
export type UserSafe = {
  _id: string;
  email: string;
  name?: string;
  role: 'admin' | 'user';
};

const USER_KEY = 'mybeauty_user';
const ACCESS_KEY = 'mybeauty_access_token';
const REFRESH_KEY = 'mybeauty_refresh_token';

export function setAuth(user: UserSafe, accessToken: string, refreshToken?: string) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem(ACCESS_KEY, accessToken);
  if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
}

export function getUser(): UserSafe | null {
  const s = localStorage.getItem(USER_KEY);
  if (!s || s === 'undefined' || s === 'null') return null;  // ← thêm check
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}
export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}

export async function signOut() {
  try {
    const token = getAccessToken();
    if (token) {
      await fetch('http://localhost:5000/api/users/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    }
  } catch (e) {
    console.error(e);
  } finally {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    window.location.href = '/login';
  }
}