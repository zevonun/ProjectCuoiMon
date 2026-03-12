"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Folder,
  Image,
  Ticket,  // ✅ THÊM icon Ticket
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { signOut } from "@/lib/auth";
import "./Sidebar.css";

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (path: string) => pathname.startsWith(path);

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <button
        className="sidebar-toggle"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      <h2 className="sidebar-header">ADMIN</h2>

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

        {/* ✅ THÊM MENU VOUCHERS */}
        <li className={isActive("/vouchers") ? "active" : ""}>
          <Link href="/vouchers">
            <Ticket size={18} />
            <span>Vouchers</span>
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