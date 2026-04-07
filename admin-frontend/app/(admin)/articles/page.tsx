'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ArticleTable from './components/ArticleTable';
import { Article } from '../../../types/article';
import styles from './page.module.css';
import { apiFetch } from '../../../lib/api';

export default function ArticleListPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const limit = 10;

  const loadArticles = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/articles?page=${page}&limit=${limit}&search=${search}`);
      const json = await res.json();
      if (json.success) {
        setArticles(json.data);
        setTotal(json.total);
      }
    } catch {
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, [page, search]);

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa bài viết này?')) return;
    try {
      const res = await apiFetch(`/api/articles/${id}`, { 
        method: 'DELETE'
      });
      const json = await res.json();
      if (json.success) {
        loadArticles();
      } else {
        alert(json.message || 'Lỗi khi xóa');
      }
    } catch {
      alert('Lỗi server');
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1); // reset to first page on search
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Quản lý bài viết (Articles)</h1>

        <div className={styles.actions}>
          <input
            type="text"
            placeholder="Tìm kiếm bài viết..."
            className={styles.searchInput}
            value={search}
            onChange={handleSearchChange}
          />
          <button
            className={styles.btnPrimary}
            onClick={() => router.push('/articles/create')}
          >
            + Thêm bài viết
          </button>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <ArticleTable 
          articles={articles} 
          onDelete={handleDelete} 
          loading={loading}
        />
        
        {/* Simple Pagination */}
        {total > limit && (
          <div className={styles.pagination}>
            <button 
              disabled={page === 1} 
              onClick={() => setPage(p => p - 1)}
              className={styles.btnPage}
            >
              Trường
            </button>
            <span className={styles.pageInfo}>Trang {page} / {Math.ceil(total / limit)}</span>
            <button 
              disabled={page >= Math.ceil(total / limit)} 
              onClick={() => setPage(p => p + 1)}
              className={styles.btnPage}
            >
              Sau
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
