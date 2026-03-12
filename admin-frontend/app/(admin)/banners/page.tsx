// app/admin/banners/page.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import BannerForm from "./components/BannerForm";

// Định nghĩa kiểu rõ ràng cho dữ liệu từ backend
interface BannerFromAPI {
  _id: string;
  title: string;
  image: string;
  link?: string;
  active?: boolean;
}

interface Banner {
  id: string;
  title: string;
  image: string;
  link: string;
  active: boolean;
}

export default function BannerAdminPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [loading, setLoading] = useState(true);

  const API_BASE = "http://localhost:5000/admin/banners";

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error("Failed to fetch banners");

      const data: BannerFromAPI[] = await res.json();

      const mapped: Banner[] = data.map((item) => ({
        id: item._id,
        title: item.title,
        image: item.image,
        link: item.link || "",
        active: item.active ?? true,
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
      const res = await fetch(`${API_BASE}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
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
      const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
      if (res.ok) {
        setBanners((prev) => prev.filter((b) => b.id !== id));
      } else {
        alert("Xóa thất bại");
      }
    } catch {
      alert("Lỗi kết nối server");
    }
  };

  const handleSubmit = async (payload: { title: string; image: string; link?: string }) => {
    try {
      if (editing) {
        const res = await fetch(`${API_BASE}/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, active: editing.active }),
        });
        if (!res.ok) throw new Error("Update failed");
        const updated: BannerFromAPI = await res.json();

        setBanners((prev) =>
          prev.map((b) =>
            b.id === updated._id
              ? {
                  ...b,
                  title: updated.title,
                  image: updated.image,
                  link: updated.link || "",
                  active: updated.active ?? true,
                }
              : b
          )
        );
        setEditing(null);
      } else {
        const res = await fetch(API_BASE, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, active: true }),
        });
        if (!res.ok) throw new Error("Create failed");
        const newBanner: BannerFromAPI = await res.json();

        setBanners((prev) => [
          ...prev,
          {
            id: newBanner._id,
            title: newBanner.title,
            image: newBanner.image,
            link: newBanner.link || "",
            active: true,
          },
        ]);
      }
      fetchBanners(); // Reload để đồng bộ
    } catch (err) {
      console.error(err);
      alert("Lỗi lưu banner");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl">Đang tải banner...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-800">Quản Lý Banner</h1>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-10">
          <h2 className="text-2xl font-bold mb-6">
            {editing ? "Chỉnh sửa Banner" : "Thêm Banner Mới"}
          </h2>
          <BannerForm onSubmit={handleSubmit} editing={editing} />
          {editing && (
            <button
              onClick={() => setEditing(null)}
              className="mt-4 text-red-600 hover:underline text-sm"
            >
              Hủy chỉnh sửa
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {banners.length === 0 ? (
            <p className="col-span-full text-center text-gray-500 text-xl py-20">
              Chưa có banner nào. Thêm ngay nào!
            </p>
          ) : (
            banners.map((banner) => (
              <div
                key={banner.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden group hover:shadow-2xl transition-all"
              >
                <div className="relative aspect-video bg-gray-100">
                  <Image
                    src={banner.image}
                    alt={banner.title}
                    fill
                    className="object-cover"
                  />
                  {!banner.active && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                      <span className="text-white text-3xl font-bold">ĐÃ TẮT</span>
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <h3 className="font-bold text-lg line-clamp-2 mb-3">{banner.title}</h3>

                  <button
                    onClick={() => toggleActive(banner.id, banner.active)}
                    className={`w-full py-2.5 rounded-lg font-medium transition mb-4 ${
                      banner.active
                        ? "bg-green-500 hover:bg-green-600 text-white"
                        : "bg-gray-400 hover:bg-gray-500 text-white"
                    }`}
                  >
                    {banner.active ? "ĐANG BẬT" : "ĐÃ TẮT"}
                  </button>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setEditing(banner)}
                      className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(banner.id)}
                      className="flex-1 bg-red-600 text-white py-2.5 rounded-lg hover:bg-red-700 transition"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}