"use client";
import { useEffect, useState } from "react";
import { getAccessToken } from "@/lib/auth";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import "./styles/dashboard.css";

ChartJS.register(
  CategoryScale, LinearScale, BarElement,
  ArcElement, LineElement, PointElement,
  Tooltip, Legend
);

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const STATUS_LABEL: Record<string, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  shipped: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
  returning: "Đang hoàn",
  returned: "Đã hoàn",
};

const STATUS_COLOR: Record<string, string> = {
  pending: "#f59e0b",
  confirmed: "#3b82f6",
  shipped: "#8b5cf6",
  delivered: "#10b981",
  cancelled: "#ef4444",
  returning: "#f97316",
  returned: "#6b7280",
};

type Stats = {
  totalProducts: number;
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  revenueByMonth: { _id: number; total: number }[];
  orderStatus: Record<string, number>;
  latestOrders: {
    _id: string;
    orderId: string;
    customerInfo: { fullName: string };
    totalPrice: number;
    status: string;
    createdAt: string;
  }[];
  lowStockProducts: { _id: string; name: string; stock: number; price: number }[];
  topSellingProducts: { _id: string; name: string; totalSold: number; price: number }[];
  topRatedProducts: { _id: string; name: string; avgRating: number; count: number }[];
  latestProducts: { _id: string; name: string; price: number; createdAt: string }[];
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    fetch(`${API}/api/dashboard/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="dashboard-loading">Đang tải dashboard...</div>;
  if (!stats) return <div className="dashboard-loading">Không thể tải dữ liệu</div>;

  // ── Biểu đồ doanh thu theo tháng ──
  const revenueChartData = {
    labels: stats.revenueByMonth.map(i => `Tháng ${i._id}`),
    datasets: [{
      label: "Doanh thu (VNĐ)",
      data: stats.revenueByMonth.map(i => i.total),
      backgroundColor: "#6366f1",
      borderRadius: 6,
    }],
  };

  // ── Biểu đồ tình trạng đơn hàng ──
  const statusEntries = Object.entries(stats.orderStatus);
  const statusChartData = {
    labels: statusEntries.map(([k]) => STATUS_LABEL[k] || k),
    datasets: [{
      data: statusEntries.map(([, v]) => v),
      backgroundColor: statusEntries.map(([k]) => STATUS_COLOR[k] || "#ccc"),
      borderWidth: 0,
    }],
  };

  return (
    <div className="dashboard">
      <h1 className="dashboard-title">Dashboard</h1>

      {/* ── CARDS TỔNG QUAN ── */}
      <div className="dashboard-cards">
        <div className="card card-blue">
          <div className="card-icon">📦</div>
          <div>
            <p className="card-title">Sản phẩm</p>
            <h2>{stats.totalProducts}</h2>
          </div>
        </div>
        <div className="card card-green">
          <div className="card-icon">👥</div>
          <div>
            <p className="card-title">Khách hàng</p>
            <h2>{stats.totalUsers}</h2>
          </div>
        </div>
        <div className="card card-purple">
          <div className="card-icon">🛒</div>
          <div>
            <p className="card-title">Đơn hàng</p>
            <h2>{stats.totalOrders}</h2>
          </div>
        </div>
        <div className="card card-orange">
          <div className="card-icon">💰</div>
          <div>
            <p className="card-title">Doanh thu</p>
            <h2>{stats.totalRevenue.toLocaleString()}đ</h2>
          </div>
        </div>
      </div>

      {/* ── BIỂU ĐỒ ── */}
      <div className="charts-row">
        <div className="chart-box chart-large">
          <h3 className="chart-title">Doanh thu theo tháng</h3>
          {stats.revenueByMonth.length > 0
            ? <Bar data={revenueChartData} options={{
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                  y: {
                    ticks: {
                      callback: (v) => `${Number(v).toLocaleString()}đ`
                    }
                  }
                }
              }} />
            : <p className="empty-text">Chưa có dữ liệu doanh thu</p>
          }
        </div>

        <div className="chart-box chart-small">
          <h3 className="chart-title">Tình trạng đơn hàng</h3>
          {statusEntries.length > 0
            ? <Doughnut data={statusChartData} options={{
                responsive: true,
                plugins: {
                  legend: { position: "bottom" as const }
                }
              }} />
            : <p className="empty-text">Chưa có đơn hàng</p>
          }
        </div>
      </div>

      {/* ── ĐƠN HÀNG MỚI ── */}
      <div className="dashboard-section">
        <h3 className="section-title">Đơn hàng mới nhất</h3>
        <div className="table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
              </tr>
            </thead>
            <tbody>
              {stats.latestOrders.length === 0
                ? <tr><td colSpan={5} className="empty-td">Chưa có đơn hàng</td></tr>
                : stats.latestOrders.map(o => (
                  <tr key={o._id}>
                    <td style={{ fontSize: 12, color: "#888" }}>{o.orderId || o._id}</td>
                    <td>{o.customerInfo?.fullName}</td>
                    <td style={{ color: "#ee4d2d", fontWeight: 700 }}>{o.totalPrice?.toLocaleString()}đ</td>
                    <td>
                      <span className="status-badge" style={{ background: STATUS_COLOR[o.status] + "22", color: STATUS_COLOR[o.status] }}>
                        {STATUS_LABEL[o.status] || o.status}
                      </span>
                    </td>
                    <td>{new Date(o.createdAt).toLocaleDateString("vi-VN")}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 3 BẢNG DƯỚI ── */}
      <div className="three-cols">

        {/* Sản phẩm bán chạy */}
        <div className="dashboard-section">
          <h3 className="section-title">🔥 Bán chạy nhất</h3>
          <table className="dash-table">
            <thead><tr><th>Sản phẩm</th><th>Đã bán</th></tr></thead>
            <tbody>
              {stats.topSellingProducts.length === 0
                ? <tr><td colSpan={2} className="empty-td">Chưa có dữ liệu</td></tr>
                : stats.topSellingProducts.map((p, i) => (
                  <tr key={p._id}>
                    <td>
                      <span className="rank-num">{i + 1}</span>
                      {p.name || "Sản phẩm đã xóa"}
                    </td>
                    <td style={{ fontWeight: 700, color: "#10b981" }}>{p.totalSold}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>

        {/* Sản phẩm đánh giá cao */}
        <div className="dashboard-section">
          <h3 className="section-title">⭐ Đánh giá cao</h3>
          <table className="dash-table">
            <thead><tr><th>Sản phẩm</th><th>Điểm</th></tr></thead>
            <tbody>
              {stats.topRatedProducts.length === 0
                ? <tr><td colSpan={2} className="empty-td">Chưa có đánh giá</td></tr>
                : stats.topRatedProducts.map((p, i) => (
                  <tr key={p._id}>
                    <td>
                      <span className="rank-num">{i + 1}</span>
                      {p.name || "Sản phẩm đã xóa"}
                    </td>
                    <td>
                      <span style={{ color: "#f59e0b", fontWeight: 700 }}>★ {p.avgRating}</span>
                      <span style={{ fontSize: 11, color: "#888", marginLeft: 4 }}>({p.count})</span>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>

        {/* Sản phẩm sắp hết hàng */}
        <div className="dashboard-section">
          <h3 className="section-title">⚠️ Sắp hết hàng</h3>
          <table className="dash-table">
            <thead><tr><th>Sản phẩm</th><th>Tồn kho</th></tr></thead>
            <tbody>
              {stats.lowStockProducts.length === 0
                ? <tr><td colSpan={2} className="empty-td">Không có sản phẩm sắp hết</td></tr>
                : stats.lowStockProducts.map(p => (
                  <tr key={p._id}>
                    <td>{p.name}</td>
                    <td>
                      <span style={{
                        color: p.stock === 0 ? "#ef4444" : "#f59e0b",
                        fontWeight: 700
                      }}>
                        {p.stock === 0 ? "Hết hàng" : p.stock}
                      </span>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
