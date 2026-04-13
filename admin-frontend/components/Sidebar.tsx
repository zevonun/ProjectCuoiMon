"use client";

import { useEffect, useState } from "react";
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

type PermissionKey =
  | "manage_products"
  | "manage_orders"
  | "manage_users"
  | "manage_banners"
  | "manage_categories"
  | "manage_vouchers"
  | "manage_admins"
  | "manage_articles";

type NavItem = {
  href?: string;
  label: string;
  icon: any;
  permission?: PermissionKey;
  type?: "link" | "action";
  onClick?: () => void;
  activePrefix?: string;
};

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [adminName, setAdminName] = useState("");
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const user = getUser();
    if (user?.name) setAdminName(user.name);
    setPermissions((user as any)?.permissions || {});
  }, []);

  const isActive = (path: string) => pathname.startsWith(path);

  const can = (key?: PermissionKey) => {
    if (!key) return true;
    return !!permissions?.[key];
  };

  const navItems: NavItem[] = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, type: "link", activePrefix: "/dashboard" },
    { href: "/products", label: "Products", icon: ShoppingCart, permission: "manage_products", type: "link", activePrefix: "/products" },
    { href: "/categories", label: "Categories", icon: Folder, permission: "manage_categories", type: "link", activePrefix: "/categories" },
    { href: "/banners", label: "Banners", icon: Image, permission: "manage_banners", type: "link", activePrefix: "/banners" },
    { href: "/articles", label: "Articles", icon: FileText, permission: "manage_articles", type: "link", activePrefix: "/articles" },
    { href: "/vouchers", label: "Vouchers", icon: Ticket, permission: "manage_vouchers", type: "link", activePrefix: "/vouchers" },
    { href: "/users", label: "Nguoi dung", icon: Users, permission: "manage_users", type: "link", activePrefix: "/users" },
    { href: "/orders", label: "Don hang", icon: ClipboardList, permission: "manage_orders", type: "link", activePrefix: "/orders" },
    { href: "/manage-inventory", label: "Quan ly ton kho", icon: Folder, permission: "manage_products", type: "link", activePrefix: "/manage-inventory" },
    { href: "/reviews", label: "Danh gia", icon: Star, permission: "manage_products", type: "link", activePrefix: "/reviews" },
    { href: "/customers", label: "Khach hang", icon: UserCheck, permission: "manage_users", type: "link", activePrefix: "/customers" },
    { label: "Dang xuat", icon: LogOut, type: "action", onClick: signOut },
  ];

  const visibleNavItems = navItems.filter((item) => can(item.permission));

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-profile">
        <div className="sidebar-avatar">
          {adminName ? adminName.charAt(0).toUpperCase() : "A"}
        </div>
        {!collapsed && (
          <div className="sidebar-profile-info">
            <p className="sidebar-profile-name">{adminName || "Admin"}</p>
            <p className="sidebar-profile-role">Quan tri vien</p>
          </div>
        )}
      </div>

      <button
        className="sidebar-toggle"
        onClick={() => setCollapsed(!collapsed)}
        title={collapsed ? "Mo rong" : "Thu gon"}
      >
        <ChevronLeft
          size={16}
          className={`sidebar-toggle-icon ${collapsed ? "rotated" : ""}`}
        />
      </button>

      {!collapsed && <p className="sidebar-header">ADMIN</p>}

      <ul className="sidebar-nav">
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const active = item.activePrefix ? isActive(item.activePrefix) : false;

          if (item.type === "action") {
            return (
              <li key={item.label}>
                <button className="sidebar-logout" onClick={item.onClick}>
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          }

          return (
            <li key={item.href} className={active ? "active" : ""}>
              <Link href={item.href || "#"}>
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
