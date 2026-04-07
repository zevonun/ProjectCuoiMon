'use client';

import React, { useState, useEffect } from 'react';
import ImageUpload from '../../../../components/ImageUpload';
import styles from './ProductForm.module.css';

export interface ProductData {
  ten_sp: string;
  gia: number | '';
  gia_km?: number | '';
  mo_ta?: string;
  hinh?: string;
  categoryId?: string;
  subcategory?: string; // Danh mục con
}

export interface ProductPayload {
  name: string;
  price: number;
  sale: number;
  categoryId: string;
  subcategory?: string; // Danh mục con
  description?: string;
  image?: string;
}

interface Category {
  id: string;
  name: string;
}

interface ProductFormProps {
  onSubmit: (data: ProductPayload) => void;
  initialData?: ProductData;
}

const noArrowStyle: React.CSSProperties = {
  MozAppearance: 'textfield' as never,
  WebkitAppearance: 'none' as never,
};

const ProductForm: React.FC<ProductFormProps> = ({ onSubmit, initialData }) => {
  const [form, setForm] = useState<ProductData>(() => ({
    ten_sp: initialData?.ten_sp ?? '',
    gia: initialData?.gia ?? '',
    gia_km: initialData?.gia_km ?? '',
    mo_ta: initialData?.mo_ta ?? '',
    hinh: initialData?.hinh ?? '',
    categoryId: initialData?.categoryId ?? '',
    subcategory: initialData?.subcategory ?? '',
  }));

  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/categories')
      .then(res => res.json())
      .then((json: { success: boolean; data: { _id?: string; name: string }[] }) => {
        if (!json.success) return;
        const mapped: Category[] = json.data
          .filter(c => c._id)
          .map(c => ({ id: String(c._id), name: c.name }));
        setCategories(mapped);
      })
      .catch(err => console.error(err));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]:
        name === 'gia' || name === 'gia_km'
          ? value === '' ? '' : Number(value)
          : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.ten_sp || !form.gia || Number(form.gia) <= 0) {
      alert('Tên sản phẩm và giá là bắt buộc');
      return;
    }

    if (!form.categoryId) {
      alert('Vui lòng chọn danh mục');
      return;
    }

    const payload: ProductPayload = {
      name: form.ten_sp,
      price: Number(form.gia),
      sale: Number(form.gia_km) || 0,
      categoryId: form.categoryId,
      subcategory: form.subcategory || '',
      description: form.mo_ta || '',
      image: form.hinh || '',
    };

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>Tên sản phẩm</label>
        <input
          name="ten_sp"
          value={form.ten_sp}
          onChange={handleChange}
          className={styles.input}
          placeholder="Nhập tên sản phẩm"
          required
        />
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>Giá</label>
        <input
          type="number"
          name="gia"
          value={form.gia}
          onChange={handleChange}
          className={styles.input}
          placeholder="Nhập giá"
          style={noArrowStyle}
          required
        />
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>Giá KM</label>
        <input
          type="number"
          name="gia_km"
          value={form.gia_km}
          onChange={handleChange}
          className={styles.input}
          placeholder="Nhập giá khuyến mãi (nếu có)"
          style={noArrowStyle}
        />
      </div>

      <div className={styles.fieldGroup}>
        <label className={`${styles.label} ${styles.required}`}>Danh mục</label>
        <select
          name="categoryId"
          value={form.categoryId}
          onChange={handleChange}
          className={styles.select}
          required
        >
          <option value="">-- Chọn danh mục --</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>Danh mục con</label>
        <input
          name="subcategory"
          value={form.subcategory}
          onChange={handleChange}
          className={styles.input}
          placeholder="Ví dụ: Combo chăm sóc da, Son màu, Dưỡng da..."
        />
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>Mô tả</label>
        <textarea
          name="mo_ta"
          value={form.mo_ta}
          onChange={handleChange}
          className={styles.textarea}
          placeholder="Nhập mô tả sản phẩm"
        />
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>Hình ảnh</label>
        <ImageUpload
          type="products"
          value={form.hinh}
          onChange={(url) =>
            setForm(prev => ({ ...prev, hinh: url }))
          }
        />
      </div>

      <button type="submit" className={styles.submitBtn}>
        Lưu
      </button>

    </form>
  );
};

export default ProductForm;