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
  permissions?: {
    manage_products?: boolean;
    manage_orders?: boolean;
    manage_users?: boolean;
    manage_banners?: boolean;
    manage_categories?: boolean;
    manage_vouchers?: boolean;
    manage_admins?: boolean;
  };
  createdAt: string;
}

interface CurrentUser {
}

const ROLE_LABEL: Record<string, string> = { user: "Khách hàng", admin: "Admin" };

const PERMISSIONS = {
  manage_products: "🏪 Quản lý sản phẩm",
  manage_orders: "📦 Quản lý đơn hàng",
  manage_users: "👥 Quản lý người dùng",
  manage_banners: "🎨 Quản lý banner",
  manage_categories: "📂 Quản lý danh mục",
  manage_vouchers: "🎟️ Quản lý voucher",
  manage_admins: "⚙️ Quản lý admin"
};

export default function AdminUsersPage() {
  const [users, setUsers]     = useState<User[]>([]);
  const [search, setSearch]   = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast]     = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    permissions: {
      manage_products: false,
      manage_orders: false,
      manage_users: false,
      manage_banners: false,
      manage_categories: false,
      manage_vouchers: false,
      manage_admins: false,
    }
  });

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

  useEffect(() => { 
    fetchUsers();
  }, []);

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

  const handleEditRole = (user: User) => {
    setEditingId(user.id);
    setEditingUser({ ...user });
  };

  const handleSaveRole = async () => {
    if (!editingUser) return;
    try {
      const res = await fetch(`${API}/admin/users/${editingUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          role: editingUser.role,
          permissions: editingUser.permissions,
        }),
      });
      if (res.ok) {
        showToast("Cập nhật thành công");
        fetchUsers();
        setEditingId(null);
        setEditingUser(null);
      }
    } catch (err) {
      showToast("Cập nhật thất bại");
    }
  };

  const handleCreateAdmin = async () => {
    try {
      if (!newAdmin.name || !newAdmin.email || !newAdmin.phone || !newAdmin.address || !newAdmin.password) {
        showToast("Vui lòng điền đầy đủ thông tin");
        return;
      }
      
      const res = await fetch(`${API}/admin/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newAdmin.name,
          email: newAdmin.email,
          phone: newAdmin.phone,
          address: newAdmin.address,
          password: newAdmin.password,
          role: "admin",
          permissions: newAdmin.permissions,
        }),
      });

      if (res.ok) {
        showToast("✅ Tạo admin thành công");
        fetchUsers();
        setCreatingAdmin(false);
        setNewAdmin({
          name: "",
          email: "",
          phone: "",
          address: "",
          password: "",
          permissions: {
            manage_products: false,
            manage_orders: false,
            manage_users: false,
            manage_banners: false,
            manage_categories: false,
            manage_vouchers: false,
            manage_admins: false,
          }
        });
      } else {
        const error = await res.json();
        showToast("❌ " + (error.message || "Tạo admin thất bại"));
      }
    } catch (err) {
      showToast("Lỗi: " + (err as any).message);
    }
  };

  const togglePermission = (key: keyof typeof PERMISSIONS) => {
    if (!editingUser) return;
    setEditingUser({
      ...editingUser,
      permissions: {
        ...editingUser.permissions,
        [key]: !editingUser.permissions?.[key],
      },
    });
  };

  const toggleNewAdminPermission = (key: keyof typeof PERMISSIONS) => {
    setNewAdmin({
      ...newAdmin,
      permissions: {
        ...newAdmin.permissions,
        [key]: !newAdmin.permissions[key],
      },
    });
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
        <button 
          className={styles.btnSuccess}
          onClick={() => setCreatingAdmin(true)}
        >
          ➕ Tạo Admin Mới
        </button>
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
                      className={styles.btnPrimary}
                      onClick={() => handleEditRole(u)}
                      disabled={u.role !== "admin"}
                      title={u.role !== "admin" ? "Chỉ admin mới có quyền" : ""}
                    >
                      ✎ Phân quyền
                    </button>
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

      {/* Modal phân quyền */}
      {editingId && editingUser && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Phân quyền: {editingUser.name}</h2>
            
            <div className={styles.formGroup}>
              <label>Vai trò:</label>
              <select
                value={editingUser.role}
                onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
              >
                <option value="user">Khách hàng</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {editingUser.role === "admin" && (
              <div className={styles.permissionsGrid}>
                <h3>Quyền hạn:</h3>
                {Object.entries(PERMISSIONS).map(([key, label]) => (
                  <label key={key} className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={editingUser.permissions?.[key as keyof typeof PERMISSIONS] || false}
                      onChange={() => togglePermission(key as keyof typeof PERMISSIONS)}
                    />
                    {label}
                  </label>
                ))}
              </div>
            )}

            <div className={styles.modalActions}>
              <button className={styles.btnSuccess} onClick={handleSaveRole}>
                ✓ Lưu
              </button>
              <button className={styles.btnSecondary} onClick={() => { setEditingId(null); setEditingUser(null); }}>
                ✕ Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal tạo admin mới */}
      {creatingAdmin && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>➕ Tạo Admin Mới</h2>
            
            <div className={styles.formGroup}>
              <label>Họ tên:</label>
              <input 
                type="text" 
                placeholder="Nhập họ tên"
                value={newAdmin.name}
                onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Email:</label>
              <input 
                type="email" 
                placeholder="Nhập email"
                value={newAdmin.email}
                onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Số điện thoại:</label>
              <input 
                type="tel" 
                placeholder="Nhập SĐT"
                value={newAdmin.phone}
                onChange={(e) => setNewAdmin({ ...newAdmin, phone: e.target.value })}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Địa chỉ:</label>
              <input 
                type="text" 
                placeholder="Nhập địa chỉ"
                value={newAdmin.address}
                onChange={(e) => setNewAdmin({ ...newAdmin, address: e.target.value })}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Mật khẩu:</label>
              <input 
                type="password" 
                placeholder="Nhập mật khẩu"
                value={newAdmin.password}
                onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
              />
            </div>

            <div className={styles.permissionsGrid}>
              <h3>Quyền hạn admin:</h3>
              {Object.entries(PERMISSIONS).map(([key, label]) => (
                <label key={key} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={newAdmin.permissions[key as keyof typeof PERMISSIONS]}
                    onChange={() => toggleNewAdminPermission(key as keyof typeof PERMISSIONS)}
                  />
                  {label}
                </label>
              ))}
            </div>

            <div className={styles.modalActions}>
              <button className={styles.btnSuccess} onClick={handleCreateAdmin}>
                ✓ Tạo Admin
              </button>
              <button className={styles.btnSecondary} onClick={() => setCreatingAdmin(false)}>
                ✕ Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
