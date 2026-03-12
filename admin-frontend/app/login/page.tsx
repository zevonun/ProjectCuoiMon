'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import './login.css';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return alert('Nhập đầy đủ thông tin');

    setLoading(true);
    try {
      // ✅ Đổi endpoint từ /login → /admin-login (không có OTP)
      const res = await fetch('http://localhost:5000/api/users/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Đăng nhập thất bại');
      }

      const data = await res.json();

      // ✅ Lưu tokens (giống cũ)
      localStorage.setItem('mybeauty_access_token', data.token);
      localStorage.setItem('mybeauty_refresh_token', data.refreshToken);
      localStorage.setItem('mybeauty_user', JSON.stringify(data.user));

      router.replace('/dashboard');
    } catch (err) {
      alert((err as Error).message || 'Sai email hoặc mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">Admin Login</h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={handleLogin} disabled={loading}>
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </div>
    </div>
  );
}