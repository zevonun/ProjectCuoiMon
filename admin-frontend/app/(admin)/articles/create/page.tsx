'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import ArticleForm, { ArticleData } from '../components/ArticleForm';
import styles from '../page.module.css';
import { apiFetch } from '@/lib/api';

const CreateArticlePage = () => {
  const router = useRouter();

  const handleCreate = async (data: ArticleData) => {
    try {
      const res = await apiFetch('/api/articles', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!json.success) {
        throw new Error(json.message || 'Tạo bài viết thất bại');
      }

      alert('Tạo bài viết thành công!');
      router.push('/articles');
    } catch (err) {
      console.error('Create article error:', err);
      alert((err as Error).message || 'Lỗi kết nối server');
    }
  };

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
        <h1 className={styles.title}>Thêm bài viết mới</h1>
      </div>
      <ArticleForm onSubmit={handleCreate} />
    </div>
  );
};

export default CreateArticlePage;
