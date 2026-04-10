"use client";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { useEffect, useState } from "react";
import styles from "./page.module.css";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  createdAt: string;
}

interface Order {
  _id: string;
  orderId: string;
  totalPrice: number;
  status: string;
  createdAt: string;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers]   = useState<User[]>([]);
  const [search, setSearch]         = useState("");
  const [selected, setSelected]     = useState<User | null>(null);
  const [orders, setOrders]         = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        console.log('🔍 Fetching customers...');
        
        const res = await fetchWithAuth('/admin/users');
        
        console.log('📊 Response status:', res.status);
        
        const json = await res.json();
        console.log('📦 Response data:', json);
        
        const users = (Array.isArray(json) ? json : Array.isArray(json.data) ? json.data : [])
          .filter((u: User & { role: string }) => u.role !== "admin");
        
        console.log('✅ Filtered customers:', users);
        setCustomers(users);
      } catch (err) {
        console.error('❌ Error fetching customers:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const loadOrders = async (userId: string) => {
    setLoadingOrders(true);
    try {
      const res = await fetchWithAuth(`/orders?userId=${userId}`);
      const json = await res.json();
      setOrders(Array.isArray(json.data) ? json.data : []);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleSelect = (customer: User) => {
    setSelected(customer);
    loadOrders(customer.id);
  };

  const STATUS_LABEL: Record<string, string> = {
    pending: "Chờ xác nhận", confirmed: "Đã xác nhận",
    shipped: "Đang giao", delivered: "Đã giao",
    cancelled: "Đã hủy",
  };

  const getStatusLabel = (status: string) => {
    if (status === "returning" || status === "returned") return STATUS_LABEL.cancelled;
    return STATUS_LABEL[status] || status;
  };

  const filtered = customers.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  );

  const totalSpent = orders
    .filter(o => o.status === "delivered")
    .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Quản lý khách hàng</h1>
        <span className={styles.badge}>{filtered.length} khách hàng</span>
      </div>

      <div className={styles.toolbar}>
        <input
          className={styles.search}
          placeholder="🔍 Tìm tên, email, SĐT..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className={styles.splitLayout}>
        {/* Danh sách khách hàng */}
        <div className={styles.tableWrap}>
          {loading ? <div className={styles.loading}>Đang tải...</div> : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Khách hàng</th>
                  <th>SĐT</th>
                  <th>Ngày đăng ký</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <tr
                    key={c.id}
                    onClick={() => handleSelect(c)}
                    className={selected?.id === c.id ? styles.rowSelected : ""}
                    style={{ cursor: "pointer" }}
                  >
                    <td>{i + 1}</td>
                    <td>
                      <div><strong>{c.name}</strong></div>
                      <div style={{ fontSize: 12, color: "#888" }}>{c.email}</div>
                    </td>
                    <td>{c.phone || "—"}</td>
                    <td>{new Date(c.createdAt).toLocaleDateString("vi-VN")}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={4} className={styles.empty}>Không có khách hàng</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Chi tiết khách hàng */}
        {selected && (
          <div className={styles.detail}>
            <div className={styles.detailHeader}>
              <h3>Thông tin khách hàng</h3>
              <button className={styles.closeBtn} onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className={styles.detailBody}>
              <div className={styles.customerAvatar}>
                {selected.name?.charAt(0).toUpperCase()}
              </div>
              <p><strong>Họ tên:</strong> {selected.name}</p>
              <p><strong>Email:</strong> {selected.email}</p>
              <p><strong>SĐT:</strong> {selected.phone || "Chưa cập nhật"}</p>
              <p><strong>Địa chỉ:</strong> {selected.address || "Chưa cập nhật"}</p>
              <p><strong>Ngày đăng ký:</strong> {new Date(selected.createdAt).toLocaleDateString("vi-VN")}</p>

              <div className={styles.statRow}>
                <div className={styles.statBox}>
                  <div className={styles.statNum}>{orders.length}</div>
                  <div className={styles.statLabel}>Tổng đơn</div>
                </div>
                <div className={styles.statBox}>
                  <div className={styles.statNum} style={{ color: "#10b981" }}>
                    {orders.filter(o => o.status === "delivered").length}
                  </div>
                  <div className={styles.statLabel}>Đã nhận</div>
                </div>
                <div className={styles.statBox}>
                  <div className={styles.statNum} style={{ color: "#ee4d2d", fontSize: 14 }}>
                    {totalSpent.toLocaleString()}đ
                  </div>
                  <div className={styles.statLabel}>Đã chi</div>
                </div>
              </div>

              <div className={styles.detailSection}>
                <strong>Lịch sử đơn hàng:</strong>
                {loadingOrders ? <div>Đang tải...</div> : orders.length === 0 ? (
                  <p style={{ color: "#aaa" }}>Chưa có đơn hàng</p>
                ) : (
                  orders.slice(0, 10).map(o => (
                    <div key={o._id} className={styles.orderRow}>
                      <span style={{ fontSize: 12, color: "#888" }}>{new Date(o.createdAt).toLocaleDateString("vi-VN")}</span>
                      <span style={{ fontSize: 12 }}>{getStatusLabel(o.status)}</span>
                      <span style={{ fontWeight: 700, color: "#ee4d2d" }}>{o.totalPrice?.toLocaleString()}đ</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
