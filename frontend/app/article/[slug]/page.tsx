"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getArticleBySlug, getRelatedArticles } from "../data";
import "../article.css";

export default function ArticleDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const article = getArticleBySlug(slug);

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

  const related = getRelatedArticles(article.relatedPosts);

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
            <span style={{ color: "#3e6807" }}>{article.title}</span>
          </nav>

          <header className="article-header">
            <h1 className="article-title">{article.title}</h1>
            <div className="article-meta">
              <span className="meta-item">
                <span className="meta-icon">👤</span> {article.author}
              </span>
              <span className="meta-item">
                <span className="meta-icon">📅</span> {article.date}
              </span>
              <span className="meta-item">
                <span className="meta-icon">⏱️</span> 5 phút đọc
              </span>
            </div>
          </header>

          <img 
            src={article.image} 
            alt={article.title} 
            className="article-featured-img" 
          />

          <div 
            className="article-content"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Social Share (Placeholder) */}
          <div className="social-share" style={{ marginTop: "50px", borderTop: "1px solid #f0f0f0", paddingTop: "30px" }}>
            <span style={{ fontWeight: 700, marginRight: "15px" }}>Chia sẻ:</span>
            <span style={{ fontSize: "1.5rem", cursor: "pointer", marginRight: "10px" }}>📘</span>
            <span style={{ fontSize: "1.5rem", cursor: "pointer", marginRight: "10px" }}>🐦</span>
            <span style={{ fontSize: "1.5rem", cursor: "pointer", marginRight: "10px" }}>📨</span>
          </div>
        </main>

        {/* SIDEBAR (RIGHT) */}
        <aside className="article-sidebar">
          <div className="sidebar-widget">
            <h3 className="widget-title">Bài viết liên quan</h3>
            <div className="related-list">
              {related.map((post: any) => (
                <Link key={post.slug} href={`/article/${post.slug}`}>
                  <article className="related-item">
                    <img 
                      src={post.image} 
                      alt={post.title} 
                      className="related-img" 
                    />
                    <div className="related-info">
                      <h4>{post.title}</h4>
                      <span className="related-date">{post.date}</span>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>

          {/* New arrivals or other widget (Optional) */}
          <div className="sidebar-widget">
            <h3 className="widget-title">Theo dõi Aura Beauty</h3>
            <p style={{ fontSize: "0.9rem", color: "#666", lineHeight: 1.6 }}> Đăng ký nhận tin để không bỏ lỡ các bí quyết chăm sóc da hữu ích từ chuyên gia Aura.</p>
            <div style={{ marginTop: "15px", display: "flex", gap: "10px" }}>
              <input 
                type="email" 
                placeholder="Email của bạn..." 
                style={{ flex: 1, padding: "8px 15px", borderRadius: "8px", border: "1px solid #ddd", outline: "none" }}
              />
              <button style={{ background: "#ec4899", color: "white", border: "none", padding: "8px 15px", borderRadius: "8px", cursor: "pointer" }}>Gửi</button>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}
