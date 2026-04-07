"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Folder,
  Image,
  Ticket,
  Users,
  ClipboardList,
  Star,
  UserCheck,
  LogOut,
  ChevronLeft,
  FileText,
} from "lucide-react";
import { signOut, getUser } from "@/lib/auth";
import "./Sidebar.css";

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [adminName, setAdminName] = useState("");

  useEffect(() => {
    const user = getUser();
    if (user?.name) setAdminName(user.name);
  }, []);

  const isActive = (path: string) => pathname.startsWith(path);

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>

      {/* ── ADMIN PROFILE ── */}
      <div className="sidebar-profile">
        <div className="sidebar-avatar">
          {adminName ? adminName.charAt(0).toUpperCase() : "A"}
        </div>
        {!collapsed && (
          <div className="sidebar-profile-info">
            <p className="sidebar-profile-name">{adminName || "Admin"}</p>
            <p className="sidebar-profile-role">Quản trị viên</p>
          </div>
        )}
      </div>

      {/* ── TOGGLE ARROW BUTTON ── */}
      <button
        className="sidebar-toggle"
        onClick={() => setCollapsed(!collapsed)}
        title={collapsed ? "Mở rộng" : "Thu gọn"}
      >
        <ChevronLeft
          size={16}
          className={`sidebar-toggle-icon ${collapsed ? "rotated" : ""}`}
        />
      </button>

      {!collapsed && <p className="sidebar-header">ADMIN</p>}

      <ul className="sidebar-nav">
        <li className={isActive("/dashboard") ? "active" : ""}>
          <Link href="/dashboard">
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </Link>
        </li>

        <li className={isActive("/products") ? "active" : ""}>
          <Link href="/products">
            <ShoppingCart size={18} />
            <span>Products</span>
          </Link>
        </li>

        <li className={isActive("/categories") ? "active" : ""}>
          <Link href="/categories">
            <Folder size={18} />
            <span>Categories</span>
          </Link>
        </li>

        <li className={isActive("/banners") ? "active" : ""}>
          <Link href="/banners">
            <Image size={18} />
            <span>Banners</span>
          </Link>
        </li>

        <li className={isActive("/articles") ? "active" : ""}>
          <Link href="/articles">
            <FileText size={18} />
            <span>Articles</span>
          </Link>
        </li>

        <li className={isActive("/vouchers") ? "active" : ""}>
          <Link href="/vouchers">
            <Ticket size={18} />
            <span>Vouchers</span>
          </Link>
        </li>

        <li className={isActive("/users") ? "active" : ""}>
          <Link href="/users">
            <Users size={18} />
            <span>Người dùng</span>
          </Link>
        </li>

        <li className={isActive("/orders") ? "active" : ""}>
          <Link href="/orders">
            <ClipboardList size={18} />
            <span>Đơn hàng</span>
          </Link>
        </li>

        <li className={isActive("/reviews") ? "active" : ""}>
          <Link href="/reviews">
            <Star size={18} />
            <span>Đánh giá</span>
          </Link>
        </li>

        <li className={isActive("/customers") ? "active" : ""}>
          <Link href="/customers">
            <UserCheck size={18} />
            <span>Khách hàng</span>
          </Link>
        </li>

        <li>
          <button className="sidebar-logout" onClick={signOut}>
            <LogOut size={18} />
            <span>Đăng xuất</span>
          </button>
        </li>
      </ul>
    </aside>
  );
}