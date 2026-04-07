'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import ArticleForm, { ArticleData } from '../../components/ArticleForm';
import styles from '../../page.module.css';
import { apiFetch } from '@/lib/api';

const EditArticlePage = () => {
  const router = useRouter();
  const { id } = useParams();
  const [initialData, setInitialData] = useState<ArticleData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    apiFetch(`/api/articles/${id}`)
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setInitialData(json.data);
        } else {
          alert('Không tìm thấy bài viết');
          router.push('/articles');
        }
      })
      .catch(err => {
        console.error('Fetch article error:', err);
        alert('Lỗi khi lấy thông tin bài viết');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleUpdate = async (data: ArticleData) => {
    try {
      const res = await apiFetch(`/api/articles/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!json.success) {
        throw new Error(json.message || 'Cập nhật bài viết thất bại');
      }

      alert('Cập nhật bài viết thành công!');
      router.push('/articles');
    } catch (err) {
      console.error('Update article error:', err);
      alert((err as Error).message || 'Lỗi kết nối server');
    }
  };

  if (loading) return <div className={styles.container}>Đang tải...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.titleContainer}>
        <button 
          className={styles.btnBack} 
          onClick={() => router.push('/articles')}
          title="Quay lại danh sách"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className={styles.title}>Chỉnh sửa bài viết</h1>
      </div>
      {initialData && <ArticleForm onSubmit={handleUpdate} initialData={initialData} />}
    </div>
  );
};

export default EditArticlePage;
