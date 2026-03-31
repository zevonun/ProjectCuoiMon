// app/profile/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import styles from './profile.module.css';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, isLoggedIn, isLoading: authLoading, updateUser } = useAuth();
  const router = useRouter();

  // State cho form
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Khởi tạo form từ user data
  useEffect(() => {
    if (user) {
      setFullName(user.name || '');
      setAddress(user.address || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  // Redirect nếu chưa đăng nhập
  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, authLoading, router]);

  // Xử lý cập nhật thông tin - ĐÃ SỬA ASYNC
  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      // TODO: Gọi API thực để cập nhật
      // const response = await userAPI.updateUser(user._id, { name: fullName, address, phone });

      // Tạm thời update local
      updateUser({ name: fullName, address, phone });

      alert("✅ Đã cập nhật thông tin thành công!");
    } catch (error) {
      const err = error as Error;
      alert(`❌ Cập nhật thất bại: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  // Xử lý đổi mật khẩu - ĐÃ SỬA ASYNC
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword) {
      alert("⚠️ Vui lòng điền đầy đủ thông tin!");
      return;
    }

    if (newPassword.length < 6) {
      alert("⚠️ Mật khẩu mới phải có ít nhất 6 ký tự!");
      return;
    }

    setIsUpdating(true);

    try {
      // TODO: Gọi API thực để đổi mật khẩu
      // await authAPI.changePassword({ currentPassword, newPassword });

      alert("✅ Đã đổi mật khẩu thành công!");
      setCurrentPassword('');
      setNewPassword('');
    } catch (error) {
      const err = error as Error;
      alert(`❌ Đổi mật khẩu thất bại: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  // Loading state
  if (authLoading) {
    return (
      <div className={styles.profileContainer}>
        <p>Đang tải thông tin...</p>
      </div>
    );
  }

  // Chưa đăng nhập
  if (!isLoggedIn || !user) {
    return null; // Sẽ redirect trong useEffect
  }

  return (
    <div className={styles.profileContainer}>
      <div className={styles.sidebar}>
        <h2>Xin chào, {user.name}!</h2>
        <nav className={styles.nav}>
          <a href="#info" className={styles.navItem}>Thông tin cá nhân</a>
          {/* <a href="#orders" className={styles.navItem}>Đơn hàng của tôi</a> */}
          <a href="#password" className={styles.navItem}>Đổi mật khẩu</a>
        </nav>
      </div>

      <div className={styles.content}>
        {/* 1. Thông tin cá nhân */}
        <section id="info" className={styles.section}>
          <h3>Thông tin cá nhân</h3>
          <form onSubmit={handleInfoSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={user.email}
                disabled
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="fullName">Họ và Tên</label>
              <input
                type="text"
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nguyễn Văn A"
                disabled={isUpdating}
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="phone">Số điện thoại</label>
              <input
                type="text"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0912345678"
                disabled={isUpdating}
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="address">Địa chỉ</label>
              <input
                type="text"
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Số 1, đường ABC, Phường X, Quận Y, TP. Z"
                disabled={isUpdating}
              />
            </div>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isUpdating}
            >
              {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </form>
        </section>

        {/* 2. Đổi mật khẩu */}
        <section id="password" className={styles.section}>
          <h3>Đổi mật khẩu</h3>
          <form onSubmit={handlePasswordSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="currentPassword">Mật khẩu hiện tại</label>
              <input
                type="password"
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Nhập mật khẩu hiện tại"
                disabled={isUpdating}
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="newPassword">Mật khẩu mới</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                disabled={isUpdating}
                required
                minLength={6}
              />
            </div>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isUpdating}
            >
              {isUpdating ? "Đang xử lý..." : "Đổi mật khẩu"}
            </button>
          </form>
        </section>


      </div>
    </div>
  );
}