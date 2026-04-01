"use client";
import { getAccessToken } from "@/lib/auth";
import { useEffect, useState } from "react";
import styles from "./page.module.css";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface User {
  id: string; 
  name: string;
  email: string;
  phone?: string;
  role: string;
  createdAt: string;
}

const ROLE_LABEL: Record<string, string> = { user: "Khách hàng", admin: "Admin" };

export default function AdminUsersPage() {
  const [users, setUsers]     = useState<User[]>([]);
  const [search, setSearch]   = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast]     = useState("");

  const token = getAccessToken();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setUsers(Array.isArray(json) ? json : Array.isArray(json.data) ? json.data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Xóa người dùng "${name}"?`)) return;
    const res = await fetch(`${API}/admin/users/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) { showToast("Đã xóa người dùng"); fetchUsers(); }
    else showToast("Xóa thất bại");
  };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.includes(search)
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Quản lý người dùng</h1>
        <span className={styles.badge}>{filtered.length} người dùng</span>
      </div>

      <div className={styles.toolbar}>
        <input
          className={styles.search}
          placeholder="🔍 Tìm tên, email, SĐT..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {toast && <div className={styles.toast}>{toast}</div>}

      {loading ? (
        <div className={styles.loading}>Đang tải...</div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Họ tên</th>
                <th>Email</th>
                <th>SĐT</th>
                <th>Vai trò</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <tr key={u.id}>
                  <td>{i + 1}</td>
                  <td><strong>{u.name}</strong></td>
                  <td>{u.email}</td>
                  <td>{u.phone || "—"}</td>
                  <td>
                    <span className={u.role === "admin" ? styles.badgeAdmin : styles.badgeUser}>
                      {ROLE_LABEL[u.role] || u.role}
                    </span>
                  </td>
                  <td>{new Date(u.createdAt).toLocaleDateString("vi-VN")}</td>
                  <td>
                    <button
                      className={styles.btnDanger}
                      onClick={() => handleDelete(u.id, u.name)}
                      disabled={u.role === "admin"}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className={styles.empty}>Không tìm thấy người dùng</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
