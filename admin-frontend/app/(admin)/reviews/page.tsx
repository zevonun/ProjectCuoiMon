"use client";
import { getAccessToken } from "@/lib/auth";
import { useEffect, useState } from "react";
import styles from "./page.module.css";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Review {
  _id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  status: string;
  createdAt: string;
}

const STATUS_MAP = {
  pending:  { label: "Chờ duyệt",  color: "#f59e0b" },
  approved: { label: "Đã duyệt",   color: "#10b981" },
  rejected: { label: "Từ chối",    color: "#ef4444" },
};

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [status, setStatus]   = useState("all");
  const [loading, setLoading] = useState(true);
  const [toast, setToast]     = useState("");

  const token = getAccessToken();

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status !== "all") params.set("status", status);
      const res = await fetch(`${API}/admin/reviews?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setReviews(Array.isArray(json.data) ? json.data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReviews(); }, [status]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const handleStatus = async (id: string, newStatus: string) => {
    const res = await fetch(`${API}/admin/reviews/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) { showToast(`Đã ${newStatus === "approved" ? "duyệt" : "từ chối"} đánh giá`); fetchReviews(); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa đánh giá này?")) return;
    const res = await fetch(`${API}/admin/reviews/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) { showToast("Đã xóa đánh giá"); fetchReviews(); }
  };

  const renderStars = (rating: number) => "★".repeat(rating) + "☆".repeat(5 - rating);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Quản lý đánh giá</h1>
        <span className={styles.badge}>{reviews.length} đánh giá</span>
      </div>

      <div className={styles.tabs}>
        {["all", "pending", "approved", "rejected"].map(s => (
          <button
            key={s}
            className={`${styles.tab} ${status === s ? styles.tabActive : ""}`}
            onClick={() => setStatus(s)}
          >
            {s === "all" ? "Tất cả" : STATUS_MAP[s as keyof typeof STATUS_MAP].label}
          </button>
        ))}
      </div>

      {toast && <div className={styles.toast}>{toast}</div>}

      {loading ? <div className={styles.loading}>Đang tải...</div> : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Người dùng</th>
                <th>Đánh giá</th>
                <th>Nội dung</th>
                <th>Trạng thái</th>
                <th>Ngày</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map(r => (
                <tr key={r._id}>
                  <td><strong>{r.userName}</strong></td>
                  <td>
                    <span style={{ color: "#f59e0b", fontSize: 18 }}>{renderStars(r.rating)}</span>
                    <span style={{ marginLeft: 4, color: "#888" }}>{r.rating}/5</span>
                  </td>
                  <td style={{ maxWidth: 260 }}>{r.comment || <em style={{ color: "#aaa" }}>Không có nhận xét</em>}</td>
                  <td>
                    <span className={styles.statusBadge} style={{
                      background: STATUS_MAP[r.status as keyof typeof STATUS_MAP]?.color + "20",
                      color: STATUS_MAP[r.status as keyof typeof STATUS_MAP]?.color,
                    }}>
                      {STATUS_MAP[r.status as keyof typeof STATUS_MAP]?.label || r.status}
                    </span>
                  </td>
                  <td>{new Date(r.createdAt).toLocaleDateString("vi-VN")}</td>
                  <td style={{ display: "flex", gap: 6 }}>
                    {r.status !== "approved" && (
                      <button className={styles.btnSuccess} onClick={() => handleStatus(r._id, "approved")}>Duyệt</button>
                    )}
                    {r.status !== "rejected" && (
                      <button className={styles.btnWarning} onClick={() => handleStatus(r._id, "rejected")}>Từ chối</button>
                    )}
                    <button className={styles.btnDanger} onClick={() => handleDelete(r._id)}>Xóa</button>
                  </td>
                </tr>
              ))}
              {reviews.length === 0 && (
                <tr><td colSpan={6} className={styles.empty}>Không có đánh giá nào</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
