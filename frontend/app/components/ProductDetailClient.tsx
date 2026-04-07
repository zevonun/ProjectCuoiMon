"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ProductCard from "./ProductCard";
import { Product, Category } from "../lib/api";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../lib/formatPrice";
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

  const decreaseQty = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const increaseQty = () => {
    setQuantity(quantity + 1);
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  // ✅ Chuẩn hóa URL ảnh
  const imageUrl =
    product.hinh?.startsWith("http")
      ? product.hinh
      : product.hinh
      ? `${API_URL}${product.hinh}`
      : "/img/no-image.jpg";

  return (
    <>
      {/* Breadcrumb */}
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

      {/* Chi tiết sản phẩm */}
      <div className="product-detail-container">
        <div className="product-container">
          <div className="row">
            {/* Ảnh */}
            <div className="col-md-6">
              <div className="product-images">
                <div className="main-image">
                  <Image
                    src={imageUrl}
                    alt={product.ten_sp}
                    width={600}
                    height={600}
                    priority
                    unoptimized   // ✅ FIX 404 + private IP
                    style={{
                      width: "100%",
                      height: "auto",
                      objectFit: "cover",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Thông tin */}
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

                {/* Số lượng + nút trong cùng hàng */}
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
                      <button className="qty-btn" onClick={increaseQty}>+</button>
                    </div>
                    <button className="add-to-cart-btn" onClick={handleAddToCart}>
                      Thêm vào giỏ hàng ({quantity})
                    </button>
                  </div>
                </div>

                {/* thông báo mua số lượng lớn */}
                <div className="bulk-order-note">
                  <p>
                    Nếu bạn muốn mua hàng với số lượng lớn, xin vui lòng liên hệ Hotline: 
                    <a href="tel:19006686900">19006686900</a> hoặc Zalo: 
                    <a href="https://zalo.me/0969822511">0969822511</a>. Aura Beauty chân thành cảm ơn bạn!
                  </p>
                </div>

                {/* mã giảm giá */}
                <div className="discount-code-box">
                  <div className="icon-percent">%</div>
                  <span>Mã giảm giá <small>(Không áp dụng đồng thời)</small></span>
                </div>

                {/* thông tin vận chuyển */}
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
{/* Thông tin sản phẩm / hướng dẫn sử dụng */}
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
      {/* Sản phẩm liên quan */}
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

      {/* Review summary section */}
      <div className="review-section">
        <div className="product-container">
          <h2 className="section-title">ĐÁNH GIÁ TỪ KHÁCH HÀNG ĐÃ MUA</h2>
          <div className="review-card">
            <div className="rating-overall">
              <div className="rating-number">0.0</div>
              <div className="stars">
                ☆☆☆☆☆
              </div>
              <div className="rating-note">Theo 0 đánh giá</div>
            </div>
            <div className="rating-breakdown">
              {[5,4,3,2,1].map(n => (
                <div className="breakdown-row" key={n}>
                  <div className="stars-count">{n} <span className="star">★</span></div>
                  <div className="bar"><div className="fill" style={{ width: "0%" }} /></div>
                  <div className="count">(0)</div>
                </div>
              ))}
            </div>
            <button className="write-review-btn">VIẾT ĐÁNH GIÁ ✏️</button>
          </div>
          <div className="review-filters">
            <button
              className={`filter ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >Tất cả</button>
            {[5,4,3,2,1].map(n => (
              <button
                key={n}
                className={`filter ${activeFilter === n ? 'active' : ''}`}
                onClick={() => setActiveFilter(n as 1|2|3|4|5)}
              >{n} ⭐</button>
            ))}
          </div>
        </div>
      </div>


    </>
  );
}
