"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ProductCard from "./ProductCard";
import { Product, Category } from "../lib/api";
import { useCart } from "../context/CartContext";

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
                    {product.gia.toLocaleString("vi-VN")}đ
                  </span>
                  {product.gia_km && product.gia_km < product.gia && (
                    <>
                      <span className="old-price">
                        {product.gia_km.toLocaleString("vi-VN")}đ
                      </span>
                      <span className="new-badge">Giảm giá</span>
                    </>
                  )}
                </div>

                {/* Số lượng */}
                <div className="product-quantity">
                  <label>Số lượng:</label>
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
                </div>

                <button className="add-to-cart-btn" onClick={handleAddToCart}>
                  Thêm vào giỏ hàng ({quantity})
                </button>

                <div className="promotion-tag">
                  <div className="promo-icon">%</div>
                  <div>
                    <div className="promo-text">
                      Ưu đãi đặc biệt khi mua online!
                    </div>
                    <div className="promo-note">
                      Gọi hotline để được tư vấn miễn phí
                    </div>
                  </div>
                </div>

                <div className="product-notice">
                  <p>
                    Hotline: <strong>1900 1234</strong> | Zalo:{" "}
                    <strong>0909 999 999</strong>
                  </p>
                </div>
              </div>
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

      <div
        className="product-container"
        style={{ textAlign: "center", padding: "50px 0" }}
      >
        <Link href="/" className="btn-detail">
          Quay về trang chủ
        </Link>
      </div>
    </>
  );
}
