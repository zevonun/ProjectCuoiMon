// app/orders/components/ChangeAddressModal.tsx
"use client";

import { useState } from "react";
import styles from "./ChangeAddressModal.module.css";

interface AddressData {
  fullName: string;
  phone: string;
  address: string;
  province: string;
}

interface ChangeAddressModalProps {
  isOpen: boolean;
  currentAddress: AddressData;
  onSubmit: (address: AddressData) => Promise<void>;
  onClose: () => void;
}

export default function ChangeAddressModal({
  isOpen,
  currentAddress,
  onSubmit,
  onClose,
}: ChangeAddressModalProps) {
  const [formData, setFormData] = useState<AddressData>(currentAddress);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<AddressData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<AddressData> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Tên người nhận không được để trống";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Số điện thoại không được để trống";
    } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Địa chỉ không được để trống";
    }

    if (!formData.province.trim()) {
      newErrors.province = "Tỉnh/thành phố không được để trống";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setIsLoading(true);
      await onSubmit(formData);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name as keyof AddressData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Thay đổi địa chỉ giao hàng</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Full name */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Tên người nhận *</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className={`${styles.input} ${errors.fullName ? styles.inputError : ""}`}
              placeholder="Nhập tên người nhận"
            />
            {errors.fullName && (
              <span className={styles.errorMessage}>{errors.fullName}</span>
            )}
          </div>

          {/* Phone */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Số điện thoại *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`${styles.input} ${errors.phone ? styles.inputError : ""}`}
              placeholder="Nhập số điện thoại"
            />
            {errors.phone && (
              <span className={styles.errorMessage}>{errors.phone}</span>
            )}
          </div>

          {/* Province */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Tỉnh/Thành phố *</label>
            <select
              name="province"
              value={formData.province}
              onChange={handleChange}
              className={`${styles.input} ${errors.province ? styles.inputError : ""}`}
            >
              <option value="">-- Chọn tỉnh/thành phố --</option>
              <option value="Hà Nội">Hà Nội</option>
              <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
              <option value="Đà Nẵng">Đà Nẵng</option>
              <option value="Hải Phòng">Hải Phòng</option>
              <option value="Cần Thơ">Cần Thơ</option>
              <option value="Khác">Khác</option>
            </select>
            {errors.province && (
              <span className={styles.errorMessage}>{errors.province}</span>
            )}
          </div>

          {/* Address */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Địa chỉ đầy đủ *</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              className={`${styles.textarea} ${errors.address ? styles.inputError : ""}`}
              placeholder="Nhập địa chỉ đầy đủ (số nhà, đường, phường, quận)"
              rows={3}
            />
            {errors.address && (
              <span className={styles.errorMessage}>{errors.address}</span>
            )}
          </div>

          {/* Buttons */}
          <div className={styles.formActions}>
            <button
              type="button"
              onClick={onClose}
              className={`${styles.btn} ${styles.btnSecondary}`}
              disabled={isLoading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className={`${styles.btn} ${styles.btnPrimary}`}
              disabled={isLoading}
            >
              {isLoading ? "Đang cập nhật..." : "Cập nhật"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
