'use client';

import { useState } from 'react';
import ImageUpload from '../../../../components/ImageUpload';

export interface CategoryPayload {
  name: string;
  image?: string;
}

interface Props {
  onSubmit: (data: CategoryPayload) => void;
  initialData?: CategoryPayload;
}

export default function CategoryForm({ onSubmit, initialData }: Props) {
  const [name, setName] = useState(initialData?.name || '');
  const [image, setImage] = useState(initialData?.image || '');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert('Tên danh mục không được để trống');

    onSubmit({ name: name.trim(), image: image || undefined });

    if (!initialData) {
      setName('');
      setImage('');
    }
  };

  return (
    <form onSubmit={submit} className="admin-form">
      <div className="form-group">
        <label>Tên danh mục</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tên danh mục"
        />
      </div>

      <div className="form-group">
        <label>Ảnh danh mục</label>
        <ImageUpload
          type="categories"
          value={image}
          onChange={setImage}
        />
      </div>

      <button type="submit" className="submit-btn">
        {initialData ? 'Cập nhật' : 'Thêm'}
      </button>
    </form>
  );
}
