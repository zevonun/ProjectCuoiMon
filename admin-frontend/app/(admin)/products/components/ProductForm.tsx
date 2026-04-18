'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import ImageUpload from '../../../../components/ImageUpload';
import styles from './ProductForm.module.css';

export interface ProductData {
  ten_sp: string;
  gia: number | '';
  gia_km?: number | '';
  mo_ta?: string;
  hinh?: string;
  categoryId?: string;
  subcategory?: string;
}

export interface ProductPayload {
  name: string;
  price: number;
  sale: number;
  categoryId: string;
  subcategory?: string;
  description?: string;
  image?: string;
}

interface Category {
  id: string;
  name: string;
  parentId: string | null;
}

interface ProductFormProps {
  onSubmit: (data: ProductPayload) => void;
  initialData?: ProductData;
}

const noArrowStyle: React.CSSProperties = {
  MozAppearance: 'textfield' as never,
  WebkitAppearance: 'none' as never,
};

/** Gán danh mục cha / con từ categoryId + chuỗi subcategory (dữ liệu cũ) */
function resolveParentChild(
  categories: Category[],
  categoryId: string,
  subcategory?: string
): { parentId: string; childId: string } {
  const cat = categories.find((c) => c.id === categoryId);
  if (!cat) return { parentId: '', childId: '' };
  if (cat.parentId) {
    return { parentId: cat.parentId, childId: cat.id };
  }
  const sub = subcategory?.trim();
  if (sub) {
    const child = categories.find(
      (c) =>
        c.parentId === cat.id &&
        c.name.trim().toLowerCase() === sub.toLowerCase()
    );
    if (child) return { parentId: cat.id, childId: child.id };
  }
  return { parentId: cat.id, childId: '' };
}

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
  const [parentId, setParentId] = useState('');
  const [childId, setChildId] = useState('');
  const initFromProductRef = useRef(false);

  useEffect(() => {
    fetch('http://localhost:5000/api/categories')
      .then((res) => res.json())
      .then((json: { success: boolean; data: { _id?: string; name: string; parentId?: string | null }[] }) => {
        if (!json.success || !json.data) return;
        const mapped: Category[] = json.data
          .filter((c) => c._id)
          .map((c) => ({
            id: String(c._id),
            name: c.name,
            parentId: c.parentId ? String(c.parentId) : null,
          }));
        setCategories(mapped);
      })
      .catch((err) => console.error(err));
  }, []);

  const parents = useMemo(
    () => categories.filter((c) => !c.parentId),
    [categories]
  );

  const children = useMemo(
    () => (parentId ? categories.filter((c) => c.parentId === parentId) : []),
    [categories, parentId]
  );

  useEffect(() => {
    initFromProductRef.current = false;
  }, [initialData?.categoryId]);

  useEffect(() => {
    if (initFromProductRef.current || categories.length === 0) return;
    if (!initialData?.categoryId) {
      initFromProductRef.current = true;
      return;
    }
    const { parentId: p, childId: ch } = resolveParentChild(
      categories,
      initialData.categoryId,
      initialData.subcategory
    );
    setParentId(p);
    setChildId(ch);
    initFromProductRef.current = true;
  }, [categories, initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === 'gia' || name === 'gia_km'
          ? value === ''
            ? ''
            : Number(value)
          : value,
    }));
  };

  const handleParentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value;
    setParentId(v);
    setChildId('');
  };

  const handleChildChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setChildId(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.ten_sp || !form.gia || Number(form.gia) <= 0) {
      alert('Tên sản phẩm và giá là bắt buộc');
      return;
    }

    if (!parentId) {
      alert('Vui lòng chọn danh mục cha');
      return;
    }

    if (children.length > 0 && !childId) {
      alert('Vui lòng chọn danh mục con (nhóm sản phẩm trong danh mục này)');
      return;
    }

    const finalCategoryId = childId || parentId;
    const child = childId ? categories.find((c) => c.id === childId) : null;
    const subcategoryStr = child ? child.name : '';

    const payload: ProductPayload = {
      name: form.ten_sp,
      price: Number(form.gia),
      sale: Number(form.gia_km) || 0,
      categoryId: finalCategoryId,
      subcategory: subcategoryStr,
      description: form.mo_ta || '',
      image: form.hinh || '',
    };

    onSubmit(payload);
  };

  const childPlaceholder =
    parentId && children.length === 0
      ? '— Không có danh mục con trong hệ thống —'
      : '— Chọn danh mục con —';

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
        <label className={`${styles.label} ${styles.required}`}>Danh mục cha</label>
        <select
          name="parentCategory"
          value={parentId}
          onChange={handleParentChange}
          className={styles.select}
          required
        >
          <option value="">-- Chọn danh mục cha --</option>
          {parents.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.fieldGroup}>
        <label
          className={`${styles.label} ${children.length > 0 ? styles.required : ''}`}
        >
          Danh mục con
        </label>
        {parentId && children.length > 0 ? (
          <select
            name="childCategory"
            value={childId}
            onChange={handleChildChange}
            className={styles.select}
            required={children.length > 0}
          >
            <option value="">{childPlaceholder}</option>
            {children.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        ) : (
          <p className={styles.helperText}>
            {parentId
              ? children.length === 0
                ? 'Danh mục này chưa có nhóm con trong hệ thống — sản phẩm sẽ gắn trực tiếp vào danh mục cha.'
                : 'Chọn danh mục cha trước.'
              : 'Chọn danh mục cha trước.'}
          </p>
        )}
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
          onChange={(url) => setForm((prev) => ({ ...prev, hinh: url }))}
        />
      </div>

      <button type="submit" className={styles.submitBtn}>
        Lưu
      </button>
    </form>
  );
};

export default ProductForm;
