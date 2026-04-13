// app/admin/banners/components/BannerForm.tsx
"use client";

import { useState } from "react";
import ImageUpload from "../../../../components/ImageUpload";

interface Props {
  onSubmit: (data: { title: string; image: string; link?: string; position?: string; active?: boolean }) => void;
  editing?: { title: string; image: string; link?: string; position?: string; active?: boolean } | null;
}

export default function BannerForm({ onSubmit, editing }: Props) {
  const [title, setTitle] = useState(editing?.title || "");
  const [image, setImage] = useState(editing?.image || "");
  const [link, setLink] = useState(editing?.link || "");
  const [position, setPosition] = useState(editing?.position || "home");
  const [active, setActive] = useState(editing?.active ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !image) {
      alert("Vui lòng nhập tiêu đề và chọn ảnh!");
      return;
    }
    onSubmit({ 
      title: title.trim(), 
      image, 
      link: link.trim() || undefined,
      position: position,
      active: active
    });
    if (!editing) {
      setTitle("");
      setImage("");
      setLink("");
      setPosition("home");
      setActive(true);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="banner-form">
      <div className="form-field">
        <label>Tiêu đề *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Tiêu đề"
          required
        />
      </div>

      <div className="form-field">
        <label>Ảnh Banner *</label>
        <ImageUpload type="banners" value={image} onChange={setImage} />
      </div>

      <div className="form-field">
        <label>Vị trí hiển thị *</label>
        <select
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          className="select-input"
        >
          <option value="home">Trang chủ (Home)</option>
          <option value="category">Trang danh mục</option>
          <option value="popup">Popup quảng cáo</option>
          <option value="sidebar">Thanh bên (Sidebar)</option>
        </select>
      </div>

      <style jsx>{`
        .select-input {
          padding: 10px 14px;
          border: 1px solid rgba(71, 85, 105, 0.8);
          border-radius: 6px;
          font-size: 14px;
          color: #e2e8f0;
          background: rgba(15, 23, 42, 0.6);
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .select-input:focus {
          outline: none;
          border-color: #3b82f6;
          background: rgba(15, 23, 42, 0.8);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }
      `}</style>

      <div className="form-field">
        <label>Link (tùy chọn)</label>
        <input
          type="url"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="https://..."
        />
      </div>

      <div className="form-field">
        <label>Trạng thái hoạt động</label>
        <div className="toggle-wrapper" onClick={() => setActive(!active)}>
          <div className={`toggle-switch ${active ? 'active' : ''}`}>
            <div className="toggle-knob"></div>
          </div>
          <span className="toggle-label">{active ? "Đang bật" : "Tạm tắt"}</span>
        </div>
      </div>

      <style jsx>{`
        .toggle-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          width: fit-content;
        }
        .toggle-switch {
          width: 48px;
          height: 24px;
          background: #334155;
          border-radius: 12px;
          position: relative;
          transition: background 0.3s ease;
        }
        .toggle-switch.active {
          background: #10b981;
        }
        .toggle-knob {
          width: 20px;
          height: 20px;
          background: white;
          border-radius: 50%;
          position: absolute;
          top: 2px;
          left: 2px;
          transition: transform 0.3s ease;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .toggle-switch.active .toggle-knob {
          transform: translateX(24px);
        }
        .toggle-label {
          font-size: 14px;
          font-weight: 500;
          color: #e2e8f0;
        }
      `}</style>

      <button type="submit" className="submit-btn">
        {editing ? "Cập Nhật Banner" : "Thêm"}
      </button>

      <style jsx>{`
        .banner-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 24px;
          background: rgba(30, 41, 59, 0.5);
          border-radius: 12px;
          border: 1px solid rgba(51, 65, 85, 0.6);
        }

        .form-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-field label {
          font-size: 14px;
          font-weight: 500;
          color: #cbd5e1;
          margin-bottom: 4px;
        }

        .form-field input {
          padding: 10px 14px;
          border: 1px solid rgba(71, 85, 105, 0.8);
          border-radius: 6px;
          font-size: 14px;
          color: #e2e8f0;
          background: rgba(15, 23, 42, 0.6);
          transition: all 0.2s ease;
        }

        .form-field input::placeholder {
          color: #64748b;
        }

        .form-field input:focus {
          outline: none;
          border-color: #3b82f6;
          background: rgba(15, 23, 42, 0.8);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }

        .submit-btn {
          padding: 10px 20px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-top: 8px;
          align-self: flex-start;
        }

        .submit-btn:hover {
          background: #2563eb;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }

        .submit-btn:active {
          transform: scale(0.98);
        }
      `}</style>
    </form>
  );
}