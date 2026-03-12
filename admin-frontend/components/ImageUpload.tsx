"use client";

import { useState, useCallback } from "react";
import { Upload, X } from "lucide-react";
import styles from "./ImageUpload.module.css";

interface ImageUploadProps {
  type: "banners" | "products" | "categories" | "others";
  value?: string;
  onChange: (url: string) => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function ImageUpload({ type, value, onChange }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const uploadFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        alert("Chỉ được chọn file ảnh!");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert("Ảnh không quá 5MB!");
        return;
      }

      setUploading(true);

      const formData = new FormData();
      formData.append("image", file);

      try {
        const res = await fetch(`${API_URL}/api/upload/${type}`, {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (data.success && data.url) {
          onChange(data.url);
        } else {
          alert("Upload thất bại");
        }
      } catch (err) {
        console.error(err);
        alert("Lỗi server");
      } finally {
        setUploading(false);
      }
    },
    [type, onChange]
  );

  const previewUrl =
    value && value.startsWith("http")
      ? value
      : value
        ? `${API_URL}${value}`
        : "";

  const zoneClass = [
    styles.uploadZone,
    isDragging ? styles.uploadZoneDragging : "",
    uploading ? styles.uploadZoneUploading : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={zoneClass}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) uploadFile(file);
      }}
    >
      <input
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files && uploadFile(e.target.files[0])}
        className={styles.hiddenInput}
        id={`upload-${type}`}
      />

      {previewUrl ? (
        <div className={styles.previewWrapper}>
          <img
            src={previewUrl}
            alt="Preview"
            className={styles.previewImage}
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className={styles.removeBtn}
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <label htmlFor={`upload-${type}`} className={styles.uploadLabel}>
          <Upload size={52} className={styles.uploadIcon} />
          <p className={styles.uploadText}>
            {uploading ? "Đang tải..." : "Kéo thả hoặc bấm chọn ảnh"}
          </p>
          <p className={styles.uploadHint}>JPG, PNG, WebP • ≤ 5MB</p>
        </label>
      )}
    </div>
  );
}