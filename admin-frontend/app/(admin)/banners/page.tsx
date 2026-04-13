// k:\DAN\ProjectCuoiMon\admin-frontend\app\(admin)\banners\page.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import BannerForm from "./components/BannerForm";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import "./banners.css";

interface BannerFromAPI {
  _id: string;
  title: string;
  image: string;
  link?: string;
  active?: boolean;
  position?: string;
}

interface Banner {
  id: string;
  title: string;
  image: string;
  link: string;
  active: boolean;
  position: string;
}

export default function BannerAdminPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [isAdding, setIsAdding] = useState(false); // ✅ Trạng thái hiển thị form thêm mới
  const [loading, setLoading] = useState(true);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await fetchWithAuth("/admin/banners", { method: "GET" });
      if (!res.ok) throw new Error("Failed to fetch banners");

      const json = await res.json();
      const data: BannerFromAPI[] = json.data || (Array.isArray(json) ? json : []);

      const mapped: Banner[] = data.map((item) => ({
        id: item._id,
        title: item.title,
        image: item.image,
        link: item.link || "",
        active: item.active ?? true,
        position: item.position || "home",
      }));

      setBanners(mapped);
    } catch (err) {
      console.error("Lỗi tải banner:", err);
      alert("Không thể tải danh sách banner!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const toggleActive = async (id: string, current: boolean) => {
    try {
      const res = await fetchWithAuth(`/admin/banners/${id}`, {
        method: "PUT",
        body: JSON.stringify({ active: !current }),
      });

      if (res.ok) {
        setBanners((prev) =>
          prev.map((b) => (b.id === id ? { ...b, active: !current } : b))
        );
      }
    } catch {
      alert("Lỗi thay đổi trạng thái");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa banner này thật chứ?")) return;

    try {
      const res = await fetchWithAuth(`/admin/banners/${id}`, { method: "DELETE" });
      if (res.ok) {
        setBanners((prev) => prev.filter((b) => b.id !== id));
      } else {
        alert("Xóa thất bại");
      }
    } catch {
      alert("Lỗi kết nối server");
    }
  };

  const handleSubmit = async (payload: { title: string; image: string; link?: string; position?: string }) => {
    try {
      if (editing) {
        const res = await fetchWithAuth(`/admin/banners/${editing.id}`, {
          method: "PUT",
          body: JSON.stringify({ ...payload, active: editing.active }),
        });
        if (!res.ok) throw new Error("Update failed");
        
        const json = await res.json();
        const updated: BannerFromAPI = json.data || json;

        setBanners((prev) =>
          prev.map((b) =>
            b.id === updated._id
              ? {
                  ...b,
                  title: updated.title,
                  image: updated.image,
                  link: updated.link || "",
                  active: updated.active ?? true,
                  position: updated.position || "home",
                }
              : b
          )
        );
        setEditing(null);
      } else {
        const res = await fetchWithAuth("/admin/banners", {
          method: "POST",
          body: JSON.stringify({ ...payload, active: true }),
        });
        if (!res.ok) throw new Error("Create failed");

        const json = await res.json();
        const newBanner: BannerFromAPI = json.data || json;

        setBanners((prev) => [
          ...prev,
          {
            id: newBanner._id,
            title: newBanner.title,
            image: newBanner.image,
            link: newBanner.link || "",
            active: true,
            position: newBanner.position || "home",
          },
        ]);
        setIsAdding(false);
      }
      fetchBanners();
    } catch (err) {
      console.error(err);
      alert("Lỗi lưu banner");
    }
  };

  if (loading && banners.length === 0) {
    return (
      <div className="loading-container">
        <p>Đang tải banner...</p>
      </div>
    );
  }

  // --- VIEW: FORM (CREATE / EDIT) ---
  if (isAdding || editing) {
    return (
      <div className="banners-container">
        <div className="form-container-card">
          <div className="form-header">
            <h2 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>
              {editing ? "Chỉnh sửa Banner" : "Thêm Banner Mới"}
            </h2>
            <button 
              onClick={() => { setIsAdding(false); setEditing(null); }}
              style={{ background: 'transparent', border: '1px solid #334155', color: '#94a3b8', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}
            >
              Quay lại danh sách
            </button>
          </div>
          <BannerForm onSubmit={handleSubmit} editing={editing} />
        </div>
      </div>
    );
  }

  // --- VIEW: TABLE LIST ---
  return (
    <div className="banners-container">
      <div className="banners-header-row">
        <h1 style={{ fontSize: '28px', fontWeight: 700, margin: 0, color: 'white' }}>Danh sách Banner</h1>
        <button className="btn-add-new" onClick={() => setIsAdding(true)}>
          <span style={{ fontSize: '20px' }}>+</span> Thêm Banner
        </button>
      </div>

      <div className="banner-table-card">
        <table className="banner-table">
          <thead>
            <tr>
              <th>Hình ảnh</th>
              <th>Tiêu đề</th>
              <th>Vị trí</th>
              <th>Trạng thái</th>
              <th style={{ textAlign: 'right' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {banners.length === 0 ? (
              <tr>
                <td colSpan={5} className="empty-text">Chưa có banner nào.</td>
              </tr>
            ) : (
              banners.map((p) => (
                <tr key={p.id}>
                  <td>
                    <img 
                      src={p.image.startsWith('http') ? p.image : `http://localhost:5000${p.image}`} 
                      alt={p.title} 
                      className="img-list" 
                    />
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{p.title}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{p.link || "Không có link"}</div>
                  </td>
                  <td>
                    <span style={{ fontSize: '12px', background: '#3b82f61a', color: '#3b82f6', padding: '4px 8px', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 600 }}>
                      {p.position}
                    </span>
                  </td>
                  <td>
                    <span 
                      className={`status-badge ${p.active ? 'status-on' : 'status-off'}`}
                      onClick={() => toggleActive(p.id, p.active)}
                      title="Click để đổi trạng thái"
                    >
                      {p.active ? "ĐANG BẬT" : "ĐÃ TẮT"}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="action-btns" style={{ justifyContent: 'flex-end' }}>
                      <button className="btn-icon" onClick={() => setEditing(p)} title="Sửa">
                        ✏️
                      </button>
                      <button className="btn-icon btn-icon-delete" onClick={() => handleDelete(p.id)} title="Xóa">
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}