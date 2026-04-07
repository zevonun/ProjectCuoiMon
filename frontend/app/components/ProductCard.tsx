"use client";

import Link from "next/link";
import styles from "./ProductCard.module.css";
import { Product } from "../lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface ProductCardProps {
  product: Product;
}

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("vi-VN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value) + " vnđ";

export default function ProductCard({ product }: ProductCardProps) {
  const productId = product._id;

  if (!productId) return null;

  // ✅ CHUẨN: convert sang absolute URL
  const imageUrl = product.hinh
    ? product.hinh.startsWith("http")
      ? product.hinh
      : `${API_URL}${product.hinh}`
    : "/img/no-image.jpg";

  return (
    <div className={styles.product}>
      <Link href={`/product/${productId}`}>
        {/* 🔥 KHÔNG DÙNG next/image */}
        <img
          src={imageUrl}
          alt={product.ten_sp}
          className={styles.productImage}
          loading="lazy"
        />
      </Link>

      <div className={styles.cardItemContent}>
        <h3>
          <Link href={`/product/${productId}`} className={styles.productTitle}>
            {product.ten_sp}
          </Link>
        </h3>

        <div className={styles.priceProduct}>
          <span className={styles.newPrice}>
            {formatCurrency(product.gia)}
          </span>
          {product.gia_km && product.gia_km > 0 && (
            <span className={styles.oldPrice}>
              {formatCurrency(product.gia_km)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}