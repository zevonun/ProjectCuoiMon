'use client';

import { useRouter } from 'next/navigation';
import { Article } from '../../../../types/article';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface ArticleTableProps {
  articles: Article[];
  onDelete: (id: string) => void;
  loading?: boolean;
}

const ArticleTable = ({ articles, onDelete, loading }: ArticleTableProps) => {
  const router = useRouter();

  const getImageUrl = (url?: string) => {
    if (!url) return '/no-image.jpg';
    if (url.startsWith('http')) return url;
    return `${API_URL}${url}`;
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Đang tải...</div>;
  }

  if (articles.length === 0) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Không có bài viết nào.</div>;
  }

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Thứ tự</th>
            <th>Hình ảnh</th>
            <th>Tiêu đề</th>
            <th>Mô tả ngắn</th>
            <th>Ngày tạo</th>
            <th style={{ textAlign: 'right' }}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {articles.map((article, index) => (
            <tr key={article.id}>
              <td>{article.num || index + 1}</td>
              <td>
                <img
                  src={getImageUrl(article.image)}
                  alt={article.title_vi}
                  width={60}
                  height={40}
                  style={{ borderRadius: 4, objectFit: 'cover', background: '#1e293b' }}
                />
              </td>
              <td style={{ fontWeight: 500, color: '#f8fafc', maxWidth: '300px' }}>
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {article.title_vi}
                </div>
              </td>
              <td style={{ color: '#94a3b8', fontSize: '13px', maxWidth: '400px' }}>
                 <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {article.short_description_vi}
                </div>
              </td>
              <td>
                {article.createdAt ? new Date(article.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
              </td>
              <td style={{ textAlign: 'right' }}>
                <button
                  style={{ color: '#3b82f6' }}
                  onClick={() => router.push(`/articles/edit/${article.id}`)}
                >
                  Sửa
                </button>
                <button
                  style={{ color: '#ef4444' }}
                  onClick={() => onDelete(article.id)}
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

export default ArticleTable;
