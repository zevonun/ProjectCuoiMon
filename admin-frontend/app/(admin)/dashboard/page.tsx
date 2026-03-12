"use client";
import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from "chart.js";
import { Bar } from "react-chartjs-2";
import "./styles/dashboard.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const API_URL = "http://localhost:5000/api/dashboard/stats";

type Product = {
  _id: string;
  name: string;
  price: number;
  createdAt: string;
};

type Revenue = {
  _id: number;
  total: number;
};

type Stats = {
  totalProducts: number;
  latestProducts: Product[];
  totalRevenue: number;
  revenueByMonth: Revenue[];
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => setStats(data));
  }, []);

  const chartData = {
    labels: stats?.revenueByMonth.map(i => `Tháng ${i._id}`),
    datasets: [
      {
        label: "Doanh thu (VNĐ)",
        data: stats?.revenueByMonth.map(i => i.total),
        backgroundColor: "#3f51b5",
        borderRadius: 6,
      },
    ],
  };

 const chartOptions = {
  responsive: true,
  plugins: {
    legend: { position: "top" as const },
    tooltip: { mode: "index" as const, intersect: false },
  },
  scales: {
    y: {
      ticks: {
        callback: (value: number | string) => {
          if (typeof value === "number") return `${value.toLocaleString()}đ`;
          return value;
        },
      },
    },
  },
};

  return (
    <div className="dashboard">
      <h1 className="dashboard-title">Admin Dashboard</h1>

      {/* Tổng quan */}
      <div className="dashboard-cards">
        <div className="card">
          <p className="card-title">Tổng sản phẩm</p>
          <h2>{stats?.totalProducts || 0}</h2>
        </div>
        <div className="card">
          <p className="card-title">Tổng doanh thu</p>
          <h2>{stats?.totalRevenue.toLocaleString() || 0}đ</h2>
        </div>
      </div>

      {/* Biểu đồ */}
      <div className="chart-box">
        <h3 className="chart-title">Doanh thu theo tháng</h3>
        {stats && <Bar data={chartData} options={chartOptions} />}
      </div>

      {/* Sản phẩm mới */}
      <div className="dashboard-table">
        <h3 className="table-title">Sản phẩm mới nhất</h3>
        <table>
          <thead>
            <tr>
              <th>Tên</th>
              <th>Giá</th>
              <th>Ngày tạo</th>
            </tr>
          </thead>
          <tbody>
            {stats?.latestProducts.map(p => (
              <tr key={p._id}>
                <td>{p.name}</td>
                <td>{p.price.toLocaleString()}đ</td>
                <td>{new Date(p.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
