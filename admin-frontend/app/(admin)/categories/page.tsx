'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import CategoryForm, { CategoryPayload } from './components/CategoryForm';
import './styles/categories.css';

interface Category {
  id: string;
  name: string;
  image?: string;
}

interface CategoryFromAPI {
  _id: string;
  name: string;
  image?: string;
}

const API = 'http://localhost:5000/api/categories';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Category | null>(null);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch(API);
      const json = await res.json();

      if (json.success && Array.isArray(json.data)) {
        setCategories(
          json.data.map((c: CategoryFromAPI) => ({
            id: c._id,
            name: c.name,
            image: c.image,
          }))
        );
      } else {
        setCategories([]);
      }
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleSubmit = async (data: CategoryPayload) => {
    try {
      if (editing) {
        await fetch(`${API}/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        setEditing(null);
      } else {
        await fetch(API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      }
      loadCategories();
    } catch {
      alert('Lỗi lưu danh mục');
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Xóa danh mục này?')) return;
    try {
      await fetch(`${API}/${id}`, { method: 'DELETE' });
      loadCategories();
    } catch {
      alert('Xóa thất bại');
    }
  };

  if (loading) {
    return <p className="no-categories">Đang tải danh mục...</p>;
  }

  return (
    <div className="categories-container">
      <h1 className="categories-title">Quản lý danh mục</h1>

      <div className="category-form-card">
        <h2>{editing ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}</h2>

        <CategoryForm
          initialData={editing || undefined}
          onSubmit={handleSubmit}
        />

        {editing && (
          <button className="cancel-link" onClick={() => setEditing(null)}>
            Hủy chỉnh sửa
          </button>
        )}
      </div>

      <div className="categories-grid">
        {categories.length === 0 ? (
          <div className="no-categories">Chưa có danh mục nào</div>
        ) : (
          categories.map((category) => (
            <div key={category.id} className="category-card">
              {category.image && (
                <div className="category-image">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              <div className="category-info">
                <div className="category-name">{category.name}</div>

                <div className="category-actions">
                  <button
                    className="edit-btn"
                    onClick={() => setEditing(category)}
                  >
                    Sửa
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => remove(category.id)}
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
