// app/context/AuthContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authAPI, User, LoginData, RegisterData } from '../lib/auth.api';

// ==================== INTERFACES ====================
interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;

  // ── OTP state ──
  pendingEmail: string | null;
  otpPurpose: 'login' | 'register' | null;
  pendingRegisterData: RegisterData | null;

  // ── Actions ──
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string, address?: string) => Promise<void>;
  verifyOtp: (otp: string) => Promise<void>;
  resendOtp: () => Promise<void>;
  cancelOtp: () => void;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

// ==================== CONTEXT ====================
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ==================== PROVIDER ====================
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── OTP states ──
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [otpPurpose, setOtpPurpose] = useState<'login' | 'register' | null>(null);
  const [pendingRegisterData, setPendingRegisterData] = useState<RegisterData | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  // ==================== KHỞI TẠO ====================
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof window === 'undefined') {
          setIsLoading(false);
          return;
        }

        // ── ✅ Đọc params từ Google OAuth callback redirect ──
        const googleLoginFlag = searchParams.get('google_login');
        if (googleLoginFlag === 'success') {
          const token        = searchParams.get('token');
          const refreshToken = searchParams.get('refreshToken');
          const userJson     = searchParams.get('user');

          if (token && refreshToken && userJson) {
            try {
              const userData = JSON.parse(userJson);
              localStorage.setItem('access_token',  token);
              localStorage.setItem('refresh_token', refreshToken);
              localStorage.setItem('user',          userJson);
              setUser(userData);
              console.log('✅ Google login restored:', userData.name);

              // Xóa params khỏi URL (clean URL)
              router.replace('/');
              setIsLoading(false);
              return;
            } catch (e) {
              console.error('❌ Parse google user failed:', e);
            }
          }
        }

        // ── Normal init: đọc từ localStorage ──
        const token      = localStorage.getItem('access_token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            console.log('✅ Restored user from localStorage:', userData.name);
          } catch (error) {
            console.error('❌ Invalid stored user data:', error);
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
          }
        }
      } catch (error) {
        console.error('❌ Failed to initialize auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [searchParams, router]);

  // ==================== LOGIN (Bước 1) ====================
  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      console.log('🔍 Attempting login for:', email);

      const data: LoginData = { email, password };
      await authAPI.login(data);

      setPendingEmail(email);
      setOtpPurpose('login');
      console.log('✅ OTP sent, waiting for verification');

    } catch (error: unknown) {
      console.error('❌ Login failed:', error);
      const err = error as { response?: { data?: { error?: string; message?: string } }; message?: string };
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Đăng nhập thất bại. Vui lòng thử lại.';
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== REGISTER (Bước 1) ====================
  const register = async (
    name: string,
    email: string,
    password: string,
    phone?: string,
    address?: string
  ): Promise<void> => {
    try {
      setIsLoading(true);
      console.log('🔍 Attempting registration for:', email);

      const data: RegisterData = { name, email, password, phone, address };
      await authAPI.register(data);

      setPendingRegisterData(data);
      setPendingEmail(email);
      setOtpPurpose('register');
      console.log('✅ OTP sent for register, waiting for verification');

    } catch (error: unknown) {
      console.error('❌ Registration failed:', error);
      const err = error as { response?: { data?: { error?: string; message?: string } }; message?: string };
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Đăng ký thất bại. Vui lòng thử lại.';
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== VERIFY OTP (Bước 2) ====================
  const verifyOtp = async (otp: string): Promise<void> => {
    if (!pendingEmail || !otpPurpose) {
      throw new Error('Không có trạng thái OTP. Vui lòng thử lại từ đầu.');
    }

    try {
      setIsLoading(true);

      if (otpPurpose === 'login') {
        const response = await authAPI.loginVerifyOtp({ email: pendingEmail, otp });
        setUser(response.user);
        console.log('✅ Login + OTP verified:', response.user.name);
      } else {
        if (!pendingRegisterData) throw new Error('Thiếu dữ liệu đăng ký');
        const response = await authAPI.registerVerifyOtp({ ...pendingRegisterData, otp });
        setUser(response.user);
        console.log('✅ Register + OTP verified:', response.user.name);
      }

      setPendingEmail(null);
      setOtpPurpose(null);
      setPendingRegisterData(null);

    } catch (error: unknown) {
      console.error('❌ OTP verification failed:', error);
      const err = error as { response?: { data?: { error?: string; message?: string } }; message?: string };
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Xác thực OTP thất bại.';
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== RESEND OTP ====================
  const resendOtp = async (): Promise<void> => {
    if (!pendingEmail || !otpPurpose) {
      throw new Error('Không có trạng thái OTP');
    }
    try {
      setIsLoading(true);
      await authAPI.resendOtp(pendingEmail, otpPurpose);
      console.log('✅ OTP resent to:', pendingEmail);
    } catch (error: unknown) {
      console.error('❌ Resend OTP failed:', error);
      const err = error as { response?: { data?: { error?: string; message?: string } }; message?: string };
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Gửi lại OTP thất bại.';
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== CANCEL OTP ====================
  const cancelOtp = (): void => {
    setPendingEmail(null);
    setOtpPurpose(null);
    setPendingRegisterData(null);
  };

  // ==================== LOGOUT ====================
  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await authAPI.logout();
      setUser(null);
      router.push('/');
    } catch (error) {
      console.error('❌ Logout failed:', error);
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
      }
      router.push('/');
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== UPDATE USER ====================
  const updateUser = (userData: Partial<User>): void => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    }
  };

  // ==================== CONTEXT VALUE ====================
  const value: AuthContextType = {
    user,
    isLoggedIn: !!user,
    isLoading,
    pendingEmail,
    otpPurpose,
    pendingRegisterData,
    login,
    register,
    verifyOtp,
    resendOtp,
    cancelOtp,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ==================== HOOK ====================
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth phải được dùng bên trong AuthProvider');
  }
  return context;
}

export { AuthContext };
