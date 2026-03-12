'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProductTable from './components/ProductTable';
import { Product } from '../../../types/product';
import styles from './page.module.css';

const API = 'http://localhost:5000/api/product';

export default function ProductListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const router = useRouter();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await fetch(API);
        const json = await res.json();
        setProducts(json.success && Array.isArray(json.data) ? json.data : []);
      } catch {
        setProducts([]);
      }
    };

    loadProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa sản phẩm này?')) return;
    try {
      const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        setProducts(prev => prev.filter(p => p.id !== id));
      }
    } catch {
      alert('Lỗi server');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Sản phẩm</h1>

        <button
          className={styles.btnPrimary}
          onClick={() => router.push('/products/create')}
        >
          + Thêm sản phẩm
        </button>
      </div>

      <div className={styles.tableWrapper}>
        <ProductTable products={products} onDelete={handleDelete} />
      </div>
    </div>
  );
}
