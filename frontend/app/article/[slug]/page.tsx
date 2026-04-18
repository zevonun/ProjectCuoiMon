"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import "../article.css";

interface Article {
  slug_vi: string;
  title_vi: string;
  image: string;
  content_vi: string;
  short_description_vi: string;
  createdAt: string;
}

export default function ArticleDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [article, setArticle] = useState<Article | null>(null);
  const [related, setRelated] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  const API_URL_BE = "http://localhost:5000";

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    
    // Fetch article by slug
    fetch(`http://localhost:5000/api/articles/slug/${slug}`)
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setArticle(json.data);
        }
      })
      .catch(err => console.error('Fetch detail error:', err))
      .finally(() => setLoading(false));

    // Fetch related (newest 3)
    fetch(`http://localhost:5000/api/articles?limit=4`)
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          // Lọc bỏ bài hiện tại và lấy tối đa 3
          const filtered = json.data
            .filter((a: Article) => a.slug_vi !== slug)
            .slice(0, 3);
          setRelated(filtered);
        }
      })
      .catch(err => console.error('Fetch related error:', err));
  }, [slug]);

  if (loading) {
    return (
      <div className="article-page article-loading">
        <p>Đang tải bài viết...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="article-page not-found">
        <div className="article-container">
          <div className="article-main">
            <h1>404 - Không tìm thấy bài viết</h1>
            <p>Bài viết bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
            <Link href="/about" className="read-more">Quay lại trang Giới thiệu</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="article-page">
      <div className="article-container">
        
        {/* MAIN CONTENT (LEFT) */}
        <main className="article-main">
          {/* Breadcrumb */}
          <nav className="breadcrumb-nav">
            <Link href="/">Trang chủ</Link>
            <span className="breadcrumb-sep">/</span>
            <Link href="/about">Giới thiệu</Link>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">{article.title_vi}</span>
          </nav>

          <header className="article-header">
            <h1 className="article-title">{article.title_vi}</h1>
            <div className="article-meta">
              <span className="meta-item">
                <span className="meta-icon">👤</span> Chuyên gia Aura
              </span>
              <span className="meta-item">
                <span className="meta-icon">📅</span> {new Date(article.createdAt).toLocaleDateString('vi-VN')}
              </span>
              <span className="meta-item">
                <span className="meta-icon">⏱️</span> 5 phút đọc
              </span>
            </div>
          </header>

          <img 
            src={API_URL_BE + article.image} 
            alt={article.title_vi} 
            className="article-featured-img" 
          />

          <div 
            className="article-content"
            dangerouslySetInnerHTML={{ __html: article.content_vi }}
          />

          <div className="article-social-share">
            <span>Chia sẻ:</span>
            <span className="share-emoji" title="Facebook">📘</span>
            <span className="share-emoji" title="Twitter">🐦</span>
            <span className="share-emoji" title="Email">📨</span>
          </div>
        </main>

        {/* SIDEBAR (RIGHT) */}
        <aside className="article-sidebar">
          <div className="sidebar-widget">
            <h3 className="widget-title">Bài viết liên quan</h3>
            <div className="related-list">
              {related.map((post: any) => (
                <Link key={post.slug_vi} href={`/article/${post.slug_vi}`}>
                  <article className="related-item">
                    <img 
                      src={post.image} 
                      alt={post.title_vi} 
                      className="related-img" 
                    />
                    <div className="related-info">
                      <h4>{post.title_vi}</h4>
                      <span className="related-date">{new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>

          <div className="sidebar-widget">
            <h3 className="widget-title">Theo dõi Aura Beauty</h3>
            <p className="widget-lead">
              Đăng ký nhận tin để không bỏ lỡ các bí quyết chăm sóc da hữu ích từ chuyên gia Aura.
            </p>
            <div className="sidebar-newsletter">
              <input type="email" placeholder="Email của bạn..." aria-label="Email nhận tin" />
              <button type="button">Gửi</button>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}
