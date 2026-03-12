'use client';

import React, { useState, useEffect } from 'react';
import { CustomerInfo, FormErrors } from '../types';
import { validateCustomerInfo } from '../lib/validation';
import styles from '../checkout.module.css';

interface CustomerFormProps {
  onCustomerInfoChange: (info: CustomerInfo, errors: FormErrors) => void;
}

const DEFAULT_CUSTOMER_INFO: CustomerInfo = {
  fullName: '',
  phone: '',
  email: '',
  address: '',
  province: '',
  notes: '',
};

const VIETNAMESE_PROVINCES = [
  'An Giang',
  'Bà Rịa - Vũng Tàu',
  'Bắc Giang',
  'Bắc Kạn',
  'Bạc Liêu',
  'Bắc Ninh',
  'Bến Tre',
  'Bình Định',
  'Bình Dương',
  'Bình Phước',
  'Bình Thuận',
  'Cà Mau',
  'Cao Bằng',
  'Đà Nẵng',
  'Đắc Lắk',
  'Đắc Nông',
  'Điện Biên',
  'Đồng Nai',
  'Đồng Tháp',
  'Gia Lai',
  'Hà Giang',
  'Hà Nam',
  'Hà Nội',
  'Hà Tĩnh',
  'Hải Dương',
  'Hải Phòng',
  'Hậu Giang',
  'Hòa Bình',
  'Hưng Yên',
  'Khánh Hòa',
  'Kiên Giang',
  'Kon Tum',
  'Lai Châu',
  'Lâm Đồng',
  'Lạng Sơn',
  'Lào Cai',
  'Long An',
  'Nam Định',
  'Nghệ An',
  'Ninh Bình',
  'Ninh Thuận',
  'Phú Thọ',
  'Phú Yên',
  'Quảng Bình',
  'Quảng Nam',
  'Quảng Ngãi',
  'Quảng Ninh',
  'Quảng Trị',
  'Sóc Trăng',
  'Sơn La',
  'Tây Ninh',
  'Thái Bình',
  'Thái Nguyên',
  'Thanh Hóa',
  'Thừa Thiên Huế',
  'Tiền Giang',
  'TP Hồ Chí Minh',
  'Trà Vinh',
  'Tuyên Quang',
  'Vĩnh Long',
  'Vĩnh Phúc',
  'Yên Bái',
];

export const CustomerForm: React.FC<CustomerFormProps> = ({
  onCustomerInfoChange,
}) => {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>(
    DEFAULT_CUSTOMER_INFO
  );
  const [errors, setErrors] = useState<FormErrors>({});

  // Load customer info from localStorage on mount
  useEffect(() => {
    const savedCustomerInfo = localStorage.getItem('customerInfo');
    if (savedCustomerInfo) {
      try {
        const parsedInfo = JSON.parse(savedCustomerInfo);
        setCustomerInfo(parsedInfo);
      } catch (error) {
        console.error('Error parsing customer info from localStorage:', error);
      }
    }
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const updatedInfo = {
      ...customerInfo,
      [name]: value,
    };

    setCustomerInfo(updatedInfo);

    // Save to localStorage
    localStorage.setItem('customerInfo', JSON.stringify(updatedInfo));

    // Validate on change and pass to parent
    const validationErrors = validateCustomerInfo(updatedInfo);
    setErrors(validationErrors);
    onCustomerInfoChange(updatedInfo, validationErrors);
  };

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionNumber}>1</span>
        <h2 className={styles.sectionTitle}>Thông tin khách hàng</h2>
      </div>

      <form className={styles.form}>
        <div className={styles.formGrid}>
          {/* Full Name */}
          <div className={styles.formGroup}>
            <label htmlFor="fullName" className={styles.label}>
              Họ và tên <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={customerInfo.fullName}
              onChange={handleInputChange}
              placeholder="Nhập họ và tên"
              className={`${styles.input} ${
                errors.fullName ? styles.inputError : ''
              }`}
            />
            {errors.fullName && (
              <span className={styles.errorMessage}>{errors.fullName}</span>
            )}
          </div>

          {/* Phone */}
          <div className={styles.formGroup}>
            <label htmlFor="phone" className={styles.label}>
              Số điện thoại <span className={styles.required}>*</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={customerInfo.phone}
              onChange={handleInputChange}
              placeholder="0123456789"
              className={`${styles.input} ${
                errors.phone ? styles.inputError : ''
              }`}
            />
            {errors.phone && (
              <span className={styles.errorMessage}>{errors.phone}</span>
            )}
          </div>

          {/* Email */}
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              Email <span className={styles.required}>*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={customerInfo.email}
              onChange={handleInputChange}
              placeholder="example@email.com"
              className={`${styles.input} ${
                errors.email ? styles.inputError : ''
              }`}
            />
            {errors.email && (
              <span className={styles.errorMessage}>{errors.email}</span>
            )}
          </div>

          {/* Address */}
          <div className={styles.formGroup}>
            <label htmlFor="address" className={styles.label}>
              Địa chỉ giao hàng <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={customerInfo.address}
              onChange={handleInputChange}
              placeholder="123 Đường ABC, Phường XYZ"
              className={`${styles.input} ${
                errors.address ? styles.inputError : ''
              }`}
            />
            {errors.address && (
              <span className={styles.errorMessage}>{errors.address}</span>
            )}
          </div>

          {/* Province */}
          <div className={styles.formGroup}>
            <label htmlFor="province" className={styles.label}>
              Tỉnh/Thành phố <span className={styles.required}>*</span>
            </label>
            <select
              id="province"
              name="province"
              value={customerInfo.province}
              onChange={handleInputChange}
              className={`${styles.input} ${styles.select} ${
                errors.province ? styles.inputError : ''
              }`}
            >
              <option value="">-- Chọn tỉnh/thành phố --</option>
              {VIETNAMESE_PROVINCES.map((province) => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </select>
            {errors.province && (
              <span className={styles.errorMessage}>{errors.province}</span>
            )}
          </div>

          {/* Notes */}
          <div className={styles.formGroup}>
            <label htmlFor="notes" className={styles.label}>
              Ghi chú (tùy chọn)
            </label>
            <textarea
              id="notes"
              name="notes"
              value={customerInfo.notes}
              onChange={handleInputChange}
              placeholder="Ghi chú thêm (nếu có)"
              className={`${styles.input} ${styles.textarea}`}
              rows={3}
            />
          </div>
        </div>
      </form>
    </div>
  );
};
