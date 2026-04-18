"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import ProductCard from "./ProductCard";
import { Product, Category } from "../lib/api";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../lib/formatPrice";
import { getProductReviews, type ProductReview } from "../lib/reviewApi";
import "../../app/product-detail.css";

interface ProductDetailClientProps {
  product: Product;
  category?: Category;
  relatedProducts: Product[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ProductDetailClient({
  product,
  category,
  relatedProducts,
}: ProductDetailClientProps) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  // tab control for description/usage section
  const [activeTab, setActiveTab] = useState<'info' | 'usage'>('info');
  // rating filter for review section ('all' or 1..5)
  const [activeFilter, setActiveFilter] = useState<'all' | 1 | 2 | 3 | 4 | 5>('all');

  const [isFavorite, setIsFavorite] = useState(false);

  const maxStock = Math.max(0, Number(product.stock) || 0);

  // Sync with localStorage
  useEffect(() => {
    const list = JSON.parse(localStorage.getItem("love_list") || "[]");
    setIsFavorite(list.includes(product._id));
  }, [product._id]);

  useEffect(() => {
    setQuantity((q) => {
      if (maxStock <= 0) return 1;
      return Math.min(Math.max(1, q), maxStock);
    });
  }, [product._id, maxStock]);

  const toggleFavorite = () => {
    const list = JSON.parse(localStorage.getItem("love_list") || "[]");
    let newList;
    if (list.includes(product._id)) {
      newList = list.filter((id: string) => id !== product._id);
      setIsFavorite(false);
    } else {
      newList = [...list, product._id];
      setIsFavorite(true);
    }
    localStorage.setItem("love_list", JSON.stringify(newList));
    // Optional: dispatch event if other components need to know
    window.dispatchEvent(new Event("wishlistUpdated"));
  };

  const decreaseQty = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const increaseQty = () => {
    if (maxStock <= 0) return;
    setQuantity((q) => Math.min(maxStock, q + 1));
  };

  const handleAddToCart = () => {
    if (maxStock <= 0) {
      alert("Sản phẩm hiện đang hết hàng!");
      return;
    }
    const qty = Math.min(quantity, maxStock);
    addToCart(product, qty);
  };

  // ✅ Chuẩn hóa URL ảnh
  const imageUrl =
    product.hinh?.startsWith("http")
      ? product.hinh
      : product.hinh
      ? `${API_URL}${product.hinh}`
      : "/img/no-image.jpg";

  // reviews state
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoadingReviews(true);
        const res = await fetch(`http://localhost:5000/api/reviews/product/${product._id}`);
        const json = await res.json();
        if (json.success) {
          setReviews(json.data);
        }
      } catch (err) {
        console.error("Error fetching reviews:", err);
      } finally {
        setLoadingReviews(false);
      }
    };
    if (product._id) fetchReviews();
  }, [product._id]);

  // Statistics
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";
  
  const breakdown = [5, 4, 3, 2, 1].map(n => ({
    stars: n,
    count: reviews.filter(r => r.rating === n).length,
    percentage: reviews.length > 0 ? (reviews.filter(r => r.rating === n).length / reviews.length * 100) : 0
  }));

  const filteredReviews = activeFilter === 'all' 
    ? reviews 
    : reviews.filter(r => r.rating === activeFilter);

  const renderStars = (rating: number) => {
    return (
      <div className="stars">
        {[1, 2, 3, 4, 5].map(star => (
          <span key={star} className={star <= rating ? "star full" : "star empty"}>
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <>
      <div className="breadcrumb">
        <div className="product-container">
          <ul className="breadcrumb-list">
            <li>
              <Link href="/">Trang chủ</Link>
            </li>
            {category && (
              <li>
                <Link href={`/danh-muc/${category.slug || category._id}`}>
                  {category.name}
                </Link>
              </li>
            )}
            <li className="active">{product.ten_sp}</li>
          </ul>
        </div>
      </div>

      <div className="product-detail-container">
        <div className="product-container">
          <div className="row">
            <div className="col-md-6">
              <div className="product-images">
                <div className="main-image">
                  <Image
                    src={imageUrl}
                    alt={product.ten_sp}
                    width={600}
                    height={600}
                    priority
                    unoptimized
                    style={{
                      width: "100%",
                      height: "auto",
                      objectFit: "cover",
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="product-info">
                <h1 className="product-title">{product.ten_sp}</h1>

                <div className="product-price">
                  <span className="current-price">
                    {formatPrice(product.gia)}
                  </span>
                  {product.gia_km && product.gia_km < product.gia && (
                    <>
                      <span className="old-price">
                        {formatPrice(product.gia_km)}
                      </span>
                      <span className="new-badge">Giảm giá</span>
                    </>
                  )}
                </div>

                <div className="product-stock-status">
                  <p>Trạng thái: 
                    <span className={maxStock > 0 ? "stock-available" : "stock-empty"}>
                      {maxStock > 0 ? ` Còn hàng (${maxStock})` : " Hết hàng"}
                    </span>
                  </p>
                </div>

                <div className="product-quantity">
                  <label>Số lượng:</label>
                  <div className="qty-add-group">
                    <div className="quantity-controls">
                      <button className="qty-btn" onClick={decreaseQty}>–</button>
                      <input
                        type="text"
                        value={quantity}
                        readOnly
                        className="qty-input"
                      />
                      <button
                        className="qty-btn"
                        onClick={increaseQty}
                        disabled={maxStock <= 0 || quantity >= maxStock}
                        type="button"
                      >
                        +
                      </button>
                    </div>
                    <button 
                      className="add-to-cart-btn" 
                      onClick={handleAddToCart}
                      disabled={maxStock <= 0}
                      type="button"
                    >
                      {maxStock > 0 ? `Thêm vào giỏ hàng (${Math.min(quantity, maxStock)})` : "Hết hàng"}
                    </button>
                    <button 
                      type="button"
                      className={`favorite-btn ${isFavorite ? "active" : ""}`}
                      onClick={toggleFavorite}
                      title={isFavorite ? "Bỏ yêu thích" : "Yêu thích"}
                      aria-label={isFavorite ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
                      aria-pressed={isFavorite}
                    >
                      <i className={isFavorite ? "fas fa-heart" : "far fa-heart"} aria-hidden />
                    </button>
                  </div>
                </div>

                <div className="bulk-order-note">
                  <p>
                    Nếu bạn muốn mua hàng với số lượng lớn, xin vui lòng liên hệ Hotline: 
                    <a href="tel:19006686900">19006686900</a> hoặc Zalo: 
                    <a href="https://zalo.me/0969822511">0969822511</a>. Aura Beauty chân thành cảm ơn bạn!
                  </p>
                </div>

                <div className="discount-code-box">
                  <div className="icon-percent">%</div>
                  <span>Mã giảm giá <small>(Không áp dụng đồng thời)</small></span>
                </div>

                <div className="shipping-info">
                  <div className="ship-col">
                    <h4>Phí Ship</h4>
                    <p>Nội thành Hà Nội - 20.000 vnđ</p>
                    <p>Các tỉnh còn lại - 25.000 vnđ</p>
                  </div>
                  <div className="ship-col">
                    <h4>Thời gian ship dự kiến</h4>
                    <p>Hà Nội, TP.HCM: 1 - 2 ngày</p>
                    <p>Các tỉnh còn lại: 2 - 5 ngày</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="product-info-section">
        <div className="product-container">
          <div className="product-info-card">
            <div className="product-info-tabs">
              <div
                className={`tab ${activeTab === "info" ? "active" : ""}`}
                onClick={() => setActiveTab("info")}
              >
                THÔNG TIN SẢN PHẨM
              </div>
              <div
                className={`tab ${activeTab === "usage" ? "active" : ""}`}
                onClick={() => setActiveTab("usage")}
              >
                HƯỚNG DẪN SỬ DỤNG
              </div>
            </div>
            <div className="tab-content">
              {activeTab === "info" ? (
                <>
                  <button className="view-details-btn">
                    Xem chi tiết
                  </button>
                  <p className="product-description-text">
                    {product.mo_ta || "Không có mô tả."}
                  </p>
                </>
              ) : (
                <p className="product-description-text">
                  Chưa có hướng dẫn sử dụng.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="related-products-section">
          <div className="product-container">
            <h2 className="section-title">Sản phẩm liên quan</h2>
            <div className="row">
              {relatedProducts.slice(0, 8).map((rp) => (
                <div key={rp._id} className="col-md-3">
                  <ProductCard product={rp} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="review-section">
        <div className="product-container">
          <h2 className="section-title">ĐÁNH GIÁ TỪ KHÁCH HÀNG ĐÃ MUA</h2>
          <div className="review-card">
            <div className="rating-overall">
              <div className="rating-number">{avgRating}</div>
              {renderStars(Math.round(Number(avgRating)))}
              <div className="rating-note">Theo {reviews.length} đánh giá</div>
            </div>
            <div className="rating-breakdown">
              {breakdown.map(item => (
                <div className="breakdown-row" key={item.stars}>
                  <div className="stars-count">{item.stars} <span className="star">★</span></div>
                  <div className="bar"><div className="fill" style={{ width: `${item.percentage}%` }} /></div>
                  <div className="count">({item.count})</div>
                </div>
              ))}
            </div>
            <Link href="/orders" className="write-review-btn">ĐÁNH GIÁ NGAY ✏️</Link>
          </div>
          
          <div className="review-filters">
            <button
              className={`filter ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >Tất cả ({reviews.length})</button>
            {[5,4,3,2,1].map(n => {
              const count = reviews.filter(r => r.rating === n).length;
              return (
                <button
                  key={n}
                  className={`filter ${activeFilter === n ? 'active' : ''}`}
                  onClick={() => setActiveFilter(n as any)}
                >{n} ⭐ ({count})</button>
              );
            })}
          </div>

          <div className="review-list">
            {loadingReviews ? (
              <p className="review-empty">Đang tải đánh giá...</p>
            ) : filteredReviews.length > 0 ? (
              filteredReviews.map((rev, idx) => (
                <div key={idx} className="review-item">
                  <div className="review-user">
                    <strong>{rev.userName}</strong>
                    <span className="review-date">{new Date(rev.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div className="review-stars">
                    {renderStars(rev.rating)}
                  </div>
                  <div className="review-text">
                    {rev.comment || "Không có nhận xét."}
                  </div>
                </div>
              ))
            ) : (
              <p className="review-empty">Chưa có đánh giá nào cho mức điểm này.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
