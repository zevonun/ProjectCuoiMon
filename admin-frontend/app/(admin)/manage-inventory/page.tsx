// k:\DAN\ProjectCuoiMon\admin-frontend\app\(admin)\manage-inventory\page.tsx
"use client";
import { useEffect, useState } from "react";
import { getAccessToken } from "@/lib/auth";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import "./styles/manage-inventory.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface InventoryProduct {
  id: string;
  name: string;
  stock: number;
  image: string;
}

interface TopSellingProduct {
  id: string;
  name: string;
  totalSold: number;
}

export default function ManageInventoryPage() {
  const [loading, setLoading] = useState(true);
  const token = getAccessToken();

  // Inventory Table State
  const [inventory, setInventory] = useState<InventoryProduct[]>([]);
  const [invTotal, setInvTotal] = useState(0);
  const [invPage, setInvPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("name_asc");
  const [status, setStatus] = useState("all");

  // Top Selling Chart State
  const [topSelling, setTopSelling] = useState<TopSellingProduct[]>([]);

  const fetchInventory = async () => {
    try {
      const res = await fetch(`${API}/admin/inventory/list?page=${invPage}&limit=10&search=${search}&sort=${sort}&status=${status}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        setInventory(json.data);
        setInvTotal(json.total);
      }
    } catch (err) { console.error(err); }
  };

  const fetchTopSelling = async () => {
    try {
      const res = await fetch(`${API}/admin/inventory/top-selling`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        setTopSelling(json.data);
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchInventory(), fetchTopSelling()]);
      setLoading(false);
    };
    loadAll();
  }, [invPage, search, sort, status]);

  // Chart Data
  const chartData = {
    labels: topSelling.map(p => p.name.length > 15 ? p.name.substring(0, 15) + "..." : p.name),
    datasets: [{
      label: "Số lượng đã bán",
      data: topSelling.map(p => p.totalSold),
      backgroundColor: "#3b82f6",
      borderRadius: 4,
    }]
  };

  const invTotalPages = Math.ceil(invTotal / 10);

  if (loading && inventory.length === 0) return <div className="inventory-loading">Đang tải dữ liệu tồn khi...</div>;

  return (
    <div className="inventory-container">
      <h1 className="inventory-title">Quản lý tồn kho</h1>

      {/* --- PHẦN 1: BIỂU ĐỒ --- */}
      <div className="inventory-card">
        <h2 className="card-title">Top 10 sản phẩm bán chạy nhất</h2>
        <div style={{ height: "300px", marginTop: "20px" }}>
          <Bar 
            data={chartData} 
            options={{ 
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false }
              }
            }} 
          />
        </div>
      </div>

      {/* --- PHẦN 2: BẢNG TỔNG QUAN TỒN KHO --- */}
      <div className="inventory-card">
        <div className="card-header">
          <h2 className="card-title">Danh sách tồn kho chi tiết</h2>
        </div>

        <div className="inventory-controls">
          <div className="search-box">
            <input 
              type="text" 
              placeholder="Tìm tên sản phẩm..." 
              className="search-input"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setInvPage(1); }}
            />
          </div>

          <div className="filter-box">
            <div className="filter-group">
              <span className="filter-label">Trạng thái:</span>
              <select className="select-filter" value={status} onChange={(e) => { setStatus(e.target.value); setInvPage(1); }}>
                <option value="all">Tất cả</option>
                <option value="out">Đã hết hàng (0)</option>
                <option value="low">Sắp hết hàng (1-5)</option>
                <option value="stable">Ổn định (&gt;5)</option>
              </select>
            </div>

            <div className="filter-group">
              <span className="filter-label">Sắp xếp:</span>
              <select className="select-filter" value={sort} onChange={(e) => { setSort(e.target.value); setInvPage(1); }}>
                <option value="name_asc">Tên A-Z</option>
                <option value="name_desc">Tên Z-A</option>
                <option value="stock_asc">Tồn kho tăng dần</option>
                <option value="stock_desc">Tồn kho giảm dần</option>
              </select>
            </div>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Ảnh</th>
                <th>Sản phẩm</th>
                <th>Tồn kho</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map(p => (
                <tr key={p.id}>
                  <td><img src={p.image.startsWith("http") ? p.image : `${API}${p.image}`} alt={p.name} className="img-thumbnail" /></td>
                  <td>{p.name}</td>
                  <td style={{fontWeight: 700}}>{p.stock}</td>
                  <td>
                    {p.stock === 0 ? (
                      <span className="low-stock-badge" style={{background: "#ef444422", color: "#ef4444"}}>Hết hàng</span>
                    ) : p.stock <= 5 ? (
                      <span className="low-stock-badge">Sắp hết hàng</span>
                    ) : (
                      <span className="stock-ok-badge">Ổn định</span>
                    )}
                  </td>
                </tr>
              ))}
              {inventory.length === 0 && (
                <tr>
                  <td colSpan={4} style={{textAlign: "center", padding: "40px", color: "#64748b"}}>
                    Không tìm thấy sản phẩm nào phù hợp
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {invTotalPages > 1 && (
          <div className="pagination">
            <button disabled={invPage === 1} onClick={() => setInvPage(p => p - 1)} className="page-btn">Trang trước</button>
            {[...Array(invTotalPages)].map((_, i) => (
              <button 
                key={i} 
                className={`page-btn ${invPage === i + 1 ? "active" : ""}`}
                onClick={() => setInvPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button disabled={invPage >= invTotalPages} onClick={() => setInvPage(p => p + 1)} className="page-btn">Trang sau</button>
          </div>
        )}
      </div>
    </div>
  );
}
