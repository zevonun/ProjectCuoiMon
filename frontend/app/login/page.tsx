// app/login/page.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "./login.module.css";
import Image from "next/image";
import { useAuth } from "../context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { redirectToGoogle } from "../lib/googleAuth.client";

// ── Map error codes từ Google callback ──
const GOOGLE_ERROR_MESSAGES: Record<string, string> = {
  google_denied:         'Bạn đã từ chối cho phép đăng nhập bằng Google.',
  token_exchange:        'Lỗi xác thực với Google. Vui lòng thử lại.',
  userinfo:              'Không thể lấy thông tin tài khoản Google.',
  email_not_verified:    'Email Google của bạn chưa được xác thực.',
  backend:               'Lỗi server khi xử lý đăng nhập Google.',
  unknown:               'Đăng nhập bằng Google thất bại. Vui lòng thử lại.',
};

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<"register" | "login">("login");
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [googleError, setGoogleError] = useState<string | null>(null);

  const { login, register, verifyOtp, resendOtp, cancelOtp, pendingEmail, otpPurpose } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const otpInputRef = useRef<HTMLInputElement>(null);

  // ── Đọc error param từ URL (sau Google callback thất bại) ──
  useEffect(() => {
    const errorCode = searchParams.get('error');
    if (errorCode) {
      setGoogleError(GOOGLE_ERROR_MESSAGES[errorCode] || GOOGLE_ERROR_MESSAGES.unknown);
      // Xóa ?error khỏi URL
      router.replace('/login');
    }
  }, [searchParams, router]);

  // ── Auto-focus OTP input ──
  useEffect(() => {
    if (pendingEmail && otpInputRef.current) otpInputRef.current.focus();
  }, [pendingEmail]);

  // ── Countdown resend ──
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((p) => p - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // ── Reset OTP input khi pendingEmail đổi ──
  useEffect(() => { setOtp(""); }, [pendingEmail]);

  // ── Dismiss google error khi user tương tác ──
  useEffect(() => {
    if (googleError) {
      const t = setTimeout(() => setGoogleError(null), 5000); // auto hide 5s
      return () => clearTimeout(t);
    }
  }, [googleError]);

  // ─────────────────────────────────────────────
  // REGISTER (Bước 1)
  // ─────────────────────────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.target as HTMLFormElement);
    const name             = formData.get("name")             as string;
    const email            = formData.get("email")            as string;
    const password         = formData.get("password")         as string;
    const confirmPassword  = formData.get("confirmPassword")  as string;
    const phone            = formData.get("phone")            as string;
    const address          = formData.get("address")          as string;

    if (password !== confirmPassword) {
      alert("❌ Mật khẩu xác nhận không khớp!");
      setIsLoading(false);
      return;
    }
    if (password.length < 6) {
      alert("❌ Mật khẩu phải có ít nhất 6 ký tự!");
      setIsLoading(false);
      return;
    }

    try {
      await register(name, email, password, phone, address);
      setResendCooldown(60);
    } catch (error) {
      alert(`❌ Đăng ký thất bại: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // ─────────────────────────────────────────────
  // LOGIN (Bước 1)
  // ─────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.target as HTMLFormElement);
    const email    = formData.get("email")    as string;
    const password = formData.get("password") as string;

    try {
      await login(email, password);
      setResendCooldown(60);
    } catch (error) {
      alert(`❌ Đăng nhập thất bại: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // ─────────────────────────────────────────────
  // VERIFY OTP (Bước 2)
  // ─────────────────────────────────────────────
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) return;
    setIsLoading(true);
    try {
      await verifyOtp(otp.trim());
      alert("✅ Xác thực thành công!");
      router.push("/");
    } catch (error) {
      alert(`❌ ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setIsLoading(true);
    try {
      await resendOtp();
      setResendCooldown(60);
    } catch (error) {
      alert(`❌ ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  return (
    <div className={styles.container}>
      <div className={styles.formBox}>

        {/* ── Google error banner ── */}
        {googleError && (
          <div className={styles.errorBanner}>
            ❌ {googleError}
          </div>
        )}

        {/* ===== FORM OTP ===== */}
        {pendingEmail ? (
          <div className={styles.otpWrapper}>
            <h2 className={styles.otpTitle}>Xác thực email</h2>
            <p className={styles.otpDesc}>
              Mã OTP đã được gửi về <strong>{pendingEmail}</strong>.
              <br />Nhập mã 6 số để {otpPurpose === "login" ? "đăng nhập" : "hoàn thành đăng ký"}.
            </p>

            <form onSubmit={handleVerifyOtp}>
              <div className={styles.otpInputGroup}>
                <input
                  ref={otpInputRef}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="● ● ● ● ● ●"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  disabled={isLoading}
                  className={styles.otpInput}
                />
              </div>

              <button
                type="submit"
                className={`${styles.btn} ${styles.register}`}
                disabled={isLoading || otp.length !== 6}
              >
                {isLoading ? "Đang xác thực..." : "Xác thực"}
              </button>
            </form>

            <div className={styles.otpActions}>
              <button
                type="button"
                className={styles.resendBtn}
                onClick={handleResend}
                disabled={resendCooldown > 0 || isLoading}
              >
                {resendCooldown > 0 ? `Gửi lại sau ${resendCooldown}s` : "Gửi lại OTP"}
              </button>
              <button type="button" className={styles.cancelBtn} onClick={cancelOtp} disabled={isLoading}>
                ← Quay lại
              </button>
            </div>
          </div>

        ) : (
          /* ===== FORM login / register bình thường ===== */
          <>
            <div className={styles.tab}>
              <button
                className={`${styles.tablink} ${activeTab === "register" ? styles.active : ""}`}
                onClick={() => setActiveTab("register")}
                disabled={isLoading}
              >Đăng ký</button>
              <button
                className={`${styles.tablink} ${activeTab === "login" ? styles.active : ""}`}
                onClick={() => setActiveTab("login")}
                disabled={isLoading}
              >Đăng nhập</button>
            </div>

            {/* ─── Form Đăng ký ─── */}
            <form
              className={`${styles.form} ${activeTab === "register" ? "" : styles.hidden}`}
              onSubmit={handleRegister}
            >
              <label htmlFor="reg_name">Họ và tên</label>
              <input type="text" id="reg_name" name="name" placeholder="Nhập họ và tên" required disabled={isLoading} />

              <label htmlFor="reg_email">Tài khoản (Email)</label>
              <input type="email" id="reg_email" name="email" placeholder="Điền email của bạn" required disabled={isLoading} />

              <label htmlFor="reg_phone">Số điện thoại (tùy chọn)</label>
              <input type="text" id="reg_phone" name="phone" placeholder="Nhập số điện thoại" disabled={isLoading} />

              <label htmlFor="reg_address">Địa chỉ (tùy chọn)</label>
              <input type="text" id="reg_address" name="address" placeholder="Nhập địa chỉ" disabled={isLoading} />

              <label htmlFor="reg_password">Mật khẩu</label>
              <input type="password" id="reg_password" name="password" placeholder="Điền mật khẩu (tối thiểu 6 ký tự)" required disabled={isLoading} minLength={6} />

              <label htmlFor="reg_confirm_password">Xác nhận mật khẩu</label>
              <input type="password" id="reg_confirm_password" name="confirmPassword" placeholder="Nhập lại mật khẩu" required disabled={isLoading} minLength={6} />

              <label className={styles.checkbox}>
                <input type="checkbox" required disabled={isLoading} /> Chấp nhận điều khoản
              </label>

              <button type="submit" className={`${styles.btn} ${styles.register}`} disabled={isLoading}>
                {isLoading ? "Đang xử lý..." : "Đăng ký"}
              </button>

              {/* ✅ Google button – gọi redirectToGoogle() */}
              <button
                type="button"
                className={`${styles.btn} ${styles.google}`}
                disabled={isLoading}
                onClick={redirectToGoogle}
              >
                <Image src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width={20} height={20} />
                Đăng nhập bằng Google
              </button>
            </form>

            {/* ─── Form Đăng nhập ─── */}
            <form
              className={`${styles.form} ${activeTab === "login" ? "" : styles.hidden}`}
              onSubmit={handleLogin}
            >
              <label htmlFor="login_email">Tài khoản</label>
              <input type="email" id="login_email" name="email" placeholder="Nhập email" required disabled={isLoading} />

              <label htmlFor="login_password">Mật khẩu</label>
              <input type="password" id="login_password" name="password" placeholder="Nhập mật khẩu" required disabled={isLoading} />

              <div className={styles.loginOptions}>
                <label className={styles.checkbox}>
                  <input type="checkbox" disabled={isLoading} /> Ghi nhớ đăng nhập
                </label>
                <a href="#" className={styles.forgotPassword}>Quên mật khẩu</a>
              </div>

              <button type="submit" className={`${styles.btn} ${styles.register}`} disabled={isLoading}>
                {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
              </button>

              {/* ✅ Google button – gọi redirectToGoogle() */}
              <button
                type="button"
                className={`${styles.btn} ${styles.google}`}
                disabled={isLoading}
                onClick={redirectToGoogle}
              >
                <Image src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width={20} height={20} />
                Đăng nhập bằng tài khoản Google
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
