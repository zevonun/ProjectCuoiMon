// app/components/UserMenu.tsx
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './UserMenu.module.css'; // Sẽ tạo file này ngay sau đây
import { useAuth, User } from '../context/AuthContext'; // Dùng hook

interface UserMenuProps {
  user: User; // Nhận thông tin user từ Header
}

export default function UserMenu({ user }: UserMenuProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  // Lấy hàm logout từ context
  const { logout } = useAuth(); 

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
  };

  return (
    <div className={styles.userMenuContainer}>
      <button 
        className={styles.userButton} 
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        // Thêm onBlur để khi click ra ngoài nó tự đóng
        onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
      >
        {/* Nếu có ảnh (từ Google/FB) thì dùng ảnh */}
        {user.image ? (
          <Image 
            src={user.image} 
            alt={user.name} 
            width={32} 
            height={32} 
            className={styles.userAvatar}
          />
        ) : (
          // Nếu không, dùng chữ cái đầu
          <span className={styles.userNameInitial}>
            {user.name.charAt(0).toUpperCase()}
          </span>
        )}
        <span className={styles.userName}>{user.name}</span>
        <i className={`fas fa-chevron-down ${styles.chevron} ${isDropdownOpen ? styles.open : ''}`}></i>
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className={styles.dropdownMenu}>
          <Link href="/profile" className={styles.dropdownItem} onClick={() => setIsDropdownOpen(false)}>
            <i className="fas fa-user-circle"></i>
            Xem thông tin của tôi
          </Link>
          <button className={styles.dropdownItem} onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
}