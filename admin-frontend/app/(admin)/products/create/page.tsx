// app/(admin)/products/create/page.tsx
'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import ProductForm, { ProductPayload } from '../components/ProductForm';
import styles from './page.module.css';
import { apiFetch } from '@/lib/api';

const CreateProductPage: React.FC = () => {
  const router = useRouter();

  const handleCreate = async (data: ProductPayload) => {
    try {
      const res = await apiFetch('/api/product', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Tạo sản phẩm thất bại');
      }

      const json = await res.json();

      if (!json.success) {
        throw new Error(json.message || 'Tạo sản phẩm thất bại');
      }

      alert('Tạo sản phẩm thành công!');
      router.push('/products'); // ✅ sửa từ '/admin/products'
    } catch (err) {
      console.error('Create product error:', err);
      alert((err as Error).message || 'Lỗi kết nối server');
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Thêm sản phẩm mới</h1>
      <div className={styles.formWrapper}>
        <ProductForm onSubmit={handleCreate} />
      </div>
    </div>
  );
};

export default CreateProductPage;