"use client";
import { getAccessToken } from "@/lib/auth";
import { useEffect, useState } from "react";
import styles from "./page.module.css";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Order {
  _id: string;
  orderId: string;
  customerInfo: { fullName: string; phone: string; email: string; address: string; province: string };
  totalPrice: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  products: { productId: string; quantity: number; price: number }[];
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending:   { label: "Chờ xác nhận", color: "#f59e0b" },
  confirmed: { label: "Đã xác nhận",  color: "#3b82f6" },
  shipped:   { label: "Đang giao",    color: "#8b5cf6" },
  delivered: { label: "Đã giao",      color: "#10b981" },
  cancelled: { label: "Đã hủy",       color: "#ef4444" },
  returning: { label: "Đang hoàn",    color: "#f97316" },
  returned:  { label: "Đã hoàn",      color: "#6b7280" },
};

export default function AdminOrdersPage() {
  const [orders, setOrders]       = useState<Order[]>([]);
  const [status, setStatus]       = useState("all");
  const [search, setSearch]       = useState("");
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState<Order | null>(null);
  const [toast, setToast]         = useState("");

  const token = getAccessToken();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status !== "all") params.set("status", status);
      if (search) params.set("search", search);
      const res = await fetch(`${API}/admin/orders?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setOrders(Array.isArray(json.data) ? json.data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [status]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const handleStatusChange = async (id: string, newStatus: string) => {
    const res = await fetch(`${API}/admin/orders/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      showToast("Cập nhật trạng thái thành công");
      fetchOrders();
      if (selected?._id === id) setSelected(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa đơn hàng này?")) return;
    const res = await fetch(`${API}/admin/orders/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) { showToast("Đã xóa đơn hàng"); fetchOrders(); setSelected(null); }
  };

  const filtered = orders.filter(o =>
    o.orderId?.toLowerCase().includes(search.toLowerCase()) ||
    o.customerInfo?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    o.customerInfo?.phone?.includes(search)
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Quản lý đơn hàng</h1>
        <span className={styles.badge}>{filtered.length} đơn</span>
      </div>

      {/* Tabs trạng thái */}
      <div className={styles.tabs}>
        {["all", ...Object.keys(STATUS_MAP)].map(s => (
          <button
            key={s}
            className={`${styles.tab} ${status === s ? styles.tabActive : ""}`}
            onClick={() => setStatus(s)}
          >
            {s === "all" ? "Tất cả" : STATUS_MAP[s].label}
          </button>
        ))}
      </div>

      <div className={styles.toolbar}>
        <input
          className={styles.search}
          placeholder="🔍 Tìm mã đơn, tên, SĐT..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === "Enter" && fetchOrders()}
        />
        <button className={styles.btnPrimary} onClick={fetchOrders}>Tìm</button>
      </div>

      {toast && <div className={styles.toast}>{toast}</div>}

      <div className={styles.splitLayout}>
        {/* Danh sách */}
        <div className={styles.tableWrap}>
          {loading ? <div className={styles.loading}>Đang tải...</div> : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th>Ngày đặt</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => (
                  <tr
                    key={o._id}
                    className={selected?._id === o._id ? styles.rowSelected : ""}
                    onClick={() => setSelected(o)}
                    style={{ cursor: "pointer" }}
                  >
                    <td><code>{o.orderId?.slice(0, 16)}...</code></td>
                    <td>
                      <div><strong>{o.customerInfo?.fullName}</strong></div>
                      <div style={{ fontSize: 12, color: "#888" }}>{o.customerInfo?.phone}</div>
                    </td>
                    <td><strong style={{ color: "#ee4d2d" }}>{o.totalPrice?.toLocaleString()}đ</strong></td>
                    <td>
                      <span className={styles.statusBadge} style={{ background: STATUS_MAP[o.status]?.color + "20", color: STATUS_MAP[o.status]?.color }}>
                        {STATUS_MAP[o.status]?.label || o.status}
                      </span>
                    </td>
                    <td>{new Date(o.createdAt).toLocaleDateString("vi-VN")}</td>
                    <td>
                      <button className={styles.btnDanger} onClick={e => { e.stopPropagation(); handleDelete(o._id); }}>Xóa</button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className={styles.empty}>Không có đơn hàng</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Chi tiết đơn */}
        {selected && (
          <div className={styles.detail}>
            <div className={styles.detailHeader}>
              <h3>Chi tiết đơn hàng</h3>
              <button className={styles.closeBtn} onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className={styles.detailBody}>
              <p><strong>Mã đơn:</strong> {selected.orderId}</p>
              <p><strong>Khách hàng:</strong> {selected.customerInfo?.fullName}</p>
              <p><strong>SĐT:</strong> {selected.customerInfo?.phone}</p>
              <p><strong>Email:</strong> {selected.customerInfo?.email}</p>
              <p><strong>Địa chỉ:</strong> {selected.customerInfo?.address}, {selected.customerInfo?.province}</p>
              <p><strong>Thanh toán:</strong> {selected.paymentMethod}</p>
              <p><strong>Tổng tiền:</strong> <span style={{ color: "#ee4d2d", fontWeight: 700 }}>{selected.totalPrice?.toLocaleString()}đ</span></p>

              <div className={styles.detailSection}>
                <strong>Cập nhật trạng thái:</strong>
                <select
                  className={styles.select}
                  value={selected.status}
                  onChange={e => handleStatusChange(selected._id, e.target.value)}
                >
                  {Object.entries(STATUS_MAP).map(([val, { label }]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>

              <div className={styles.detailSection}>
                <strong>Sản phẩm ({selected.products?.length}):</strong>
                {selected.products?.map((p, i) => (
                  <div key={i} className={styles.productRow}>
                    <span>SP #{i + 1}</span>
                    <span>x{p.quantity}</span>
                    <span>{p.price?.toLocaleString()}đ</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
