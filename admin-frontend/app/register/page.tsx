'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import './register.css';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (form.password !== form.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp!');
      return;
    }

    if (form.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:5000/api/users/register-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Đăng ký thất bại');
        setLoading(false);
        return;
      }

      alert('Tạo tài khoản Admin thành công! Vui lòng đăng nhập.');
      router.push('/login');
    } catch (err) {
      setError('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <h1 className="register-title">Tạo tài khoản Admin</h1>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Họ tên"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            disabled={loading}
          />

          <input
            type="email"
            placeholder="Email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            disabled={loading}
          />

          <input
            type="password"
            placeholder="Mật khẩu (tối thiểu 6 ký tự)"
            required
            minLength={6}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            disabled={loading}
          />

          <input
            type="password"
            placeholder="Nhập lại mật khẩu"
            required
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            disabled={loading}
          />

          <button type="submit" disabled={loading}>
            {loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
          </button>
        </form>

        <p className="register-footer">
          Đã có tài khoản?{' '}
          <a href="/login">Đăng nhập ngay</a>
        </p>
      </div>
    </div>
  );
}