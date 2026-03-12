// lib/auth.api.ts
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Interceptor tự thêm token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ==================== INTERFACES ====================
export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role?: 'user' | 'admin';
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
}

// Response khi login/register thành công (sau verify OTP)
export interface AuthSuccessResponse {
  message: string;
  user: User;
  token: string;
  refreshToken: string;
}

// Response khi login/register chỉ gửi OTP (chưa cấp token)
export interface PendingOtpResponse {
  pending: true;
  message: string;
  email: string;
}

// Verify OTP body
export interface VerifyOtpData {
  email: string;
  otp: string;
}

// Register verify OTP cần gửi kèm toàn bộ data để backend tạo user
export interface RegisterVerifyOtpData extends RegisterData {
  otp: string;
}

// ==================== AUTH API ====================
export const authAPI = {
  // ── Bước 1 đăng nhập: gửi email + password → backend gửi OTP ──
  login: async (data: LoginData): Promise<PendingOtpResponse> => {
    const response = await api.post('/api/users/login', data);
    return response.data;
  },

  // ── Bước 2 đăng nhập: gửi OTP → nhận JWT ──
  loginVerifyOtp: async (data: VerifyOtpData): Promise<AuthSuccessResponse> => {
    const response = await api.post('/api/users/login/verify-otp', data);

    if (typeof window !== 'undefined' && response.data.token) {
      const { token, refreshToken, user } = response.data;
      localStorage.setItem('access_token', token);
      localStorage.setItem('refresh_token', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
    }

    return response.data;
  },

  // ── Bước 1 đăng ký: gửi info → backend gửi OTP ──
  register: async (data: RegisterData): Promise<PendingOtpResponse> => {
    const response = await api.post('/api/users/register', data);
    return response.data;
  },

  // ── Bước 2 đăng ký: gửi OTP + data → backend tạo user + cấp JWT ──
  registerVerifyOtp: async (data: RegisterVerifyOtpData): Promise<AuthSuccessResponse> => {
    const response = await api.post('/api/users/register/verify-otp', data);

    if (typeof window !== 'undefined' && response.data.token) {
      const { token, refreshToken, user } = response.data;
      localStorage.setItem('access_token', token);
      localStorage.setItem('refresh_token', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
    }

    return response.data;
  },

  // ── Gửi lại OTP ──
  resendOtp: async (email: string, purpose: string): Promise<{ message: string }> => {
    const response = await api.post('/api/otp/resend', { email, purpose });
    return response.data;
  },

  // ── Logout ──
  logout: async (): Promise<void> => {
    try {
      await api.post('/api/users/logout');
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
      }
    }
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/api/users/me');
    return response.data;
  },
};

export default api;
