// app/(admin)/products/edit/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ProductForm, { ProductPayload, ProductData } from '../../components/ProductForm';
import styles from '../../page.module.css';
import { apiFetch } from '@/lib/api';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    apiFetch(`/admin/products/${id}`)
      .then(async res => {
        const json = await res.json().catch(() => null);
        if (!res.ok) {
          throw new Error(json?.message || 'Khong the tai san pham');
        }
        return json;
      })
      .then(res => {
        if (res.success && res.data) {
          setProduct(res.data);
        } else {
          throw new Error('Không tìm thấy sản phẩm');
        }
      })
      .catch(err => {
        console.error('Load product error:', err);
        alert('Không thể tải sản phẩm');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleUpdate = async (payload: ProductPayload) => {
    try {
      const res = await apiFetch(`/admin/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Cập nhật thất bại');
      }

      const json = await res.json();

      if (!json.success) {
        throw new Error(json.message || 'Cập nhật thất bại');
      }

      alert('Cập nhật thành công');
      router.push('/products');
    } catch (err) {
      console.error('Update product error:', err);
      alert((err as Error).message || 'Lỗi kết nối server');
    }
  };

  if (loading) return <p className="p-6">Đang tải...</p>;
  if (!product) return <p className="p-6 text-red-500">Không tìm thấy sản phẩm</p>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Chỉnh sửa sản phẩm</h1>
      <ProductForm initialData={product} onSubmit={handleUpdate} />
    </div>
  );
}
