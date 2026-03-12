'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '../../../../types/product';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface CategoryFromAPI {
  _id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
}

const ProductTable = ({
  products,
  onDelete,
}: {
  products: Product[];
  onDelete: (id: string) => void;
}) => {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/api/categories`)
      .then(res => res.json())
      .then((json: { success: boolean; data: CategoryFromAPI[] }) => {
        if (!json.success) return;
        setCategories(
          json.data.map(c => ({
            id: String(c._id),
            name: c.name,
          }))
        );
      });
  }, []);

  const getCategoryName = (id?: string) => {
    if (!id) return 'Mặc định';
    return categories.find(c => c.id === id)?.name || 'Không tìm thấy';
  };

  const getImageUrl = (url?: string) => {
    if (!url) return '/noimg.png';
    if (url.startsWith('http')) return url;
    return `${API_URL}${url}`;
  };

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Ảnh</th>
            <th>Tên</th>
            <th>Giá</th>
            <th>Danh mục</th>
            <th>Hành động</th>
          </tr>
        </thead>

        <tbody>
          {products.map(p => (
            <tr key={p.id}>
              <td>
                {/* ✅ Dùng <img> thay vì <Image> để tránh lỗi 400 */}
                <img
                  src={getImageUrl(p.hinh)}
                  alt={p.ten_sp}
                  width={48}
                  height={48}
                  style={{ borderRadius: 6, objectFit: 'cover' }}
                />
              </td>
              <td>{p.ten_sp}</td>
              <td>{p.gia}</td>
              <td>{getCategoryName(p.categoryId)}</td>
              <td className="table-actions">
                <button
                  className="btn-edit"
                  onClick={() => router.push(`/products/edit/${p.id}`)}
                >
                  Sửa
                </button>
                <button
                  className="btn-delete"
                  onClick={() => onDelete(p.id)}
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;